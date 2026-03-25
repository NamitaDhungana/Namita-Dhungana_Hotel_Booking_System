import React, { useState, useEffect } from 'react';
import { App } from 'antd';
import { FaEdit, FaFacebook, FaInstagram, FaTwitter, FaPhone } from 'react-icons/fa';
import apiClient from '../../services/apiClient';
import settingsService from '../../services/settingsService';

const DEFAULTS = {
    site_title: '', about_us: '', shutdown_website: '0',
    address: '', google_map: '', phone_numbers: '',
    facebook_url: '', instagram_url: '', twitter_url: '', map_iframe: '',
};

const Field = ({ label, value }) => (
    <div style={{ marginBottom: 14 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: '#222', marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 14, color: '#444' }}>{value || <span style={{ color: '#bbb' }}>Not set</span>}</div>
    </div>
);

const SectionCard = ({ children }) => (
    <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 8, padding: '24px 28px', marginBottom: 20 }}>
        {children}
    </div>
);

const SectionHeader = ({ title, onEdit }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#111' }}>{title}</h3>
        {onEdit && (
            <button onClick={onEdit} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: '#222', color: '#fff', border: 'none',
                borderRadius: 6, padding: '7px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 600,
            }}>
                <FaEdit /> Edit
            </button>
        )}
    </div>
);

const Toggle = ({ checked, onChange }) => (
    <label style={{ position: 'relative', display: 'inline-block', width: 44, height: 24, cursor: 'pointer' }}>
        <input type="checkbox" checked={checked} onChange={onChange} style={{ opacity: 0, width: 0, height: 0 }} />
        <span style={{
            position: 'absolute', inset: 0, borderRadius: 24,
            background: checked ? '#6C5CE7' : '#ccc', transition: '0.2s',
        }} />
        <span style={{
            position: 'absolute', top: 3, left: checked ? 23 : 3,
            width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: '0.2s',
        }} />
    </label>
);

