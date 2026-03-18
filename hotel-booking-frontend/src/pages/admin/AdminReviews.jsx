import React, { useState, useEffect } from 'react';
import { message, Modal } from 'antd';
import { FaTrash, FaStar, FaUser } from 'react-icons/fa';
import apiClient from '../../services/apiClient';
import './ManageHotels.css';

const AdminReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            // This might need a custom admin endpoint in actual backend, 
            // but fetching what we can for now.
            const response = await apiClient.get('/reviews');
            setReviews(response.data);
        } catch (error) {
            console.error("Failed to fetch reviews", error);
            // Dummy data
            setReviews([
                { id: 1, user: { name: 'Alice' }, rating: 5, comment: 'Amazing stay!', hotel: { name: 'Grand Plaza' } },
                { id: 2, user: { name: 'Bob' }, rating: 2, comment: 'Staff was rude.', hotel: { name: 'Cheap Inn' } }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id) => {
        Modal.confirm({
            title: 'Delete Review',
            content: 'Are you sure you want to delete this review?',
            okText: 'Delete',
            okType: 'danger',
            onOk: async () => {
                try {
                    await apiClient.delete(`/admin/reviews/${id}`);
                    setReviews(reviews.filter(r => r.id !== id));
                    message.success("Review deleted");
                } catch (error) {
                    message.error("Delete failed");
                }
            }
        });
    };

    return (
        <div className="admin-reviews">
            <h2>Manage Reviews</h2>
            <div className="hotels-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Guest</th>
                            <th>Hotel</th>
                            <th>Rating</th>
                            <th>Comment</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reviews.map(review => (
                            <tr key={review.id}>
                                <td><FaUser style={{ marginRight: 8, color: '#888' }} /> {review.user?.name}</td>
                                <td>{review.hotel?.name}</td>
                                <td>
                                    {[...Array(5)].map((_, i) => (
                                        <FaStar key={i} color={i < review.rating ? "#ffc107" : "#e4e5e9"} />
                                    ))}
                                </td>
                                <td style={{ maxWidth: '300px', fontSize: '13px' }}>{review.comment}</td>
                                <td className="actions">
                                    <button className="delete-icon" onClick={() => handleDelete(review.id)}><FaTrash /></button>
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
