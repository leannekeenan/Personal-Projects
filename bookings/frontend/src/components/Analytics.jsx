import { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { useNavigate } from 'react-router-dom';

function Analytics() {
    const navigate = useNavigate();
    const [data, setData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/admin/analytics');
                setData(res.data);
            } catch (err) { console.error(err); }
        };
        fetchData();
    }, []);

    const exportToExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(data.exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Financial Report");
        
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const finalData = new Blob([excelBuffer], { type: 'application/octet-stream' });
        saveAs(finalData, `Grimoire_Financial_Report_${new Date().toLocaleDateString()}.xlsx`);
    };

    if (!data) return <div className="admin-container">Loading Intelligence...</div>;

    return (
        <div className="admin-container">
            <div className="admin-nav" style={{ display: 'flex', gap: '10px', borderBottom: '1px solid white', paddingBottom: '15px' }}>
                <button className="nav-btn" onClick={() => navigate('/dashboard')}>📅 Dashboard</button>
                <button className="nav-btn" onClick={() => navigate('/crm')}>👥 CRM</button>
                <button className="nav-btn active">📈 Analytics</button>
            </div>

            <div className="admin-header">
                <h1>Command Center</h1>
                <button className="add-btn" onClick={exportToExcel}>📥 Export Financial Excel</button>
            </div>

            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '20px' }}>
                <div className="stat-card" style={{ background: '#222', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #4caf50' }}>
                    <h3>Total Revenue</h3>
                    <p style={{ fontSize: '2rem', color: '#4caf50' }}>${data.summary.totalRevenue.toLocaleString()}</p>
                </div>
                <div className="stat-card" style={{ background: '#222', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #2196f3' }}>
                    <h3>Total Bookings</h3>
                    <p style={{ fontSize: '2rem', color: '#2196f3' }}>{data.summary.count}</p>
                </div>
                <div className="stat-card" style={{ background: '#222', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #ff9800' }}>
                    <h3>Avg. Ticket Value</h3>
                    <p style={{ fontSize: '2rem', color: '#ff9800' }}>${Math.round(data.summary.avgTicket)}</p>
                </div>
            </div>

            <h2 style={{ marginTop: '40px' }}>Revenue by Service</h2>
            <table className="admin-table">
                <thead>
                    <tr><th>Service</th><th>Total Earned</th></tr>
                </thead>
                <tbody>
                    {data.revenueByService.map(item => (
                        <tr key={item._id}>
                            <td>{item._id}</td>
                            <td>${item.value.toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default Analytics;