export const planMatchesVariantIndex = (plan, vIdx) =>
  Number(plan?.variantIndex) === Number(vIdx);

export const getActivePaymentPlans = (plans) =>
  (plans || []).filter(
    (p) => String(p.planName || "").trim() && Number(p.installmentPrice) > 0
  );

export const hasStandardVariant = (variants) =>
  (variants || []).some(
    (v) => String(v.variantName || "").trim().toLowerCase() === "standard"
  );

export const buildCreateInstallmentPayload = ({
  form,
  activePlans,
  getVariantEffectivePrice,
  deriveProductPrice,
  status = "approved",
}) => {
  const productPrice = deriveProductPrice(form.variants, form.price);
  return {
    ...form,
    category: form.category === "other" ? form.customCategory : form.category,
    price: productPrice,
    downpayment: Number(form.downpayment),
    variants: (form.variants || []).map((v, vIdx) => ({
      variantName: v.variantName,
      price: Number(v.price),
      discountPercent: Number(v.discountPercent) || 0,
      status: v.status || "active",
      paymentPlans: activePlans
        .filter((p) => planMatchesVariantIndex(p, vIdx))
        .map((p) => ({
          ...p,
          cashPrice: getVariantEffectivePrice(v),
          installmentPrice: Number(p.installmentPrice),
          downPayment: Number(p.downPayment),
          monthlyInstallment: Number(p.monthlyInstallment),
        })),
    })),
    paymentPlans: activePlans
      .filter(
        (p) =>
          p.variantIndex === null ||
          p.variantIndex === undefined ||
          p.variantIndex === -1
      )
      .map((p) => ({
        ...p,
        cashPrice: productPrice,
        installmentPrice: Number(p.installmentPrice),
        downPayment: Number(p.downPayment),
        monthlyInstallment: Number(p.monthlyInstallment),
      })),
    finance: form.finance || {},
    status,
  };
};

export const isAttachedMultiVendor = (editorUserId, productOwnerUserId) =>
  Boolean(
    editorUserId &&
    productOwnerUserId &&
    String(editorUserId) !== String(productOwnerUserId)
  );

export const filterPlansForEditor = (plans, editorUserId, productOwnerUserId) => {
  if (!editorUserId) return plans || [];
  return (plans || []).filter((p) => {
    if (p?.partnerId) return String(p.partnerId) === String(editorUserId);
    return String(productOwnerUserId) === String(editorUserId);
  });
};

export const mapVariantsForEditor = (variants, editorUserId, productOwnerUserId) =>
  (variants || []).map((v) => ({
    ...v,
    paymentPlans: filterPlansForEditor(
      v.paymentPlans,
      editorUserId,
      productOwnerUserId
    ),
  }));

export const processPlansForForm = (plans) =>
  (plans || []).map((pp) => ({
    ...pp,
    hasFinance: !!(pp.finance && (pp.finance.bankName || pp.finance.financeInfo)),
    finance: pp.finance || { bankName: "", financeInfo: "" },
  }));

export const buildInstallmentUpdateBody = ({
  form,
  editorUserId,
  isAttachedProduct,
  includeFullForm = false,
  getVariantEffectivePrice,
  variantsOnly = false,
}) => {
  const rootPlans = (form.paymentPlans || [])
    .filter(
      (p) =>
        p.variantIndex === null ||
        p.variantIndex === undefined ||
        p.variantIndex === -1
    )
    .map((p) => ({
      ...p,
      partnerId: p.partnerId || editorUserId,
      cashPrice: Number(p.cashPrice) || 0,
      installmentPrice: Number(p.installmentPrice),
      downPayment: Number(p.downPayment),
      monthlyInstallment: Number(p.monthlyInstallment),
    }));

  const variantsPayload = (form.variants || []).map((v, vIdx) => {
    const variantBase = {
      ...v,
      price: Number(v.price),
      discountPercent: Number(v.discountPercent) || 0,
    };
    if (variantsOnly) {
      return {
        variantName: v.variantName,
        price: Number(v.price),
        discountPercent: Number(v.discountPercent) || 0,
        status: v.status || "active",
        paymentPlans: v.paymentPlans || [],
      };
    }
    return {
      ...variantBase,
      paymentPlans: [
        ...(v.paymentPlans || []).map((p) => ({
          ...p,
          partnerId: p.partnerId || editorUserId,
          variantIndex: vIdx,
          cashPrice:
            Number(p.cashPrice) ||
            (getVariantEffectivePrice ? getVariantEffectivePrice(v) : Number(v.price)) ||
            0,
          installmentPrice: Number(p.installmentPrice),
          downPayment: Number(p.downPayment),
          monthlyInstallment: Number(p.monthlyInstallment),
        })),
        ...(form.paymentPlans || [])
          .filter((p) => Number(p.variantIndex) === vIdx)
          .map((p) => ({
            ...p,
            partnerId: p.partnerId || editorUserId,
            variantIndex: vIdx,
            cashPrice:
              Number(p.cashPrice) ||
              (getVariantEffectivePrice ? getVariantEffectivePrice(v) : 0),
            installmentPrice: Number(p.installmentPrice),
            downPayment: Number(p.downPayment),
            monthlyInstallment: Number(p.monthlyInstallment),
          })),
      ],
    };
  });

  if (isAttachedProduct) {
    const attached = {
      userId: editorUserId,
      mergePartnerPlans: true,
      variants: variantsPayload,
    };
    if (!variantsOnly) attached.paymentPlans = rootPlans;
    return attached;
  }

  const base = {
    userId: editorUserId || form.userId,
    category: form.category === "other" ? form.customCategory : form.category,
    price: Number(form.price),
    downpayment: Number(form.downpayment),
    variants: variantsPayload,
  };
  if (!variantsOnly) base.paymentPlans = rootPlans;

  if (includeFullForm) {
    const merged = { ...form, ...base };
    if (variantsOnly) delete merged.paymentPlans;
    return merged;
  }

  return base;
};
