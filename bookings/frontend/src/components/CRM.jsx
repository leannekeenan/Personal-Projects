import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../App.css'; 

function CRM() {
    const navigate = useNavigate();
    const [customers, setCustomers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [history, setHistory] = useState([]);

    useEffect(() => { fetchCustomers(); }, []);

    const fetchCustomers = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/admin/customers');
            setCustomers(Array.isArray(res.data) ? res.data : []);
        } catch (err) { console.error("Fetch Error", err); }
    };

    const viewHistory = async (email) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/admin/customers/${email}/history`);
            setHistory(res.data);
            setSelectedCustomer(email);
        } catch (err) { console.error("History Error", err); }
    };

    const filtered = customers.filter(c => 
        c.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone?.includes(searchTerm)
    );

    return (
        <div className="admin-container">
            <div className="admin-nav">
                <button onClick={() => navigate('/admin')}>📅 Dashboard</button>
                <button className="active-nav">👥 CRM</button>
            </div>

            <div className="admin-header"><h1>Customer Manager</h1></div>

            <div className="search-bar-container">
                <input 
                    type="text" className="search-input" 
                    placeholder="Search by ID/Email/Name..." 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                />
            </div>

            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Primary ID (Email)</th>
                        <th>Phone</th>
                        <th>Total Visits</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filtered.map(c => (
                        <tr key={c._id}>
                            <td>{c.clientName}</td>
                            <td>{c.email}</td>
                            <td>{c.phone}</td>
                            <td>{c.totalBookings}</td>
                            <td><button className="add-btn" onClick={() => viewHistory(c.email)}>History</button></td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {selectedCustomer && (
                <div className="history-section">
                    <h2>History for {selectedCustomer}</h2>
                    <button onClick={() => setSelectedCustomer(null)}>Close</button>
                    <table className="admin-table">
                        <thead>
                            <tr><th>Date</th><th>Service</th><th>Status</th></tr>
                        </thead>
                        <tbody>
                            {history.map(h => (
                                <tr key={h._id}>
                                    <td>{new Date(h.date).toLocaleDateString()}</td>
                                    <td>{h.service}</td>
                                    <td><span className={`badge ${h.status?.toLowerCase()}`}>{h.status || 'Scheduled'}</span></td>
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