import React, { useState } from 'react';
import heic2any from 'heic2any';
import { X, Plus, Edit2, Trash2, Save, Image as ImageIcon, Upload, Layers, Box, Languages } from 'lucide-react';
import { Product, Category, Offer, Order } from '../types';
import { saveProduct, deleteProduct, saveCategory, deleteCategory, saveOffer, deleteOffer, fetchOrders, saveOrder, deleteOrder } from '../firebase';

interface Props {
  products: Product[];
  setProducts: (p: Product[]) => void;
  categories: Category[];
  setCategories: (c: Category[]) => void;
  offers: Offer[];
  setOffers: (o: Offer[]) => void;
  onClose: () => void;
}


const processImageFile = async (
  file: File, 
  onSuccess: (dataUrl: string) => void,
  setMsg: (msg: {type: 'error'|'success', text: string} | null) => void
) => {
  let targetFile = file;
  if (file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif')) {
    try {
      setMsg({type: 'success', text: 'Converting HEIC image, please wait...'});
      const convertedBlob = await heic2any({
        blob: file,
        toType: "image/jpeg",
        quality: 0.9
      });
      targetFile = new File([Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob], file.name.replace(/.heic$/i, '.jpg'), { type: "image/jpeg" });
      setMsg(null);
    } catch (err) {
      console.error("HEIC conversion error", err);
      setMsg({type: 'error', text: 'Failed to convert HEIC image.'});
      return;
    }
  }

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
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        onSuccess(dataUrl);
      }
    };
    img.src = event.target?.result as string;
  };
  reader.readAsDataURL(targetFile);
};

const formatPrice = (p: string | undefined) => {
  if (!p) return '';
  return p.includes('₹') ? p : `₹${p}`;
};


