export const roundPKR = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.round(n);
};

export const stripHtmlText = (value) =>
  String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

export const planHasFinanceDetails = (plan) => {
  if (!plan) return false;
  const finance = plan.finance || {};
  return Boolean(
    String(finance.bankName || "").trim() || stripHtmlText(finance.financeInfo)
  );
};

/** Keep only plans the editor actually configured (not empty template rows). */
export const filterValidPaymentPlans = (plans = []) =>
  (plans || []).filter((plan) => {
    if (!String(plan?.planName || "").trim()) return false;
    if (planHasFinanceDetails(plan) || plan.hasFinance) return true;
    return roundPKR(plan.installmentPrice) > 0 || roundPKR(plan.monthlyInstallment) > 0;
  });

export const getVariantEffectivePrice = (variant) => {
  if (!variant) return 0;
  const discounted = roundPKR(variant.discountedPrice);
  if (discounted > 0) return discounted;
  const base = roundPKR(variant.price);
  const disc = Math.min(100, Math.max(0, Number(variant.discountPercent) || 0));
  if (base <= 0) return 0;
  if (disc <= 0) return base;
  return roundPKR(base * (1 - disc / 100));
};

export const normalizeVariantsForCashSave = (variants, rootPrice, options = {}) => {
  const { cashOnly = false, clearDiscounts = false } = options;
  const list = variants || [];
  if (!list.length) return list;
  const root = roundPKR(rootPrice);
  const syncSingle = (clearDiscounts || cashOnly) && root > 0 && list.length === 1;

  return list.map((v) => {
    const next = { ...v };
    if (clearDiscounts || cashOnly) {
      next.discountPercent = 0;
    }
    if (syncSingle) {
      next.price = root;
    }
    return next;
  });
};

export const isCashOnlySave = (form) => {
  const validPlans = filterValidPaymentPlans(form?.paymentPlans || []);
  if (validPlans.length > 0) return false;
  const hasCash =
    roundPKR(form?.price) > 0 ||
    (form?.variants || []).some((v) => roundPKR(v.price) > 0);
  return hasCash;
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

const sanitizePlanForApi = (p, editorUserId, variantCash = 0) => ({
  ...p,
  partnerId: p.partnerId || editorUserId,
  cashPrice: roundPKR(p.cashPrice) || roundPKR(variantCash) || 0,
  installmentPrice: roundPKR(p.installmentPrice),
  downPayment: roundPKR(p.downPayment),
  monthlyInstallment: roundPKR(p.monthlyInstallment),
  markup: roundPKR(p.markup),
  totalInterest: roundPKR(p.totalInterest),
  totalCostToCustomer: roundPKR(p.totalCostToCustomer),
});

export const buildInstallmentUpdateBody = ({
  form,
  editorUserId,
  isAttachedProduct,
  includeFullForm = false,
  cashOnly = false,
}) => {
  const rawPlans = cashOnly ? [] : filterValidPaymentPlans(form.paymentPlans || []);
  const explicitPrice = roundPKR(form.price);
  const clearDiscounts = cashOnly || isCashOnlySave(form);
  const variantsForSave = normalizeVariantsForCashSave(form.variants, explicitPrice, {
    cashOnly,
    clearDiscounts,
  });

  const rootPlans = rawPlans
    .filter(
      (p) =>
        p.variantIndex === null ||
        p.variantIndex === undefined ||
        p.variantIndex === -1
    )
    .map((p) => sanitizePlanForApi(p, editorUserId, explicitPrice));

  const variantsPayload = (variantsForSave || []).map((v, vIdx) => {
    const variantCash = roundPKR(v.price) || getVariantEffectivePrice(v);
    const fromVariant = (v.paymentPlans || [])
      .filter((p) => filterValidPaymentPlans([p]).length > 0)
      .map((p) =>
        sanitizePlanForApi(
          { ...p, variantIndex: vIdx },
          editorUserId,
          variantCash
        )
      );

    const fromRoot = rawPlans
      .filter((p) => Number(p.variantIndex) === vIdx)
      .map((p) =>
        sanitizePlanForApi({ ...p, variantIndex: vIdx }, editorUserId, variantCash)
      );

    return {
      ...v,
      price: roundPKR(v.price),
      discountPercent: clearDiscounts || cashOnly ? 0 : Number(v.discountPercent) || 0,
      paymentPlans: cashOnly ? [] : [...fromVariant, ...fromRoot],
    };
  });

  if (isAttachedProduct) {
    return {
      userId: editorUserId,
      mergePartnerPlans: true,
      paymentPlans: rootPlans,
      variants: variantsPayload,
    };
  }

  const base = {
    userId: editorUserId || form.userId,
    mergePartnerPlans: true,
    category: form.category === "other" ? form.customCategory : form.category,
    price: explicitPrice,
    downpayment: roundPKR(form.downpayment),
    variants: variantsPayload,
    paymentPlans: rootPlans,
  };

  if (includeFullForm) {
    const { paymentPlans: _dropPlans, variants: _dropVariants, price: _dropPrice, ...rest } = form;
    return {
      ...rest,
      ...base,
    };
  }

  return base;
};
