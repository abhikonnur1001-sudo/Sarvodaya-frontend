import React from "react";
import "./AccountsDashboard.css";

const AccountantDashboard = () => {
    return (
        <div className="ac-dashboard">

            {/* 🔷 KPI CARDS */}
            <div className="ac-kpi-row">
                <div className="ac-card">💰 Today Collection <h2>₹1,25,000</h2></div>
                <div className="ac-card">📅 Monthly Collection <h2>₹18,40,000</h2></div>
                <div className="ac-card">⚠ Pending Fees <h2>235</h2></div>
                <div className="ac-card">✅ Authenticated Today <h2>42</h2></div>
            </div>

            {/* 🔷 MAIN GRID */}
            <div className="ac-main-grid">

                {/* LEFT SIDE */}
                <div className="ac-left">

                    {/* Pending Admissions */}
                    <div className="ac-section">
                        <h3>📥 Pending Admissions (HM Approved)</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Class</th>
                                    <th>School</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Ravi Kumar</td>
                                    <td>5</td>
                                    <td>English School</td>
                                    <td><button className="btn-primary">Collect Fee</button></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Fee Collection */}
                    <div className="ac-section">
                        <h3>💳 Fee Collection</h3>

                        <input placeholder="Search Student..." className="ac-input" />

                        <div className="ac-fee-box">
                            <p>Total Fee: ₹25,000</p>
                            <p>Paid: ₹10,000</p>
                            <p>Balance: ₹15,000</p>
                        </div>

                        <button className="btn-primary">Collect Payment</button>
                        <button className="btn-secondary">Generate Receipt</button>
                    </div>

                </div>

                {/* RIGHT SIDE */}
                <div className="ac-right">

                    {/* Alerts */}
                    <div className="ac-section">
                        <h3>⚠ Alerts</h3>
                        <ul>
                            <li>120 students pending fee</li>
                            <li>15 stock approvals pending</li>
                            <li>8 TC clearance pending</li>
                        </ul>
                    </div>

                    {/* Stock Eligibility */}
                    <div className="ac-section">
                        <h3>📦 Stock Eligibility</h3>
                        <p>Ravi → ✅ Books Allowed</p>
                        <p>Ajay → ❌ Not Eligible</p>
                    </div>

                    {/* TC Clearance */}
                    <div className="ac-section">
                        <h3>📄 TC Clearance</h3>
                        <p>Check dues before issuing TC</p>
                        <button className="btn-primary">Approve Clearance</button>
                    </div>

                </div>

            </div>

        </div>
    );
};

export default AccountantDashboard;