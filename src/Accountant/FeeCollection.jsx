import { useState, useEffect } from "react";
import { api } from "../api";
import "./FeeCollection.css";
import FeeReceiptPage from "./FeeReceiptPage";

const PAYMENT_MODES = [
    { value: 0, label: "Cash", icon: "💵" },
    { value: 1, label: "Card", icon: "💳" },
    { value: 2, label: "UPI", icon: "📱" },
    { value: 3, label: "Bank Transfer", icon: "🏦" },
];

export default function FeeCollection({ goBack, prefillEnrollment = "" }) {
    const [enrollmentNumber, setEnrollmentNumber] = useState(prefillEnrollment);
    const [summary, setSummary] = useState(null);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState("");

    const [collectTarget, setCollectTarget] = useState("tuition");
    const [amountPaid, setAmountPaid] = useState("");
    const [paymentMode, setPaymentMode] = useState(0);
    const [collectLoading, setCollectLoading] = useState(false);

    const [receipt, setReceipt] = useState(null);
    const [notification, setNotification] = useState(null);

    const fmt = (n) => Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });

    const notify = (type, msg) => {
        setNotification({ type, msg });
        setTimeout(() => setNotification(null), 4500);
    };

    // ── Auto-search when opened with prefilled enrollment ────────────────────
    useEffect(() => {
        if (!prefillEnrollment?.trim()) return;
        fetchSummary(prefillEnrollment.trim());
    }, [prefillEnrollment]);

    // ── Fetch student summary ────────────────────────────────────────────────
    const fetchSummary = async (enrollment) => {
        setSearchLoading(true);
        setSearchError("");
        setSummary(null);
        setReceipt(null);
        setAmountPaid("");
        setCollectTarget("tuition");
        try {
            const res = await api.get(`/accounts/student-full-summary/${enrollment}`);
            setSummary(res.data);
        } catch (err) {
            setSearchError(err.response?.data?.error || "Student not found or no fee assigned.");
        } finally {
            setSearchLoading(false);
        }
    };

    // ── Search submit ────────────────────────────────────────────────────────
    const handleSearch = async (e) => {
        e.preventDefault();
        if (!enrollmentNumber.trim()) return;
        await fetchSummary(enrollmentNumber.trim());
    };

    // ── Collect fee ──────────────────────────────────────────────────────────
    const handleCollect = async (e) => {
        e.preventDefault();
        if (!summary) return;

        const amount = parseFloat(amountPaid);
        if (!amount || amount <= 0) { notify("error", "Enter a valid amount."); return; }

        setCollectLoading(true);
        try {
            if (collectTarget === "tuition") {
                const remaining = summary.tuitionBalance;
                if (amount > remaining) {
                    notify("error", `Amount exceeds tuition balance ₹${fmt(remaining)}.`);
                    setCollectLoading(false);
                    return;
                }
                await api.post("/accounts/collect-fee", {
                    assignmentId: summary.assignmentId,
                    amountPaid: amount,
                    paymentMode: paymentMode,
                    remarks: "",
                });
                const res = await api.get(`/accounts/student-full-summary/${enrollmentNumber.trim()}`);
                const updated = res.data;
                setSummary(updated);
                setReceipt({
                    feeType: "Tuition Fee",
                    enrollmentNumber: summary.enrollmentNumber,
                    studentName: summary.studentName,
                    schoolName: summary.schoolName,
                    className: summary.className,
                    academicYear: summary.academicYear,
                    studentId: summary.studentId,
                    studentType: summary.studentType,
                    classFee: summary.classFee,
                    studentTypeFee: summary.studentTypeFee,
                    concessionAmount: summary.concessionAmount,
                    amountPaid: amount,
                    totalFee: updated.grandTotalFee,
                    totalPaid: updated.grandTotalPaid,
                    balanceDue: updated.grandTotalBalance,
                    paymentMode: paymentMode,
                    paidAt: new Date().toLocaleString("en-IN"),
                });
            } else {
                // Additional fee
                await api.post(`/accounts/collect-additional-fee/${collectTarget}`, {
                    paymentMode: paymentMode,
                    collectedByUserId: 0,
                });
                const fee = summary.additionalFees.find(f => f.id === collectTarget);
                const res = await api.get(`/accounts/student-full-summary/${enrollmentNumber.trim()}`);
                const updated = res.data;
                setSummary(updated);
                setReceipt({
                    feeType: fee?.name ?? "Additional Fee",
                    enrollmentNumber: summary.enrollmentNumber,
                    studentName: summary.studentName,
                    schoolName: summary.schoolName,
                    className: summary.className,
                    academicYear: summary.academicYear,
                    studentId: summary.studentId,
                    studentType: summary.studentType,
                    classFee: 0,
                    studentTypeFee: 0,
                    concessionAmount: 0,
                    amountPaid: fee?.amount ?? amount,
                    totalFee: updated.grandTotalFee,
                    totalPaid: updated.grandTotalPaid,
                    balanceDue: updated.grandTotalBalance,
                    paymentMode: paymentMode,
                    paidAt: new Date().toLocaleString("en-IN"),
                });
            }
            setAmountPaid("");
            setCollectTarget("tuition");
            notify("success", "Fee collected successfully.");
        } catch (err) {
            notify("error", err.response?.data?.error || err.response?.data || "Failed to collect fee.");
        } finally {
            setCollectLoading(false);
        }
    };

    // ── Derived values ───────────────────────────────────────────────────────
    const tuitionPct = summary && summary.totalTuitionFee > 0
        ? Math.min((summary.tuitionPaid / summary.totalTuitionFee) * 100, 100) : 0;

    const additionalPct = summary && summary.totalAdditionalFee > 0
        ? Math.min((summary.additionalFeePaid / summary.totalAdditionalFee) * 100, 100) : 0;

    const maxAmount = collectTarget === "tuition"
        ? (summary?.tuitionBalance ?? 0)
        : (summary?.additionalFees?.find(f => f.id === collectTarget)?.amount ?? 0);

    const isPrefilled = Boolean(prefillEnrollment?.trim());

    // ── Receipt modal ────────────────────────────────────────────────────────
    if (receipt) {
        return (
            <FeeReceiptPage
                receipt={receipt}
                onClose={() => setReceipt(null)}
            />
        );
    }

    return (
        <div className="fc-container">

            {/* Page Header */}
            <div className="fc-page-header">
                <div>
                    <h2 className="fc-page-title">Fee Collection</h2>
                    <p className="fc-page-subtitle">Tuition &amp; additional fees — search by enrollment number</p>
                </div>
                <button className="fc-back-btn" onClick={goBack}>← Back</button>
            </div>

            {/* Notification */}
            {notification && (
                <div className={`fc-notification ${notification.type}`}>
                    {notification.type === "success" ? "✅" : "❌"} {notification.msg}
                </div>
            )}

            {/* Search — hidden when prefilled */}
            {!isPrefilled && (
                <div className="fc-card">
                    <div className="fc-card-header">
                        <span className="fc-card-title">🔍 Search Student</span>
                    </div>
                    <div className="fc-card-body">
                        <form className="fc-search-row" onSubmit={handleSearch}>
                            <input
                                className="fc-search-input"
                                type="text"
                                placeholder="Enter Enrollment Number (e.g. HDM001-2025-001)"
                                value={enrollmentNumber}
                                onChange={e => setEnrollmentNumber(e.target.value.toUpperCase())}
                                required
                            />
                            <button type="submit" className="fc-search-btn" disabled={searchLoading}>
                                {searchLoading ? "Searching…" : "Search"}
                            </button>
                        </form>
                        {searchError && <div className="fc-search-error">❌ {searchError}</div>}
                    </div>
                </div>
            )}

            {/* Error when prefilled */}
            {isPrefilled && searchError && (
                <div className="fc-search-error">❌ {searchError}</div>
            )}

            {/* Loading */}
            {searchLoading && (
                <div className="fc-state-msg">⏳ Loading student details…</div>
            )}

            {/* Main content */}
            {summary && (
                <>
                    {/* Student Info Bar */}
                    <div className="fc-student-bar">
                        <div className="fc-student-bar-left">
                            <div className="fc-student-bar-name">{summary.studentName}</div>
                            <div className="fc-student-bar-meta">
                                <span>{summary.enrollmentNumber}</span>
                                <span className="fc-dot">·</span>
                                <span>Class {summary.className}</span>
                                <span className="fc-dot">·</span>
                                <span>{summary.schoolName}</span>
                                <span className="fc-dot">·</span>
                                <span>{summary.academicYear}</span>
                            </div>
                        </div>
                        <div className="fc-grand-totals">
                            <div className="fc-grand-item">
                                <span>Grand Total</span>
                                <strong>₹{fmt(summary.grandTotalFee)}</strong>
                            </div>
                            <div className="fc-grand-item green">
                                <span>Total Paid</span>
                                <strong>₹{fmt(summary.grandTotalPaid)}</strong>
                            </div>
                            <div className={`fc-grand-item ${summary.grandTotalBalance <= 0 ? "green" : "red"}`}>
                                <span>Balance Due</span>
                                <strong>₹{fmt(summary.grandTotalBalance)}</strong>
                            </div>
                        </div>
                    </div>

                    <div className="fc-two-col">

                        {/* LEFT: Fee Sections */}
                        <div className="fc-left-col">

                            {/* Tuition Fee */}
                            <div className="fc-card">
                                <div className="fc-card-header">
                                    <span className="fc-card-title">
                                        🎓 Tuition Fee
                                        <span className="fc-section-tag">Set at Admission</span>
                                    </span>
                                    <span className={`fc-status-badge ${summary.tuitionBalance <= 0 ? "paid" : "pending"}`}>
                                        {summary.tuitionBalance <= 0 ? "✅ Cleared" : "⏳ Pending"}
                                    </span>
                                </div>
                                <div className="fc-card-body">
                                    <div className="fc-breakdown">
                                        <div className="fc-breakdown-row">
                                            <span>Class Fee</span>
                                            <span>₹{fmt(summary.classFee)}</span>
                                        </div>
                                        <div className="fc-breakdown-row">
                                            <span>Student Type Fee</span>
                                            <span>₹{fmt(summary.studentTypeFee)}</span>
                                        </div>
                                        <div className="fc-breakdown-divider" />
                                        <div className="fc-breakdown-row">
                                            <span><strong>Total Tuition</strong></span>
                                            <span><strong>₹{fmt(summary.totalTuitionFee)}</strong></span>
                                        </div>
                                        <div className="fc-breakdown-row">
                                            <span>Amount Paid</span>
                                            <span className="fc-amt-paid">₹{fmt(summary.tuitionPaid)}</span>
                                        </div>
                                        <div className="fc-breakdown-divider" />
                                        <div className="fc-breakdown-row fc-breakdown-balance">
                                            <span>Balance</span>
                                            <span className={summary.tuitionBalance <= 0 ? "fc-amt-zero" : "fc-amt-due"}>
                                                ₹{fmt(summary.tuitionBalance)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="fc-progress-wrap">
                                        <div className="fc-progress-bar">
                                            <div className="fc-progress-fill" style={{ width: `${tuitionPct}%` }} />
                                        </div>
                                        <span className="fc-progress-label">{tuitionPct.toFixed(1)}% paid</span>
                                    </div>
                                    {summary.tuitionBalance > 0 && (
                                        <button
                                            className={`fc-section-select-btn ${collectTarget === "tuition" ? "active" : ""}`}
                                            onClick={() => { setCollectTarget("tuition"); setAmountPaid(""); }}
                                        >
                                            💰 Collect Tuition Fee
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Additional Fees */}
                            <div className="fc-card">
                                <div className="fc-card-header">
                                    <span className="fc-card-title">
                                        📋 Additional Fees
                                        <span className="fc-section-tag">During Academic Year</span>
                                    </span>
                                    <span className={`fc-status-badge ${summary.additionalFeeBalance <= 0 ? "paid" : "pending"}`}>
                                        {summary.additionalFees.length === 0
                                            ? "None Assigned"
                                            : summary.additionalFeeBalance <= 0 ? "✅ Cleared" : "⏳ Pending"}
                                    </span>
                                </div>
                                <div className="fc-card-body">
                                    {summary.additionalFees.length === 0 ? (
                                        <div className="fc-empty-additional">
                                            No additional fees assigned to this student yet.
                                        </div>
                                    ) : (
                                        <>
                                            <div className="fc-additional-list">
                                                {summary.additionalFees.map(fee => (
                                                    <div
                                                        key={fee.id}
                                                        className={`fc-additional-row ${fee.isPaid ? "fc-add-paid" : "fc-add-pending"}`}
                                                    >
                                                        <div className="fc-additional-info">
                                                            <span className="fc-additional-name">{fee.name}</span>
                                                            <span className="fc-additional-code">{fee.code}</span>
                                                            {fee.isPaid
                                                                ? <span className="fc-add-tag paid">Paid {fee.paidAt}</span>
                                                                : <span className="fc-add-tag pending">Unpaid</span>
                                                            }
                                                        </div>
                                                        <div className="fc-additional-right">
                                                            <span className={fee.isPaid ? "fc-amt-zero" : "fc-amt-due"}>
                                                                ₹{fmt(fee.amount)}
                                                            </span>
                                                            {!fee.isPaid && (
                                                                <button
                                                                    className={`fc-add-collect-btn ${collectTarget === fee.id ? "active" : ""}`}
                                                                    onClick={() => {
                                                                        setCollectTarget(fee.id);
                                                                        setAmountPaid(String(fee.amount));
                                                                    }}
                                                                >
                                                                    Collect
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="fc-breakdown" style={{ marginTop: "0.85rem" }}>
                                                <div className="fc-breakdown-row">
                                                    <span>Total Additional</span>
                                                    <span>₹{fmt(summary.totalAdditionalFee)}</span>
                                                </div>
                                                <div className="fc-breakdown-row">
                                                    <span>Paid</span>
                                                    <span className="fc-amt-paid">₹{fmt(summary.additionalFeePaid)}</span>
                                                </div>
                                                <div className="fc-breakdown-divider" />
                                                <div className="fc-breakdown-row fc-breakdown-balance">
                                                    <span>Balance</span>
                                                    <span className={summary.additionalFeeBalance <= 0 ? "fc-amt-zero" : "fc-amt-due"}>
                                                        ₹{fmt(summary.additionalFeeBalance)}
                                                    </span>
                                                </div>
                                            </div>

                                            {summary.totalAdditionalFee > 0 && (
                                                <div className="fc-progress-wrap" style={{ marginTop: "0.75rem" }}>
                                                    <div className="fc-progress-bar">
                                                        <div
                                                            className="fc-progress-fill fc-progress-orange"
                                                            style={{ width: `${additionalPct}%` }}
                                                        />
                                                    </div>
                                                    <span className="fc-progress-label">{additionalPct.toFixed(1)}% paid</span>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>

                        </div>{/* /fc-left-col */}

                        {/* RIGHT: Collect Payment Form */}
                        <div className="fc-card fc-collect-card">
                            <div className="fc-card-header">
                                <span className="fc-card-title">
                                    💰 Collect Payment
                                    {collectTarget === "tuition"
                                        ? <span className="fc-collect-for"> — Tuition</span>
                                        : summary?.additionalFees && (
                                            <span className="fc-collect-for">
                                                — {summary.additionalFees.find(f => f.id === collectTarget)?.name}
                                            </span>
                                        )
                                    }
                                </span>
                            </div>
                            <form className="fc-card-body fc-collect-form" onSubmit={handleCollect}>
                                {maxAmount <= 0 && collectTarget === "tuition" ? (
                                    <div className="fc-fully-paid">🎉 Tuition fee fully paid.</div>
                                ) : (
                                    <>
                                        {collectTarget === "tuition" ? (
                                            <>
                                                <div className="fc-field">
                                                    <label>Amount to Collect (₹) <span className="req">*</span></label>
                                                    <input
                                                        type="number"
                                                        placeholder={`Max ₹${fmt(maxAmount)}`}
                                                        value={amountPaid}
                                                        onChange={e => setAmountPaid(e.target.value)}
                                                        min="1"
                                                        max={maxAmount}
                                                        step="0.01"
                                                        required
                                                    />
                                                    <small>Tuition balance: <strong>₹{fmt(maxAmount)}</strong></small>
                                                </div>
                                                <div className="fc-quick-amounts">
                                                    {[500, 1000, 2000, 5000]
                                                        .filter(v => v <= maxAmount)
                                                        .map(v => (
                                                            <button key={v} type="button" className="fc-quick-btn"
                                                                onClick={() => setAmountPaid(String(v))}>
                                                                ₹{v.toLocaleString("en-IN")}
                                                            </button>
                                                        ))
                                                    }
                                                    <button type="button" className="fc-quick-btn fc-quick-full"
                                                        onClick={() => setAmountPaid(String(maxAmount))}>
                                                        Full ₹{fmt(maxAmount)}
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="fc-fixed-amount-box">
                                                <span className="fc-fixed-label">Amount</span>
                                                <span className="fc-fixed-value">₹{fmt(maxAmount)}</span>
                                                <span className="fc-fixed-note">(Full amount only)</span>
                                            </div>
                                        )}

                                        {/* Payment Mode */}
                                        <div className="fc-field">
                                            <label>Payment Mode <span className="req">*</span></label>
                                            <div className="fc-mode-grid">
                                                {PAYMENT_MODES.map(m => (
                                                    <button key={m.value} type="button"
                                                        className={`fc-mode-btn ${paymentMode === m.value ? "active" : ""}`}
                                                        onClick={() => setPaymentMode(m.value)}>
                                                        <span>{m.icon}</span>
                                                        <span>{m.label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <button type="submit" className="fc-collect-btn" disabled={collectLoading}>
                                            {collectLoading ? "Processing…" : "✅ Collect Fee"}
                                        </button>

                                        {collectTarget !== "tuition" && (
                                            <button type="button" className="fc-cancel-link"
                                                onClick={() => { setCollectTarget("tuition"); setAmountPaid(""); }}>
                                                ← Back to Tuition
                                            </button>
                                        )}
                                    </>
                                )}
                            </form>
                        </div>

                    </div>{/* /fc-two-col */}
                </>
            )}
        </div>
    );
}