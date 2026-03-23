import { useEffect, useState, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import "./KhaltiReturn.css";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

function KhaltiReturn() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("verifying"); // verifying | success | pending | failed | error
  const [data, setData] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  const pidx = searchParams.get("pidx");

  const verify = useCallback((attempt = 1) => {
    if (!pidx) {
      setStatus("error");
      setErrorMsg("Missing payment reference (pidx). Please contact support.");
      return;
    }

    setStatus("verifying");

    axios
      .get(`${BASE_URL}/payments/khalti/verify`, {
        params: { pidx },
        headers: { Accept: "application/json" },
      })
      .then((res) => {
        const resStatus = res.data.status;

        if (resStatus === "completed") {
          setData(res.data);
          setStatus("success");
        } else if (res.status === 202 && attempt <= 3) {
          // Still pending — auto-retry with backoff (1s, 2s, 3s)
          setTimeout(() => verify(attempt + 1), attempt * 1000);
        } else {
          // Exhausted retries — show pending state with manual retry
          setStatus("pending");
        }
      })
      .catch((err) => {
        const httpStatus = err.response?.status;
        const msg =
          err.response?.data?.message ||
          err.response?.data?.error ||
          "Payment verification failed.";

        if (httpStatus === 400) {
          setErrorMsg(msg);
          setStatus("failed");
        } else if (attempt <= 3) {
          setTimeout(() => verify(attempt + 1), attempt * 1000);
        } else {
          setErrorMsg(msg);
          setStatus("error");
        }
      });
  }, [pidx]);

  useEffect(() => {
    verify(1);
  }, [verify]);

  const handleManualRetry = () => {
    setRetryCount((c) => c + 1);
    verify(1);
  };

  // ── Verifying ──────────────────────────────────────────
  if (status === "verifying") {
    return (
      <div className="kr-page">
        <div className="kr-card">
          <div className="kr-spinner" />
          <h2>Verifying your payment...</h2>
          <p>Please wait, do not close this page.</p>
        </div>
      </div>
    );
  }

  // ── Success ────────────────────────────────────────────
  if (status === "success") {
    return (
      <div className="kr-page">
        <div className="kr-card">
          <div className="kr-icon">✅</div>
          <h2>Payment Successful!</h2>
          <p>Your booking is confirmed and the dates are reserved.</p>
          {data?.transaction_id && (
            <div className="kr-ref">
              Transaction ID
              <strong>{data.transaction_id}</strong>
            </div>
          )}
          {data?.booking_id && (
            <div className="kr-ref kr-ref--booking">
              Booking #{data.booking_id}
              <strong>✅ Confirmed</strong>
            </div>
          )}
          <div className="kr-actions">
            <Link to="/my-bookings" className="kr-btn kr-btn--primary">
              View My Bookings
            </Link>
            <Link to="/hotels" className="kr-btn kr-btn--outline">
              Browse Hotels
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Still Pending (Khalti not yet processed) ───────────
  if (status === "pending") {
    return (
      <div className="kr-page">
        <div className="kr-card">
          <div className="kr-icon">⏳</div>
          <h2>Payment Processing</h2>
          <p>
            Your payment is being processed by Khalti. This can take a few
            moments.
          </p>
          <p className="kr-note">
            If you completed the payment, click "Check Status" to verify.
          </p>
          <div className="kr-actions">
            <button className="kr-btn kr-btn--primary" onClick={handleManualRetry}>
              {retryCount > 0 ? "Check Again" : "Check Status"}
            </button>
            <Link to="/my-bookings" className="kr-btn kr-btn--outline">
              My Bookings
            </Link>
          </div>
          {retryCount >= 3 && (
            <p className="kr-note kr-note--warn">
              Still not confirmed? Your booking is saved. Check "My Bookings"
              or contact support with your transaction details.
            </p>
          )}
        </div>
      </div>
    );
  }

  // ── Failed ─────────────────────────────────────────────
  if (status === "failed") {
    return (
      <div className="kr-page">
        <div className="kr-card">
          <div className="kr-icon">❌</div>
          <h2>Payment Failed</h2>
          <p>{errorMsg}</p>
          <p className="kr-note">No charges were made. You can try booking again.</p>
          <div className="kr-actions">
            <Link to="/hotels" className="kr-btn kr-btn--primary">
              Try Again
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────
  return (
    <div className="kr-page">
      <div className="kr-card">
        <div className="kr-icon">⚠️</div>
        <h2>Verification Error</h2>
        <p>{errorMsg || "Could not reach the payment server."}</p>
        <p className="kr-note">
          If your payment was deducted, your booking is saved. Check "My
          Bookings" or contact support.
        </p>
        <div className="kr-actions">
          <button className="kr-btn kr-btn--primary" onClick={handleManualRetry}>
            Retry
          </button>
          <Link to="/my-bookings" className="kr-btn kr-btn--outline">
            My Bookings
          </Link>
        </div>
      </div>
    </div>
  );
}

export default KhaltiReturn;
