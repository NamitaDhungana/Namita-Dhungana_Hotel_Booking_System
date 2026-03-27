import React, { useState, useEffect } from 'react';
import { App } from 'antd';
import { FaTrash, FaStar, FaUser, FaCheck, FaTimes } from 'react-icons/fa';
import apiClient from '../../services/apiClient';
import './ManageHotels.css';

const STATUS_COLORS = {
    pending:  { background: '#fff8e1', color: '#f59e0b', border: '1px solid #fde68a' },
    approved: { background: '#e8f5e9', color: '#16a34a', border: '1px solid #bbf7d0' },
    rejected: { background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' },
};

const AdminReviews = () => {
    const { message, modal } = App.useApp();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchReviews(); }, []);

    const fetchReviews = async () => {
        try {
            const response = await apiClient.get('/admin/reviews');
            setReviews(response.data);
        } catch (error) {
            console.error("Failed to fetch reviews", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatus = async (id, status) => {
        try {
            await apiClient.put(`/admin/reviews/${id}/status`, { status });
            setReviews(prev => prev.map(r => r.review_id === id ? { ...r, status } : r));
            message.success(`Review ${status}`);
        } catch {
            message.error('Failed to update status');
        }
    };

    const handleDelete = (id) => {
        modal.confirm({
            title: 'Delete Review',
            content: 'Are you sure you want to delete this review?',
            okText: 'Delete',
            okType: 'danger',
            onOk: async () => {
                try {
                    await apiClient.delete(`/admin/reviews/${id}`);
                    setReviews(prev => prev.filter(r => r.review_id !== id));
                    message.success('Review deleted');
                } catch {
                    message.error('Delete failed');
                }
            }
        });
    };

    if (loading) return <div style={{ padding: 40, color: '#888' }}>Loading reviews...</div>;

    return (
        <div className="admin-reviews">
            <h2>Manage Reviews</h2>
            <p style={{ color: '#888', fontSize: 14, marginBottom: 20 }}>
                Approve reviews to make them visible on the hotel page. Pending reviews are not shown publicly.
            </p>
            <div className="hotels-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Guest</th>
                            <th>Hotel</th>
                            <th>Rating</th>
                            <th>Comment</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reviews.length === 0 ? (
                            <tr><td colSpan={6} style={{ textAlign: 'center', color: '#aaa', padding: 32 }}>No reviews yet.</td></tr>
                        ) : reviews.map(review => (
                            <tr key={review.review_id}>
                                <td><FaUser style={{ marginRight: 8, color: '#888' }} />{review.user?.name}</td>
                                <td>{review.hotel?.name}</td>
                                <td>
                                    {[...Array(5)].map((_, i) => (
                                        <FaStar key={i} color={i < review.rating ? '#ffc107' : '#e4e5e9'} />
                                    ))}
                                </td>
                                <td style={{ maxWidth: 260, fontSize: 13 }}>
                                    {review.title && <strong style={{ display: 'block', marginBottom: 2 }}>{review.title}</strong>}
                                    {review.comment || <span style={{ color: '#bbb' }}>No comment</span>}
                                </td>
                                <td>
                                    <span style={{
                                        ...STATUS_COLORS[review.status],
                                        padding: '3px 10px',
                                        borderRadius: 12,
                                        fontSize: 12,
                                        fontWeight: 700,
                                        textTransform: 'capitalize',
                                    }}>
                                        {review.status}
                                    </span>
                                </td>
                                <td className="actions">
                                    {review.status !== 'approved' && (
                                        <button
                                            title="Approve"
                                            onClick={() => handleStatus(review.review_id, 'approved')}
                                            style={{ background: '#16a34a', color: '#fff', border: 'none', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', marginRight: 6 }}
                                        >
                                            <FaCheck />
                                        </button>
                                    )}
                                    {review.status !== 'rejected' && (
                                        <button
                                            title="Reject"
                                            onClick={() => handleStatus(review.review_id, 'rejected')}
                                            style={{ background: '#dc2626', color: '#fff', border: 'none', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', marginRight: 6 }}
                                        >
                                            <FaTimes />
                                        </button>
                                    )}
                                    <button className="delete-icon" title="Delete" onClick={() => handleDelete(review.review_id)}>
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminReviews;
