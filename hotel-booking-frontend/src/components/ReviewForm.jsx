import React, { useState } from 'react';
import { FaStar } from 'react-icons/fa';
import apiClient from '../services/apiClient';
import './ReviewForm.css';

const ReviewForm = ({ hotelId, onReviewSubmitted }) => {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) return alert("Please select a rating");

        setSubmitting(true);
        try {
            await apiClient.post('/reviews', {
                hotel_id: hotelId,
                rating,
                comment
            });
            alert("Review submitted! Thank you.");
            setRating(0);
            setComment('');
            if (onReviewSubmitted) onReviewSubmitted();
        } catch (error) {
            console.error("Failed to submit review", error);
            alert("Submission failed. Have you stayed here?");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="review-form-container">
            <h3>Leave a Review</h3>
            <form onSubmit={handleSubmit}>
                <div className="star-rating">
                    {[...Array(5)].map((star, index) => {
                        const ratingValue = index + 1;
                        return (
                            <label key={index}>
                                <input
                                    type="radio"
                                    name="rating"
                                    value={ratingValue}
                                    onClick={() => setRating(ratingValue)}
                                />
                                <FaStar
                                    className="star"
                                    color={ratingValue <= (hover || rating) ? "#ffc107" : "#e4e5e9"}
                                    onMouseEnter={() => setHover(ratingValue)}
                                    onMouseLeave={() => setHover(0)}
                                />
                            </label>
                        );
                    })}
                </div>
                <textarea
                    placeholder="Share your experience..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                />
                <button type="submit" disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Post Review'}
                </button>
            </form>
        </div>
    );
};

export default ReviewForm;
