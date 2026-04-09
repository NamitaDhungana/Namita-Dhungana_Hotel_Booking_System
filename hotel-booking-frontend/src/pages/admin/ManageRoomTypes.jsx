import { useState, useEffect } from 'react';
import { App } from 'antd';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import adminService from '../../services/adminService';
import hotelService from '../../services/hotelService';
import './ManageRooms.css';

const ROOM_TYPES = ['Single Room', 'Double Room', 'Deluxe Room', 'Suite', 'Family Room', 'Presidential Suite'];

const defaultForm = {
    hotel_id: '', type_name: '', base_price: '', area_sqft: '',
    max_adults: '', max_children: '', description: '',
    amenities: [],
};

const ManageRoomTypes = () => {
    const { message } = App.useApp();
    const [roomTypes, setRoomTypes] = useState([]);
    const [hotels, setHotels] = useState([]);
    const [allAmenities, setAllAmenities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingRoom, setEditingRoom] = useState(null);
    const [formData, setFormData] = useState(defaultForm);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const [roomsData, hotelsData, amenitiesData] = await Promise.all([
                hotelService.getAllRoomTypes(),
                adminService.getMyHotels(),
                hotelService.getAmenities(),
            ]);
            setRoomTypes(Array.isArray(roomsData) ? roomsData : []);
            setHotels(Array.isArray(hotelsData) ? hotelsData : []);
            setAllAmenities(Array.isArray(amenitiesData) ? amenitiesData : []);
        } catch {
            message.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const set = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

    const toggleAmenity = (name) => {
        setFormData(prev => ({
            ...prev,
            amenities: prev.amenities.includes(name)
                ? prev.amenities.filter(a => a !== name)
                : [...prev.amenities, name],
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            ...formData,
            max_occupancy: parseInt(formData.max_adults || 1) + parseInt(formData.max_children || 0),
        };
        try {
            if (editingRoom) {
                await adminService.updateRoomType(editingRoom.id, payload);
                message.success('Room type updated!');
            } else {
                await adminService.createRoomType(payload);
                message.success('Room type created!');
            }
            setShowModal(false);
            setFormData(defaultForm);
            setEditingRoom(null);
            fetchData();
        } catch (error) {
            message.error('Action failed: ' + (error.message || 'Unknown error'));
        }
    };

    const openEdit = (room) => {
        setEditingRoom(room);
        setFormData({
            hotel_id: room.hotel_id,
            type_name: room.type_name,
            base_price: room.base_price,
            area_sqft: room.area_sqft || '',
            max_adults: room.max_adults || '',
            max_children: room.max_children ?? '',
            description: room.description || '',
            amenities: Array.isArray(room.amenities) ? room.amenities : [],
        });
        setShowModal(true);
    };

    const openAdd = () => { setEditingRoom(null); setFormData(defaultForm); setShowModal(true); };

    const handleDelete = async (room) => {
        if (!window.confirm(`Delete room type "${room.type_name}"? This cannot be undone.`)) return;
        try {
            await adminService.deleteRoomType(room.id);
            message.success('Room type deleted!');
            fetchData();
        } catch (error) {
            message.error(error?.message || 'Failed to delete room type.');
        }
    };

    const statusBadge = (count) => (
        <span className={`rm-badge ${count > 0 ? 'available' : 'none'}`}>
            {count > 0 ? `${count} rooms` : 'No Rooms'}
        </span>
    );

    return (
        <div className="manage-rooms-page">
            <div className="rm-header">
                <h2>Manage Room Types</h2>
                <button className="rm-add-btn" onClick={openAdd}><FaPlus /> Add Room Type</button>
            </div>

            {loading ? <p className="rm-loading">Loading...</p> : (
                <div className="rm-table-wrap">
                    <table className="rm-table">
                        <thead>
                            <tr>
                                <th>Hotel</th>
                                <th>Type Name</th>
                                <th>Price / Night</th>
                                <th>Area</th>
                                <th>Adults</th>
                                <th>Children</th>
                                <th>Rooms</th>
                                <th>Facilities and Features</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {roomTypes.length === 0 ? (
                                <tr><td colSpan={9} className="rm-empty">No room types found.</td></tr>
                            ) : roomTypes.map(room => (
                                <tr key={room.id}>
                                    <td className="rm-hotel-name">{room.hotel?.name || '—'}</td>
                                    <td className="rm-type-name">{room.type_name}</td>
                                    <td className="rm-price">Rs. {Number(room.base_price).toLocaleString()}</td>
                                    <td>{room.area_sqft ? `${room.area_sqft} m²` : '—'}</td>
                                    <td>{room.max_adults ?? '—'}</td>
                                    <td>{room.max_children ?? '—'}</td>
                                    <td>{statusBadge(room.rooms_count ?? 0)}</td>
                                    <td>
                                        <div className="rm-amenity-tags">
                                            {Array.isArray(room.amenities) && room.amenities.length > 0
                                                ? room.amenities.slice(0, 3).map(a => (
                                                    <span key={a} className="rm-amenity-tag">{a}</span>
                                                ))
                                                : <span style={{ color: '#aaa', fontSize: 12 }}>None</span>
                                            }
                                            {Array.isArray(room.amenities) && room.amenities.length > 3 && (
                                                <span className="rm-amenity-tag">+{room.amenities.length - 3}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <button className="rm-edit-btn" onClick={() => openEdit(room)} title="Edit"><FaEdit /></button>
                                        <button className="rm-delete-btn" onClick={() => handleDelete(room)} title="Delete"><FaTrash /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && (
                <div className="rm-overlay" onClick={() => setShowModal(false)}>
                    <div className="rm-modal" onClick={e => e.stopPropagation()}>
                        <h3>{editingRoom ? 'Edit Room Type' : 'Add Room Type'}</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="rm-form-grid">
                                <div className="rm-field full">
                                    <label>Hotel</label>
                                    <select required value={formData.hotel_id} onChange={e => set('hotel_id', e.target.value)}>
                                        <option value="">Select hotel...</option>
                                        {hotels.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                                    </select>
                                </div>

                                <div className="rm-field full">
                                    <label>Room Type Name</label>
                                    <select required value={formData.type_name} onChange={e => set('type_name', e.target.value)}>
                                        <option value="">Select room type...</option>
                                        {ROOM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>

                                <div className="rm-field">
                                    <label>Price / Night (Rs.)</label>
                                    <input type="number" required min="0" step="0.01"
                                        value={formData.base_price}
                                        onKeyDown={e => ['-','e','E','+'].includes(e.key) && e.preventDefault()}
                                        onChange={e => set('base_price', e.target.value)} />
                                </div>

                                <div className="rm-field">
                                    <label>Area (m²)</label>
                                    <input type="number" min="0" step="0.1" placeholder="e.g. 25"
                                        value={formData.area_sqft}
                                        onKeyDown={e => ['-','e','E','+'].includes(e.key) && e.preventDefault()}
                                        onChange={e => set('area_sqft', e.target.value)} />
                                </div>

                                <div className="rm-field">
                                    <label>Max Adults</label>
                                    <input type="number" required min="1"
                                        value={formData.max_adults}
                                        onKeyDown={e => ['-','e','E','+','.'].includes(e.key) && e.preventDefault()}
                                        onChange={e => set('max_adults', e.target.value)} />
                                </div>

                                <div className="rm-field">
                                    <label>Max Children</label>
                                    <input type="number" min="0"
                                        value={formData.max_children}
                                        onKeyDown={e => ['-','e','E','+','.'].includes(e.key) && e.preventDefault()}
                                        onChange={e => set('max_children', e.target.value)} />
                                </div>

                                <div className="rm-field full">
                                    <label>Description</label>
                                    <textarea rows={3} value={formData.description}
                                        onChange={e => set('description', e.target.value)} />
                                </div>

                                {allAmenities.filter(a => a.type === 'facility').length > 0 && (
                                    <div className="rm-field full">
                                        <label>Facilities</label>
                                        <div className="rm-amenity-checks">
                                            {allAmenities.filter(a => a.type === 'facility').map(a => (
                                                <label key={a.amenity_id} className="rm-check-label">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.amenities.includes(a.name)}
                                                        onChange={() => toggleAmenity(a.name)}
                                                    />
                                                    {a.name}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {allAmenities.filter(a => a.type === 'feature').length > 0 && (
                                    <div className="rm-field full">
                                        <label>Features</label>
                                        <div className="rm-amenity-checks">
                                            {allAmenities.filter(a => a.type === 'feature').map(a => (
                                                <label key={a.amenity_id} className="rm-check-label">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.amenities.includes(a.name)}
                                                        onChange={() => toggleAmenity(a.name)}
                                                    />
                                                    {a.name}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="rm-modal-footer">
                                <button type="button" className="rm-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="rm-save">{editingRoom ? 'Update' : 'Create'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageRoomTypes;
