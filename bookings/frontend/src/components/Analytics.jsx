import { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { useNavigate, useLocation } from 'react-router-dom';
import '../App.css';

function Analytics() {
    const navigate = useNavigate();
    const location = useLocation();
    const [data, setData] = useState(null);

    useEffect(() => {
        if (localStorage.getItem('isAdmin') !== 'true') navigate('/login');
        const fetchData = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/admin/analytics');
                setData(res.data);
            } catch (err) { console.error("Analytics Error:", err); }
        };
        fetchData();
    }, [navigate]);

    const exportToExcel = () => {
        if (!data || !data.exportData) return alert("No data to export");
        const worksheet = XLSX.utils.json_to_sheet(data.exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Business_Data");
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const finalData = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
        saveAs(finalData, `Grimoire_Analytics_${new Date().toLocaleDateString()}.xlsx`);
    };

    if (!data) return <div className="admin-container"><h1 style={{color: 'white'}}>Loading Analytics...</h1></div>;

    return (
        <div className="admin-container">
            {/* NAVIGATION BAR */}
            <div className="admin-nav" style={{ justifyContent: 'space-between', display: 'flex', width: '100%', borderBottom: '1px solid white', paddingBottom: '15px' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className={`nav-btn ${location.pathname === '/admin' ? 'active' : ''}`} onClick={() => navigate('/admin')}>📅 Dashboard</button>
                    <button className={`nav-btn ${location.pathname === '/crm' ? 'active' : ''}`} onClick={() => navigate('/crm')}>👥 CRM</button>
                    <button className={`nav-btn ${location.pathname === '/analytics' ? 'active' : ''}`} onClick={() => navigate('/analytics')}>📈 Analytics</button>
                </div>
                <button className="delete-btn" onClick={() => { localStorage.removeItem('isAdmin'); navigate('/login'); }}>🔒 Lock Grimoire</button>
            </div>

            {/* HEADER WITH EXPORT BUTTON */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
                <h1 style={{ color: 'white' }}>Business Analytics</h1>
                <button className="add-btn" onClick={exportToExcel} style={{ background: '#28a745' }}>
                    📥 Export to Excel (.xlsx)
                </button>
            </div>

            {/* STATS CARDS - ALL THREE RESTORED */}
            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '20px' }}>
                <div className="stat-card" style={{ background: '#222', padding: '20px', borderRadius: '10px', border: '1px solid #444', textAlign: 'center' }}>
                    <h3 style={{ color: '#888' }}>Total Revenue</h3>
                    <p style={{ color: '#28a745', fontSize: '2rem', fontWeight: 'bold' }}>${data.summary.totalRevenue}</p>
                </div>
                <div className="stat-card" style={{ background: '#222', padding: '20px', borderRadius: '10px', border: '1px solid #444', textAlign: 'center' }}>
                    <h3 style={{ color: '#888' }}>Total Appointments</h3>
                    <p style={{ color: 'white', fontSize: '2rem', fontWeight: 'bold' }}>{data.summary.count}</p>
                </div>
                <div className="stat-card" style={{ background: '#222', padding: '20px', borderRadius: '10px', border: '1px solid #444', textAlign: 'center' }}>
                    <h3 style={{ color: '#888' }}>Avg. Ticket</h3>
                    <p style={{ color: '#007bff', fontSize: '2rem', fontWeight: 'bold' }}>
                        ${data.summary.count > 0 ? (data.summary.totalRevenue / data.summary.count).toFixed(2) : 0}
                    </p>
                </div>
            </div>

            {/* REVENUE TABLE */}
            <h2 style={{ color: 'white', marginTop: '40px' }}>Revenue by Service</h2>
            <table className="admin-table">
                <thead><tr><th>Service</th><th>Revenue Generated</th></tr></thead>
                <tbody>
                    {data.revenueByService.map(item => (
                        <tr key={item._id}>
                            <td>{item._id}</td>
                            <td>${item.value}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default Analytics;