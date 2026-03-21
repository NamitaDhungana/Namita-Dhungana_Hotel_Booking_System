import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCog } from 'react-icons/fa';

const SystemSettings = () => {
    const [settings, setSettings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        axios.get('http://localhost:8000/api/super-admin/settings', {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => setSettings(res.data))
        .catch(() => {})
        .finally(() => setLoading(false));
    }, []);

    return (
        <div>
            <div style={{ marginBottom: '24px' }}>
                <h2 style={{ margin: 0, fontSize: '20px', color: '#1a1d2e', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaCog /> System Settings
                </h2>
                <p style={{ color: '#888', margin: '6px 0 0', fontSize: '14px' }}>
                    Manage global system configuration.
                </p>
            </div>

            {loading ? (
                <p style={{ color: '#aaa' }}>Loading settings...</p>
            ) : settings.length === 0 ? (
                <div style={{ background: '#fff', padding: '32px', borderRadius: '12px', textAlign: 'center', color: '#aaa' }}>
                    No settings configured yet.
                </div>
            ) : (
                <div style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f8f9fc', borderBottom: '1px solid #eee' }}>
                                <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', color: '#888', textTransform: 'uppercase' }}>Key</th>
                                <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', color: '#888', textTransform: 'uppercase' }}>Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            {settings.map((s, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                    <td style={{ padding: '14px 20px', fontWeight: 600, color: '#333' }}>{s.key}</td>
                                    <td style={{ padding: '14px 20px', color: '#555' }}>{s.value}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default SystemSettings;
