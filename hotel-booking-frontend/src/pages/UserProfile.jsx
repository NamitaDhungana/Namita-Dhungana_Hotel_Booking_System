import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";
import "./UserProfile.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace("/api", "") || "http://localhost:8000";

// Client-side image compression using canvas
async function compressImage(file, maxDim = 400, quality = 0.75) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const ratio = Math.min(maxDim / img.width, maxDim / img.height, 1);
        const w = Math.round(img.width * ratio);
        const h = Math.round(img.height * ratio);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        canvas.toBlob((blob) => resolve(new File([blob], "profile.jpg", { type: "image/jpeg" })), "image/jpeg", quality);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

function UserProfile() {
  const navigate = useNavigate();
  const fileRef = useRef();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null); // { type: 'success'|'error', text }
  const [editMode, setEditMode] = useState(false);
  const [preview, setPreview] = useState(null);
  const [picFile, setPicFile] = useState(null);

  const [form, setForm] = useState({ name: "", phone: "", address: "", current_password: "", new_password: "", new_password_confirmation: "" });

  useEffect(() => {
    if (!authService.isAuthenticated()) { navigate("/login"); return; }
    authService.getProfile()
      .then((u) => { setUser(u); setForm({ name: u.name || "", phone: u.phone || "", address: u.address || "", current_password: "", new_password: "", new_password_confirmation: "" }); })
      .catch(() => setMsg({ type: "error", text: "Failed to load profile." }))
      .finally(() => setLoading(false));
  }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const compressed = await compressImage(file);
    setPicFile(compressed);
    setPreview(URL.createObjectURL(compressed));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (form.phone && !/^\d{10}$/.test(form.phone)) {
      setMsg({ type: "error", text: "Phone number must be exactly 10 digits." });
      return;
    }
    setSaving(true);
    setMsg(null);
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("phone", form.phone);
      fd.append("address", form.address);
      if (form.new_password) {
        fd.append("current_password", form.current_password);
        fd.append("new_password", form.new_password);
        fd.append("new_password_confirmation", form.new_password_confirmation);
      }
      if (picFile) fd.append("profile_picture", picFile);

      const res = await authService.updateProfile(fd);
      setUser(res.user);
      setPreview(null);
      setPicFile(null);
      setEditMode(false);
      setForm((f) => ({ ...f, current_password: "", new_password: "", new_password_confirmation: "" }));
      setMsg({ type: "success", text: "Profile updated successfully." });
    } catch (err) {
      const errMsg = err?.message || (typeof err === "string" ? err : "Update failed.");
      setMsg({ type: "error", text: errMsg });
    } finally {
      setSaving(false);
    }
  };

  const handleRemovePicture = async () => {
    if (!window.confirm("Remove your profile picture?")) return;
    try {
      const res = await authService.deleteProfilePicture();
      setUser(res.user);
      setPreview(null);
      setPicFile(null);
      setMsg({ type: "success", text: "Profile picture removed." });
    } catch {
      setMsg({ type: "error", text: "Failed to remove picture." });
    }
  };

  const avatarSrc = preview || (user?.profile_picture ? `${API_BASE}${user.profile_picture}` : null);

  if (loading) return <div className="up-loading"><div className="up-spinner" /><p>Loading profile...</p></div>;
  if (!user) return null;

  return (
    <div className="up-page">
      <div className="up-card">
        {/* Avatar */}
        <div className="up-avatar-section">
          <div className="up-avatar-wrap">
            {avatarSrc
              ? <img src={avatarSrc} alt="Profile" className="up-avatar-img" />
              : <div className="up-avatar-initials">{user.name?.charAt(0).toUpperCase()}</div>
            }
            {editMode && (
              <button className="up-avatar-edit-btn" onClick={() => fileRef.current.click()} title="Change photo">📷</button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileChange} />
          {editMode && user.profile_picture && !preview && (
            <button className="up-remove-pic-btn" onClick={handleRemovePicture}>Remove photo</button>
          )}
          {preview && <p className="up-pic-hint">New photo selected (compressed)</p>}
        </div>

        {/* Name + role badge */}
        <div className="up-identity">
          <h1 className="up-name">{user.name}</h1>
          <span className={`up-role-badge up-role-${user.role}`}>{user.role}</span>
        </div>

        {/* Flash message */}
        {msg && <div className={`up-msg up-msg-${msg.type}`}>{msg.text}</div>}

        {/* View mode */}
        {!editMode && (
          <div className="up-info-grid">
            <div className="up-info-item"><span className="up-info-label">📧 Email</span><span>{user.email}</span></div>
            <div className="up-info-item"><span className="up-info-label">📞 Phone</span><span>{user.phone || "—"}</span></div>
            <div className="up-info-item"><span className="up-info-label">📍 Address</span><span>{user.address || "—"}</span></div>
            {user.pan_number && <div className="up-info-item"><span className="up-info-label">🪪 PAN</span><span>{user.pan_number}</span></div>}
            <button className="up-btn-edit" onClick={() => { setEditMode(true); setMsg(null); }}>Edit Profile</button>
          </div>
        )}

        {/* Edit mode */}
        {editMode && (
          <form className="up-form" onSubmit={handleSave}>
            <div className="up-field">
              <label>Full Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="up-field">
              <label>Phone</label>
              <input
                value={form.phone}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                  setForm({ ...form, phone: val });
                }}
                inputMode="numeric"
                maxLength={10}
                placeholder="10-digit phone number"
              />
            </div>
            <div className="up-field">
              <label>Address</label>
              <textarea rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>

            <div className="up-divider">Change Password <span>(leave blank to keep current)</span></div>
            <div className="up-field">
              <label>Current Password</label>
              <input type="password" value={form.current_password} onChange={(e) => setForm({ ...form, current_password: e.target.value })} />
            </div>
            <div className="up-field">
              <label>New Password</label>
              <input type="password" value={form.new_password} onChange={(e) => setForm({ ...form, new_password: e.target.value })} />
            </div>
            <div className="up-field">
              <label>Confirm New Password</label>
              <input type="password" value={form.new_password_confirmation} onChange={(e) => setForm({ ...form, new_password_confirmation: e.target.value })} />
            </div>

            <div className="up-form-actions">
              <button type="submit" className="up-btn-save" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button>
              <button type="button" className="up-btn-cancel" onClick={() => { setEditMode(false); setPreview(null); setPicFile(null); setMsg(null); }}>Cancel</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default UserProfile;