const Modal = ({ title, children, onClose, onSave }) => (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        onClick={onClose}>
        <div style={{ background: '#fff', borderRadius: 10, padding: 28, width: 520, maxWidth: '95vw', maxHeight: '85vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 20px', fontSize: 17, fontWeight: 700 }}>{title}</h3>
            {children}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
                <button onClick={onClose} style={{ padding: '8px 18px', borderRadius: 6, border: '1px solid #ddd', background: '#fff', cursor: 'pointer' }}>Cancel</button>
                <button onClick={onSave} style={{ padding: '8px 18px', borderRadius: 6, border: 'none', background: '#222', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>Save</button>
            </div>
        </div>
    </div>
);

const inputStyle = { width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 14, boxSizing: 'border-box', marginTop: 4 };
const labelStyle = { fontSize: 13, fontWeight: 600, color: '#444', display: 'block', marginBottom: 2 };

const SystemSettings = () => {
    const { message } = App.useApp();
    const [settings, setSettings] = useState(DEFAULTS);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Modal state
    const [generalModal, setGeneralModal] = useState(false);
    const [contactModal, setContactModal] = useState(false);
    const [draft, setDraft] = useState({});

    const fetchSettings = () => {
        apiClient.get('/super-admin/settings')
            .then(res => setSettings({ ...DEFAULTS, ...res.data }))
            .catch(() => {})
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchSettings(); }, []);

    const save = async (patch) => {
        setSaving(true);
        try {
            await apiClient.put('/super-admin/settings', patch);
            setSettings(prev => ({ ...prev, ...patch }));
            settingsService.clearCache(); // force Header/Footer to reload
            message.success('Settings saved!');
        } catch {
            message.error('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const handleShutdownToggle = () => {
        const newVal = settings.shutdown_website === '1' ? '0' : '1';
        save({ shutdown_website: newVal });
    };

    const openGeneral = () => {
        setDraft({ site_title: settings.site_title, about_us: settings.about_us });
        setGeneralModal(true);
    };

    const openContact = () => {
        setDraft({
            address: settings.address,
            google_map: settings.google_map,
            phone_numbers: settings.phone_numbers,
            facebook_url: settings.facebook_url,
            instagram_url: settings.instagram_url,
            twitter_url: settings.twitter_url,
            map_iframe: settings.map_iframe,
        });
        setContactModal(true);
    };

    const d = (field, value) => setDraft(prev => ({ ...prev, [field]: value }));

    if (loading) return <p style={{ color: '#aaa', padding: 20 }}>Loading settings...</p>;

    return (
        <div style={{ maxWidth: 900 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#111', marginBottom: 24, letterSpacing: 1, textTransform: 'uppercase' }}>Settings</h2>

            {/* General Settings */}
            <SectionCard>
                <SectionHeader title="General Settings" onEdit={openGeneral} />
                <Field label="Site Title" value={settings.site_title} />
                <Field label="About us" value={settings.about_us} />
            </SectionCard>

            {/* Shutdown Website */}
            <SectionCard>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#111' }}>Shutdown Website</h3>
                    <Toggle checked={settings.shutdown_website === '1'} onChange={handleShutdownToggle} />
                </div>
                <p style={{ margin: 0, fontSize: 14, color: '#555' }}>
                    No customers will be allowed to book hotel room, when shutdown mode is turned on.
                </p>
            </SectionCard>

            {/* Contact Settings */}
            <SectionCard>
                <SectionHeader title="Contacts Settings" onEdit={openContact} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 40px' }}>
                    <div>
                        <Field label="Address" value={settings.address} />
                        <Field label="Google Map" value={settings.google_map} />
                        <div style={{ marginBottom: 14 }}>
                            <div style={{ fontWeight: 700, fontSize: 14, color: '#222', marginBottom: 4 }}>Phone Numbers</div>
                            {settings.phone_numbers
                                ? settings.phone_numbers.split(',').map((p, i) => (
                                    <div key={i} style={{ fontSize: 14, color: '#444', display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <FaPhone size={11} /> {p.trim()}
                                    </div>
                                ))
                                : <span style={{ color: '#bbb', fontSize: 14 }}>Not set</span>
                            }
                        </div>
                    </div>
                    <div>
                        <div style={{ marginBottom: 14 }}>
                            <div style={{ fontWeight: 700, fontSize: 14, color: '#222', marginBottom: 6 }}>Social Links</div>
                            {settings.facebook_url && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, fontSize: 14, color: '#444' }}>
                                    <FaFacebook color="#1877f2" /> {settings.facebook_url}
                                </div>
                            )}
                            {settings.instagram_url && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, fontSize: 14, color: '#444' }}>
                                    <FaInstagram color="#e1306c" /> {settings.instagram_url}
                                </div>
                            )}
                            {settings.twitter_url && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, fontSize: 14, color: '#444' }}>
                                    <FaTwitter color="#1da1f2" /> {settings.twitter_url}
                                </div>
                            )}
                            {!settings.facebook_url && !settings.instagram_url && !settings.twitter_url && (
                                <span style={{ color: '#bbb', fontSize: 14 }}>Not set</span>
                            )}
                        </div>
                        {settings.map_iframe && (
                            <div>
                                <div style={{ fontWeight: 700, fontSize: 14, color: '#222', marginBottom: 6 }}>iFrame</div>
                                <div dangerouslySetInnerHTML={{ __html: settings.map_iframe }}
                                    style={{ borderRadius: 6, overflow: 'hidden', maxWidth: '100%' }} />
                            </div>
                        )}
                    </div>
                </div>
            </SectionCard>

            {/* General Edit Modal */}
            {generalModal && (
                <Modal title="Edit General Settings" onClose={() => setGeneralModal(false)}
                    onSave={() => { save(draft); setGeneralModal(false); }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div>
                            <label style={labelStyle}>Site Title</label>
                            <input style={inputStyle} value={draft.site_title} onChange={e => d('site_title', e.target.value)} placeholder="e.g. StayHub" />
                        </div>
                        <div>
                            <label style={labelStyle}>About Us</label>
                            <textarea style={{ ...inputStyle, minHeight: 100, resize: 'vertical' }} value={draft.about_us} onChange={e => d('about_us', e.target.value)} placeholder="Describe your platform..." />
                        </div>
                    </div>
                </Modal>
            )}

            {/* Contact Edit Modal */}
            {contactModal && (
                <Modal title="Edit Contact Settings" onClose={() => setContactModal(false)}
                    onSave={() => { save(draft); setContactModal(false); }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div>
                            <label style={labelStyle}>Address</label>
                            <input style={inputStyle} value={draft.address} onChange={e => d('address', e.target.value)} placeholder="e.g. Kathmandu, Nepal" />
                        </div>
                        <div>
                            <label style={labelStyle}>Google Map URL</label>
                            <input style={inputStyle} value={draft.google_map} onChange={e => d('google_map', e.target.value)} placeholder="https://goo.gl/maps/..." />
                        </div>
                        <div>
                            <label style={labelStyle}>Phone Numbers (comma separated)</label>
                            <input style={inputStyle} value={draft.phone_numbers} onChange={e => d('phone_numbers', e.target.value)} placeholder="9800000000, 9811111111" />
                        </div>
                        <div>
                            <label style={labelStyle}>Facebook URL</label>
                            <input style={inputStyle} value={draft.facebook_url} onChange={e => d('facebook_url', e.target.value)} placeholder="https://facebook.com/..." />
                        </div>
                        <div>
                            <label style={labelStyle}>Instagram URL</label>
                            <input style={inputStyle} value={draft.instagram_url} onChange={e => d('instagram_url', e.target.value)} placeholder="https://instagram.com/..." />
                        </div>
                        <div>
                            <label style={labelStyle}>Twitter URL</label>
                            <input style={inputStyle} value={draft.twitter_url} onChange={e => d('twitter_url', e.target.value)} placeholder="https://twitter.com/..." />
                        </div>
                        <div>
                            <label style={labelStyle}>Map iFrame (embed HTML)</label>
                            <textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical', fontFamily: 'monospace', fontSize: 12 }}
                                value={draft.map_iframe} onChange={e => d('map_iframe', e.target.value)}
                                placeholder='<iframe src="https://maps.google.com/..." ...></iframe>' />
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default SystemSettings;
