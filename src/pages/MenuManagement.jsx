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
import toast from 'react-hot-toast';
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

  const addButtonClass =
    'inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 px-5 py-3 text-base font-bold text-white shadow-md shadow-orange-500/25 transition hover:from-orange-600 hover:to-orange-700 hover:shadow-lg hover:shadow-orange-500/30 active:scale-[0.98] sm:w-auto sm:min-w-[180px] sm:rounded-xl sm:px-6';

  return (
    <VendorShell title="Menu Management">
      <div className="relative w-full max-w-[1400px] pb-28 sm:pb-6">
        <div className="mb-4 flex flex-col gap-4 sm:mb-5 sm:flex-row sm:items-stretch sm:justify-between sm:gap-4">
          <div className="relative min-w-0 flex-1">
            <Search
              size={18}
              className="pointer-events-none absolute left-3.5 top-1/2 z-[1] -translate-y-1/2 text-gray-400"
              aria-hidden
            />
            <input
              type="text"
              placeholder="Search dishes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="min-h-[48px] w-full rounded-xl border border-white/10 bg-slate-900/60 py-3 pl-11 pr-4 text-sm text-slate-100 shadow-inner placeholder:text-slate-500 transition focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/25"
            />
          </div>

          <button
            type="button"
            className={`${addButtonClass} hidden sm:inline-flex`}
            onClick={() => {
              setEditingItem(null);
              setIsAddModalOpen(true);
            }}
          >
            <Plus size={20} strokeWidth={2.5} />
            <span>Add New Item</span>
          </button>
        </div>

        <div className="menu-tabs-section">
          <div className="menu-tabs-scroll scrollbar-hide">
            <div role="tablist" aria-label="Filter by category" className="category-tabs">
              {categories.map((cat) => {
                const active = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setActiveCategory(cat)}
                    className={`category-tab${active ? ' active' : ''}`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <MenuGrid>
            {filteredItems.map((item) => (
              <MenuItemCard
                key={item.id}
                item={{ ...item, isAvailable: item.is_available }}
                onEdit={openEditModal}
                onDelete={confirmDelete}
                onToggleAvailability={(id, val) => toggleAvailability(id, val)}
              />
            ))}
          </MenuGrid>
        )}

        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[998] border-t border-white/10 bg-slate-900/85 px-4 pb-4 pt-3 shadow-[0_-12px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:hidden">
          <button
            type="button"
            className={`${addButtonClass} pointer-events-auto`}
            onClick={() => {
              setEditingItem(null);
              setIsAddModalOpen(true);
            }}
          >
            <Plus size={20} strokeWidth={2.5} />
            <span>Add New Item</span>
          </button>
        </div>
      </div>

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
