import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../App.css'; 

function CRM() {
    const navigate = useNavigate();
    const [customers, setCustomers] = useState([]);
    const [searchTerm, setSearchTerm] = useState(''); // SEARCH STATE
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [history, setHistory] = useState([]);

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/admin/customers');
            setCustomers(res.data);
        } catch (err) {
            console.error("CRM Fetch Error:", err);
        }
    };

    const viewHistory = async (email) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/admin/customers/${email}/history`);
            setHistory(res.data);
            setSelectedCustomer(email);
        } catch (err) {
            console.error("Error fetching history", err);
        }
    };

    // SEARCH LOGIC
    const filteredCustomers = customers.filter(c => {
        const lowerSearch = searchTerm.toLowerCase();
        return (
            c.clientName.toLowerCase().includes(lowerSearch) ||
            c.email.toLowerCase().includes(lowerSearch) ||
            (c.phone && c.phone.includes(searchTerm))
        );
    });

    return (
        <div className="admin-container">
            {/* NAVIGATION */}
            <div className="admin-nav" style={{ 
                marginBottom: '20px', 
                display: 'flex', 
                gap: '10px',
                borderBottom: '1px solid var(--primary-color)',
                paddingBottom: '15px' 
            }}>
                <button 
                    onClick={() => navigate('/admin')}
                    style={{ background: 'transparent', border: '1px solid var(--primary-color)' }}
                >
                    📅 Dashboard
                </button>
                <button style={{ background: 'var(--primary-color)' }}>
                    👥 CRM
                </button>
            </div>

            <div className="admin-header">
                <h1>Customer Relationship Manager</h1>
            </div>

            {/* SEARCH BAR - MATCHING YOUR DASHBOARD STYLE */}
            <div className="search-bar-container">
                <input 
                    type="text" 
                    className="search-input"
                    placeholder="Search Customer ID (Email), Name, or Phone..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* MAIN CUSTOMER TABLE */}
            <div className="table-responsive-wrapper">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Customer Name</th>
                            <th>Email (Primary ID)</th>
                            <th>Phone</th>
                            <th>Total Visits</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCustomers.length > 0 ? (
                            filteredCustomers.map(c => (
                                <tr key={c.email}>
                                    <td>{c.clientName}</td>
                                    <td>{c.email}</td>
                                    <td>{c.phone}</td>
                                    <td>{c.totalBookings}</td>
                                    <td>
                                        <button className="add-btn" onClick={() => viewHistory(c.email)}>
                                            View Full History
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="5" style={{textAlign: 'center', padding: '20px'}}>No records match your search.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* HISTORY SECTION */}
            {selectedCustomer && (
                <div className="history-section" style={{ marginTop: '40px', padding: '20px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid var(--primary-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h2 style={{color: 'var(--primary-color)', margin: 0}}>📜 History: {selectedCustomer}</h2>
                        <button className="delete-btn" onClick={() => setSelectedCustomer(null)}>Close History</button>
                    </div>
                    
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Date & Time</th>
                                <th>Service</th>
                                <th>Admin Notes</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map(h => (
                                <tr key={h._id}>
                                    <td>{new Date(h.date).toLocaleString()}</td>
                                    <td>{h.service}</td>
                                    <td>{h.notes || '—'}</td>
                                    <td>
                                        <span className={`badge ${h.status ? h.status.toLowerCase() : 'scheduled'}`}>
                                            {h.status || 'Scheduled'}
                                        </span>
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

export default CRM;