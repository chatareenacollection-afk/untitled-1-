import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Tag, Layers, Check, X, Sparkles, Image as ImageIcon } from 'lucide-react';
import { CategoryItem, Product } from '../types';
import { ImageUploader } from './ImageUploader';

interface CategoryManagerProps {
  categories: CategoryItem[];
  products: Product[];
  onRefresh: () => void;
  showToast: (msg: string) => void;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({
  categories,
  products,
  onRefresh,
  showToast,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formName, setFormName] = useState('');
  const [formId, setFormId] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formImages, setFormImages] = useState<string[]>([]);
  const [formFeatured, setFormFeatured] = useState(true);

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormName('');
    setFormId('');
    setFormSubtitle('');
    setFormImages(['https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80']);
    setFormFeatured(true);
    setModalOpen(true);
  };

  const openEditModal = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormId(cat.id);
    setFormSubtitle(cat.subtitle || '');
    setFormImages(cat.image ? [cat.image] : []);
    setFormFeatured(cat.featured ?? true);
    setModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setFormName(val);
    if (!editingCategory) {
      // Auto-generate slug from name
      const slug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setFormId(slug);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert('Please enter a category title.');
      return;
    }

    setIsSaving(true);
    try {
      const payload: Partial<CategoryItem> = {
        name: formName.trim(),
        subtitle: formSubtitle.trim(),
        image: formImages[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
        featured: formFeatured,
      };

      if (editingCategory) {
        const res = await fetch(`/api/categories/${editingCategory.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Failed to update category');
        showToast(`Category "${formName}" updated successfully`);
      } else {
        const res = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...payload,
            id: formId.trim() || formName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          }),
        });
        if (!res.ok) throw new Error('Failed to create category');
        showToast(`New category "${formName}" created`);
      }

      setModalOpen(false);
      onRefresh();
    } catch (err: any) {
      alert(`Error saving category: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const matchingProducts = products.filter((p) => p.category === id);
    let promptMsg = `Are you sure you want to delete category "${name}"?`;
    if (matchingProducts.length > 0) {
      promptMsg += ` Warning: ${matchingProducts.length} product(s) are currently assigned to this category.`;
    }

    if (!confirm(promptMsg)) return;

    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete category');
      showToast(`Category "${name}" removed`);
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-xl font-bold text-stone-900">Collections & Category Registry</h2>
          <p className="text-xs text-stone-500">
            Create and customize couture collections. Updates appear instantly in the store navigation, homepage grid, and catalog filters across all devices.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-[#1C1917] hover:bg-stone-800 text-[#DFCA95] rounded-md text-xs font-semibold tracking-wide border border-[#C5A059]/40 flex items-center gap-1.5 shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#C5A059]" />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const count = products.filter((p) => p.category === cat.id).length;
          return (
            <div
              key={cat.id}
              className="bg-white rounded-lg border border-[#EBDCCB] overflow-hidden shadow-xs hover:border-[#C5A059] transition-all flex flex-col"
            >
              {/* Cover Image */}
              <div className="h-36 w-full bg-stone-100 relative overflow-hidden group">
                <img
                  src={cat.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80'}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <span className="bg-[#1C1917]/85 text-[#DFCA95] text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-[#C5A059]/40">
                    ID: {cat.id}
                  </span>
                  {cat.featured && (
                    <span className="bg-emerald-900/85 text-emerald-200 text-[10px] font-semibold px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" /> Homepage
                    </span>
                  )}
                </div>

                <div className="absolute bottom-2.5 left-3 right-3 text-white">
                  <h3 className="font-serif text-base font-bold drop-shadow-sm line-clamp-1">{cat.name}</h3>
                  <p className="text-[11px] text-stone-200 line-clamp-1">{cat.subtitle || 'Artisanal Luxury Ensembles'}</p>
                </div>
              </div>

              {/* Card Meta & Actions */}
              <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between text-xs text-stone-600">
                  <span className="flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span>Catalog Products:</span>
                  </span>
                  <span className="font-bold text-stone-900 bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#EBDCCB]">
                    {count} {count === 1 ? 'Ensemble' : 'Ensembles'}
                  </span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
                  <button
                    onClick={() => openEditModal(cat)}
                    className="px-2.5 py-1 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Edit2 className="w-3 h-3 text-[#A37F37]" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => handleDelete(cat.id, cat.name)}
                    className="px-2.5 py-1 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 rounded flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3 h-3 text-red-500" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE / EDIT CATEGORY MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-70 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] w-full max-w-lg rounded-lg p-6 border border-[#EBDCCB] shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-[#EBDCCB]">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#C5A059]" />
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  {editingCategory ? `Edit Category: ${editingCategory.name}` : 'Add New Category'}
                </h3>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-1 hover:bg-stone-200 rounded cursor-pointer">
                <X className="w-5 h-5 text-stone-600" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs pt-4">
              <div>
                <label className="block font-semibold uppercase text-stone-700 mb-1">
                  Category Display Title *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Velvet Winter Edit, Bridal Ghararas, Chiffon Pret"
                  className="w-full bg-white border border-[#EBDCCB] rounded py-2 px-3 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase text-stone-700 mb-1">
                  Unique Slug / URL ID *
                </label>
                <input
                  type="text"
                  required
                  value={formId}
                  disabled={!!editingCategory}
                  onChange={(e) => setFormId(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}
                  placeholder="e.g. velvet-winter-edit"
                  className="w-full bg-white border border-[#EBDCCB] rounded py-2 px-3 font-mono text-xs disabled:bg-stone-100"
                />
                <p className="text-[10px] text-stone-500 mt-1">
                  Used internally for product categorization and filtering.
                </p>
              </div>

              <div>
                <label className="block font-semibold uppercase text-stone-700 mb-1">
                  Subtitle / Description
                </label>
                <input
                  type="text"
                  value={formSubtitle}
                  onChange={(e) => setFormSubtitle(e.target.value)}
                  placeholder="e.g. Hand-embroidered resham and zardozi threadwork on pure silk"
                  className="w-full bg-white border border-[#EBDCCB] rounded py-2 px-3 text-xs"
                />
              </div>

              {/* Direct Image Upload for Category Banner */}
              <div>
                <ImageUploader
                  images={formImages}
                  onChange={setFormImages}
                  maxImages={1}
                  label="Category Cover Picture *"
                  helperText="Upload a banner photo directly from your device, or enter a web link."
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer bg-white p-3 rounded border border-[#EBDCCB]">
                  <input
                    type="checkbox"
                    checked={formFeatured}
                    onChange={(e) => setFormFeatured(e.target.checked)}
                    className="w-4 h-4 rounded text-[#A37F37]"
                  />
                  <div>
                    <span className="font-semibold text-stone-900 block">Feature in Homepage Collections Grid</span>
                    <span className="text-[11px] text-stone-500 block">
                      Prominently showcases this couture collection on the storefront home screen.
                    </span>
                  </div>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[#EBDCCB]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 rounded text-stone-700 font-semibold hover:bg-stone-100 cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-[#1C1917] hover:bg-stone-800 text-[#DFCA95] rounded font-semibold tracking-wide border border-[#C5A059]/50 flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? (
                    <span>Saving...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4 text-[#C5A059]" />
                      <span>{editingCategory ? 'Update Category' : 'Create Category'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
