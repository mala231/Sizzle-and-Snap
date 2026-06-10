import React, { useState, useEffect, useCallback } from 'react';
import api, { API_BASE_URL } from '../../utils/api';
import MenuItemForm from '../../components/admin/MenuItemForm';
import { 
  PlusIcon, 
  PencilSquareIcon, 
  TrashIcon,
  ExclamationTriangleIcon,
  PhotoIcon,
  Squares2X2Icon
} from '@heroicons/react/24/outline';

export default function MenuManagerPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form panel state: null = closed, 'add' = add mode, item object = edit mode
  const [formMode, setFormMode] = useState(null);

  // Delete confirmation: null or item id pending confirmation
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Availability toggle loading set (itemId being toggled)
  const [togglingId, setTogglingId] = useState(null);

  const fetchItems = useCallback(async () => {
    try {
      const res = await api.get('/api/menu');
      setItems(res.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch menu items:', err);
      setError('Failed to load menu items.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleSave = async () => {
    setFormMode(null);
    setLoading(true);
    await fetchItems();
  };

  const handleToggleAvailability = async (item) => {
    if (togglingId === item.id) return;
    setTogglingId(item.id);
    try {
      const res = await api.patch(`/api/menu/${item.id}/availability`);
      const updated = res.data.data;
      setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    } catch (err) {
      console.error('Failed to toggle availability:', err);
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (itemId) => {
    setDeleting(true);
    try {
      await api.delete(`/api/menu/${itemId}`);
      setItems((prev) => prev.filter((i) => i.id !== itemId));
      setDeleteConfirmId(null);
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setDeleting(false);
    }
  };

  const openEdit = (item) => {
    setDeleteConfirmId(null);
    setFormMode(item);
    // Scroll form panel into view
    setTimeout(() => {
      document.getElementById('menu-form-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const openAdd = () => {
    setDeleteConfirmId(null);
    setFormMode('add');
    setTimeout(() => {
      document.getElementById('menu-form-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const isFormOpen = formMode !== null;
  const editingItem = formMode && formMode !== 'add' ? formMode : null;

  return (
    <div className="max-w-7xl mx-auto space-y-xl">

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md border-b border-outline-variant/20 pb-md">
        <div>
          <h1 className="text-headline-lg-mobile sm:text-headline-lg font-extrabold text-on-background tracking-tight">
            Menu Manager
          </h1>
          <p className="text-body-md text-on-surface-variant mt-xs">
            Add, edit, and manage all menu items and their availability
          </p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-xs bg-primary-container text-on-primary text-label-md font-bold px-lg py-sm rounded-full hover:bg-primary hover:shadow-hover shadow-sm transition-all active:scale-[0.98]"
        >
          <PlusIcon className="h-5 w-5" />
          Add New Item
        </button>
      </div>

      {/* Inline form panel — slides in when open */}
      {isFormOpen && (
        <div
          id="menu-form-panel"
          className="bg-surface-lowest border border-outline-variant/30 rounded-xl p-md sm:p-lg shadow-card"
        >
          <div className="flex items-center justify-between mb-lg pb-sm border-b border-outline-variant/15">
            <h2 className="text-title-md font-bold text-on-surface">
              {editingItem ? `Editing: ${editingItem.name}` : 'Add New Menu Item'}
            </h2>
          </div>
          <MenuItemForm
            item={editingItem}
            onSave={handleSave}
            onCancel={() => setFormMode(null)}
          />
        </div>
      )}

      {/* Loading skeletons */}
      {loading && items.length === 0 && (
        <div className="space-y-sm">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-surface-lowest border border-outline-variant/20 rounded-xl h-[68px] animate-pulse flex items-center gap-md px-md">
              <div className="w-12 h-12 bg-surface-container rounded-lg shrink-0" />
              <div className="flex-1 space-y-xs">
                <div className="h-4 bg-surface-container rounded w-1/3" />
                <div className="h-3 bg-surface-container rounded w-1/5" />
              </div>
              <div className="h-6 w-16 bg-surface-container rounded-full" />
              <div className="h-8 w-8 bg-surface-container rounded-lg" />
              <div className="h-8 w-8 bg-surface-container rounded-lg" />
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="text-center py-xl max-w-md mx-auto">
          <div className="bg-error-container/30 border border-error/20 rounded-xl p-xl flex flex-col items-center gap-md">
            <ExclamationTriangleIcon className="h-12 w-12 text-error" />
            <p className="text-body-md text-on-surface-variant">{error}</p>
            <button onClick={fetchItems} className="bg-primary-container text-on-primary text-label-md font-bold px-lg py-xs rounded-full hover:bg-primary transition-all">
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && items.length === 0 && (
        <div className="text-center py-3xl bg-surface-low rounded-xl border border-dashed border-outline-variant/30 flex flex-col items-center p-lg">
          <Squares2X2Icon className="h-16 w-16 text-on-surface-variant/20 mb-md" />
          <h3 className="text-headline-lg-mobile text-on-surface-variant/40 font-bold">No Menu Items Yet</h3>
          <p className="text-body-md text-on-surface-variant/60 mt-xs mb-lg max-w-xs">
            Click "Add New Item" above to create your first menu listing.
          </p>
        </div>
      )}

      {/* Items table */}
      {!loading && !error && items.length > 0 && (
        <div className="bg-surface-lowest border border-outline-variant/30 rounded-xl shadow-card overflow-hidden">
          {/* Desktop table header */}
          <div className="hidden md:grid grid-cols-[64px_1fr_100px_80px_100px_80px_80px] gap-md px-lg py-sm bg-surface-container-low border-b border-outline-variant/15">
            <span className="text-label-sm font-bold text-on-surface-variant/60 uppercase tracking-wider">Image</span>
            <span className="text-label-sm font-bold text-on-surface-variant/60 uppercase tracking-wider">Name</span>
            <span className="text-label-sm font-bold text-on-surface-variant/60 uppercase tracking-wider">Category</span>
            <span className="text-label-sm font-bold text-on-surface-variant/60 uppercase tracking-wider">Price</span>
            <span className="text-label-sm font-bold text-on-surface-variant/60 uppercase tracking-wider text-center">Available</span>
            <span className="text-label-sm font-bold text-on-surface-variant/60 uppercase tracking-wider text-center">Edit</span>
            <span className="text-label-sm font-bold text-on-surface-variant/60 uppercase tracking-wider text-center">Delete</span>
          </div>

          {/* Rows */}
          <div className="divide-y divide-outline-variant/10">
            {items.map((item) => (
              <React.Fragment key={item.id}>
                {/* Main row */}
                <div className="grid grid-cols-[auto_1fr] md:grid-cols-[64px_1fr_100px_80px_100px_80px_80px] gap-md px-md md:px-lg py-md items-center">

                  {/* Thumbnail */}
                  <div className="w-14 h-14 rounded-lg bg-surface-container overflow-hidden shrink-0 border border-outline-variant/20">
                    {item.imageUrl ? (
                      <img
                        src={`${API_BASE_URL}/uploads/${item.imageUrl}`}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <PhotoIcon className="h-6 w-6 text-on-surface-variant/20" />
                      </div>
                    )}
                  </div>

                  {/* Name + description (mobile stacks info) */}
                  <div className="min-w-0">
                    <p className="text-body-md font-bold text-on-surface truncate">{item.name}</p>
                    <p className="text-label-sm text-on-surface-variant/60 truncate hidden md:block">{item.description}</p>
                    {/* Mobile: show category + price inline */}
                    <div className="flex items-center gap-md mt-xs md:hidden">
                      <span className="text-label-sm text-on-surface-variant">{item.category}</span>
                      <span className="text-label-sm font-bold text-primary-container">${parseFloat(item.price).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Category — desktop only */}
                  <span className="hidden md:block text-body-md text-on-surface-variant">{item.category}</span>

                  {/* Price — desktop only */}
                  <span className="hidden md:block text-body-md font-bold text-primary-container">
                    ${parseFloat(item.price).toFixed(2)}
                  </span>

                  {/* Availability toggle */}
                  <div className="hidden md:flex justify-center">
                    <button
                      type="button"
                      onClick={() => handleToggleAvailability(item)}
                      disabled={togglingId === item.id}
                      title={item.isAvailable ? 'Mark as Sold Out' : 'Mark as Available'}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                        item.isAvailable ? 'bg-[#1a6b2a]' : 'bg-surface-highest'
                      } ${togglingId === item.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                          item.isAvailable ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Action buttons — always visible */}
                  <div className="hidden md:flex justify-center">
                    <button
                      onClick={() => openEdit(item)}
                      className="p-sm text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg transition-all"
                      title="Edit item"
                    >
                      <PencilSquareIcon className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="hidden md:flex justify-center">
                    <button
                      onClick={() => setDeleteConfirmId(deleteConfirmId === item.id ? null : item.id)}
                      className="p-sm text-on-surface-variant hover:text-error hover:bg-error-container/20 rounded-lg transition-all"
                      title="Delete item"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Mobile action buttons */}
                  <div className="md:hidden flex items-center gap-sm col-span-2 justify-end pt-xs border-t border-outline-variant/10 mt-xs">
                    <button
                      onClick={() => handleToggleAvailability(item)}
                      disabled={togglingId === item.id}
                      className={`text-label-sm font-bold px-md py-xs rounded-full border transition-all ${
                        item.isAvailable
                          ? 'bg-[#c8f0d2] border-[#1a6b2a]/20 text-[#0d3d18]'
                          : 'bg-surface-container border-outline-variant/30 text-on-surface-variant'
                      }`}
                    >
                      {item.isAvailable ? 'In Stock' : 'Sold Out'}
                    </button>
                    <button
                      onClick={() => openEdit(item)}
                      className="p-sm text-primary border border-primary/20 hover:bg-primary-fixed rounded-lg transition-all"
                    >
                      <PencilSquareIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(deleteConfirmId === item.id ? null : item.id)}
                      className="p-sm text-error border border-error/20 hover:bg-error-container/20 rounded-lg transition-all"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Inline delete confirmation row */}
                {deleteConfirmId === item.id && (
                  <div className="bg-error-container/20 border-l-4 border-error px-lg py-md flex flex-col sm:flex-row sm:items-center gap-md justify-between">
                    <div>
                      <p className="text-body-md font-bold text-on-surface">
                        Delete "{item.name}"?
                      </p>
                      <p className="text-label-sm text-on-surface-variant mt-xs">
                        This will permanently remove the item and its image. This cannot be undone.
                      </p>
                    </div>
                    <div className="flex gap-sm shrink-0">
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        disabled={deleting}
                        className="px-lg py-sm text-label-md font-bold text-on-surface-variant border border-outline-variant/40 rounded-full hover:bg-surface-container transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={deleting}
                        className={`px-lg py-sm text-label-md font-bold text-on-error bg-error rounded-full hover:shadow-hover transition-all active:scale-[0.98] ${
                          deleting ? 'opacity-60 cursor-not-allowed' : ''
                        }`}
                      >
                        {deleting ? 'Deleting...' : 'Yes, Delete'}
                      </button>
                    </div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
