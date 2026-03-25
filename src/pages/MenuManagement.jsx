import React, { useState } from 'react';
import VendorShell from '../components/layout/VendorShell';
import MenuItemCard from '../components/menu/MenuItemCard';
import MenuGrid from '../components/menu/MenuGrid';
import AddItemModal from '../components/menu/AddItemModal';
import ConfirmModal from '../components/common/ConfirmModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Plus, Search } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useMenuSync } from '../hooks/useMenuSync';
import toast, { Toaster } from 'react-hot-toast';
import './MenuManagement.css';

const MenuManagement = () => {
  const { shopId } = useAuth();
  const { menuItems: items, loading, addItem, updateItem, deleteItem, toggleAvailability } = useMenuSync(shopId);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Snacks', 'Meals', 'Beverages', 'Desserts'];

  const handleSaveItem = async (data) => {
    let error;
    if (editingItem) {
      error = await updateItem(editingItem.id, data);
      if (!error) toast.success('Item updated successfully');
    } else {
      error = await addItem(data);
      if (!error) toast.success('Item added successfully');
    }
    if (error) toast.error(error.message);
    setEditingItem(null);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setIsAddModalOpen(true);
  };

  const confirmDelete = (id) => {
    setItemToDelete(id);
  };

  const handleDelete = async () => {
    const error = await deleteItem(itemToDelete);
    if (error) toast.error(error.message);
    else toast.success('Item deleted successfully');
    setItemToDelete(null);
  };

  const filteredItems = items.filter(item => {
    const itemName = typeof item?.name === 'string' ? item.name : ''
    const itemCategoryName =
      typeof item?.category === 'string'
        ? item.category
        : item?.category?.name || item?.category_info?.name || '';

    const matchesSearch = itemName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'All' || itemCategoryName === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <VendorShell title="Menu Management">
      <Toaster position="top-right" />
      <div className="menu-header-actions">
        <div className="search-filter-bar">
          <div className="search-input-wrapper">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search dishes..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="category-tabs">
            {categories.map(cat => (
              <button 
                key={cat} 
                className={`category-tab ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <button className="add-item-btn" onClick={() => { setEditingItem(null); setIsAddModalOpen(true); }}>
          <Plus size={20} />
          <span>Add New Item</span>
        </button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <MenuGrid>
          {filteredItems.map(item => (
            <MenuItemCard 
              key={item.id} 
              item={{...item, isAvailable: item.is_available}} 
              onEdit={openEditModal}
              onDelete={confirmDelete}
              onToggleAvailability={(id, val) => toggleAvailability(id, !val)}
            />
          ))}
        </MenuGrid>
      )}

      <AddItemModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSave={handleSaveItem}
        editingItem={editingItem}
      />

      <ConfirmModal 
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Item"
        message="Are you sure you want to remove this item from the menu? this action cannot be undone."
      />
    </VendorShell>
  );
};

export default MenuManagement;
