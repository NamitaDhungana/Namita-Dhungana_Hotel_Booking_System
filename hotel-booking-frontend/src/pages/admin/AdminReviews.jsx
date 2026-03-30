import { useState, useEffect, useCallback } from 'react';
import { App } from 'antd';
import { FaTrash, FaStar, FaUser, FaCheck, FaTimes, FaSearch } from 'react-icons/fa';
import apiClient from '../../services/apiClient';
import Pagination from '../../components/Pagination';
import './ManageHotels.css';

const STATUS_COLORS = {
    pending:  { background: '#fff8e1', color: '#f59e0b', border: '1px solid #fde68a' },
    approved: { background: '#e8f5e9', color: '#16a34a', border: '1px solid #bbf7d0' },
    rejected: { background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' },
};

const AdminReviews = () => {
    const { message, modal } = App.useApp();
    const [reviews, setReviews]   = useState([]);
    const [loading, setLoading]   = useState(true);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage]       = useState(1);
    const [total, setTotal]             = useState(0);

    // Filters
    const [search, setSearch]   = useState('');
    const [status, setStatus]   = useState('');

    const fetchReviews = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const params = { page, per_page: 15 };
            if (search) params.search = search;
            if (status) params.status = status;
            const res = await apiClient.get('/admin/reviews', { params });
            const data = res.data;
            setReviews(data.data || data);
            setCurrentPage(data.current_page || 1);
            setLastPage(data.last_page || 1);
            setTotal(data.total || 0);
        } catch {
            message.error('Failed to fetch reviews');
        } finally {
            setLoading(false);
        }
    }, [search, status, message]);

    useEffect(() => { fetchReviews(1); }, [fetchReviews]);

    const handleSearch = (e) => { e.preventDefault(); fetchReviews(1); };
    const handleReset  = () => { setSearch(''); setStatus(''); };

    const handleStatus = async (id, newStatus) => {
        try {
            await apiClient.put(`/admin/reviews/${id}/status`, { status: newStatus });
            setReviews(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
            message.success(`Review ${newStatus}`);
        } catch {
            message.error('Failed to update status');
        }
    };

    const handleDelete = (id) => {
        modal.confirm({
            title: 'Delete Review',
            content: 'Are you sure you want to delete this review?',
            okText: 'Delete', okType: 'danger',
            onOk: async () => {
                try {
                    await apiClient.delete(`/admin/reviews/${id}`);
                    setReviews(prev => prev.filter(r => r.id !== id));
                    message.success('Review deleted');
                } catch {
                    message.error('Delete failed');
                }
            }
        });
    };

    return (
        <div className="admin-reviews">
            <h2>Manage Reviews {total > 0 && <span style={{ fontSize: 14, color: '#888', fontWeight: 400 }}>({total} total)</span>}</h2>
            <p style={{ color: '#888', fontSize: 14, marginBottom: 16 }}>
                Approve reviews to make them visible on the hotel page. Pending reviews are not shown publicly.
            </p>

            {/* Search & Filter */}
            <form onSubmit={handleSearch} style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20, alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: '1 1 220px' }}>
                    <FaSearch style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#aaa', fontSize: 13 }} />
                    <input
                        type="text"
                        placeholder="Search by guest or hotel name..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ padding: '8px 12px 8px 32px', border: '1.5px solid #e0d9f7', borderRadius: 8, fontSize: 13, outline: 'none', background: '#faf9ff', width: '100%' }}
                    />
                </div>
                <select value={status} onChange={e => setStatus(e.target.value)} style={selStyle}>
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                </select>
                <button type="submit" style={btnStyle}>Search</button>
                <button type="button" onClick={handleReset} style={{ ...btnStyle, background: '#f1f5f9', color: '#475569' }}>Reset</button>
            </form>

            <div className="hotels-table-container">
                {loading ? (
                    <p style={{ padding: 30, textAlign: 'center', color: '#aaa' }}>Loading reviews...</p>
                ) : (
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
                                <tr><td colSpan={6} style={{ textAlign: 'center', color: '#aaa', padding: 32 }}>No reviews found.</td></tr>
                            ) : reviews.map(review => (
                                <tr key={review.id}>
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
                                        <span style={{ ...STATUS_COLORS[review.status], padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 700, textTransform: 'capitalize' }}>
                                            {review.status}
                                        </span>
                                    </td>
                                    <td className="actions">
                                        {review.status !== 'approved' && (
                                            <button title="Approve" onClick={() => handleStatus(review.id, 'approved')}
                                                style={{ background: '#16a34a', color: '#fff', border: 'none', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', marginRight: 6 }}>
                                                <FaCheck />
                                            </button>
                                        )}
                                        {review.status !== 'rejected' && (
                                            <button title="Reject" onClick={() => handleStatus(review.id, 'rejected')}
                                                style={{ background: '#dc2626', color: '#fff', border: 'none', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', marginRight: 6 }}>
                                                <FaTimes />
                                            </button>
                                        )}
                                        <button className="delete-icon" title="Delete" onClick={() => handleDelete(review.id)}>
                                            <FaTrash />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <Pagination currentPage={currentPage} lastPage={lastPage} onPageChange={p => fetchReviews(p)} />
        </div>
    );
};

const selStyle = { padding: '8px 12px', border: '1.5px solid #e0d9f7', borderRadius: 8, fontSize: 13, outline: 'none', background: '#faf9ff' };
const btnStyle = { padding: '8px 18px', background: '#6C5CE7', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer' };

export default AdminReviews;
