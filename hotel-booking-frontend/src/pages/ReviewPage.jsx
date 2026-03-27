import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { App } from "antd";
import apiClient from "../services/apiClient";
import authService from "../services/authService";
import "./ReviewPage.css";

function StarRating({ value, onChange }) {
    const [hovered, setHovered] = useState(0);
    return (
        <div className="rp-stars">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    className={`rp-star ${star <= (hovered || value) ? "rp-star--filled" : ""}`}
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    onClick={() => onChange(star)}
                    aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                >
                    ★
                </button>
            ))}
            <span className="rp-star-label">
                {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][hovered || value] || "Select rating"}
            </span>
        </div>
    );
}

function ReviewPage() {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const { message } = App.useApp();

    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [alreadyReviewed, setAlreadyReviewed] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [rating, setRating] = useState(0);
    const [title, setTitle] = useState("");
    const [comment, setComment] = useState("");

    useEffect(() => {
        const user = authService.getCurrentUser();
        if (!user) {
            navigate(`/login?redirectTo=${encodeURIComponent(`/review/${bookingId}`)}`);
            return;
        }

        apiClient.get(`/review-booking/${bookingId}`)
            .then(res => {
                setBooking(res.data.booking);
                setAlreadyReviewed(res.data.already_reviewed);
            })
            .catch((err) => {
                const msg = err.response?.data?.message || "Booking not found or not eligible for review.";
                message.error(msg);
                navigate("/my-bookings");
            })
            .finally(() => setLoading(false));
    }, [bookingId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            message.warning("Please select a star rating.");
            return;
        }
        setSubmitting(true);
        try {
            await apiClient.post("/reviews", {
                hotel_id: booking.hotel_id,
                booking_id: booking.id,
                rating,
                title: title.trim() || null,
                comment: comment.trim() || null,
            });
            message.success("Review submitted! It will appear after approval.");
            navigate("/my-bookings");
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to submit review.";
            message.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="rp-loading">Loading...</div>;

    if (alreadyReviewed) {
        return (
            <div className="rp-wrapper">
                <div className="rp-card rp-already">
                    <div className="rp-already-icon">✓</div>
                    <h2>Already Reviewed</h2>
                    <p>You've already submitted a review for this stay at <strong>{booking?.hotel?.name}</strong>.</p>
                    <button className="rp-btn" onClick={() => navigate("/my-bookings")}>Back to My Bookings</button>
                </div>
            </div>
        );
    }

    return (
        <div className="rp-wrapper">
            <div className="rp-card">
                <div className="rp-hotel-banner">
                    {booking?.hotel?.featured_image && (
                        <img src={booking.hotel.featured_image} alt={booking.hotel.name} className="rp-hotel-img" />
                    )}
                    <div className="rp-hotel-overlay">
                        <h1>{booking?.hotel?.name}</h1>
                        <p>📍 {booking?.hotel?.city}</p>
                    </div>
                </div>

                <div className="rp-body">
                    <div className="rp-stay-info">
                        <span>📅 {booking?.check_in_date} → {booking?.check_out_date}</span>
                        <span>🔖 {booking?.booking_reference}</span>
                    </div>

                    <h2 className="rp-heading">How was your stay?</h2>
                    <p className="rp-subheading">Your honest feedback helps other travellers make better choices.</p>

                    <form onSubmit={handleSubmit} className="rp-form">
                        <div className="rp-field">
                            <label>Overall Rating</label>
                            <StarRating value={rating} onChange={setRating} />
                        </div>

                        <div className="rp-field">
                            <label htmlFor="rp-title">Review Title <span className="rp-optional">(optional)</span></label>
                            <input
                                id="rp-title"
                                type="text"
                                placeholder="Summarise your experience"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                maxLength={255}
                                className="rp-input"
                            />
                        </div>

                        <div className="rp-field">
                            <label htmlFor="rp-comment">Your Review <span className="rp-optional">(optional)</span></label>
                            <textarea
                                id="rp-comment"
                                placeholder="Tell us about your stay — what did you love, what could be better?"
                                value={comment}
                                onChange={e => setComment(e.target.value)}
                                maxLength={1000}
                                rows={5}
                                className="rp-textarea"
                            />
                            <span className="rp-char-count">{comment.length}/1000</span>
                        </div>

                        <div className="rp-actions">
                            <button type="button" className="rp-btn rp-btn--ghost" onClick={() => navigate("/my-bookings")}>
                                Cancel
                            </button>
                            <button type="submit" className="rp-btn" disabled={submitting}>
                                {submitting ? "Submitting..." : "Submit Review"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ReviewPage;
