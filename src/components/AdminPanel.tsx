import React, { useState, useRef } from 'react';
import { X, Plus, Edit2, Trash2, Save, Image as ImageIcon, Upload, Layers, Box } from 'lucide-react';
import { Product, Category } from '../types';
import { saveProduct, deleteProduct, saveCategory, deleteCategory } from '../firebase';

interface Props {
  products: Product[];
  setProducts: (p: Product[]) => void;
  categories: Category[];
  setCategories: (c: Category[]) => void;
  onClose: () => void;
}

export default function AdminPanel({ products, setProducts, categories, setCategories, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<'products' | 'categories'>('products');
  const [editing, setEditing] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [deleteCategoryConfirm, setDeleteCategoryConfirm] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const categoryFileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    if (!editing) return;
    try {
      await saveProduct(editing);
      const exists = products.find(p => p.id === editing.id);
      if (exists) {
        setProducts(products.map(p => p.id === editing.id ? editing : p));
      } else {
        setProducts([...products, editing]);
      }
    } catch (e) {
      console.error("Error saving product to Firestore:", e);
    }
    setEditing(null);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteProduct(id);
      setProducts(products.filter(p => p.id !== id));
    } catch (e) {
      console.error("Error deleting product from Firestore:", e);
    }
    setDeleteConfirm(null);
  };

  const handleAdd = () => {
    setEditing({
      id: Date.now(),
      price: '₹',
      image: '',
      en: { name: '', badge: '' },
      kn: { name: '', badge: '' }
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editing) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const MAX_WIDTH = 600;
        const MAX_HEIGHT = 800;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          setEditing({ ...editing, image: dataUrl });
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleCategoryImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingCategory) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const MAX_WIDTH = 600;
        const MAX_HEIGHT = 800;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          setEditingCategory({ ...editingCategory, image: dataUrl });
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveCategory = async () => {
    if (!editingCategory) return;
    try {
      await saveCategory(editingCategory);
      const exists = categories.find(c => c.id === editingCategory.id);
      if (exists) {
        setCategories(categories.map(c => c.id === editingCategory.id ? editingCategory : c));
      } else {
        setCategories([...categories, editingCategory]);
      }
    } catch (e) {
      console.error("Error saving category to Firestore:", e);
    }
    setEditingCategory(null);
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteCategory(id);
      setCategories(categories.filter(c => c.id !== id));
    } catch (e) {
      console.error("Error deleting category from Firestore:", e);
    }
    setDeleteCategoryConfirm(null);
  };

  const handleAddCategory = () => {
    setEditingCategory({
      id: Date.now().toString(),
      en: '',
      kn: ''
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-[#f8f6f2]">
          <div className="flex items-center gap-6">
            <h2 className="font-serif text-2xl text-[#8B1C31] italic tracking-tight hidden sm:block">Store Management</h2>
            {!editing && !editingCategory && (
              <div className="flex items-center gap-2 bg-white rounded-lg p-1 shadow-sm border border-gray-100">
                <button
                  onClick={() => setActiveTab('products')}
                  className={`px-4 py-1.5 text-xs font-medium tracking-widest uppercase rounded-md transition-colors flex items-center gap-2 ${
                    activeTab === 'products' ? 'bg-[#8B1C31] text-white' : 'text-gray-500 hover:text-[#1a1a1a]'
                  }`}
                >
                  <Box size={14} /> Products
                </button>
                <button
                  onClick={() => setActiveTab('categories')}
                  className={`px-4 py-1.5 text-xs font-medium tracking-widest uppercase rounded-md transition-colors flex items-center gap-2 ${
                    activeTab === 'categories' ? 'bg-[#8B1C31] text-white' : 'text-gray-500 hover:text-[#1a1a1a]'
                  }`}
                >
                  <Layers size={14} /> Categories
                </button>
              </div>
            )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors text-gray-500">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 bg-white custom-scrollbar">
          {editingCategory ? (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-[#1a1a1a]">Edit Category</h3>
                <button onClick={() => setEditingCategory(null)} className="text-sm text-gray-500 hover:text-black transition-colors font-medium">Cancel</button>
              </div>
              
              <div className="grid gap-5">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-widest">Category Image</label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input 
                      type="text" 
                      value={editingCategory.image || ''}
                      onChange={e => setEditingCategory({...editingCategory, image: e.target.value})}
                      className="flex-1 border border-gray-200 rounded-md px-4 py-3 text-sm focus:outline-none focus:border-[#8B1C31] focus:ring-1 focus:ring-[#8B1C31] transition-shadow bg-gray-50"
                      placeholder="Image URL (https://...)"
                    />
                    <div className="flex items-center">
                      <span className="text-xs text-gray-400 uppercase tracking-widest mx-2 font-medium">OR</span>
                    </div>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      ref={categoryFileInputRef} 
                      onChange={handleCategoryImageUpload} 
                    />
                    <button 
                      onClick={() => categoryFileInputRef.current?.click()}
                      className="bg-[#1a1a1a] text-white px-5 py-3 rounded-md text-[10px] font-medium tracking-widest uppercase hover:bg-black transition-colors flex items-center justify-center gap-2 flex-shrink-0"
                    >
                      <Upload size={16} /> Upload Photo
                    </button>
                  </div>
                  {editingCategory.image && (
                    <div className="mt-4 w-32 h-32 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 relative group">
                      <img src={editingCategory.image} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
                  {/* English Section */}
                  <div className="space-y-4 p-5 border border-gray-100 rounded-lg bg-gray-50/50">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#8B1C31] flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#8B1C31]"></span> English
                    </h4>
                    <div>
                      <label className="block text-xs text-gray-500 mb-2 font-medium">Category Name</label>
                      <input 
                        type="text" 
                        value={editingCategory.en} 
                        onChange={e => setEditingCategory({...editingCategory, en: e.target.value})} 
                        className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#8B1C31]" 
                      />
                    </div>
                  </div>

                  {/* Kannada Section */}
                  <div className="space-y-4 p-5 border border-gray-100 rounded-lg bg-gray-50/50">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#8B1C31] flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#8B1C31]"></span> ಕನ್ನಡ (Kannada)
                    </h4>
                    <div>
                      <label className="block text-xs text-gray-500 mb-2 font-medium">Category Name</label>
                      <input 
                        type="text" 
                        value={editingCategory.kn} 
                        onChange={e => setEditingCategory({...editingCategory, kn: e.target.value})} 
                        className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#8B1C31]" 
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button 
                  onClick={handleSaveCategory} 
                  className="w-full bg-[#8B1C31] text-white py-4 rounded-md text-[11px] font-medium tracking-widest uppercase hover:bg-[#6A1525] transition-colors flex items-center justify-center gap-2"
                >
                  <Save size={16} /> Save Category
                </button>
              </div>
            </div>
          ) : editing ? (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-[#1a1a1a]">Edit Product</h3>
                <button onClick={() => setEditing(null)} className="text-sm text-gray-500 hover:text-black transition-colors font-medium">Cancel</button>
              </div>
              
              <div className="grid gap-5">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-widest">Product Image</label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input 
                      type="text" 
                      value={editing.image}
                      onChange={e => setEditing({...editing, image: e.target.value})}
                      className="flex-1 border border-gray-200 rounded-md px-4 py-3 text-sm focus:outline-none focus:border-[#8B1C31] focus:ring-1 focus:ring-[#8B1C31] transition-shadow bg-gray-50"
                      placeholder="Image URL (https://...)"
                    />
                    <div className="flex items-center">
                      <span className="text-xs text-gray-400 uppercase tracking-widest mx-2 font-medium">OR</span>
                    </div>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      ref={fileInputRef} 
                      onChange={handleImageUpload} 
                    />
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-[#1a1a1a] text-white px-5 py-3 rounded-md text-[10px] font-medium tracking-widest uppercase hover:bg-black transition-colors flex items-center justify-center gap-2 flex-shrink-0"
                    >
                      <Upload size={16} /> Upload Device Photo
                    </button>
                  </div>
                  {editing.image && (
                    <div className="mt-4 w-32 h-40 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 relative group">
                      <img src={editing.image} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-widest">Price</label>
                  <input 
                    type="text" 
                    value={editing.price}
                    onChange={e => setEditing({...editing, price: e.target.value})}
                    className="w-full border border-gray-200 rounded-md px-4 py-3 text-sm focus:outline-none focus:border-[#8B1C31] focus:ring-1 focus:ring-[#8B1C31] transition-shadow bg-gray-50"
                    placeholder="₹..."
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-widest">Category / Section</label>
                  {categories.length > 0 ? (
                    <select
                      value={editing.categoryId || categories.find(c => c.en === editing.en.badge)?.id || ''}
                      onChange={e => {
                        const cat = categories.find(c => c.id === e.target.value);
                        if (cat) {
                          setEditing({
                            ...editing,
                            categoryId: cat.id,
                            en: { ...editing.en, badge: cat.en },
                            kn: { ...editing.kn, badge: cat.kn }
                          });
                        }
                      }}
                      className="w-full border border-gray-200 rounded-md px-4 py-3 text-sm focus:outline-none focus:border-[#8B1C31] focus:ring-1 focus:ring-[#8B1C31] transition-shadow bg-gray-50"
                    >
                      <option value="" disabled>Select a category</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.en} / {c.kn}</option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-xs text-red-500 font-medium">Please add a category in the Categories tab first.</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
                  {/* English Section */}
                  <div className="space-y-4 p-5 border border-gray-100 rounded-lg bg-gray-50/50">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#8B1C31] flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#8B1C31]"></span> English
                    </h4>
                    <div>
                      <label className="block text-xs text-gray-500 mb-2 font-medium">Product Name</label>
                      <input 
                        type="text" 
                        value={editing.en.name} 
                        onChange={e => setEditing({...editing, en: {...editing.en, name: e.target.value}})} 
                        className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#8B1C31]" 
                      />
                    </div>
                  </div>

                  {/* Kannada Section */}
                  <div className="space-y-4 p-5 border border-gray-100 rounded-lg bg-gray-50/50">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#8B1C31] flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#8B1C31]"></span> ಕನ್ನಡ (Kannada)
                    </h4>
                    <div>
                      <label className="block text-xs text-gray-500 mb-2 font-medium">Product Name</label>
                      <input 
                        type="text" 
                        value={editing.kn.name} 
                        onChange={e => setEditing({...editing, kn: {...editing.kn, name: e.target.value}})} 
                        className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#8B1C31]" 
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button 
                  onClick={handleSave} 
                  className="w-full bg-[#8B1C31] text-white py-4 rounded-md text-[11px] font-medium tracking-widest uppercase hover:bg-[#6A1525] transition-colors flex items-center justify-center gap-2"
                >
                  <Save size={16} /> Save Product to Store
                </button>
              </div>
            </div>
          ) : activeTab === 'products' ? (
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <p className="text-sm text-gray-500 max-w-md leading-relaxed">
                  Manage your entire product catalog here. Changes are saved locally on this device.
                </p>
                <button 
                  onClick={handleAdd} 
                  className="bg-[#1a1a1a] text-white px-5 py-3 rounded-md text-[10px] font-medium tracking-widest uppercase hover:bg-black transition-colors flex items-center gap-2 flex-shrink-0"
                >
                  <Plus size={16} /> Add Product
                </button>
              </div>
              
              <div className="grid gap-3">
                {products.map(p => (
                  <div key={p.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-gray-300 hover:shadow-sm transition-all bg-white group">
                    <div className="flex items-center gap-5 w-full sm:w-auto mb-4 sm:mb-0">
                      <div className="w-16 h-16 bg-gray-50 border border-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {p.image ? (
                          <img src={p.image} alt={p.en.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageIcon size={20}/></div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-[#1a1a1a] font-serif text-lg leading-tight mb-1">{p.en.name}</h4>
                        <p className="text-xs text-gray-500 font-medium tracking-wide uppercase">{p.price} <span className="mx-2 text-gray-300">|</span> {p.en.badge}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      {deleteConfirm === p.id ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-red-500 font-medium mr-2">Delete?</span>
                          <button onClick={() => handleDelete(p.id)} className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors">
                            Yes
                          </button>
                          <button onClick={() => setDeleteConfirm(null)} className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">
                            No
                          </button>
                        </div>
                      ) : (
                        <>
                          <button onClick={() => setEditing(p)} className="p-2.5 text-gray-400 hover:text-[#8B1C31] hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => setDeleteConfirm(p.id)} className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100">
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
                {products.length === 0 && (
                  <div className="text-center py-16 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                    <div className="flex justify-center mb-4"><ImageIcon size={48} className="opacity-20"/></div>
                    <p className="text-sm font-medium">No products found</p>
                    <p className="text-xs mt-1">Add your first saree to the collection to get started.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <p className="text-sm text-gray-500 max-w-md leading-relaxed">
                  Manage the sections (categories) shown at the top of your collection.
                </p>
                <button 
                  onClick={handleAddCategory} 
                  className="bg-[#1a1a1a] text-white px-5 py-3 rounded-md text-[10px] font-medium tracking-widest uppercase hover:bg-black transition-colors flex items-center gap-2 flex-shrink-0"
                >
                  <Plus size={16} /> Add Category
                </button>
              </div>
              
              <div className="grid gap-3">
                {categories.map(c => (
                  <div key={c.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-gray-300 hover:shadow-sm transition-all bg-white group">
                    <div className="flex items-center gap-5 w-full sm:w-auto mb-4 sm:mb-0">
                      <div className="w-16 h-16 bg-gray-50 border border-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {c.image ? (
                          <img src={c.image} alt={c.en} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageIcon size={20}/></div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-[#1a1a1a] text-sm leading-tight mb-1">{c.en}</h4>
                        <p className="text-xs text-gray-500 font-medium tracking-wide">{c.kn}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      {deleteCategoryConfirm === c.id ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-red-500 font-medium mr-2">Delete?</span>
                          <button onClick={() => handleDeleteCategory(c.id)} className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors">
                            Yes
                          </button>
                          <button onClick={() => setDeleteCategoryConfirm(null)} className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">
                            No
                          </button>
                        </div>
                      ) : (
                        <>
                          <button onClick={() => setEditingCategory(c)} className="p-2.5 text-gray-400 hover:text-[#8B1C31] hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => setDeleteCategoryConfirm(c.id)} className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100">
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
                {categories.length === 0 && (
                  <div className="text-center py-16 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                    <div className="flex justify-center mb-4"><Layers size={48} className="opacity-20"/></div>
                    <p className="text-sm font-medium">No categories found</p>
                    <p className="text-xs mt-1">Add a new category to group your products.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
