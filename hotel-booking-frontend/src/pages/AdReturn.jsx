import { useEffect, useState, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import apiClient from "../services/apiClient";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

export default function AdReturn() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("verifying");
  const [data, setData] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  const pidx = searchParams.get("pidx");

  const verify = useCallback((attempt = 1) => {
    if (!pidx) {
      setStatus("error");
      setErrorMsg("Missing payment reference.");
      return;
    }
    setStatus("verifying");

    apiClient.get(`/advertisements/verify`, { params: { pidx } })
      .then((res) => {
        if (res.data.status === "completed") {
          setData(res.data);
          setStatus("success");
        } else if (res.status === 202 && attempt <= 3) {
          setTimeout(() => verify(attempt + 1), attempt * 1000);
        } else {
          setStatus("pending");
        }
      })
      .catch((err) => {
        const msg = err.response?.data?.message || "Verification failed.";
        if (err.response?.status === 400) {
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

  useEffect(() => { verify(1); }, [verify]);

  const cardStyle = {
    minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
    background: "#f8f7ff",
  };
  const boxStyle = {
    background: "#fff", borderRadius: 16, padding: "48px 40px", maxWidth: 460,
    width: "90%", textAlign: "center", boxShadow: "0 8px 32px rgba(108,92,231,0.12)",
  };
  const btnPrimary = {
    display: "inline-block", background: "#6C5CE7", color: "#fff", padding: "12px 28px",
    borderRadius: 8, fontWeight: 600, textDecoration: "none", border: "none", cursor: "pointer", fontSize: 15,
  };
  const btnOutline = {
    display: "inline-block", background: "transparent", color: "#6C5CE7", padding: "12px 28px",
    borderRadius: 8, fontWeight: 600, textDecoration: "none", border: "2px solid #6C5CE7", fontSize: 15,
  };

  if (status === "verifying") return (
    <div style={cardStyle}><div style={boxStyle}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
      <h2>Verifying payment...</h2>
      <p style={{ color: "#666" }}>Please wait, do not close this page.</p>
    </div></div>
  );

  if (status === "success") return (
    <div style={cardStyle}><div style={boxStyle}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
      <h2 style={{ color: "#10b981" }}>Payment Successful!</h2>
      <p style={{ color: "#555" }}>Your advertisement has been submitted and is pending approval by the admin.</p>
      {data?.transaction_id && (
        <p style={{ background: "#f0fdf4", padding: "10px 16px", borderRadius: 8, fontSize: 14, color: "#065f46" }}>
          Transaction ID: <strong>{data.transaction_id}</strong>
        </p>
      )}
      <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 24 }}>
        <Link to="/admin/advertisements" style={btnPrimary}>View My Ads</Link>
        <Link to="/admin" style={btnOutline}>Dashboard</Link>
      </div>
    </div></div>
  );

  if (status === "pending") return (
    <div style={cardStyle}><div style={boxStyle}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
      <h2>Payment Processing</h2>
      <p style={{ color: "#555" }}>Khalti is still processing your payment.</p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 24 }}>
        <button onClick={() => { setRetryCount(c => c + 1); verify(1); }} style={btnPrimary}>
          {retryCount > 0 ? "Check Again" : "Check Status"}
        </button>
        <Link to="/admin/advertisements" style={btnOutline}>My Ads</Link>
      </div>
    </div></div>
  );

  if (status === "failed") return (
    <div style={cardStyle}><div style={boxStyle}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
      <h2 style={{ color: "#ef4444" }}>Payment Failed</h2>
      <p style={{ color: "#555" }}>{errorMsg}</p>
      <div style={{ marginTop: 24 }}>
        <Link to="/admin/advertisements" style={btnPrimary}>Try Again</Link>
      </div>
    </div></div>
  );

  return (
    <div style={cardStyle}><div style={boxStyle}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
      <h2>Verification Error</h2>
      <p style={{ color: "#555" }}>{errorMsg || "Could not reach payment server."}</p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 24 }}>
        <button onClick={() => { setRetryCount(c => c + 1); verify(1); }} style={btnPrimary}>Retry</button>
        <Link to="/admin/advertisements" style={btnOutline}>My Ads</Link>
      </div>
    </div></div>
  );
}
