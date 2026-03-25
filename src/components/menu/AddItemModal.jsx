import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import './AddItemModal.css';

const AddItemModal = ({ isOpen, onClose, onSave, editingItem = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Snacks',
    price: '',
    description: '',
    is_available: true,
  });

  useEffect(() => {
    if (editingItem) {
      setFormData({
        name: editingItem.name || '',
        // UI stores category as a string name; fetched rows may expose it as `category_info`.
        category:
          (typeof editingItem.category === 'string' ? editingItem.category : null) ||
          editingItem?.category_info?.name ||
          editingItem?.category?.name ||
          'Snacks',
        price: editingItem.price || '',
        description: editingItem.description || '',
        is_available: editingItem.is_available ?? true,
      });
    } else {
      setFormData({
        name: '',
        category: 'Snacks',
        price: '',
        description: '',
        is_available: true,
      });
    }
  }, [editingItem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <form className="modal-content glass-effect" onClick={e => e.stopPropagation()} onSubmit={handleSubmit}>
        <div className="modal-header">
          <h2>{editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}</h2>
          <button type="button" className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="modal-grid">
          <div className="form-group">
            <label>Item Name</label>
            <input 
              type="text" 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
              placeholder="e.g. Masala Dosa"
              required 
            />
          </div>

          <div className="form-group">
            <label>Category</label>
            <select 
              value={formData.category} 
              onChange={e => setFormData({...formData, category: e.target.value})}
            >
              <option>Snacks</option>
              <option>Meals</option>
              <option>Beverages</option>
              <option>Desserts</option>
            </select>
          </div>

          <div className="form-group">
            <label>Price (₹)</label>
            <input 
              type="number" 
              value={formData.price} 
              onChange={e => setFormData({...formData, price: e.target.value})} 
              placeholder="0.00"
              required 
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea 
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="Short description of the item"
              rows={3}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-save">
            {editingItem ? 'Update Item' : 'Add Item'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddItemModal;
