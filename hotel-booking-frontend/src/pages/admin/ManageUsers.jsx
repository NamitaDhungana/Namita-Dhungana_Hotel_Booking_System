import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, App } from 'antd'; // Removed 'message' from import as it's obtained via App.useApp()
import { FaExternalLinkAlt, FaCheck, FaTimes, FaUserShield, FaUserCircle } from 'react-icons/fa';
import './ManageUsers.css';

const ManageUsers = () => {
    const { message, modal } = App.useApp();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8000/api/super-admin/users', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching users:', error);
            message.error('Failed to fetch users');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleApprove = async (userId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:8000/api/super-admin/users/${userId}/approve`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            message.success('User approved successfully!');
            fetchUsers();
        } catch (error) {
            console.error('Error approving user:', error);
            message.error('Failed to approve user');
        }
    };

    const handleReject = (userId) => {
        modal.confirm({
            title: 'Reject Manager',
            content: 'Are you sure you want to reject this manager?',
            okText: 'Yes, Reject',
            okType: 'danger',
            cancelText: 'No',
            onOk: async () => {
                try {
                    const token = localStorage.getItem('token');
                    await axios.post(`http://localhost:8000/api/super-admin/users/${userId}/reject`, {}, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    message.warning('User registration rejected.');
                    fetchUsers();
                } catch (error) {
                    console.error('Error rejecting user:', error);
                    message.error('Failed to reject user');
                }
            }
        });
    };

    if (loading) return <div className="manage-users-container">Loading Users...</div>;

    const pendingManagers = users.filter(u => u.role === 'admin' && u.registration_status === 'pending');
    const allOtherUsers = users.filter(u => !(u.role === 'admin' && u.registration_status === 'pending'));

    return (
        <div className="manage-users-container">
            <div className="section-header">
                <h2><FaUserShield style={{ marginRight: '10px' }} /> User Management</h2>
            </div>

            {pendingManagers.length > 0 && (
                <div className="section-card">
                    <div className="section-header">
                        <h3>Pending Hotel Manager Approvals</h3>
                    </div>
                    <div className="users-table-wrapper">
                        <table className="modern-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>PAN Number</th>
                                    <th>Verification</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingManagers.map(user => (
                                    <tr key={user.id}>
                                        <td><strong>{user.name}</strong></td>
                                        <td>{user.email}</td>
                                        <td><code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>{user.pan_number}</code></td>
                                        <td>
                                            <a 
                                                href="https://ird.gov.np/pan-search/" 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="pan-link"
                                            >
                                                Verify on IRD <FaExternalLinkAlt size={11} />
                                            </a>
                                        </td>
                                        <td>
                                            <div className="action-group">
                                                <button onClick={() => handleApprove(user.id)} className="btn-approve">
                                                    <FaCheck /> Approve
                                                </button>
                                                <button onClick={() => handleReject(user.id)} className="btn-reject">
                                                    <FaTimes /> Reject
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <div className="section-card">
                <div className="section-header">
                    <h3>All System Users</h3>
                </div>
                <div className="users-table-wrapper">
                    <table className="modern-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Email Status</th>
                                <th>Approval Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allOtherUsers.map(user => (
                                <tr key={user.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <FaUserCircle size={20} color="#cbd5e1" />
                                            <span>{user.name}</span>
                                        </div>
                                    </td>
                                    <td>{user.email}</td>
                                    <td>
                                        <span className={`badge badge-role-${user.role}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge ${user.email_verified_at ? 'badge-verified' : 'badge-unverified'}`}>
                                            {user.email_verified_at ? 'Verified' : 'Unverified'}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge badge-status-${user.registration_status}`}>
                                            {user.registration_status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ManageUsers;
