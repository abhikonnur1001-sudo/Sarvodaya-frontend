import { useRef } from "react";
import "./FeeReceiptPage.css";

function generateReceiptNumber(academicYear, studentId) {
    const yr  = (academicYear || "").replace(/\s/g, "").replace("/", "-");
    const sid = String(studentId || "0").padStart(4, "0");
    const seq = String(Date.now()).slice(-5);
    return `SAR${yr}S${sid}${seq}`;
}

/**
 * Splits amountPaid across 3 buckets derived from studentTypeFee:
 *   Study Material Fee = 5%
 *   Stock Fee          = 5%
 *   Tuition Fee        = 90%
 * Fills in order: Study Material → Stock → Tuition
 */
function splitStudentTypeFee(studentTypeFee, amountPaid) {
    const sf   = Number(studentTypeFee || 0);
    const paid = Number(amountPaid || 0);

    const studyMaterialTotal = sf * 0.05;
    const stockTotal         = sf * 0.05;
    const tuitionTotal       = sf * 0.90;

    let rem = paid;

    const studyMaterialPaid = Math.min(rem, studyMaterialTotal);
    rem -= studyMaterialPaid;

    const stockPaid = Math.min(rem, stockTotal);
    rem -= stockPaid;

    const tuitionPaid = Math.min(rem, tuitionTotal);

    return {
        studyMaterial: { total: studyMaterialTotal, paid: studyMaterialPaid },
        stock:         { total: stockTotal,         paid: stockPaid         },
        tuition:       { total: tuitionTotal,       paid: tuitionPaid       },
    };
}

const PAYMENT_MODE_LABELS = ["Cash", "Card", "UPI", "Bank Transfer"];

