import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import ImageUploader from './ImageUploader';
import { CATEGORIES } from '../../constants';

export default function MenuItemForm({ item, onSave, onCancel }) {
  const isEditing = Boolean(item);

  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Populate form when editing an existing item
  useEffect(() => {
    if (item) {
      setName(item.name || '');
      setCategory(item.category || CATEGORIES[0]);
      setPrice(String(parseFloat(item.price) || ''));
      setDescription(item.description || '');
      setIsAvailable(item.isAvailable !== false);
    } else {
      setName('');
      setCategory(CATEGORIES[0]);
      setPrice('');
      setDescription('');
      setIsAvailable(true);
    }
    setSelectedFile(null);
    setError(null);
  }, [item]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Client-side validation
    if (!name.trim()) return setError('Name is required.');
    if (!description.trim()) return setError('Description is required.');
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) return setError('Price must be a positive number.');
    if (!CATEGORIES.includes(category)) return setError('Please select a valid category.');

    setLoading(true);

    try {
      let savedItem;

      if (isEditing) {
        // Phase 1: Update text fields
        const res = await api.put(`/api/menu/${item.id}`, {
          name: name.trim(),
          description: description.trim(),
          price: parsedPrice,
          category,
          isAvailable
        });
        savedItem = res.data.data;
      } else {
        // Phase 1: Create item (text only, no image yet)
        const res = await api.post('/api/menu', {
          name: name.trim(),
          description: description.trim(),
          price: parsedPrice,
          category
        });
        savedItem = res.data.data;
      }

      // Phase 2: Upload image only if a new file was selected
      if (selectedFile && savedItem?.id) {
        const formData = new FormData();
        formData.append('image', selectedFile);
        await api.post(`/api/menu/${savedItem.id}/image`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      onSave();
    } catch (err) {
      console.error('MenuItemForm save error:', err);
      setError(err.response?.data?.message || 'Failed to save menu item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'w-full bg-surface-container-high border border-outline-variant/40 rounded-lg p-md text-body-md text-on-surface focus:outline-none focus:border-secondary-container transition-all';
  const labelClass = 'block text-label-sm font-bold text-on-surface-variant mb-sm';

  return (
    <form onSubmit={handleSubmit} className="space-y-lg">
      {/* Error banner */}
      {error && (
        <div className="bg-error-container/40 border border-error/20 p-md rounded-lg text-on-error-container text-label-md font-bold">
          {error}
        </div>
      )}

      {/* Text fields grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
        {/* Name */}
        <div className="sm:col-span-2">
          <label className={labelClass}>Item Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Classic Smash Burger"
            disabled={loading}
            className={inputClass}
            required
          />
        </div>

        {/* Category */}
        <div>
          <label className={labelClass}>Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={loading}
            className={inputClass}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Price */}
        <div>
          <label className={labelClass}>Price ($)</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.00"
            min="0.01"
            step="0.01"
            disabled={loading}
            className={inputClass}
            required
          />
        </div>

        {/* Description */}
        <div className="sm:col-span-2">
          <label className={labelClass}>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="A short appetizing description of the item..."
            rows={2}
            disabled={loading}
            className={`${inputClass} resize-none`}
            required
          />
        </div>

        {/* Availability toggle (edit mode only — new items default to available) */}
        {isEditing && (
          <div className="sm:col-span-2 flex items-center justify-between p-md bg-surface-container-low border border-outline-variant/20 rounded-lg">
            <div>
              <p className="text-body-md font-bold text-on-surface">Item Availability</p>
              <p className="text-label-sm text-on-surface-variant mt-xs">
                {isAvailable ? 'Customers can order this item.' : 'Item is marked as sold out.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAvailable(!isAvailable)}
              disabled={loading}
              className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                isAvailable ? 'bg-[#1a6b2a]' : 'bg-surface-highest'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                  isAvailable ? 'translate-x-8' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        )}
      </div>

      {/* Image section */}
      <div>
        <label className={labelClass}>
          {isEditing ? 'Replace Image (optional)' : 'Upload Image (optional — can add later)'}
        </label>
        <ImageUploader
          onFileSelect={setSelectedFile}
          currentImageUrl={isEditing ? item?.imageUrl : null}
        />
      </div>

      {/* Form actions */}
      <div className="flex justify-end items-center gap-md pt-sm border-t border-outline-variant/20">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-lg py-sm text-label-md font-bold text-on-surface-variant border border-outline-variant/40 rounded-full hover:bg-surface-container transition-all"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className={`px-xl py-sm text-label-md font-bold rounded-full shadow-sm transition-all active:scale-[0.98] ${
            loading
              ? 'bg-surface-dim text-on-surface-variant cursor-not-allowed shadow-none'
              : 'bg-primary-container text-on-primary hover:bg-primary hover:shadow-hover'
          }`}
        >
          {loading
            ? (isEditing ? 'Saving...' : 'Creating...')
            : (isEditing ? 'Save Changes' : 'Create Item')
          }
        </button>
      </div>
    </form>
  );
}
