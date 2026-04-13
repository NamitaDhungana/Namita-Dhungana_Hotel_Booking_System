import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import apiClient from '../services/apiClient';
import './RegistrationStatus.css';

function RegistrationStatus() {
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status') || 'pending';
  const email  = searchParams.get('email') || '';

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  // Try to fetch notifications if the user somehow has a token
  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) return;
    setLoading(true);
    apiClient.get('/notifications')
      .then(res => {
        const relevant = (res.data || []).filter(n =>
          n.type === 'registration_approved' || n.type === 'registration_rejected'
        );
        setNotifications(relevant);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const isPending  = status === 'pending';
  const isRejected = status === 'rejected';

  return (
    <div className="rs-page">
      <div className="rs-card">

        {/* Icon */}
        <div className={`rs-icon-wrap ${isPending ? 'rs-pending' : 'rs-rejected'}`}>
          {isPending ? '⏳' : '✕'}
        </div>

        {/* Heading */}
        <h1 className="rs-title">
          {isPending ? 'Registration Under Review' : 'Registration Not Approved'}
        </h1>

        <p className="rs-sub">
          {isPending
            ? 'Your Hotel Manager account is currently being reviewed by our team. You will receive an email notification once a decision has been made.'
            : 'Unfortunately, your Hotel Manager registration was not approved at this time. Please check your email for more details or contact support.'}
        </p>

        {/* Status badge */}
        <div className={`rs-badge ${isPending ? 'rs-badge-pending' : 'rs-badge-rejected'}`}>
          {isPending ? 'Status: Pending Approval' : 'Status: Rejected'}
        </div>

        {/* Notifications from backend if available */}
        {notifications.length > 0 && (
          <div className="rs-notifications">
            <h3>Notifications</h3>
            {notifications.map(n => (
              <div key={n.notification_id} className={`rs-notif ${n.type === 'registration_approved' ? 'rs-notif-approved' : 'rs-notif-rejected'}`}>
                <strong>{n.title}</strong>
                <p>{n.message}</p>
                <span className="rs-notif-time">{new Date(n.created_at).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}

        {/* Info box */}
        <div className="rs-info">
          <p>📧 Notifications will be sent to <strong>{email || 'your registered email'}</strong></p>
          {isPending && <p>⏱ Review typically takes 1–2 business days.</p>}
          {isRejected && <p>📞 Contact us at <a href="mailto:support@stayhub.com">support@stayhub.com</a> for assistance.</p>}
        </div>

        <Link to="/login" className="rs-back">← Back to Login</Link>
      </div>
    </div>
  );
}

export default RegistrationStatus;
