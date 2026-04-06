import React from "react";
import "./AccountsDashboard.css";

const Receipt = ({ receipt, goBack }) => {
    return (
        <div className="receipt-container">

            {/* HEADER */}
            <div className="receipt-header">
                <h2>SARVODAYA GROUP OF INSTITUTIONS</h2>
                <p>Fee Receipt</p>
            </div>

            {/* DETAILS */}
            <div className="receipt-details">
                <div><b>Receipt No:</b> RCPT-{receipt.receiptId}</div>
                <div><b>Date:</b> {new Date(receipt.date).toLocaleString()}</div>
            </div>

            {/* STUDENT INFO */}
            <div className="receipt-section">
                <p><b>Student Name:</b> {receipt.studentName}</p>
                <p><b>Class:</b> {receipt.className}</p>
            </div>

            {/* PAYMENT INFO */}
            <div className="receipt-section">
                <p><b>Amount Paid:</b> ₹{receipt.amount}</p>
                <p><b>Payment Mode:</b> {receipt.paymentMode}</p>
            </div>

            {/* FOOTER */}
            <div className="receipt-footer">
                <p>Received with thanks</p>
                <br />
                <p>Authorized Signature</p>
            </div>

            {/* ACTIONS */}
            <div style={{ marginTop: "20px" }}>
                <button className="btn" onClick={goBack}>Back</button>
                <button className="btn primary" onClick={() => window.print()}>
                    Print
                </button>
            </div>

        </div>
    );
};

export default Receipt;