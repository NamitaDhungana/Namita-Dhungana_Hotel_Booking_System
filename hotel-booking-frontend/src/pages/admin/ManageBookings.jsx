import { useState, useEffect, useCallback } from 'react';
import { App, Modal } from 'antd';
import { FaCheck, FaTimes, FaEye, FaSignInAlt, FaSignOutAlt, FaSearch, FaDownload } from 'react-icons/fa';
import bookingService from '../../services/bookingService';
import adminService from '../../services/adminService';
import Pagination from '../../components/Pagination';
import { downloadBookingPdf } from '../../utils/bookingPdf';
import './ManageHotels.css';

const STATUSES = ['', 'pending', 'reserved', 'confirmed', 'checked_in', 'checked_out', 'cancelled'];

const ManageBookings = () => {
    const { message } = App.useApp();
    const [bookings, setBookings]         = useState([]);
    const [loading, setLoading]           = useState(true);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [detailLoading, setDetailLoading]     = useState(false);
    const [updatingId, setUpdatingId]     = useState(null);

    // Pagination
    const [currentPage, setCurrentPage]   = useState(1);
    const [lastPage, setLastPage]         = useState(1);
    const [total, setTotal]               = useState(0);

    // Filters
    const [search, setSearch]             = useState('');
    const [status, setStatus]             = useState('');
    const [checkInFrom, setCheckInFrom]   = useState('');
    const [checkInTo, setCheckInTo]       = useState('');

    const fetchBookings = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const params = { page, per_page: 15 };
            if (search)      params.search       = search;
            if (status)      params.status       = status;
            if (checkInFrom) params.check_in_from = checkInFrom;
            if (checkInTo)   params.check_in_to   = checkInTo;

            const res = await adminService.getAllBookings(params);
            setBookings(res.data || res);
            setCurrentPage(res.current_page || 1);
            setLastPage(res.last_page || 1);
            setTotal(res.total || 0);
        } catch (error) {
            console.error('Failed to fetch bookings', error);
        } finally {
            setLoading(false);
        }
    }, [search, status, checkInFrom, checkInTo]);

    useEffect(() => { fetchBookings(1); }, [fetchBookings]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchBookings(1);
    };

    const handleReset = () => {
        setSearch(''); setStatus(''); setCheckInFrom(''); setCheckInTo('');
    };

    const handleStatusUpdate = async (id, newStatus) => {
        setUpdatingId(id);
        try {
            await adminService.updateBookingStatus(id, newStatus);
            message.success(`Booking marked as ${newStatus.replace('_', ' ')} successfully!`);
            fetchBookings(currentPage);
        } catch {
            message.error('Status update failed');
        } finally {
            setUpdatingId(null);
        }
    };

    const handleViewDetails = async (id) => {
        setDetailLoading(true);
        setSelectedBooking(null);
        try {
            const data = await bookingService.getBookingDetails(id);
            setSelectedBooking(data);
        } catch {
            message.error('Failed to load booking details');
        } finally {
            setDetailLoading(false);
        }
    };

    return (
        <div className="manage-bookings">
            <h2>All Guest Bookings {total > 0 && <span style={{ fontSize: 14, color: '#888', fontWeight: 400 }}>({total} total)</span>}</h2>

            {/* Search & Filter Bar */}
            <form onSubmit={handleSearch} style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20, alignItems: 'flex-end' }}>
                <div style={{ position: 'relative', flex: '1 1 200px' }}>
                    <FaSearch style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#aaa', fontSize: 13 }} />
                    <input
                        type="text"
                        placeholder="Search guest name or email..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={inputStyle}
                    />
                </div>
                <select value={status} onChange={e => setStatus(e.target.value)} style={{ ...inputStyle, flex: '0 1 150px' }}>
                    {STATUSES.map(s => <option key={s} value={s}>{s || 'All Statuses'}</option>)}
                </select>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <label style={labelStyle}>Check-in From</label>
                    <input type="date" value={checkInFrom} onChange={e => setCheckInFrom(e.target.value)} style={dateStyle} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <label style={labelStyle}>Check-in To</label>
                    <input type="date" value={checkInTo} onChange={e => setCheckInTo(e.target.value)} style={dateStyle} />
                </div>
                <button type="submit" style={btnStyle}>Search</button>
                <button type="button" onClick={handleReset} style={{ ...btnStyle, background: '#f1f5f9', color: '#475569' }}>Reset</button>
            </form>

            <div className="hotels-table-container">
                {loading ? (
                    <p style={{ padding: 30, textAlign: 'center', color: '#aaa' }}>Loading...</p>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Guest</th>
                                <th>Hotel</th>
                                <th>Room Type</th>
                                <th>Check-in</th>
                                <th>Check-out</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.length === 0 ? (
                                <tr><td colSpan={8} style={{ textAlign: 'center', color: '#aaa', padding: 32 }}>No bookings found.</td></tr>
                            ) : bookings.map(booking => (
                                <tr key={booking.id}>
                                    <td>
                                        <div style={{ fontWeight: 600 }}>{booking.user?.name || 'Guest'}</div>
                                        <div style={{ fontSize: 12, color: '#888' }}>{booking.user?.email}</div>
                                    </td>
                                    <td>{booking.hotel?.name || 'N/A'}</td>
                                    <td>{booking.room?.room_type?.type_name || booking.room?.roomType?.type_name || 'N/A'}</td>
                                    <td>{new Date(booking.check_in_date).toLocaleDateString()}</td>
                                    <td>{new Date(booking.check_out_date).toLocaleDateString()}</td>
                                    <td><div style={{ fontWeight: 700, color: '#F5C518' }}>Rs. {parseFloat(booking.total_amount).toLocaleString()}</div></td>
                                    <td><span className={`status-badge ${booking.status}`}>{booking.status}</span></td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                        {(booking.status === 'pending' || booking.status === 'reserved') && (
                                            <>
                                                <button className="edit-icon" title="Confirm" disabled={updatingId === booking.id} onClick={() => handleStatusUpdate(booking.id, 'confirmed')}>
                                                    {updatingId === booking.id ? '…' : <FaCheck />}
                                                </button>
                                                <button className="delete-icon" title="Cancel" disabled={updatingId === booking.id} onClick={() => handleStatusUpdate(booking.id, 'cancelled')}>
                                                    <FaTimes />
                                                </button>
                                            </>
                                        )}
                                        {booking.status === 'confirmed' && (
                                            <button className="checkin-icon" title="Mark as Checked In" disabled={updatingId === booking.id} onClick={() => handleStatusUpdate(booking.id, 'checked_in')}>
                                                {updatingId === booking.id ? '…' : <FaSignInAlt />}
                                            </button>
                                        )}
                                        {booking.status === 'checked_in' && (
                                            <button className="checkout-icon" title="Mark as Checked Out" disabled={updatingId === booking.id} onClick={() => handleStatusUpdate(booking.id, 'checked_out')}>
                                                {updatingId === booking.id ? '…' : <FaSignOutAlt />}
                                            </button>
                                        )}
                                        <button className="view-icon" title="View Details" onClick={() => handleViewDetails(booking.id)}><FaEye /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <Pagination currentPage={currentPage} lastPage={lastPage} onPageChange={p => fetchBookings(p)} />

            {/* Booking Detail Modal */}
            <Modal
                open={!!selectedBooking || detailLoading}
                onCancel={() => setSelectedBooking(null)}
                footer={
                    selectedBooking ? (
                        <button
                            onClick={() => downloadBookingPdf(selectedBooking, 'admin')}
                            style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 18px', background:'#6C5CE7', color:'#fff', border:'none', borderRadius:8, fontWeight:600, fontSize:13, cursor:'pointer' }}
                        >
                            <FaDownload /> Download PDF
                        </button>
                    ) : null
                }
                title="Booking Details"
                width={520}
            >
                {detailLoading ? (
                    <p style={{ textAlign: 'center', padding: 20 }}>Loading...</p>
                ) : selectedBooking ? (
                    <div className="booking-detail-modal">
                        <section>
                            <h4 className="detail-section-title">Booking Info</h4>
                            <div className="detail-row"><span>Reference</span><strong>{selectedBooking.booking_reference}</strong></div>
                            <div className="detail-row"><span>Guest</span><strong>{selectedBooking.user?.name || 'N/A'}</strong></div>
                            <div className="detail-row"><span>Guest Email</span><strong>{selectedBooking.user?.email || 'N/A'}</strong></div>
                            <div className="detail-row"><span>Hotel</span><strong>{selectedBooking.hotel?.name || 'N/A'}</strong></div>
                            <div className="detail-row"><span>Room Type</span><strong>{selectedBooking.room?.roomType?.type_name || selectedBooking.room?.room_type?.type_name || 'N/A'}</strong></div>
                            <div className="detail-row"><span>Check-in</span><strong>{selectedBooking.check_in_date}</strong></div>
                            <div className="detail-row"><span>Check-out</span><strong>{selectedBooking.check_out_date}</strong></div>
                            <div className="detail-row"><span>Guests</span><strong>{selectedBooking.num_guests}</strong></div>
                            <div className="detail-row"><span>Status</span><span className={`status-badge ${selectedBooking.status}`}>{selectedBooking.status}</span></div>
                            <div className="detail-row"><span>Total Amount</span><strong>Rs. {Number(selectedBooking.total_amount).toLocaleString()}</strong></div>
                            {selectedBooking.payment_method && (
                                <div className="detail-row"><span>Payment Method</span>
                                    <strong style={{ textTransform: 'capitalize' }}>
                                        {selectedBooking.payment_method === 'cash' ? '💵 Pay at Hotel' : selectedBooking.payment_method}
                                    </strong>
                                </div>
                            )}
                        </section>
                        {selectedBooking.payment && (
                            <section style={{ marginTop: 16 }}>
                                <h4 className="detail-section-title">Payment Info</h4>
                                <div className="detail-row"><span>Method</span><strong>{selectedBooking.payment.payment_method || 'Khalti'}</strong></div>
                                <div className="detail-row"><span>Status</span><span className={`status-badge ${selectedBooking.payment.payment_status}`}>{selectedBooking.payment.payment_status}</span></div>
                                <div className="detail-row"><span>Amount Paid</span><strong>Rs. {Number(selectedBooking.payment.amount).toLocaleString()}</strong></div>
                                {selectedBooking.payment.transaction_id && (
                                    <div className="detail-row"><span>Transaction ID</span><strong>{selectedBooking.payment.transaction_id}</strong></div>
                                )}
                            </section>
                        )}
                    </div>
                ) : null}
            </Modal>

            <style>{`
                .manage-bookings { background:#fff; padding:30px; border-radius:16px; box-shadow:0 0.15rem 1.75rem 0 rgba(108,92,231,0.1); }
                .manage-bookings h2 { margin-bottom:20px; color:#2D1B69; font-weight:700; }
                .status-badge { padding:5px 11px; border-radius:20px; font-size:11px; text-transform:uppercase; font-weight:800; letter-spacing:0.5px; display:inline-block; }
                .status-badge.pending    { background:rgba(246,194,62,0.1);  color:#F5C518; }
                .status-badge.reserved   { background:rgba(52,152,219,0.1);  color:#2980b9; }
                .status-badge.confirmed  { background:rgba(28,200,138,0.1);  color:#1cc88a; }
                .status-badge.cancelled  { background:rgba(231,74,59,0.1);   color:#e74a3b; }
                .status-badge.checked_in { background:rgba(52,152,219,0.1);  color:#3498db; }
                .status-badge.checked_out{ background:rgba(108,92,231,0.1);  color:#6C5CE7; }
                .view-icon   { color:#858796; } .edit-icon { color:#6C5CE7; } .delete-icon { color:#e74a3b; }
                .checkin-icon { color:#1cc88a; } .checkout-icon { color:#6C5CE7; }
                .actions button { transition:all 0.2s; font-size:15px; }
                .actions button:hover:not(:disabled) { transform:scale(1.2); }
                .actions button:disabled { opacity:0.4; cursor:not-allowed; transform:none; }
                .booking-detail-modal .detail-section-title { font-size:0.85rem; font-weight:700; color:#6C5CE7; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:10px; padding-bottom:6px; border-bottom:1px solid #f0f0f0; }
                .booking-detail-modal .detail-row { display:flex; justify-content:space-between; align-items:center; padding:6px 0; font-size:0.88rem; border-bottom:1px solid #fafafa; }
                .booking-detail-modal .detail-row span:first-child { color:#888; }
            `}</style>
        </div>
    );
};

const inputStyle = { padding: '8px 12px 8px 32px', border: '1.5px solid #e0d9f7', borderRadius: 8, fontSize: 13, outline: 'none', background: '#faf9ff', width: '100%' };
const dateStyle  = { padding: '8px 12px', border: '1.5px solid #e0d9f7', borderRadius: 8, fontSize: 13, outline: 'none', background: '#faf9ff' };
const labelStyle = { fontSize: 11, color: '#888', fontWeight: 600, textTransform: 'uppercase' };
const btnStyle   = { padding: '8px 18px', background: '#6C5CE7', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer' };

export default ManageBookings;
