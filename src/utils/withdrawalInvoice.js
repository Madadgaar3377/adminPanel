/**
 * Generate a printable withdrawal invoice (paid amount) for approved requests.
 * For admin: agent info comes from request (agentName, agentEmail, agentId).
 */
const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleString("en-PK", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return "—";
  }
};

function escapeHtml(str) {
  if (str == null) return "";
  const s = String(str);
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const INVOICE_STYLES = `
  * { box-sizing: border-box; }
  body { font-family: 'Segoe UI', system-ui, sans-serif; margin: 0; padding: 24px; color: #1f2937; background: #fff; font-size: 14px; line-height: 1.5; }
  .container { max-width: 680px; margin: 0 auto; }
  .header { border-bottom: 3px solid #dc2626; padding-bottom: 16px; margin-bottom: 24px; }
  .brand { font-size: 24px; font-weight: 800; color: #dc2626; letter-spacing: 0.02em; }
  .sub { font-size: 12px; color: #6b7280; margin-top: 2px; }
  .invoice-title { font-size: 20px; font-weight: 700; color: #111; margin: 20px 0 8px; }
  .invoice-meta { display: flex; flex-wrap: wrap; gap: 24px; margin-bottom: 24px; color: #4b5563; font-size: 13px; }
  .invoice-meta strong { color: #111; }
  .section { margin-bottom: 20px; }
  .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; margin-bottom: 8px; }
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
  @media (max-width: 500px) { .two-col { grid-template-columns: 1fr; } }
  .invoice-table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 13px; }
  .invoice-table th, .invoice-table td { padding: 10px 12px; text-align: left; border: 1px solid #e5e7eb; }
  .invoice-table th { background: #f9fafb; font-weight: 600; color: #374151; }
  .invoice-table .text-right { text-align: right; }
  .totals { margin-top: 16px; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; }
  .totals-row { display: flex; justify-content: space-between; padding: 10px 16px; border-bottom: 1px solid #e5e7eb; }
  .totals-row:last-child { border-bottom: none; }
  .totals-row.final { background: #fef2f2; font-weight: 700; font-size: 16px; color: #991b1b; }
  .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; text-align: center; }
  @media print { body { padding: 16px; } .no-print { display: none !important; } }
  .invoice-page { page-break-after: always; }
  .invoice-page:last-child { page-break-after: auto; }
`;

function getAgentFromRequest(request) {
  return {
    name: request.agentName || request.agentId || "Agent",
    email: request.agentEmail || "",
    userId: request.agentId || "",
  };
}

/** Returns HTML for one invoice body (container content only). */
function getOneInvoiceBody(request) {
  if (!request || request.status !== "approved") return "";
  const agent = getAgentFromRequest(request);
  const currency = request.deductionBreakdown?.currencyCode || "PKR";
  const amount = Number(request.amount) || 0;
  const b = request.deductionBreakdown || {};
  const totalDeductions = Number(b.totalDeductions) || 0;
  const finalPay = Number(b.finalPayAmount) ?? amount;
  const deductions = b.deductions || [];

  const invoiceNumber = `INV-WD-${String(request._id || "").slice(-8).toUpperCase()}-${new Date(request.reviewedAt || request.createdAt).getFullYear()}`;
  const invoiceDate = formatDate(request.reviewedAt || request.createdAt);

  const rows = deductions.length
    ? deductions
        .map(
          (d) =>
            `<tr><td>${escapeHtml(d.name)}${d.percent ? ` (${d.percent}%)` : ""}</td><td class="text-right">${currency} ${Number(d.amount).toLocaleString()}</td></tr>`
        )
        .join("")
    : "";
  const deductionTable =
    rows &&
    `<table class="invoice-table"><thead><tr><th>Description</th><th class="text-right">Amount</th></tr></thead><tbody>${rows}</tbody></table>`;

  return `
    <div class="header">
      <div class="brand">MADADGAAR</div>
      <div class="sub">Withdrawal Invoice (Admin)</div>
    </div>
    <div class="invoice-title">Payment Invoice</div>
    <div class="invoice-meta">
      <span>Invoice No: <strong>${escapeHtml(invoiceNumber)}</strong></span>
      <span>Date: <strong>${escapeHtml(invoiceDate)}</strong></span>
      <span>Status: <strong>Paid</strong></span>
    </div>
    <div class="section two-col">
      <div>
        <div class="section-title">Payee (Agent)</div>
        <div><strong>${escapeHtml(agent.name)}</strong></div>
        ${agent.email ? `<div>${escapeHtml(agent.email)}</div>` : ""}
        ${agent.userId ? `<div class="sub">ID: ${escapeHtml(agent.userId)}</div>` : ""}
      </div>
      <div>
        <div class="section-title">Bank details</div>
        <div>${escapeHtml(request.bankName || "—")}</div>
        <div>${escapeHtml(request.bankAccountName || "—")}</div>
        <div>Account: ****${escapeHtml(String(request.bankAccountNumber || "").slice(-4))}</div>
      </div>
    </div>
    <div class="section">
      <div class="section-title">Payment summary</div>
      <table class="invoice-table">
        <tr><td>Requested amount</td><td class="text-right">${currency} ${amount.toLocaleString()}</td></tr>
      </table>
      ${deductionTable ? `<div class="section-title" style="margin-top:16px">Deductions (taxes)</div>${deductionTable}` : ""}
      <div class="totals">
        ${totalDeductions > 0 ? `<div class="totals-row"><span>Total deductions</span><span>${currency} ${totalDeductions.toLocaleString()}</span></div>` : ""}
        <div class="totals-row final"><span>Amount paid</span><span>${currency} ${finalPay.toLocaleString()}</span></div>
      </div>
    </div>
    <div class="footer">
      This is a computer-generated invoice. Generated on ${new Date().toLocaleString("en-PK")}. &copy; Madadgaar.
    </div>`;
}

/**
 * @param {Object} request - Withdrawal request
 * @param {Object} options - { openPrintDialog?: boolean }
 */
export function openWithdrawalInvoice(request, options = {}) {
  if (!request || request.status !== "approved") return;
  const invoiceNumber = `INV-WD-${String(request._id || "").slice(-8).toUpperCase()}`;
  const bodyContent = getOneInvoiceBody(request);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Withdrawal Invoice - ${invoiceNumber}</title>
  <style>${INVOICE_STYLES}</style>
</head>
<body>
  <div class="container">
    ${bodyContent}
    <div class="no-print" style="margin-top:24px; text-align:center;">
      <button onclick="window.print()" style="padding:10px 24px; background:#dc2626; color:white; border:none; border-radius:8px; font-weight:600; cursor:pointer;">Print / Save as PDF</button>
      <button onclick="window.close()" style="margin-left:12px; padding:10px 24px; background:#6b7280; color:white; border:none; border-radius:8px; font-weight:600; cursor:pointer;">Close</button>
    </div>
  </div>
</body>
</html>`;

  const win = window.open("", "_blank");
  if (!win) {
    console.warn("Popup blocked - openWithdrawalInvoice");
    return;
  }
  win.document.write(html);
  win.document.close();
  if (options.openPrintDialog) {
    win.onload = () => {
      try {
        win.print();
      } catch (e) {
        console.warn("Print failed", e);
      }
    };
  }
}

/**
 * Open ALL approved invoices in ONE window (one document, multiple pages). One Print / Save as PDF = all invoices.
 * @param {Array} requests - List of withdrawal requests
 */
export function openWithdrawalInvoicesAll(requests, options = {}) {
  const approved = (requests || []).filter((r) => r && r.status === "approved");
  if (approved.length === 0) return;

  const pagesHtml = approved
    .map((req) => getOneInvoiceBody(req))
    .filter(Boolean)
    .map(
      (body) =>
        `<div class="invoice-page"><div class="container">${body}</div></div>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>All Withdrawal Invoices (${approved.length})</title>
  <style>${INVOICE_STYLES}</style>
</head>
<body>
  ${pagesHtml}
  <div class="no-print" style="margin:24px auto; max-width:680px; text-align:center;">
    <button onclick="window.print()" style="padding:10px 24px; background:#dc2626; color:white; border:none; border-radius:8px; font-weight:600; cursor:pointer;">Print / Save as PDF (all ${approved.length} invoices)</button>
    <button onclick="window.close()" style="margin-left:12px; padding:10px 24px; background:#6b7280; color:white; border:none; border-radius:8px; font-weight:600; cursor:pointer;">Close</button>
  </div>
</body>
</html>`;

  const win = window.open("", "_blank");
  if (!win) {
    console.warn("Popup blocked - openWithdrawalInvoicesAll");
    return;
  }
  win.document.write(html);
  win.document.close();
}
