import { useState, useEffect, useCallback } from 'react';
import { App, Modal } from 'antd';
import { FaEnvelopeOpen, FaEnvelope, FaTrash, FaEye, FaSearch } from 'react-icons/fa';
import apiClient from '../../services/apiClient';
import Pagination from '../../components/Pagination';

const ContactQueries = () => {
    const { message, modal } = App.useApp();
    const [queries, setQueries]   = useState([]);
    const [loading, setLoading]   = useState(true);
    const [selected, setSelected] = useState(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage]       = useState(1);
    const [total, setTotal]             = useState(0);

    // Filters
    const [search, setSearch]   = useState('');
    const [isRead, setIsRead]   = useState('');

    const fetchQueries = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const params = { page, per_page: 15 };
            if (search) params.search  = search;
            if (isRead !== '') params.is_read = isRead;
            const res = await apiClient.get('/super-admin/contact-queries', { params });
            const data = res.data;
            setQueries(data.data || data);
            setCurrentPage(data.current_page || 1);
            setLastPage(data.last_page || 1);
            setTotal(data.total || 0);
        } catch {
            message.error('Failed to load queries');
        } finally {
            setLoading(false);
        }
    }, [search, isRead, message]);

    useEffect(() => { fetchQueries(1); }, [fetchQueries]);

    const handleSearch = (e) => { e.preventDefault(); fetchQueries(1); };
    const handleReset  = () => { setSearch(''); setIsRead(''); };

    const handleView = async (q) => {
        setSelected(q);
        if (!q.is_read) {
            try {
                await apiClient.put(`/super-admin/contact-queries/${q.id}/read`);
                setQueries(prev => prev.map(x => x.id === q.id ? { ...x, is_read: true } : x));
            } catch {}
        }
    };

    const handleDelete = (id) => {
        modal.confirm({
            title: 'Delete this query?', content: 'This cannot be undone.',
            okText: 'Delete', okType: 'danger', cancelText: 'Cancel',
            onOk: async () => {
                try {
                    await apiClient.delete(`/super-admin/contact-queries/${id}`);
                    setQueries(prev => prev.filter(q => q.id !== id));
                    if (selected?.id === id) setSelected(null);
                    message.success('Deleted');
                } catch {
                    message.error('Delete failed');
                }
            },
        });
    };

    const unreadCount = queries.filter(q => !q.is_read).length;

    return (
        <div style={{ background: '#fff', borderRadius: 16, padding: 28, boxShadow: '0 0.15rem 1.75rem rgba(108,92,231,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <h2 style={{ margin: 0, color: '#2D1B69', fontWeight: 700, fontSize: 20 }}>
                    Contact Queries
                    {total > 0 && <span style={{ marginLeft: 8, fontSize: 13, color: '#888', fontWeight: 400 }}>({total} total)</span>}
                </h2>
                {unreadCount > 0 && (
                    <span style={{ background: '#6C5CE7', color: '#fff', borderRadius: 20, padding: '2px 10px', fontSize: 12, fontWeight: 700 }}>
                        {unreadCount} new
                    </span>
                )}
            </div>

            {/* Search & Filter */}
            <form onSubmit={handleSearch} style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20, alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: '1 1 220px' }}>
                    <FaSearch style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#aaa', fontSize: 13 }} />
                    <input
                        type="text"
                        placeholder="Search by name, email or subject..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ padding: '8px 12px 8px 32px', border: '1.5px solid #e0d9f7', borderRadius: 8, fontSize: 13, outline: 'none', background: '#faf9ff', width: '100%' }}
                    />
                </div>
                <select value={isRead} onChange={e => setIsRead(e.target.value)} style={selStyle}>
                    <option value="">All Messages</option>
                    <option value="false">Unread</option>
                    <option value="true">Read</option>
                </select>
                <button type="submit" style={btnStyle}>Search</button>
                <button type="button" onClick={handleReset} style={{ ...btnStyle, background: '#f1f5f9', color: '#475569' }}>Reset</button>
            </form>

            {loading ? (
                <p style={{ color: '#aaa' }}>Loading...</p>
            ) : queries.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#aaa' }}>
                    <FaEnvelopeOpen size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
                    <p>No contact queries found.</p>
                </div>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f8f9fc', borderBottom: '2px solid #eee' }}>
                                <th style={th}>Status</th>
                                <th style={th}>Name</th>
                                <th style={th}>Email</th>
                                <th style={th}>Subject</th>
                                <th style={th}>Received</th>
                                <th style={th}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {queries.map(q => (
                                <tr key={q.id} style={{ borderBottom: '1px solid #f0f0f0', background: q.is_read ? '#fff' : '#faf8ff', fontWeight: q.is_read ? 400 : 600 }}>
                                    <td style={td}>
                                        {q.is_read
                                            ? <FaEnvelopeOpen size={14} color="#aaa" title="Read" />
                                            : <FaEnvelope size={14} color="#6C5CE7" title="Unread" />
                                        }
                                    </td>
                                    <td style={td}>{q.name}</td>
                                    <td style={{ ...td, color: '#6C5CE7', fontSize: 13 }}>{q.email}</td>
                                    <td style={{ ...td, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.subject}</td>
                                    <td style={{ ...td, fontSize: 12, color: '#888' }}>{new Date(q.created_at).toLocaleString()}</td>
                                    <td style={{ ...td, display: 'flex', gap: 8 }}>
                                        <button onClick={() => handleView(q)} title="View"
                                            style={{ background: '#f0eeff', border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', color: '#6C5CE7' }}>
                                            <FaEye />
                                        </button>
                                        <button onClick={() => handleDelete(q.id)} title="Delete"
                                            style={{ background: '#fdecea', border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', color: '#e74a3b' }}>
                                            <FaTrash />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Pagination currentPage={currentPage} lastPage={lastPage} onPageChange={p => fetchQueries(p)} />

            {/* Detail Modal */}
            <Modal open={!!selected} onCancel={() => setSelected(null)} footer={null} title="Contact Query" width={520}>
                {selected && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <Row label="From"     value={selected.name} />
                        <Row label="Email"    value={<a href={`mailto:${selected.email}`} style={{ color: '#6C5CE7' }}>{selected.email}</a>} />
                        <Row label="Subject"  value={selected.subject} />
                        <Row label="Received" value={new Date(selected.created_at).toLocaleString()} />
                        <div>
                            <div style={{ fontSize: 12, color: '#888', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase' }}>Message</div>
                            <div style={{ background: '#f8f9fc', borderLeft: '3px solid #6C5CE7', padding: '14px 16px', borderRadius: '0 8px 8px 0', fontSize: 14, color: '#333', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                                {selected.message}
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
                            <button
                                onClick={() => {
                                    const to      = encodeURIComponent(selected.email);
                                    const subject = encodeURIComponent('Re: ' + selected.subject);
                                    const body    = encodeURIComponent('\n\n---\nOriginal message from ' + selected.name + ':\n' + selected.message);
                                    window.open(`https://mail.google.com/mail/?view=cm&to=${to}&su=${subject}&body=${body}`, '_blank');
                                }}
                                style={{ background: '#6C5CE7', color: '#fff', padding: '8px 18px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                                Reply via Gmail
                            </button>
                            <button onClick={() => { handleDelete(selected.id); setSelected(null); }}
                                style={{ background: '#fdecea', color: '#e74a3b', border: 'none', borderRadius: 8, padding: '8px 18px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                                Delete
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

const th = { padding: '12px 16px', textAlign: 'left', fontSize: 12, color: '#888', textTransform: 'uppercase', fontWeight: 700 };
const td = { padding: '12px 16px', fontSize: 14, color: '#333' };
const selStyle = { padding: '8px 12px', border: '1.5px solid #e0d9f7', borderRadius: 8, fontSize: 13, outline: 'none', background: '#faf9ff' };
const btnStyle = { padding: '8px 18px', background: '#6C5CE7', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer' };

const Row = ({ label, value }) => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <span style={{ minWidth: 70, fontSize: 12, color: '#888', fontWeight: 700, textTransform: 'uppercase', paddingTop: 2 }}>{label}</span>
        <span style={{ fontSize: 14, color: '#333' }}>{value}</span>
    </div>
);

export default ContactQueries;
