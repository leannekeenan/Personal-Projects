import React, { useState, useEffect } from 'react';
import axios from 'axios';

function CRM() {
    const [customers, setCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [history, setHistory] = useState([]);

    // Fetch the unique list of customers
    useEffect(() => {
        axios.get('http://localhost:5000/api/admin/customers')
            .then(res => setCustomers(res.data))
            .catch(err => console.error(err));
    }, []);

    // Fetch history when a name is clicked
    const viewHistory = async (email) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/admin/customers/${email}/history`);
            setHistory(res.data);
            setSelectedCustomer(email);
        } catch (err) {
            console.error("Error fetching history", err);
        }
    };

    return (
        <div className="admin-container">
            <h1>Customer Relationship Manager</h1>
            
            {/* 1. THE MAIN CUSTOMER LIST */}
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Customer Name</th>
                        <th>Email (ID)</th>
                        <th>Total Visits</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {customers.map(c => (
                        <tr key={c.email}>
                            <td>{c.clientName}</td>
                            <td>{c.email}</td>
                            <td>{c.totalBookings}</td>
                            <td>
                                <button onClick={() => viewHistory(c.email)}>View History</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* 2. THE HISTORY VIEW (Shows up when you click a button) */}
            {selectedCustomer && (
                <div className="history-modal" style={{ marginTop: '40px', padding: '20px', background: '#333', borderRadius: '10px' }}>
                    <h2>History for {selectedCustomer}</h2>
                    <button onClick={() => setSelectedCustomer(null)}>Close History</button>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Service</th>
                                <th>Notes</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map(h => (
                                <tr key={h._id}>
                                    <td>{new Date(h.date).toLocaleDateString()}</td>
                                    <td>{h.service}</td>
                                    <td>{h.notes}</td>
                                    <td><span className="status-badge">Completed</span></td> 
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default CRM;