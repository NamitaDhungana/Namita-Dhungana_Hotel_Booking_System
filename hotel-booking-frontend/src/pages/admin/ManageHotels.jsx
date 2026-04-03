import React, { useState, useEffect } from 'react';
import { message, Modal, App } from 'antd';
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import adminService from '../../services/adminService';
import authService from '../../services/authService';
import apiClient from '../../services/apiClient';
import './ManageHotels.css';

const ManageHotels = () => {
    const { message, modal } = App.useApp();
    const user = authService.getCurrentUser();
    const isSuperAdmin = user?.role === 'super_admin';
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingHotel, setEditingHotel] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        city: '',
        description: '',
        rating: 0,
        featured_image: '',
        property_type: 'hotel',
        latitude: '',
        longitude: '',
    });

    useEffect(() => {
        fetchHotels();
    }, []);

    const fetchHotels = async () => {
        try {
            let data;
            if (isSuperAdmin) {
                // Super admin fetches all hotels via public endpoint
                const res = await apiClient.get('/hotels?per_page=1000');
                data = res.data?.data ?? res.data;
            } else {
                data = await adminService.getMyHotels();
            }
            setHotels(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to fetch hotels", error);
            message.error("Failed to fetch hotels");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id) => {
        modal.confirm({
            title: 'Delete Hotel',
            content: 'Are you sure you want to delete this hotel?',
            okText: 'Yes, Delete',
            okType: 'danger',
            cancelText: 'No',
            onOk: async () => {
                try {
                    await adminService.deleteHotel(id);
                    setHotels(hotels.filter(h => h.id !== id));
                    message.success("Hotel deleted successfully");
                } catch (error) {
                    message.error("Failed to delete hotel");
                }
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingHotel) {
                await adminService.updateHotel(editingHotel.id, formData);
                message.success("Hotel updated successfully");
            } else {
                await adminService.createHotel(formData);
                message.success("Hotel created successfully");
            }
            setShowModal(false);
            setEditingHotel(null);
            fetchHotels();
        } catch (error) {
            message.error("Action failed: " + (error.message || "Unknown error"));
        }
    };

    const openEdit = (hotel) => {
        setEditingHotel(hotel);
        setFormData({
            name: hotel.name,
            address: hotel.address,
            city: hotel.city,
            description: hotel.description,
            rating: hotel.rating,
            featured_image: hotel.featured_image,
            property_type: hotel.property_type || 'hotel',
            latitude: hotel.latitude || '',
            longitude: hotel.longitude || '',
        });
        setShowModal(true);
    };

    const filteredHotels = hotels.filter(h =>
        h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (h.city && h.city.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="manage-hotels">
            <div className="page-actions">
                <div className="search-bar">
                    <FaSearch />
                    <input
                        type="text"
                        placeholder="Search hotels..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="add-btn" onClick={() => { setShowModal(true); setEditingHotel(null); setFormData({ name: '', address: '', city: '', description: '', rating: 0, featured_image: '', property_type: 'hotel', latitude: '', longitude: '' }); }}>
                    <FaPlus /> Add New Hotel
                </button>
            </div>

            <div className="hotels-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Image</th>
                            <th>Name</th>
                            <th>City</th>
                            <th>Rating</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredHotels.map(hotel => (
                            <tr key={hotel.id}>
                                <td><img src={hotel.featured_image} alt={hotel.name} className="table-thumb" /></td>
                                <td>{hotel.name}</td>
                                <td>{hotel.city}</td>
                                <td>{hotel.rating} / 5</td>
                                <td className="actions">
                                    <button className="edit-icon" onClick={() => openEdit(hotel)}><FaEdit /></button>
                                    <button className="delete-icon" onClick={() => handleDelete(hotel.id)}><FaTrash /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="admin-modal">
                        <h2>{editingHotel ? 'Edit Hotel' : 'Add New Hotel'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Hotel Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Address</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>City</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    required
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Image URL</label>
                                <input
                                    type="text"
                                    value={formData.featured_image}
                                    onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
                                />
                            </div>
                            <div className="form-group" style={{ display: 'flex', gap: '12px' }}>
                                <div style={{ flex: 1 }}>
                                    <label>Latitude</label>
                                    <input
                                        type="number"
                                        step="any"
                                        placeholder="e.g. 27.7172"
                                        value={formData.latitude}
                                        onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label>Longitude</label>
                                    <input
                                        type="number"
                                        step="any"
                                        placeholder="e.g. 85.3240"
                                        value={formData.longitude}
                                        onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="save-btn">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageHotels;