export default function FeeReceiptPage({ receipt, onClose }) {
    const printRef = useRef();
    if (!receipt) return null;

    const receiptNumber = generateReceiptNumber(receipt.academicYear, receipt.studentId);
    const fmt = (n) => Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });
    const modeLabel = typeof receipt.paymentMode === "number"
        ? (PAYMENT_MODE_LABELS[receipt.paymentMode] ?? "Cash")
        : (receipt.paymentMode ?? "Cash");

    const isTuitionReceipt = receipt.feeType === "Tuition Fee";
    const breakdown = isTuitionReceipt
        ? splitStudentTypeFee(receipt.studentTypeFee, receipt.amountPaid)
        : null;

    const handlePrint = () => {
        const content = printRef.current.innerHTML;
        const win = window.open("", "_blank", "width=820,height=750");
        win.document.write(`<!DOCTYPE html><html><head>
            <title>Receipt — ${receiptNumber}</title>
            <style>
            * { box-sizing:border-box; margin:0; padding:0; }
            body { font-family:'Segoe UI',Arial,sans-serif; background:#fff; color:#1a1a1a; padding:28px; }
            .pw { max-width:680px; margin:0 auto; }
            ${printCSS()}
            </style></head><body>
            <div class="pw">${content}</div>
            </body></html>`);
        win.document.close(); win.focus(); win.print();
    };

    return (
        <div className="rp-overlay">
            <div className="rp-modal">

                <div className="rp-modal-header">
                    <span className="rp-modal-title">🧾 Payment Receipt</span>
                    <button className="rp-close-btn" onClick={onClose} aria-label="Close">✕</button>
                </div>

                <div className="rp-scroll-body">
                    <div ref={printRef}>
                        <div className="rp-receipt">

                            {/* Org Header */}
                            <div className="rp-receipt-head">
                                <div className="rp-org-logo">S</div>
                                <div className="rp-org-info">
                                    <div className="rp-org-name">Sarvodaya Social Welfare &amp; Education Foundation</div>
                                    <div className="rp-org-address">Bellubbi, Babaleshwer, Vijayapur — Karnataka 586113</div>
                                </div>
                            </div>

                            {/* Title Band */}
                            <div className="rp-title-band">
                                <div className="rp-title-left">
                                    <span className="rp-doc-type">FEE RECEIPT</span>
                                    <span className="rp-sub-type">{receipt.feeType}</span>
                                </div>
                                <div className="rp-title-right">
                                    <div className="rp-receipt-no-label">Receipt No.</div>
                                    <div className="rp-receipt-no">{receiptNumber}</div>
                                    <div className="rp-receipt-date">{receipt.paidAt || new Date().toLocaleString("en-IN")}</div>
                                </div>
                            </div>

                            {/* Student Details */}
                            <div className="rp-section-label">Student Details</div>
                            <div className="rp-details-grid">
                                {[
                                    ["Student Name",   receipt.studentName],
                                    ["Enrollment No.", receipt.enrollmentNumber, true],
                                    ["School",         receipt.schoolName ?? "—"],
                                    ["Class",          receipt.className  ?? "—"],
                                    ["Academic Year",  receipt.academicYear ?? "—"],
                                    receipt.studentType && ["Student Type", receipt.studentType],
                                ].filter(Boolean).map(([k, v, mono]) => (
                                    <div className="rp-detail-row" key={k}>
                                        <span className="rp-detail-key">{k}</span>
                                        <span className={`rp-detail-val${mono ? " rp-mono" : ""}`}>{v}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Fee Breakdown */}
                            <div className="rp-section-label">Fee Breakdown</div>
                            <div className="rp-fee-table">
                                <div className="rp-fee-thead">
                                    <span>Description</span>
                                    <span>Total</span>
                                    <span>This Payment</span>
                                </div>

                                {isTuitionReceipt && breakdown ? (
                                    <>
                                        {/* Study Material — 5% of studentTypeFee */}
                                        <div className="rp-fee-row">
                                            <span>Study Material Fee <span className="rp-pct-tag">5%</span></span>
                                            <span className="rp-col-total">₹{fmt(breakdown.studyMaterial.total)}</span>
                                            <span className={breakdown.studyMaterial.paid > 0 ? "rp-col-paid" : "rp-col-zero"}>
                                                {breakdown.studyMaterial.paid > 0 ? `₹${fmt(breakdown.studyMaterial.paid)}` : "—"}
                                            </span>
                                        </div>

                                        {/* Stock Fee — 5% of studentTypeFee */}
                                        <div className="rp-fee-row">
                                            <span>Stock Fee <span className="rp-pct-tag">5%</span></span>
                                            <span className="rp-col-total">₹{fmt(breakdown.stock.total)}</span>
                                            <span className={breakdown.stock.paid > 0 ? "rp-col-paid" : "rp-col-zero"}>
                                                {breakdown.stock.paid > 0 ? `₹${fmt(breakdown.stock.paid)}` : "—"}
                                            </span>
                                        </div>

                                        {/* Tuition Fee — 90% of studentTypeFee */}
                                        <div className="rp-fee-row">
                                            <span>Tuition Fee <span className="rp-pct-tag">90%</span></span>
                                            <span className="rp-col-total">₹{fmt(breakdown.tuition.total)}</span>
                                            <span className={breakdown.tuition.paid > 0 ? "rp-col-paid" : "rp-col-zero"}>
                                                {breakdown.tuition.paid > 0 ? `₹${fmt(breakdown.tuition.paid)}` : "—"}
                                            </span>
                                        </div>

                                        {/* Class Fee — shown as-is, no split */}
                                        {(receipt.classFee ?? 0) > 0 && (
                                            <div className="rp-fee-row">
                                                <span>Class Fee</span>
                                                <span className="rp-col-total">₹{fmt(receipt.classFee)}</span>
                                                <span className="rp-col-zero">—</span>
                                            </div>
                                        )}

                                        {/* Concession */}
                                        {(receipt.concessionAmount ?? 0) > 0 && (
                                            <div className="rp-fee-row concession">
                                                <span>Concession Applied</span>
                                                <span className="rp-col-total">—</span>
                                                <span>−₹{fmt(receipt.concessionAmount)}</span>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="rp-fee-row">
                                        <span>{receipt.feeType}</span>
                                        <span className="rp-col-total">₹{fmt(receipt.amountPaid)}</span>
                                        <span className="rp-col-paid">₹{fmt(receipt.amountPaid)}</span>
                                    </div>
                                )}

                                <div className="rp-fee-divider" />
                                <div className="rp-fee-total">
                                    <span>Amount Collected</span>
                                    <span></span>
                                    <span className="rp-total-val">₹{fmt(receipt.amountPaid)}</span>
                                </div>
                            </div>

                            {/* Balance Row */}
                            <div className="rp-balance-row">
                                <div className="rp-balance-item">
                                    <div className="rp-bal-label">Grand Total</div>
                                    <div className="rp-bal-val">₹{fmt(receipt.totalFee)}</div>
                                </div>
                                <div className="rp-balance-item green">
                                    <div className="rp-bal-label">Total Paid</div>
                                    <div className="rp-bal-val">₹{fmt(receipt.totalPaid)}</div>
                                </div>
                                <div className={`rp-balance-item ${(receipt.balanceDue ?? 0) <= 0 ? "green" : "red"}`}>
                                    <div className="rp-bal-label">Balance Due</div>
                                    <div className="rp-bal-val">₹{fmt(receipt.balanceDue)}</div>
                                </div>
                            </div>

                            {/* Payment Mode */}
                            <div className="rp-payment-mode-row">
                                <span className="rp-pm-label">Payment Mode</span>
                                <span className="rp-pm-badge">{modeLabel}</span>
                            </div>

                            {/* Footer */}
                            <div className="rp-footer">
                                <div className="rp-footer-left">
                                    <div className="rp-footer-note">This is a computer-generated receipt and does not require a signature.</div>
                                    <div className="rp-footer-id">Receipt ID: {receiptNumber}</div>
                                </div>
                                <div className="rp-seal-circle"><span>PAID</span></div>
                            </div>

                        </div>
                    </div>
                </div>

                <div className="rp-modal-footer">
                    <button className="rp-btn-secondary" onClick={onClose}>← Back to Collection</button>
                    <button className="rp-btn-print" onClick={handlePrint}>🖨️ Print Receipt</button>
                </div>

            </div>
        </div>
    );
}

function printCSS() {
    return `
        .rp-receipt{border:1px solid #ccc;border-radius:8px;overflow:hidden}
        .rp-receipt-head{display:flex;align-items:center;gap:14px;background:linear-gradient(135deg,#01696f,#0c4e54);color:white;padding:18px 24px}
        .rp-org-logo{width:48px;height:48px;border-radius:50%;background:rgba(255,255,255,.18);display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:800;border:2px solid rgba(255,255,255,.3);flex-shrink:0}
        .rp-org-name{font-size:14px;font-weight:700;line-height:1.35}
        .rp-org-address{font-size:11px;opacity:.8;margin-top:2px}
        .rp-title-band{display:flex;justify-content:space-between;align-items:flex-start;background:#f0fafa;padding:14px 24px;border-bottom:1px solid #d1eded}
        .rp-doc-type{font-size:18px;font-weight:900;color:#01696f;display:block;letter-spacing:3px}
        .rp-sub-type{font-size:12px;color:#64748b;margin-top:3px;display:block}
        .rp-title-right{text-align:right}
        .rp-receipt-no-label{font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px}
        .rp-receipt-no{font-size:12px;font-weight:700;font-family:monospace;color:#01696f;margin-top:2px}
        .rp-receipt-date{font-size:11px;color:#64748b;margin-top:2px}
        .rp-section-label{font-size:10px;text-transform:uppercase;letter-spacing:1.8px;color:#94a3b8;font-weight:700;padding:10px 24px 4px;border-top:1px solid #f1f5f9;background:#fafafa}
        .rp-details-grid{padding:4px 24px 12px}
        .rp-detail-row{display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px dashed #e2e8f0;font-size:13px;gap:1rem}
        .rp-detail-key{color:#64748b}
        .rp-detail-val{font-weight:600;color:#0f172a;text-align:right}
        .rp-mono{font-family:monospace;font-size:12px}
        .rp-fee-table{padding:4px 24px 12px}
        .rp-fee-thead{display:grid;grid-template-columns:1fr 100px 110px;font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;font-weight:700;padding:4px 0 6px;border-bottom:2px solid #e2e8f0;margin-bottom:2px}
        .rp-fee-thead span:not(:first-child){text-align:right}
        .rp-fee-row{display:grid;grid-template-columns:1fr 100px 110px;padding:7px 0;font-size:13px;border-bottom:1px dashed #f1f5f9;align-items:baseline;gap:.5rem}
        .rp-fee-row.concession{color:#15803d}
        .rp-col-total{text-align:right;color:#64748b;font-size:12px}
        .rp-col-paid{text-align:right;font-weight:700;color:#01696f}
        .rp-col-zero{text-align:right;color:#cbd5e1}
        .rp-pct-tag{display:inline-block;font-size:10px;background:#e0f2f1;color:#01696f;border-radius:4px;padding:1px 7px;margin-left:7px;font-weight:600}
        .rp-fee-divider{border-top:2px solid #e2e8f0;margin:8px 0}
        .rp-fee-total{display:grid;grid-template-columns:1fr 100px 110px;font-size:15px;font-weight:800;padding:5px 0 2px}
        .rp-fee-total span:not(:first-child){text-align:right}
        .rp-total-val{color:#01696f}
        .rp-balance-row{display:flex;gap:1px;background:#e2e8f0}
        .rp-balance-item{flex:1;background:#f8fafc;padding:12px;text-align:center}
        .rp-balance-item.green{background:#f0fdf4}
        .rp-balance-item.red{background:#fef2f2}
        .rp-bal-label{font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8}
        .rp-bal-val{font-size:14px;font-weight:800;margin-top:4px;color:#0f172a}
        .rp-balance-item.green .rp-bal-val{color:#15803d}
        .rp-balance-item.red .rp-bal-val{color:#b91c1c}
        .rp-payment-mode-row{display:flex;align-items:center;gap:10px;padding:12px 24px;border-top:1px solid #f1f5f9}
        .rp-pm-label{font-size:12px;color:#64748b}
        .rp-pm-badge{background:#e0f2f1;color:#01696f;font-size:12px;font-weight:700;padding:3px 13px;border-radius:999px}
        .rp-footer{display:flex;justify-content:space-between;align-items:flex-end;padding:14px 24px;background:#f8fafc;border-top:1px solid #e2e8f0;gap:1rem}
        .rp-footer-note{font-size:10px;color:#b0b8c4;font-style:italic}
        .rp-footer-id{font-size:10px;color:#d1d9e0;margin-top:4px;font-family:monospace}
        .rp-seal-circle{width:62px;height:62px;border-radius:50%;border:2.5px double #01696f;display:flex;align-items:center;justify-content:center;color:#01696f;font-size:12px;font-weight:900;letter-spacing:2px;opacity:.5;flex-shrink:0;transform:rotate(-12deg)}
    `;
}