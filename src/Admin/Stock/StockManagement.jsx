import { useState, useEffect } from "react";
import { api } from "../../api";
import "./StockManagement.css";
import IssueMaterial from "../../shared/IssueMaterial";

const TABS = [
    { key: "all", label: "📦 All Stock" },
    { key: "create", label: "➕ Create Item" },
    { key: "update", label: "🔢 Update Quantity" },
    { key: "assign", label: "👤 Assign Faculty" },
    { key: "issue", label: "📤 Issue Material" },
];

export default function StockManagement({ goBack }) {
    const [activeTab, setActiveTab] = useState("all");
    const [academicYear, setAcademicYear] = useState(null);
    const [stockItems, setStockItems] = useState([]);
    const [categories, setCategories] = useState([]);

    const loadStockData = () => {
        api.get("/stock/all")
            .then(r => {
                setStockItems(r.data);
                const cats = [...new Set(r.data.map(i => i.categoryName).filter(Boolean))];
                setCategories(cats);
            })
            .catch(() => { });
    };

    useEffect(() => {
        api.get("/academicyears/active")
            .then(r => setAcademicYear(r.data))
            .catch(() => { });
        loadStockData();
    }, []);

    return (
        <div className="sm-container">

            <div className="sm-page-header">
                <div>
                    <h2 className="sm-page-title">Stock Management</h2>
                    <p className="sm-page-subtitle">
                        Manage stock items, quantities, faculty assignments and material issues
                        {academicYear && (
                            <span className="sm-active-year"> &nbsp;|&nbsp; ✅ Active Year: {academicYear.yearName}</span>
                        )}
                    </p>
                </div>
                <button className="sm-back-btn" onClick={goBack}>← Back</button>
            </div>

            <div className="sm-tabs">
                {TABS.map(tab => (
                    <button key={tab.key}
                        className={`sm-tab ${activeTab === tab.key ? "active" : ""}`}
                        onClick={() => setActiveTab(tab.key)}>
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="sm-content">
                {activeTab === "all" && <AllStock stockItems={stockItems} onRefresh={loadStockData} />}
                {activeTab === "create" && <CreateItem
                    onSuccess={() => { loadStockData(); setActiveTab("all"); }}
                    academicYear={academicYear}
                    categories={categories} />}
                {activeTab === "update" && <UpdateQuantity stockItems={stockItems} />}
                {activeTab === "assign" && <AssignFaculty categories={categories} />}
                {activeTab === "issue" && <IssueMaterial stockItems={stockItems} />}
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────
   TAB 1 — All Stock
───────────────────────────────────────── */
function AllStock({ stockItems, onRefresh }) {
    const [search, setSearch] = useState("");

    const filtered = stockItems.filter(i =>
        i.itemName?.toLowerCase().includes(search.toLowerCase()) ||
        i.categoryName?.toLowerCase().includes(search.toLowerCase()) ||
        i.stockItemId?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <div className="sm-toolbar">
                <input className="sm-search"
                    placeholder="🔍 Search by item, category, ID..."
                    value={search} onChange={e => setSearch(e.target.value)} />
                <span className="sm-count">{filtered.length} item{filtered.length !== 1 ? "s" : ""}</span>
                <button className="sm-refresh-btn" onClick={onRefresh}>🔄 Refresh</button>
            </div>
            <div className="sm-card">
                {filtered.length === 0 ? (
                    <div className="sm-empty">No stock items found.</div>
                ) : (
                    <table className="sm-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Stock ID</th>
                                <th>Item Name</th>
                                <th>Category</th>
                                <th>Quantity</th>
                                <th>Academic Year</th>
                                <th>Created At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((item, index) => (
                                <tr key={item.stockItemId}>
                                    <td>{index + 1}</td>
                                    <td><span className="sm-id-badge">{item.stockItemId}</span></td>
                                    <td>{item.itemName}</td>
                                    <td><span className="sm-cat-badge">{item.categoryName}</span></td>
                                    <td className={item.quantity <= 5 ? "sm-low-qty" : ""}>{item.quantity}</td>
                                    <td>{item.academicYear}</td>
                                    <td>{new Date(item.createdAt).toLocaleDateString("en-IN")}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────
   TAB 2 — Create Item
───────────────────────────────────────── */
function CreateItem({ onSuccess, academicYear, categories }) {
    const [form, setForm] = useState({ itemName: "", categoryName: "", quantity: "" });
    const [customCategory, setCustomCategory] = useState(false);
    const [loading, setLoading] = useState(false);
    const [notify, setNotify] = useState(null);

    const showNotify = (type, message) => {
        setNotify({ type, message });
        setTimeout(() => setNotify(null), 3500);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!academicYear) { showNotify("error", "No active academic year found."); return; }
        setLoading(true);
        try {
            await api.post("/stock/create", {
                itemName: form.itemName,
                categoryName: form.categoryName,
                quantity: Number(form.quantity),
                academicYear: academicYear.yearName,
            });
            showNotify("success", "Stock item created successfully.");
            setForm({ itemName: "", categoryName: "", quantity: "" });
            setTimeout(onSuccess, 1200);
        } catch (err) {
            showNotify("error", err.response?.data || "Failed to create stock item.");
        } finally { setLoading(false); }
    };

    return (
        <div className="sm-form-wrap">
            {notify && (
                <div className={`sm-notification ${notify.type}`}>
                    {notify.type === "success" ? "✅" : "❌"} {notify.message}
                </div>
            )}
            <h3 className="sm-form-title">Create New Stock Item</h3>
            <form className="sm-form" onSubmit={handleSubmit}>
                <div className="sm-form-grid">

                    <div className="sm-field">
                        <label>Item Name <span className="req">*</span></label>
                        <input value={form.itemName} required placeholder="e.g. Notebook"
                            onChange={e => setForm(p => ({ ...p, itemName: e.target.value }))} />
                    </div>

                    <div className="sm-field">
                        <label>Category <span className="req">*</span></label>
                        {!customCategory ? (
                            <div className="sm-select-row">
                                <select value={form.categoryName} required
                                    onChange={e => setForm(p => ({ ...p, categoryName: e.target.value }))}>
                                    <option value="">— Select Category —</option>
                                    {categories.map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                                <button type="button" className="sm-new-btn"
                                    onClick={() => { setCustomCategory(true); setForm(p => ({ ...p, categoryName: "" })); }}>
                                    + New
                                </button>
                            </div>
                        ) : (
                            <div className="sm-select-row">
                                <input value={form.categoryName} required autoFocus
                                    placeholder="Type new category name"
                                    onChange={e => setForm(p => ({ ...p, categoryName: e.target.value }))} />
                                <button type="button" className="sm-new-btn"
                                    onClick={() => { setCustomCategory(false); setForm(p => ({ ...p, categoryName: "" })); }}>
                                    ↩
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="sm-field">
                        <label>Quantity <span className="req">*</span></label>
                        <input type="number" min="0" value={form.quantity} required
                            onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))} />
                    </div>

                    <div className="sm-field">
                        <label>Academic Year</label>
                        <input
                            value={academicYear?.yearName || "No active year"}
                            readOnly
                            className="sm-readonly-input"
                        />
                    </div>

                </div>

                {!academicYear && (
                    <small className="sm-warn">⚠️ No active academic year. Create one in Fee Assign first.</small>
                )}

                <button type="submit" className="sm-submit-btn" disabled={loading || !academicYear}>
                    {loading ? "Creating…" : "➕ Create Stock Item"}
                </button>
            </form>
        </div>
    );
}

/* ─────────────────────────────────────────
   TAB 3 — Update Quantity
───────────────────────────────────────── */
function UpdateQuantity({ stockItems }) {
    const [form, setForm] = useState({ stockItemId: "", quantity: "" });
    const [selectedItem, setSelectedItem] = useState(null);
    const [loading, setLoading] = useState(false);
    const [notify, setNotify] = useState(null);

    const showNotify = (type, message) => {
        setNotify({ type, message });
        setTimeout(() => setNotify(null), 3500);
    };

    const handleSelect = (id) => {
        setForm(p => ({ ...p, stockItemId: id }));
        setSelectedItem(stockItems.find(i => i.stockItemId === id) || null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.put("/stock/update-quantity", {
                stockItemId: form.stockItemId,
                quantity: Number(form.quantity),
            });
            showNotify("success", "Quantity updated successfully.");
            setForm({ stockItemId: "", quantity: "" });
            setSelectedItem(null);
        } catch (err) {
            showNotify("error", err.response?.data || "Failed to update quantity.");
        } finally { setLoading(false); }
    };

    return (
        <div className="sm-form-wrap">
            {notify && (
                <div className={`sm-notification ${notify.type}`}>
                    {notify.type === "success" ? "✅" : "❌"} {notify.message}
                </div>
            )}
            <h3 className="sm-form-title">Update Stock Quantity</h3>
            <form className="sm-form" onSubmit={handleSubmit}>
                <div className="sm-form-grid">

                    <div className="sm-field sm-field-full">
                        <label>Stock Item <span className="req">*</span></label>
                        <select value={form.stockItemId} required onChange={e => handleSelect(e.target.value)}>
                            <option value="">— Select Stock Item —</option>
                            {stockItems.map(i => (
                                <option key={i.stockItemId} value={i.stockItemId}>
                                    {i.stockItemId} — {i.itemName} ({i.categoryName})
                                </option>
                            ))}
                        </select>
                        {selectedItem && (
                            <div className="sm-item-info">
                                📦 <strong>{selectedItem.itemName}</strong> &nbsp;|&nbsp;
                                Category: <span className="sm-cat-badge">{selectedItem.categoryName}</span> &nbsp;|&nbsp;
                                Current Qty: <strong className={selectedItem.quantity <= 5 ? "sm-low-qty" : ""}>{selectedItem.quantity}</strong>
                            </div>
                        )}
                    </div>

                    <div className="sm-field">
                        <label>New Quantity <span className="req">*</span></label>
                        <input type="number" min="0" value={form.quantity} required
                            onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))} />
                    </div>

                </div>
                <button type="submit" className="sm-submit-btn" disabled={loading}>
                    {loading ? "Updating…" : "🔢 Update Quantity"}
                </button>
            </form>
        </div>
    );
}

/* ─────────────────────────────────────────
   TAB 4 — Assign Faculty
───────────────────────────────────────── */
function AssignFaculty({ categories }) {
    const [users, setUsers] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [form, setForm] = useState({ userId: "", categoryName: "" });
    const [loading, setLoading] = useState(false);
    const [notify, setNotify] = useState(null);

    const showNotify = (type, message) => {
        setNotify({ type, message });
        setTimeout(() => setNotify(null), 3500);
    };

    const loadAssignments = async () => {
        try {
            const res = await api.get("/stock/my-assignments");
            setAssignments(res.data);
        } catch { /* silent */ }
    };

    const loadUsers = async () => {
        try {
            const res = await api.get("/auth/users");
            setUsers(res.data.filter(u => u.role === 3));
        } catch {
            showNotify("error", "Failed to load faculty.");
        }
    };

    useEffect(() => {
        loadUsers();
        loadAssignments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleAssign = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post("/stock/assign-faculty", {
                userId: form.userId,
                categoryName: form.categoryName,
            });
            showNotify("success", "Faculty assigned successfully.");
            setForm({ userId: "", categoryName: "" });
            loadAssignments();
        } catch (err) {
            showNotify("error", err.response?.data || "Failed to assign faculty.");
        } finally { setLoading(false); }
    };

    const handleUnassign = async (userId, categoryName) => {
        try {
            await api.delete("/stock/unassign-faculty", { data: { userId, categoryName } });
            showNotify("success", "Faculty unassigned.");
            loadAssignments();
        } catch (err) {
            showNotify("error", err.response?.data || "Failed to unassign.");
        }
    };

    return (
        <div className="sm-form-wrap">
            {notify && (
                <div className={`sm-notification ${notify.type}`}>
                    {notify.type === "success" ? "✅" : "❌"} {notify.message}
                </div>
            )}
            <h3 className="sm-form-title">Assign Faculty to Category</h3>
            <form className="sm-form" onSubmit={handleAssign}>
                <div className="sm-form-grid">

                    <div className="sm-field">
                        <label>Faculty <span className="req">*</span></label>
                        <select value={form.userId} required
                            onChange={e => setForm(p => ({ ...p, userId: e.target.value }))}>
                            <option value="">— Select Faculty —</option>
                            {users.map(u => (
                                <option key={u.userId} value={u.userId}>
                                    {u.fullName} ({u.userId})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="sm-field">
                        <label>Category <span className="req">*</span></label>
                        <select value={form.categoryName} required
                            onChange={e => setForm(p => ({ ...p, categoryName: e.target.value }))}>
                            <option value="">— Select Category —</option>
                            {categories.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>

                </div>
                <button type="submit" className="sm-submit-btn" disabled={loading}>
                    {loading ? "Assigning…" : "👤 Assign Faculty"}
                </button>
            </form>

            {assignments.length > 0 && (
                <div className="sm-assignments">
                    <h4>Current Assignments</h4>
                    <table className="sm-table">
                        <thead>
                            <tr><th>Faculty ID</th><th>Category</th><th>Action</th></tr>
                        </thead>
                        <tbody>
                            {assignments.map((a, i) => (
                                <tr key={i}>
                                    <td><span className="sm-id-badge">{a.userId}</span></td>
                                    <td><span className="sm-cat-badge">{a.categoryName}</span></td>
                                    <td>
                                        <button className="sm-unassign-btn"
                                            onClick={() => handleUnassign(a.userId, a.categoryName)}>
                                            🗑️ Unassign
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}