const translateText = async (text: string) => {
  if (!text) return '';
  try {
    const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=kn&dt=t&q=${encodeURIComponent(text)}`);
    const data = await res.json();
    return data[0].map((item: any) => item[0]).join('');
  } catch (error) {
    console.error("Translation error:", error);
    return text;
  }
};

export default function AdminPanel({ products, setProducts, categories, setCategories, offers, setOffers, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'offers' | 'orders'>('products');
  const [editing, setEditing] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [deleteCategoryConfirm, setDeleteCategoryConfirm] = useState<string | null>(null);
  const [deleteOfferConfirm, setDeleteOfferConfirm] = useState<string | null>(null);
  const [deleteOrderConfirm, setDeleteOrderConfirm] = useState<string | null>(null);
  const [formMessage, setFormMessage] = useState<{type: 'error'|'success', text: string} | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  React.useEffect(() => {
    if (activeTab === 'orders') {
      const loadOrders = async () => {
        setLoadingOrders(true);
        const fetchedOrders = await fetchOrders();
        setOrders(fetchedOrders);
        setLoadingOrders(false);
      };
      loadOrders();
    }
  }, [activeTab]);


  const handleSave = async () => {
    if (!editing) return;

    if (!editing.en?.name?.trim()) {
      setFormMessage({type: 'error', text: "Product Name (English) is required."});
      return;
    }
    if (!editing.kn?.name?.trim()) {
      setFormMessage({type: 'error', text: "Product Name (Kannada) is required."});
      return;
    }
    if (!editing.price?.trim()) {
      setFormMessage({type: 'error', text: "Price is required."});
      return;
    }
    if (!editing.categoryId) {
      setFormMessage({type: 'error', text: "Please select a category."});
      return;
    }
    if (!editing.image) {
      // Use a placeholder if no image provided for easier testing
      editing.image = "https://images.unsplash.com/photo-1610189013669-7b3b33190805?auto=format&fit=crop&q=80";
    }

    console.log("============== ADMIN PANEL SAVE INITIATED ==============");
    console.log("[AdminPanel] Saving product ID: ", editing.id);
    console.log("[AdminPanel] Product payload object:", JSON.stringify(editing, null, 2));
    try {
      console.log("[AdminPanel] Calling saveProduct...");
      await saveProduct(editing);
      console.log("[AdminPanel] saveProduct returned successfully!");
      const exists = products.find(p => p.id === editing.id);
      if (exists) {
        setProducts(products.map(p => p.id === editing.id ? editing : p));
      } else {
        setProducts([...products, editing]);
      }
    } catch (e: any) {
      console.error("============== ADMIN PANEL SAVE ERROR ==============");
      console.error("Error saving product to Firestore:", e);
      console.error("Error message:", e.message);
      if (e.name === 'QuotaExceededError' || e.message.includes('quota')) {
        setFormMessage({type: 'error', text: "Storage is full! Firestore can only hold a few images. Please delete some old products or use smaller images."});
      } else {
        setFormMessage({type: 'error', text: "Failed to save product: " + e.message});
      }
      return;
    }
    setFormMessage({type: 'success', text: "Product saved successfully!"});
    setTimeout(() => setEditing(null), 1500);
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
    const defaultCat = categories.length > 0 ? categories[0] : null;
    setFormMessage(null);
    setEditing({
      id: Date.now(),
      price: '',
      image: '',
      images: [],
      colors: [],
      en: { name: '', badge: defaultCat ? defaultCat.en : '', description: '', subcategory: '' },
      kn: { name: '', badge: defaultCat ? defaultCat.kn : '', description: '', subcategory: '' },
      categoryId: defaultCat ? defaultCat.id : '',
      subcategoryId: '',
      inOffer: false,
      isDailyOffer: false,
      discountRate: '',
      offerPrice: '',
      stock: 10,
      specifications: []
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editing) return;
    processImageFile(file, (dataUrl) => {
      setEditing(prev => ({ ...prev!, image: dataUrl }));
    }, setFormMessage);
  };

  const handleAdditionalImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !editing) return;
    Array.from(files).forEach((file: File) => {
      processImageFile(file, (dataUrl) => {
        setEditing(prev => {
          if (!prev) return prev;
          return { ...prev, images: [...(prev.images || []), dataUrl] };
        });
      }, setFormMessage);
    });
  };

  const handleCategoryImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingCategory) return;
    processImageFile(file, (dataUrl) => {
      setEditingCategory(prev => ({ ...prev!, image: dataUrl }));
    }, setFormMessage);
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
      kn: '',
      section: 'Saree'
    });
  };

  const handleOfferImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingOffer) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      setEditingOffer(prev => ({ ...prev!, image: dataUrl }));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveOffer = async () => {
    if (!editingOffer) return;
    try {
      await saveOffer(editingOffer);
      const exists = offers.find(o => o.id === editingOffer.id);
      if (exists) {
        setOffers(offers.map(o => o.id === editingOffer.id ? editingOffer : o));
      } else {
        setOffers([...offers, editingOffer]);
      }
    } catch (e) {
      console.error("Error saving offer to Firestore:", e);
    }
    setEditingOffer(null);
  };

  const handleDeleteOffer = async (id: string) => {
    try {
      await deleteOffer(id);
      setOffers(offers.filter(o => o.id !== id));
    } catch (e) {
      console.error("Error deleting offer from Firestore:", e);
    }
    setDeleteOfferConfirm(null);
  };

  const handleAddOffer = () => {
    setEditingOffer({
      id: Date.now().toString(),
      isActive: true,
      en: { title: '', description: '', buttonText: 'SHOP NOW' },
      kn: { title: '', description: '', buttonText: 'ಈಗಲೇ ಖರೀದಿಸಿ' }
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-[#f8f6f2]">
          <div className="flex items-center gap-6">
            <h2 className="font-serif text-2xl text-[#8B1C31] italic tracking-tight hidden sm:block">Store Management</h2>
            {!editing && !editingCategory && !editingOffer && (
              <div className="flex overflow-x-auto gap-2 bg-white rounded-lg p-1 shadow-sm border border-gray-100 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] max-w-[calc(100vw-120px)] md:max-w-none">
                <button
                  onClick={() => setActiveTab('products')}
                  className={`whitespace-nowrap flex-shrink-0 px-4 py-1.5 text-xs font-medium tracking-widest uppercase rounded-md transition-colors flex items-center gap-2 ${
                    activeTab === 'products' ? 'bg-[#8B1C31] text-white' : 'text-gray-500 hover:text-[#1a1a1a]'
                  }`}
                >
                  <Box size={14} /> Products
                </button>
                <button
                  onClick={() => setActiveTab('categories')}
                  className={`whitespace-nowrap flex-shrink-0 px-4 py-1.5 text-xs font-medium tracking-widest uppercase rounded-md transition-colors flex items-center gap-2 ${
                    activeTab === 'categories' ? 'bg-[#8B1C31] text-white' : 'text-gray-500 hover:text-[#1a1a1a]'
                  }`}
                >
                  <Layers size={14} /> Categories
                </button>
                <button
                  onClick={() => setActiveTab('offers')}
                  className={`whitespace-nowrap flex-shrink-0 px-4 py-1.5 text-xs font-medium tracking-widest uppercase rounded-md transition-colors flex items-center gap-2 ${
                    activeTab === 'offers' ? 'bg-[#8B1C31] text-white' : 'text-gray-500 hover:text-[#1a1a1a]'
                  }`}
                >
                  <ImageIcon size={14} /> Offers
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`whitespace-nowrap flex-shrink-0 px-4 py-1.5 text-xs font-medium tracking-widest uppercase rounded-md transition-colors flex items-center gap-2 ${
                    activeTab === 'orders' ? 'bg-[#8B1C31] text-white' : 'text-gray-500 hover:text-[#1a1a1a]'
                  }`}
                >
                  <Box size={14} /> Orders
                </button>
              </div>
            )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors text-gray-500">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 bg-white custom-scrollbar">
          {editingOffer ? (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-[#1a1a1a]">Edit Offer</h3>
                <button onClick={() => setEditingOffer(null)} className="text-sm text-gray-500 hover:text-black transition-colors font-medium">Cancel</button>
              </div>
              
              <div className="grid gap-5">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-widest">Offer Image (Optional)</label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input 
                      type="text" 
                      value={editingOffer.image || ''}
                      onChange={e => setEditingOffer({...editingOffer, image: e.target.value})}
                      placeholder="Image URL" 
                      className="flex-1 border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#8B1C31]" 
                    />
                    <div className="flex items-center">
                      <span className="text-xs text-gray-400 uppercase tracking-widest mx-2 font-medium">OR</span>
                    </div>
                    <label className="bg-[#1a1a1a] text-white px-5 py-3 rounded-md text-[10px] font-medium tracking-widest uppercase hover:bg-black transition-colors flex items-center justify-center gap-2 flex-shrink-0 cursor-pointer">
                      <Upload size={16} /> Upload Photo
                      <input 
                        type="file" 
                        accept="image/*,.heic,.heif" 
                        className="hidden" 
                        onChange={handleOfferImageUpload} 
                      />
                    </label>
                  </div>
                  {editingOffer.image && (
                    <div className="mt-4 w-48 aspect-video rounded-lg overflow-hidden border border-gray-200 bg-gray-50 relative group">
                      <img referrerPolicy="no-referrer" src={editingOffer.image} alt="Preview" className="w-full h-full object-cover" />
                      <button onClick={() => setEditingOffer({...editingOffer, image: ''})} className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full text-red-600 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <input 
                    type="checkbox" 
                    id="offerActive"
                    checked={editingOffer.isActive} 
                    onChange={e => setEditingOffer({...editingOffer, isActive: e.target.checked})} 
                    className="w-4 h-4 text-[#8B1C31] rounded border-gray-300 focus:ring-[#8B1C31]"
                  />
                  <label htmlFor="offerActive" className="text-sm font-medium text-gray-700 cursor-pointer">
                    Offer is Active (Show popup to users)
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* English Section */}
                  <div className="space-y-4 p-5 border border-gray-100 rounded-lg bg-gray-50/50">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#8B1C31] flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#8B1C31]"></span> English
                    </h4>
                    <div>
                      <label className="block text-xs text-gray-500 mb-2 font-medium">Title</label>
                      <input 
                        type="text" 
                        value={editingOffer.en?.title} 
                        onChange={e => setEditingOffer({...editingOffer, en: {...editingOffer.en, title: e.target.value}})} 
                        className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#8B1C31]" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-2 font-medium">Description</label>
                      <textarea 
                        value={editingOffer.en?.description} 
                        onChange={e => setEditingOffer({...editingOffer, en: {...editingOffer.en, description: e.target.value}})} 
                        className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#8B1C31] h-24" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-2 font-medium">Button Text</label>
                      <input 
                        type="text" 
                        value={editingOffer.en?.buttonText} 
                        onChange={e => setEditingOffer({...editingOffer, en: {...editingOffer.en, buttonText: e.target.value}})} 
                        className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#8B1C31]" 
                      />
                    </div>
                  </div>

                  {/* Kannada Section */}
                  <div className="space-y-4 p-5 border border-gray-100 rounded-lg bg-gray-50/50">
                    <div className="flex items-center justify-between"><h4 className="text-[10px] font-bold uppercase tracking-widest text-[#8B1C31] flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#8B1C31]"></span> ಕನ್ನಡ (Kannada)
                    </h4>
                    <button type="button" onClick={async () => {
                      if (!editingOffer) return;
                      const title = await translateText(editingOffer.en?.title || '');
                      const desc = await translateText(editingOffer.en?.description || '');
                      const btn = await translateText(editingOffer.en?.buttonText || '');
                      setEditingOffer({...editingOffer, kn: { title, description: desc, buttonText: btn }});
                    }} className="text-xs text-[#8B1C31] font-medium flex items-center gap-1 hover:underline">
                      <Languages size={12}/> Auto-Translate
                    </button></div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-2 font-medium">Title</label>
                      <input 
                        type="text" 
                        value={editingOffer.kn?.title} 
                        onChange={e => setEditingOffer({...editingOffer, kn: {...editingOffer.kn, title: e.target.value}})} 
                        className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#8B1C31]" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-2 font-medium">Description</label>
                      <textarea 
                        value={editingOffer.kn?.description} 
                        onChange={e => setEditingOffer({...editingOffer, kn: {...editingOffer.kn, description: e.target.value}})} 
                        className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#8B1C31] h-24" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-2 font-medium">Button Text</label>
                      <input 
                        type="text" 
                        value={editingOffer.kn?.buttonText} 
                        onChange={e => setEditingOffer({...editingOffer, kn: {...editingOffer.kn, buttonText: e.target.value}})} 
                        className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#8B1C31]" 
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button 
                  onClick={handleSaveOffer} 
                  className="w-full bg-[#8B1C31] text-white py-4 rounded-md text-[11px] font-bold tracking-[0.2em] uppercase hover:bg-[#6a1525] transition-colors flex items-center justify-center gap-2"
                >
                  <Save size={16} /> Save Offer
                </button>
              </div>
            </div>
          ) : editingCategory ? (
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
                    <label className="bg-[#1a1a1a] text-white px-5 py-3 rounded-md text-[10px] font-medium tracking-widest uppercase hover:bg-black transition-colors flex items-center justify-center gap-2 flex-shrink-0 cursor-pointer">
                      <Upload size={16} /> Upload Photo
                      <input 
                        type="file" 
                        accept="image/*,.heic,.heif" 
                        className="hidden" 
                        onChange={handleCategoryImageUpload} 
                      />
                    </label>
                  </div>
                  {editingCategory.image ? (
                    <div className="mt-4 w-32 h-32 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 relative group">
                      <img referrerPolicy="no-referrer" src={editingCategory.image} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  ) : null}
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

                  <div className="space-y-4 p-5 border border-gray-100 rounded-lg bg-gray-50/50">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#8B1C31] flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#8B1C31]"></span> Section
                    </h4>
                    <div>
                      <label className="block text-xs text-gray-500 mb-2 font-medium">Main Section</label>
                      <select
                        value={editingCategory.section || 'Saree'}
                        onChange={e => setEditingCategory({...editingCategory, section: e.target.value})}
                        className="w-full border border-gray-200 rounded-md px-4 py-3 text-sm focus:outline-none focus:border-[#8B1C31] focus:ring-1 focus:ring-[#8B1C31] transition-shadow bg-gray-50"
                      >
                        <option value="Saree">Sarees</option>
                        <option value="Kurti">Kurti</option>
                      </select>
                    </div>
                  </div>

                  {/* Kannada Section */}
                  <div className="space-y-4 p-5 border border-gray-100 rounded-lg bg-gray-50/50">
                    <div className="flex items-center justify-between"><h4 className="text-[10px] font-bold uppercase tracking-widest text-[#8B1C31] flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#8B1C31]"></span> ಕನ್ನಡ (Kannada)
                    </h4>
                    <button type="button" onClick={async () => {
                      if (!editingCategory) return;
                      const title = await translateText(editingCategory.en || '');
                      
                      // translate subcategories too if any
                      let newSubcats = editingCategory.subcategories ? [...editingCategory.subcategories] : [];
                      for (let i = 0; i < newSubcats.length; i++) {
                        if (newSubcats[i].en && !newSubcats[i].kn) {
                          newSubcats[i].kn = await translateText(newSubcats[i].en);
                        }
                      }
                      setEditingCategory({...editingCategory, kn: title, subcategories: newSubcats});
                    }} className="text-xs text-[#8B1C31] font-medium flex items-center gap-1 hover:underline">
                      <Languages size={12}/> Auto-Translate
                    </button></div>
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

              <div className="space-y-4 p-5 border border-gray-100 rounded-lg bg-gray-50/50 mt-6">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#8B1C31] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#8B1C31]"></span> Subcategories
                </h4>
                <div className="space-y-3">
                  {(editingCategory.subcategories || []).map((subcat, idx) => (
                    <div key={subcat.id} className="flex gap-2 items-center">
                      <input 
                        type="text" 
                        placeholder="English Name"
                        value={subcat.en} 
                        onChange={e => {
                          const newSubcats = [...(editingCategory.subcategories || [])];
                          newSubcats[idx] = { ...newSubcats[idx], en: e.target.value };
                          setEditingCategory({...editingCategory, subcategories: newSubcats});
                        }}
                        className="flex-1 border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#8B1C31]" 
                      />
                      <input 
                        type="text" 
                        placeholder="Kannada Name"
                        value={subcat.kn} 
                        onChange={e => {
                          const newSubcats = [...(editingCategory.subcategories || [])];
                          newSubcats[idx] = { ...newSubcats[idx], kn: e.target.value };
                          setEditingCategory({...editingCategory, subcategories: newSubcats});
                        }}
                        className="flex-1 border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#8B1C31]" 
                      />
                      <button 
                        onClick={() => {
                          const newSubcats = (editingCategory.subcategories || []).filter((_, i) => i !== idx);
                          setEditingCategory({...editingCategory, subcategories: newSubcats});
                        }}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-md"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={() => {
                      const newSubcats = [...(editingCategory.subcategories || []), { id: Date.now().toString(), en: '', kn: '' }];
                      setEditingCategory({...editingCategory, subcategories: newSubcats});
                    }}
                    className="text-xs font-medium text-[#8B1C31] uppercase tracking-widest flex items-center gap-1 hover:underline mt-2"
                  >
                    <Plus size={14} /> Add Subcategory
                  </button>
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
                <button onClick={() => { setEditing(null); setFormMessage(null); }} className="text-sm text-gray-500 hover:text-black transition-colors font-medium">Cancel</button>
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
                    <label className="bg-[#1a1a1a] text-white px-5 py-3 rounded-md text-[10px] font-medium tracking-widest uppercase hover:bg-black transition-colors flex items-center justify-center gap-2 flex-shrink-0 cursor-pointer">
                      <Upload size={16} /> Upload Device Photo
                      <input 
                        type="file" 
                        accept="image/*,.heic,.heif" 
                        className="hidden" 
                        onChange={handleImageUpload} 
                      />
                    </label>
                  </div>
                  {editing.image ? (
                    <div className="mt-4 w-32 h-40 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 relative group">
                      <img referrerPolicy="no-referrer" src={editing.image} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  ) : null}
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-widest">Additional Images</label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <textarea 
                      value={(editing.images || []).join(', ')}
                      onChange={e => setEditing({...editing, images: e.target.value.split(',').map(s => s.trim()).filter(s => s)})}
                      className="flex-1 border border-gray-200 rounded-md px-4 py-3 text-sm focus:outline-none focus:border-[#8B1C31] focus:ring-1 focus:ring-[#8B1C31] transition-shadow bg-gray-50 h-16"
                      placeholder="https://..., https://..."
                    />
                    <div className="flex items-center">
                      <span className="text-xs text-gray-400 uppercase tracking-widest mx-2 font-medium">OR</span>
                    </div>
                    <label className="bg-[#1a1a1a] text-white px-5 py-3 rounded-md text-[10px] font-medium tracking-widest uppercase hover:bg-black transition-colors flex items-center justify-center gap-2 flex-shrink-0 cursor-pointer">
                      <Upload size={16} /> Upload Photos
                      <input 
                        type="file" 
                        accept="image/*,.heic,.heif" 
                        multiple
                        className="hidden" 
                        onChange={handleAdditionalImageUpload} 
                      />
                    </label>
                  </div>
                  {(editing.images || []).length > 0 && (
                    <div className="flex gap-2 mt-2 overflow-x-auto">
                      {(editing.images || []).map((img, i) => (
                         <div key={i} className="w-16 h-20 flex-shrink-0 rounded-md overflow-hidden border border-gray-200 bg-gray-50 relative group">
                           <button onClick={() => setEditing({...editing, images: editing.images!.filter((_, idx) => idx !== i)})} className="absolute top-1 right-1 z-10 bg-white rounded-full p-0.5 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                             <X size={12} />
                           </button>
                           <img referrerPolicy="no-referrer" src={img} className="w-full h-full object-cover" />
                         </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-widest">Colors (Comma separated)</label>
                  <input 
                    type="text" 
                    value={(editing.colors || []).join(', ')}
                    onChange={e => setEditing({...editing, colors: e.target.value.split(',').map(s => s.trim()).filter(s => s)})}
                    className="w-full border border-gray-200 rounded-md px-4 py-3 text-sm focus:outline-none focus:border-[#8B1C31] focus:ring-1 focus:ring-[#8B1C31] transition-shadow bg-gray-50"
                    placeholder="Red, Blue, Green..."
                  />
                  {(editing.colors || []).length > 0 && (
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {(editing.colors || []).map((c, i) => (
                         <span key={i} className="px-2 py-1 bg-gray-100 text-xs rounded-full border border-gray-200 text-gray-700">{c}</span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-widest">Price</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 font-medium pointer-events-none">₹</span>
                      <input 
                        type="text" 
                        value={editing.price}
                        onChange={e => setEditing({...editing, price: e.target.value})}
                        className="w-full border border-gray-200 rounded-md pl-8 pr-4 py-3 text-sm focus:outline-none focus:border-[#8B1C31] focus:ring-1 focus:ring-[#8B1C31] transition-shadow bg-gray-50"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-widest">Stock</label>
                    <input 
                      type="number" 
                      value={editing.stock ?? ''}
                      onChange={e => setEditing({...editing, stock: e.target.value ? parseInt(e.target.value) : 0})}
                      className="w-full border border-gray-200 rounded-md px-4 py-3 text-sm focus:outline-none focus:border-[#8B1C31] focus:ring-1 focus:ring-[#8B1C31] transition-shadow bg-gray-50"
                      placeholder="e.g. 10"
                    />
                  </div>
                </div>

                <div className="mt-4 border border-gray-100 rounded-lg p-4 bg-white shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        id="productInOffer"
                        checked={editing.inOffer || false}
                        onChange={e => setEditing({...editing, inOffer: e.target.checked})}
                        className="w-4 h-4 text-[#8B1C31] rounded focus:ring-[#8B1C31]"
                      />
                      <label htmlFor="productInOffer" className="text-sm font-medium text-gray-700 cursor-pointer">
                        Included in Regular Offer
                      </label>
                    </div>
                    <div className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        id="productIsDailyOffer"
                        checked={editing.isDailyOffer || false}
                        onChange={e => setEditing({...editing, isDailyOffer: e.target.checked})}
                        className="w-4 h-4 text-[#8B1C31] rounded focus:ring-[#8B1C31]"
                      />
                      <label htmlFor="productIsDailyOffer" className="text-sm font-medium text-gray-700 cursor-pointer">
                        Daily Offer
                      </label>
                    </div>
                  </div>
                  
                  {(editing.inOffer || editing.isDailyOffer) && (
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-widest">Discount Rate</label>
                        <div className="relative">
                          <input 
                            type="text" 
                            value={editing.discountRate || ''}
                            onChange={e => setEditing({...editing, discountRate: e.target.value})}
                            className="w-full border border-gray-200 rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:border-[#8B1C31] focus:ring-1 focus:ring-[#8B1C31] transition-shadow bg-white"
                            placeholder="e.g. 20"
                          />
                          <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 font-medium pointer-events-none">%</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-widest">Offer Price</label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 font-medium pointer-events-none">₹</span>
                          <input 
                            type="text" 
                            value={editing.offerPrice || ''}
                            onChange={e => setEditing({...editing, offerPrice: e.target.value})}
                            className="w-full border border-gray-200 rounded-md pl-8 pr-3 py-2 text-sm focus:outline-none focus:border-[#8B1C31] focus:ring-1 focus:ring-[#8B1C31] transition-shadow bg-white"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 border border-gray-100 rounded-lg p-4 bg-gray-50/30">
                  <div className="flex justify-between items-center mb-4">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Product Specifications</label>
                    <button 
                      onClick={() => setEditing({
                        ...editing, 
                        specifications: [...(editing.specifications || []), { key: '', value: '' }]
                      })}
                      className="text-[#8B1C31] text-[10px] uppercase tracking-widest font-bold flex items-center gap-1 hover:text-[#6A1525]"
                    >
                      <Plus size={12} /> Add Field
                    </button>
                  </div>
                  
                  {editing.specifications && editing.specifications.length > 0 ? (
                    <div className="space-y-3">
                      {editing.specifications.map((spec, index) => (
                        <div key={index} className="flex gap-2 items-start">
                          <input 
                            type="text" 
                            value={spec.key}
                            onChange={(e) => {
                              const newSpecs = [...(editing.specifications || [])];
                              newSpecs[index].key = e.target.value;
                              setEditing({...editing, specifications: newSpecs});
                            }}
                            placeholder="e.g. Fabric"
                            className="flex-1 border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#8B1C31]"
                          />
                          <input 
                            type="text" 
                            value={spec.value}
                            onChange={(e) => {
                              const newSpecs = [...(editing.specifications || [])];
                              newSpecs[index].value = e.target.value;
                              setEditing({...editing, specifications: newSpecs});
                            }}
                            placeholder="e.g. Kora"
                            className="flex-1 border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#8B1C31]"
                          />
                          <button 
                            onClick={() => {
                              const newSpecs = editing.specifications?.filter((_, i) => i !== index);
                              setEditing({...editing, specifications: newSpecs});
                            }}
                            className="p-2 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-xs text-gray-400 font-medium">
                      No specifications added yet. Add details like Fabric, Wash & Care, etc.
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <label className="block text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-widest">Category / Section</label>
                  {categories.length > 0 ? (
                    <div className="space-y-3">
                      <select
                        value={editing.categoryId || categories.find(c => c.en === editing.en?.badge)?.id || ''}
                        onChange={e => {
                          const cat = categories.find(c => c.id === e.target.value);
                          if (cat) {
                            setEditing({
                              ...editing,
                              categoryId: cat.id,
                              subcategoryId: '', // Reset subcategory when category changes
                              en: { ...editing.en, badge: cat.en, subcategory: '' },
                              kn: { ...editing.kn, badge: cat.kn, subcategory: '' }
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
                      
                      {/* Subcategory Select (if applicable) */}
                      {(() => {
                        const activeCat = categories.find(c => c.id === (editing.categoryId || categories.find(cat => cat.en === editing.en?.badge)?.id));
                        if (activeCat && activeCat.subcategories && activeCat.subcategories.length > 0) {
                          return (
                            <div>
                              <label className="block text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-widest mt-2">Subcategory (Optional)</label>
                              <select
                                value={editing.subcategoryId || ''}
                                onChange={e => {
                                  const subcat = activeCat.subcategories?.find(sc => sc.id === e.target.value);
                                  if (subcat) {
                                    setEditing({
                                      ...editing,
                                      subcategoryId: subcat.id,
                                      en: { ...editing.en, subcategory: subcat.en },
                                      kn: { ...editing.kn, subcategory: subcat.kn }
                                    });
                                  } else {
                                    setEditing({
                                      ...editing,
                                      subcategoryId: '',
                                      en: { ...editing.en, subcategory: '' },
                                      kn: { ...editing.kn, subcategory: '' }
                                    });
                                  }
                                }}
                                className="w-full border border-gray-200 rounded-md px-4 py-3 text-sm focus:outline-none focus:border-[#8B1C31] focus:ring-1 focus:ring-[#8B1C31] transition-shadow bg-gray-50"
                              >
                                <option value="">No subcategory</option>
                                {activeCat.subcategories.map(sc => (
                                  <option key={sc.id} value={sc.id}>{sc.en} / {sc.kn}</option>
                                ))}
                              </select>
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
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
                        value={editing.en?.name} 
                        onChange={e => setEditing({...editing, en: {...editing.en, name: e.target.value}})} 
                        className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#8B1C31]" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-2 font-medium">Description</label>
                      <textarea 
                        value={editing.en?.description || ''} 
                        onChange={e => setEditing({...editing, en: {...editing.en, description: e.target.value}})} 
                        className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#8B1C31] h-24" 
                      />
                    </div>
                  </div>

                  {/* Kannada Section */}
                  <div className="space-y-4 p-5 border border-gray-100 rounded-lg bg-gray-50/50">
                    <div className="flex items-center justify-between"><h4 className="text-[10px] font-bold uppercase tracking-widest text-[#8B1C31] flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#8B1C31]"></span> ಕನ್ನಡ (Kannada)
                    </h4>
                    <button type="button" onClick={async () => {
                      if (!editing) return;
                      const name = await translateText(editing.en?.name || '');
                      const desc = await translateText(editing.en?.description || '');
                      setEditing({...editing, kn: { ...editing.kn, name, description: desc }});
                    }} className="text-xs text-[#8B1C31] font-medium flex items-center gap-1 hover:underline">
                      <Languages size={12}/> Auto-Translate
                    </button></div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-2 font-medium">Product Name</label>
                      <input 
                        type="text" 
                        value={editing.kn?.name} 
                        onChange={e => setEditing({...editing, kn: {...editing.kn, name: e.target.value}})} 
                        className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#8B1C31]" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-2 font-medium">Description</label>
                      <textarea 
                        value={editing.kn?.description || ''} 
                        onChange={e => setEditing({...editing, kn: {...editing.kn, description: e.target.value}})} 
                        className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#8B1C31] h-24" 
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                
                {formMessage && (
                  <div className={`p-3 mb-4 rounded-md text-sm ${formMessage.type === 'error' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-600 border border-green-200'}`}>
                    {formMessage.text}
                  </div>
                )}
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
                  Manage your entire product catalog here. Changes are saved to your Firestore database.
                </p>
                <div className="flex gap-2 flex-wrap">
                  <button 
                    onClick={handleAdd} 
                    className="bg-[#1a1a1a] text-white px-5 py-3 rounded-md text-[10px] font-medium tracking-widest uppercase hover:bg-black transition-colors flex items-center gap-2 flex-shrink-0"
                  >
                    <Plus size={16} /> Add Product
                  </button>
                </div>
              </div>
              
              <div className="grid gap-3">
                {products.map(p => (
                  <div key={p.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-gray-300 hover:shadow-sm transition-all bg-white group">
                    <div className="flex items-center gap-5 w-full sm:w-auto mb-4 sm:mb-0">
                      <div className="w-16 h-16 bg-gray-50 border border-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {p.image ? (
                          <img referrerPolicy="no-referrer" src={p.image} alt={p.en?.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageIcon size={20}/></div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-[#1a1a1a] font-serif text-lg leading-tight mb-1">{p.en?.name}</h4>
                        <p className="text-xs text-gray-500 font-medium tracking-wide uppercase">{formatPrice(p.price)} <span className="mx-2 text-gray-300">|</span> {p.en?.badge} {p.en?.subcategory ? ` / ${p.en?.subcategory}` : ''}</p>
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
          ) : activeTab === 'categories' ? (
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
                          <img referrerPolicy="no-referrer" src={c.image} alt={c.en} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageIcon size={20}/></div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-[#1a1a1a] text-sm leading-tight mb-1">{c.en}</h4>
                        <p className="text-xs text-gray-500 font-medium tracking-wide">{c.kn}</p>
                        {c.subcategories && c.subcategories.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {c.subcategories.map(sc => (
                              <span key={sc.id} className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px]">
                                {sc.en}
                              </span>
                            ))}
                          </div>
                        )}
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
          ) : activeTab === 'offers' ? (
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <p className="text-sm text-gray-500 max-w-md leading-relaxed">
                  Manage special offers and popups shown to users.
                </p>
                <button 
                  onClick={handleAddOffer} 
                  className="bg-[#1a1a1a] text-white px-5 py-3 rounded-md text-[10px] font-medium tracking-widest uppercase hover:bg-black transition-colors flex items-center gap-2 flex-shrink-0"
                >
                  <Plus size={16} /> Add Offer
                </button>
              </div>
              
              <div className="grid gap-3">
                {offers.map(o => (
                  <div key={o.id} className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-xl transition-all bg-white group ${o.isActive ? 'border-green-200 shadow-sm' : 'border-gray-100 hover:border-gray-300 hover:shadow-sm'}`}>
                    <div className="flex items-center gap-5 w-full sm:w-auto mb-4 sm:mb-0">
                      <div className="w-24 h-16 bg-gray-50 border border-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {o.image ? (
                          <img referrerPolicy="no-referrer" src={o.image} alt={o.en?.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageIcon size={20}/></div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-[#1a1a1a] text-sm leading-tight">{o.en?.title}</h4>
                          {o.isActive && (
                            <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold tracking-widest uppercase">Active</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 font-serif">{o.kn?.title}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 self-end sm:self-auto w-full sm:w-auto justify-end border-t sm:border-t-0 border-gray-100 pt-3 sm:pt-0">
                      {deleteOfferConfirm === o.id ? (
                        <div className="flex items-center gap-2 mr-2">
                          <span className="text-xs text-red-500 font-medium mr-2">Delete this offer?</span>
                          <button onClick={() => handleDeleteOffer(o.id)} className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors">
                            Yes
                          </button>
                          <button onClick={() => setDeleteOfferConfirm(null)} className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <>
                          <button 
                            onClick={async () => {
                              const updated = { ...o, isActive: !o.isActive };
                              await saveOffer(updated);
                              setOffers(offers.map(off => off.id === o.id ? updated : off));
                            }} 
                            className={`px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase rounded-md transition-colors ${o.isActive ? 'text-gray-500 bg-gray-100 hover:bg-gray-200' : 'text-green-700 bg-green-100 hover:bg-green-200'}`}
                          >
                            {o.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button onClick={() => setEditingOffer(o)} className="p-2.5 text-gray-400 hover:text-[#8B1C31] hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => setDeleteOfferConfirm(o.id)} className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100">
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
                {offers.length === 0 && (
                  <div className="text-center py-16 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                    <div className="flex justify-center mb-4"><ImageIcon size={48} className="opacity-20"/></div>
                    <p className="text-sm font-medium">No offers found</p>
                    <p className="text-xs mt-1">Create a special offer popup for your customers.</p>
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === 'orders' ? (
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <p className="text-sm text-gray-500 max-w-md leading-relaxed">
                  Manage your customer orders. Orders are generated from WhatsApp checkout.
                </p>
              </div>

              {loadingOrders ? (
                <div className="text-center py-16 text-gray-400">Loading orders...</div>
              ) : (
                <div className="space-y-4">
                  {orders.map(order => (
                    <div key={order.id} className="bg-white border border-gray-100 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-100">
                        <div>
                          <p className="text-xs font-bold text-gray-400 mb-1">Order #{order.id}</p>
                          <p className="text-sm text-gray-900">{new Date(order.createdAt).toLocaleString()}</p>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-[#8B1C31] font-serif font-bold text-lg">₹{order.totalAmount.toLocaleString('en-IN')}</span>
                          <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded-sm mt-2
                            ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                              order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                              order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'}`}>
                            {order.status}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Customer Details</h4>
                          <div className="space-y-1 text-sm text-gray-700">
                            <p><span className="font-semibold">Name:</span> {order.customerDetails.name}</p>
                            <p><span className="font-semibold">Mobile:</span> {order.customerDetails.mobileNumber}</p>
                            {order.customerDetails.alternateNumber && <p><span className="font-semibold">Alt:</span> {order.customerDetails.alternateNumber}</p>}
                            <p><span className="font-semibold">Address:</span> {order.customerDetails.address}</p>
                            {order.customerDetails.landmark && <p><span className="font-semibold">Landmark:</span> {order.customerDetails.landmark}</p>}
                            <p><span className="font-semibold">City:</span> {order.customerDetails.city}</p>
                            <p><span className="font-semibold">District:</span> {order.customerDetails.district}</p>
                            <p><span className="font-semibold">Pincode:</span> {order.customerDetails.pincode}</p>
                            {order.paymentMethod && <p><span className="font-semibold">Payment:</span> <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${order.paymentMethod === 'online' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>{order.paymentMethod === 'online' ? 'Online' : 'COD'}</span></p>}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Order Items</h4>
                          <div className="space-y-2">
                            {order.products.map((item, i) => (
                              <div key={i} className="flex justify-between text-sm">
                                <span className="text-gray-700">
                                  {item.quantity}x {item.name} {item.color ? `(${item.color})` : ''}
                                </span>
                                <span className="font-semibold text-gray-900">₹{item.price}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 justify-end pt-4 border-t border-gray-100 items-center">
                        {deleteOrderConfirm === order.id ? (
                          <div className="flex items-center gap-2 mr-auto">
                            <span className="text-xs text-red-600 font-medium">Delete?</span>
                            <button 
                              onClick={async () => {
                                if (order.id) {
                                  await deleteOrder(order.id);
                                  setOrders(orders.filter(o => o.id !== order.id));
                                }
                                setDeleteOrderConfirm(null);
                              }}
                              className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                            >
                              Yes
                            </button>
                            <button 
                              onClick={() => setDeleteOrderConfirm(null)}
                              className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300 transition-colors"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => setDeleteOrderConfirm(order.id || null)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors mr-auto"
                            title="Delete Order"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                        <select 
                          className="border border-gray-200 rounded-md px-3 py-1.5 text-xs focus:outline-none focus:border-[#8B1C31]"
                          value={order.status}
                          onChange={async (e) => {
                            const newStatus = e.target.value as any;
                            const updatedOrder = { ...order, status: newStatus };
                            await saveOrder(updatedOrder);
                            setOrders(orders.map(o => o.id === order.id ? updatedOrder : o));
                          }}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>
                  ))}
                  {orders.length === 0 && (
                    <div className="text-center py-16 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                      <div className="flex justify-center mb-4"><Box size={48} className="opacity-20"/></div>
                      <p className="text-sm font-medium">No orders yet</p>
                      <p className="text-xs mt-1">Orders will appear here when customers checkout.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
