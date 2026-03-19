import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import "./KhaltiReturn.css";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

function KhaltiReturn() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("verifying");
  const [data, setData] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const pidx = searchParams.get("pidx");

    if (!pidx) {
      setStatus("error");
      setErrorMsg("Missing payment reference (pidx). Please contact support.");
      return;
    }

    // Use plain axios — no auth header needed, route is public
    axios
      .get(`${BASE_URL}/payments/khalti/verify`, {
        params: { pidx },
        headers: { Accept: "application/json" },
      })
      .then((res) => {
        setData(res.data);
        if (res.data.status === "completed") {
          setStatus("success");
        } else {
          setErrorMsg(res.data.message || "Payment was not completed.");
          setStatus("failed");
        }
      })
      .catch((err) => {
        const responseData = err.response?.data;
        const httpStatus = err.response?.status;
        const msg =
          responseData?.message ||
          responseData?.error ||
          "Payment verification failed. Please contact support.";

        console.error("Khalti verify error:", httpStatus, responseData);
        setErrorMsg(msg);

        // 400 = payment failed/expired, anything else = unexpected error
        setStatus(httpStatus === 400 ? "failed" : "error");
      });
  }, []);

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

  if (status === "success") {
    return (
      <div className="kr-page">
        <div className="kr-card">
          <div className="kr-icon">✅</div>
          <h2>Payment Successful!</h2>
          <p>Your booking has been confirmed.</p>
          {data?.transaction_id && (
            <div className="kr-ref">
              Transaction ID: <strong>{data.transaction_id}</strong>
            </div>
          )}
          <div className="kr-actions">
            <Link to="/userProfile" className="kr-btn kr-btn--primary">
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

  if (status === "failed") {
    return (
      <div className="kr-page">
        <div className="kr-card">
          <div className="kr-icon">❌</div>
          <h2>Payment Failed</h2>
          <p>{errorMsg}</p>
          <div className="kr-actions">
            <Link to="/hotels" className="kr-btn kr-btn--primary">
              Try Again
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // error state
  return (
    <div className="kr-page">
      <div className="kr-card">
        <div className="kr-icon">⚠️</div>
        <h2>Something Went Wrong</h2>
        <p>{errorMsg}</p>
        <div className="kr-actions">
          <Link to="/" className="kr-btn kr-btn--primary">
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default KhaltiReturn;
