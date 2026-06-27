export const stripHtmlText = (value) =>
  String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

export const hasProductFinance = (finance) => {
  if (!finance || typeof finance !== "object") return false;
  const bankName = String(finance.bankName || "").trim();
  const financeInfo = stripHtmlText(finance.financeInfo);
  return Boolean(bankName || financeInfo);
};

export const isFinanceOnlyStep = (step4Tab) => step4Tab === "finance";

export const planHasFinance = (plan) =>
  Boolean(plan?.hasFinance && hasProductFinance(plan?.finance));

export const isSubmittablePaymentPlan = (plan) => {
  if (!String(plan?.planName || "").trim()) return false;
  if (Number(plan.installmentPrice) > 0) return true;
  return planHasFinance(plan) || hasProductFinance(plan?.finance);
};
