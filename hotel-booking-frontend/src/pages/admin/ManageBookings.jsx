import React, { useState, useEffect } from 'react';
import { message } from 'antd';
import { FaCheck, FaTimes, FaEye } from 'react-icons/fa';
import bookingService from '../../services/bookingService';
import adminService from '../../services/adminService';
import './ManageHotels.css';

const ManageBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

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
                                    <button className="view-icon" title="View Details"><FaEye /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

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
                .status-badge.pending { background: rgba(246, 194, 62, 0.1); color: #F5C518; }
                .status-badge.confirmed { background: rgba(28, 200, 138, 0.1); color: #1cc88a; }
                .status-badge.cancelled { background: rgba(231, 74, 59, 0.1); color: #e74a3b; }
                .view-icon { color: #858796; }
                .edit-icon { color: #6C5CE7; }
                .delete-icon { color: #e74a3b; }
                .actions button {
                    transition: all 0.2s;
                }
                .actions button:hover {
                    transform: scale(1.2);
                }
            `}</style>
        </div>
    );
};

export default ManageBookings;
