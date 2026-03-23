import React, { useState, useEffect } from 'react';
import { App, Modal } from 'antd';
import { FaCheck, FaTimes, FaEye } from 'react-icons/fa';
import bookingService from '../../services/bookingService';
import adminService from '../../services/adminService';
import './ManageHotels.css';

const ManageBookings = () => {
    const { message } = App.useApp();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const data = await adminService.getAllBookings();
            setBookings(data);
        } catch (error) {
            console.error("Failed to fetch bookings", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await adminService.updateBookingStatus(id, status);
            message.success(`Booking ${status} successfully!`);
            fetchBookings();
        } catch (error) {
            message.error("Status update failed");
        }
    };

    const handleViewDetails = async (id) => {
        setDetailLoading(true);
        setSelectedBooking(null);
        try {
            const data = await bookingService.getBookingDetails(id);
            setSelectedBooking(data);
        } catch (e) {
            message.error("Failed to load booking details");
        } finally {
            setDetailLoading(false);
        }
    };

    return (
        <div className="manage-bookings">
            <h2>All Guest Bookings</h2>
            <div className="hotels-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Guest</th>
                            <th>Hotel</th>
                            <th>Room Type</th>
                            <th>Check-in</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.map(booking => (
                            <tr key={booking.id}>
                                <td>
                                    <div style={{ fontWeight: 600 }}>{booking.user?.name || 'Guest'}</div>
                                    <div style={{ fontSize: '12px', color: '#888' }}>{booking.user?.email}</div>
                                </td>
                                <td>{booking.hotel?.name || 'N/A'}</td>
                                <td>{booking.room?.room_type?.type_name || booking.room?.roomType?.type_name || 'N/A'}</td>
                                <td>{new Date(booking.check_in_date).toLocaleDateString()}</td>
                                <td>
                                    <div style={{ fontWeight: 700, color: '#F5C518' }}>
                                        Rs. {parseFloat(booking.total_amount).toLocaleString()}
                                    </div>
                                </td>
                                <td>
                                    <span className={`status-badge ${booking.status}`}>
                                        {booking.status}
                                    </span>
                                </td>
                                <td className="actions">
                                    {booking.status === 'pending' && (
                                        <>
                                            <button className="edit-icon" title="Confirm" onClick={() => handleStatusUpdate(booking.id, 'confirmed')}><FaCheck /></button>
                                            <button className="delete-icon" title="Cancel" onClick={() => handleStatusUpdate(booking.id, 'cancelled')}><FaTimes /></button>
                                        </>
                                    )}
                                    <button className="view-icon" title="View Details" onClick={() => handleViewDetails(booking.id)}><FaEye /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Booking Detail Modal */}
            <Modal
                open={!!selectedBooking || detailLoading}
                onCancel={() => { setSelectedBooking(null); }}
                footer={null}
                title="Booking Details"
                width={520}
            >
                {detailLoading ? (
                    <p style={{ textAlign: 'center', padding: '20px' }}>Loading...</p>
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
                            <div className="detail-row"><span>Status</span>
                                <span className={`status-badge ${selectedBooking.status}`}>{selectedBooking.status}</span>
                            </div>
                            <div className="detail-row"><span>Total Amount</span><strong>Rs. {Number(selectedBooking.total_amount).toLocaleString()}</strong></div>
                        </section>

                        {selectedBooking.payment && (
                            <section style={{ marginTop: 16 }}>
                                <h4 className="detail-section-title">Payment Info</h4>
                                <div className="detail-row"><span>Method</span><strong>{selectedBooking.payment.payment_method || 'Khalti'}</strong></div>
                                <div className="detail-row"><span>Status</span>
                                    <span className={`status-badge ${selectedBooking.payment.payment_status}`}>{selectedBooking.payment.payment_status}</span>
                                </div>
                                <div className="detail-row"><span>Amount Paid</span><strong>Rs. {Number(selectedBooking.payment.amount).toLocaleString()}</strong></div>
                                {selectedBooking.payment.transaction_id && (
                                    <div className="detail-row"><span>Transaction ID</span><strong>{selectedBooking.payment.transaction_id}</strong></div>
                                )}
                                {selectedBooking.payment.payment_date && (
                                    <div className="detail-row"><span>Paid On</span><strong>{new Date(selectedBooking.payment.payment_date).toLocaleString()}</strong></div>
                                )}
                            </section>
                        )}
                    </div>
                ) : null}
            </Modal>

            <style>{`
                .manage-bookings {
                    background: #fff;
                    padding: 30px;
                    border-radius: 16px;
                    box-shadow: 0 0.15rem 1.75rem 0 rgba(108, 92, 231, 0.1);
                }
                .manage-bookings h2 {
                    margin-bottom: 25px;
                    color: #2D1B69;
                    font-weight: 700;
                }
                .status-badge {
                    padding: 6px 12px;
                    border-radius: 20px;
                    font-size: 11px;
                    text-transform: uppercase;
                    font-weight: 800;
                    letter-spacing: 0.5px;
                    display: inline-block;
                }
                .status-badge.pending    { background: rgba(246,194,62,0.1);  color: #F5C518; }
                .status-badge.confirmed  { background: rgba(28,200,138,0.1);  color: #1cc88a; }
                .status-badge.cancelled  { background: rgba(231,74,59,0.1);   color: #e74a3b; }
                .status-badge.completed  { background: rgba(108,92,231,0.1);  color: #6C5CE7; }
                .status-badge.checked_in { background: rgba(52,152,219,0.1);  color: #3498db; }
                .view-icon  { color: #858796; }
                .edit-icon  { color: #6C5CE7; }
                .delete-icon { color: #e74a3b; }
                .actions button { transition: all 0.2s; }
                .actions button:hover { transform: scale(1.2); }

                .booking-detail-modal .detail-section-title {
                    font-size: 0.85rem;
                    font-weight: 700;
                    color: #6C5CE7;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 10px;
                    padding-bottom: 6px;
                    border-bottom: 1px solid #f0f0f0;
                }
                .booking-detail-modal .detail-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 6px 0;
                    font-size: 0.88rem;
                    border-bottom: 1px solid #fafafa;
                }
                .booking-detail-modal .detail-row span:first-child { color: #888; }
            `}</style>
        </div>
    );
};

export default ManageBookings;
