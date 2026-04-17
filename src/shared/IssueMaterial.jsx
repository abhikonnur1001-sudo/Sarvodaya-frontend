import { useState } from "react";
import { api } from "../api";
import "../Admin/Stock/StockManagement.css";   // reuse same styles

export default function IssueMaterial({ stockItems }) {
    const [enrollmentId, setEnrollmentId] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [checkedItems, setCheckedItems] = useState({});
    const [loading, setLoading] = useState(false);
    const [notify, setNotify] = useState(null);
    const [issuedList, setIssuedList] = useState([]);
    const [searchEnroll, setSearchEnroll] = useState("");

    const showNotify = (type, message) => {
        setNotify({ type, message });
        setTimeout(() => setNotify(null), 3500);
    };

    // Group stock items by category
    const grouped = stockItems.reduce((acc, item) => {
        if (!acc[item.categoryName]) acc[item.categoryName] = [];
        acc[item.categoryName].push(item);
        return acc;
    }, {});

    const handleOpenModal = () => {
        if (!enrollmentId.trim()) {
            showNotify("error", "Enter a student enrollment ID first.");
            return;
        }
        setCheckedItems({});
        setShowModal(true);
    };

    const handleCheck = (stockItemId, checked) => {
        setCheckedItems(prev => {
            const updated = { ...prev };
            if (checked) updated[stockItemId] = 1;
            else delete updated[stockItemId];
            return updated;
        });
    };

    const handleQtyChange = (stockItemId, qty) => {
        setCheckedItems(prev => ({ ...prev, [stockItemId]: Number(qty) }));
    };

    const handleConfirmIssue = async () => {
        const selected = Object.keys(checkedItems);
        if (selected.length === 0) {
            showNotify("error", "Select at least one item.");
            return;
        }
        setLoading(true);
        try {
            await Promise.all(
                selected.map(stockItemId =>
                    api.post("/stock/issue", {
                        stockItemId,
                        studentEnrollmentId: enrollmentId.trim(),
                        quantity: checkedItems[stockItemId],
                        remarks: "",
                    })
                )
            );
            showNotify("success", `${selected.length} item(s) issued to ${enrollmentId}.`);
            setShowModal(false);
            setEnrollmentId("");
            setCheckedItems({});
        } catch (err) {
            showNotify("error", err.response?.data || "Failed to issue materials.");
        } finally { setLoading(false); }
    };

    const handleSearch = async () => {
        if (!searchEnroll.trim()) return;
        try {
            const res = await api.get(`/stock/issued/${searchEnroll.trim()}`);
            setIssuedList(res.data);
            if (res.data.length === 0) showNotify("error", "No records found.");
        } catch {
            showNotify("error", "No records found for this enrollment ID.");
            setIssuedList([]);
        }
    };

    return (
        <div className="sm-form-wrap">
            {notify && (
                <div className={`sm-notification ${notify.type}`}>
                    {notify.type === "success" ? "✅" : "❌"} {notify.message}
                </div>
            )}

            {/* Enrollment ID input */}
            <h3 className="sm-form-title">Issue Material to Student</h3>
            <div className="sm-form">
                <div className="sm-field">
                    <label>Student Enrollment ID <span className="req">*</span></label>
                    <div className="sm-search-row">
                        <input
                            className="sm-search"
                            placeholder="e.g. ENR2025001"
                            value={enrollmentId}
                            onChange={e => setEnrollmentId(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && handleOpenModal()}
                        />
                        <button className="sm-submit-btn" type="button" onClick={handleOpenModal}>
                            📋 Issue Material
                        </button>
                    </div>
                </div>
            </div>

            {/* Checklist Modal */}
            {showModal && (
                <div className="ul-overlay" onClick={() => setShowModal(false)}>
                    <div className="sm-issue-modal" onClick={e => e.stopPropagation()}>

                        <div className="ul-modal-header">
                            <span>📋 Issue Materials — <strong>{enrollmentId}</strong></span>
                            <button className="ul-modal-close" onClick={() => setShowModal(false)}>✖</button>
                        </div>

                        <div className="sm-issue-modal-body">
                            {Object.keys(grouped).length === 0 ? (
                                <div className="sm-empty">No stock items available.</div>
                            ) : (
                                Object.entries(grouped).map(([category, items]) => (
                                    <div key={category} className="sm-issue-category">
                                        <div className="sm-issue-cat-header">
                                            <span className="sm-cat-badge">📦 {category}</span>
                                        </div>
                                        <table className="sm-table">
                                            <thead>
                                                <tr>
                                                    <th style={{ width: "40px" }}></th>
                                                    <th>Stock ID</th>
                                                    <th>Item Name</th>
                                                    <th>Available</th>
                                                    <th>Qty to Issue</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {items.map(item => {
                                                    const isChecked = !!checkedItems[item.stockItemId];
                                                    return (
                                                        <tr key={item.stockItemId}
                                                            className={isChecked ? "sm-row-checked" : ""}
                                                            onClick={() => handleCheck(item.stockItemId, !isChecked)}
                                                            style={{ cursor: "pointer" }}>
                                                            <td onClick={e => e.stopPropagation()}>
                                                                <input
                                                                    type="checkbox"
                                                                    className="sm-checkbox"
                                                                    checked={isChecked}
                                                                    onChange={e => handleCheck(item.stockItemId, e.target.checked)}
                                                                />
                                                            </td>
                                                            <td><span className="sm-id-badge">{item.stockItemId}</span></td>
                                                            <td>{item.itemName}</td>
                                                            <td className={item.quantity <= 5 ? "sm-low-qty" : ""}>
                                                                {item.quantity}
                                                            </td>
                                                            <td onClick={e => e.stopPropagation()}>
                                                                {isChecked ? (
                                                                    <input
                                                                        type="number"
                                                                        min="1"
                                                                        max={item.quantity}
                                                                        value={checkedItems[item.stockItemId]}
                                                                        className="sm-qty-input"
                                                                        onChange={e => handleQtyChange(item.stockItemId, e.target.value)}
                                                                    />
                                                                ) : (
                                                                    <span className="sm-qty-dash">—</span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="ul-modal-footer">
                            <div className="sm-issue-selected">
                                {Object.keys(checkedItems).length} item(s) selected
                            </div>
                            <button className="ul-cancel-btn" onClick={() => setShowModal(false)}>
                                Cancel
                            </button>
                            <button className="sm-submit-btn" onClick={handleConfirmIssue} disabled={loading}>
                                {loading ? "Issuing…" : `✅ Confirm Issue (${Object.keys(checkedItems).length})`}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Issued history search */}
            <div className="sm-issued-search">
                <h4>View Issued Materials by Student</h4>
                <div className="sm-search-row">
                    <input className="sm-search" placeholder="Enter Enrollment ID..."
                        value={searchEnroll}
                        onChange={e => setSearchEnroll(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && handleSearch()} />
                    <button className="sm-submit-btn" type="button" onClick={handleSearch}>
                        🔍 Search
                    </button>
                </div>
                {issuedList.length > 0 && (
                    <table className="sm-table" style={{ marginTop: "1rem" }}>
                        <thead>
                            <tr><th>Stock ID</th><th>Quantity</th><th>Issued At</th><th>Remarks</th></tr>
                        </thead>
                        <tbody>
                            {issuedList.map((item, i) => (
                                <tr key={i}>
                                    <td><span className="sm-id-badge">{item.stockItemId}</span></td>
                                    <td>{item.quantity}</td>
                                    <td>{new Date(item.issuedAt).toLocaleDateString("en-IN")}</td>
                                    <td>{item.remarks || "—"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}