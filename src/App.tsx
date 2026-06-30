/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Menu, Search, ShoppingBag, ArrowRight, Globe, Lock, ChevronLeft, ChevronRight, ImageIcon, X } from 'lucide-react';
import { Product } from './types';
import AdminPanel from './components/AdminPanel';
import { fetchProducts, saveProduct, fetchCategories, saveCategory } from './firebase';

export const defaultProducts: Product[] = [
  { id: 1, price: '₹4,500', image: 'https://images.unsplash.com/photo-1610030469983-9b85c8e03bc0?auto=format&fit=crop&q=80&w=800', en: { name: 'Pure Kanjeevaram Silk Saree', badge: 'Silk' }, kn: { name: 'ಶುದ್ಧ ಕಾಂಜೀವರಂ ರೇಷ್ಮೆ ಸೀರೆ', badge: 'ರೇಷ್ಮೆ' } },
  { id: 2, price: '₹3,200', image: 'https://images.unsplash.com/photo-1583391733959-b15124b87cea?auto=format&fit=crop&q=80&w=800', en: { name: 'Elegant Banarasi Chanderi Saree', badge: 'Chanderi' }, kn: { name: 'ಸೊಗಸಾದ ಬನಾರಸಿ ಚಂದೇರಿ ಸೀರೆ', badge: 'ಚಂದೇರಿ' } },
  { id: 3, price: '₹2,800', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=800', en: { name: 'Premium Organza Floral Saree', badge: 'Organza' }, kn: { name: 'ಪ್ರೀಮಿಯಂ ಆರ್ಗನ್ಜಾ ಹೂವಿನ ಸೀರೆ', badge: 'ಆರ್ಗನ್ಜಾ' } },
  { id: 4, price: '₹1,999', image: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&q=80&w=800', en: { name: 'Classic Cotton Linen Saree', badge: 'Linen' }, kn: { name: 'ಕ್ಲಾಸಿಕ್ ಕಾಟನ್ ಲಿನೆನ್ ಸೀರೆ', badge: 'ಲಿನೆನ್' } },
];

const content = {
  en: {
    nav: { home: 'Home', collection: 'Collection', about: 'About', contact: 'Contact' },
    hero: { pre: 'Handcrafted Excellence', title1: 'Elegance in', title2: 'Every Weave', desc: 'Celebrating the timeless art of traditional Indian handlooms and modern grace. Discover sarees crafted with heritage and passion.', explore: 'Explore Collection' },
    collection: { title: 'The Shivgouri Collection', desc: 'Our curated selection of premium silks, organzas, and cottons, ethically sourced directly from master weavers.', viewAll: 'View All', orderBtn: 'Order via WhatsApp', filterAll: 'All' },
    about: { title: 'Our Heritage', desc: 'Shivgouri is more than a boutique; it is an homage to the intricate craftsmanship of generations past. Every thread we select is a testament to the unparalleled skill of our artisans.' },
    footer: { address: 'Shivgouri Silk Sarees', city: 'Gokak, Karnataka', visit: 'Visit our physical store to experience the textures in person, or order directly online via our dedicated WhatsApp concierge.', rights: 'All rights reserved.' }
  },
  kn: {
    nav: { home: 'ಮುಖಪುಟ', collection: 'ಸಂಗ್ರಹ', about: 'ಬಗ್ಗೆ', contact: 'ಸಂಪರ್ಕ' },
    hero: { pre: 'ಕರಕುಶಲ ಶ್ರೇಷ್ಠತೆ', title1: 'ಪ್ರತಿ ನೇಯ್ಗೆಯಲ್ಲೂ', title2: 'ಸೊಬಗು', desc: 'ಸಾಂಪ್ರದಾಯಿಕ ಭಾರತೀಯ ಕೈಮಗ್ಗಗಳ ಮತ್ತು ಆಧುನಿಕ ಸೊಬಗಿನ ಸಮಯಾತೀತ ಕಲೆಯನ್ನು ಆಚರಿಸಲಾಗುತ್ತಿದೆ. ಪರಂಪರೆ ಮತ್ತು ಉತ್ಸಾಹದಿಂದ ರಚಿಸಲಾದ ಸೀರೆಗಳನ್ನು ಅನ್ವೇಷಿಸಿ.', explore: 'ಸಂಗ್ರಹ ಅನ್ವೇಷಿಸಿ' },
    collection: { title: 'ಶಿವಗೌರಿ ಸಂಗ್ರಹ', desc: 'ನುರಿತ ನೇಕಾರರಿಂದ ನೇರವಾಗಿ ಪಡೆದ ಪ್ರೀಮಿಯಂ ರೇಷ್ಮೆ, ಆರ್ಗನ್ಜಾ ಮತ್ತು ಕಾಟನ್‌ಗಳ ನಮ್ಮ ವಿಶೇಷ ಆಯ್ಕೆ.', viewAll: 'ಎಲ್ಲ ವೀಕ್ಷಿಸಿ', orderBtn: 'ವಾಟ್ಸಾಪ್ ಮೂಲಕ ಆರ್ಡರ್ ಮಾಡಿ', filterAll: 'ಎಲ್ಲ' },
    about: { title: 'ನಮ್ಮ ಪರಂಪರೆ', desc: 'ಶಿವಗೌರಿ ಕೇವಲ ಒಂದು ಮಳಿಗೆಯಲ್ಲ; ಇದು ಹಿಂದಿನ ತಲೆಮಾರುಗಳ ಸಂಕೀರ್ಣ ಕರಕುಶಲತೆಗೆ ಸಲ್ಲಿಸುವ ಗೌರವ. ನಾವು ಆಯ್ಕೆ ಮಾಡುವ ಪ್ರತಿಯೊಂದು ದಾರವೂ ನಮ್ಮ ಕುಶಲಕರ್ಮಿಗಳ ಅಪ್ರತಿಮ ಕೌಶಲ್ಯಕ್ಕೆ ಸಾಕ್ಷಿಯಾಗಿದೆ.' },
    footer: { address: 'ಶಿವಗೌರಿ ಸಿಲ್ಕ್ ಸೀರೆಗಳು', city: 'ಗೋಕಾಕ್, ಕರ್ನಾಟಕ', visit: 'ಬಟ್ಟೆಗಳನ್ನು ಖುದ್ದಾಗಿ ನೋಡಲು ನಮ್ಮ ಮಳಿಗೆಗೆ ಭೇಟಿ ನೀಡಿ, ಅಥವಾ ವಾಟ್ಸಾಪ್ ಮೂಲಕ ನೇರವಾಗಿ ಆನ್‌ಲೈನ್‌ನಲ್ಲಿ ಆರ್ಡರ್ ಮಾಡಿ.', rights: 'ಎಲ್ಲ ಹಕ್ಕುಗಳನ್ನು ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ.' }
  }
};

type CartItem = { product: Product; quantity: number };

export default function App() {
  const [lang, setLang] = useState<'en' | 'kn'>('en');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  const [products, setProducts] = useState<Product[]>([]);

  const [categories, setCategories] = useState<import('./types').Category[]>([]);

  const dragStartX = useRef<number | null>(null);
  const dragOffset = useRef<number>(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);

  const handleDragStart = (clientX: number) => {
    dragStartX.current = clientX;
    dragOffset.current = 0;
    setIsSwiping(true);
  };

  const handleDragMove = (clientX: number) => {
    if (dragStartX.current === null) return;
    const diff = clientX - dragStartX.current;
    dragOffset.current = diff;
    setSwipeOffset(diff);
  };

  const handleDragEnd = () => {
    if (dragStartX.current === null) return;
    const threshold = 50; // min swipe distance in px
    if (dragOffset.current < -threshold) {
      // Swiped left -> next
      setCurrentCategoryIndex(prev => Math.min(categories.length - 1, prev + 1));
    } else if (dragOffset.current > threshold) {
      // Swiped right -> prev
      setCurrentCategoryIndex(prev => Math.max(0, prev - 1));
    }
    dragStartX.current = null;
    dragOffset.current = 0;
    setIsSwiping(false);
    setSwipeOffset(0);
  };

  useEffect(() => {
    async function loadData() {
      try {
        const fetchedCats = await fetchCategories();
        const fetchedProds = await fetchProducts();
        
        let finalCats = fetchedCats;
        let finalProds = fetchedProds;

        if (fetchedProds.length === 0) {
          finalProds = defaultProducts;
          for (const prod of defaultProducts) {
            await saveProduct(prod);
          }
        }

        if (fetchedCats.length === 0) {
          const defaultCats: import('./types').Category[] = [];
          finalProds.forEach(p => {
            if (!defaultCats.find(c => c.en === p.en.badge)) {
              defaultCats.push({ id: p.en.badge, en: p.en.badge, kn: p.kn.badge });
            }
          });
          finalCats = defaultCats;
          for (const cat of defaultCats) {
            await saveCategory(cat);
          }
        }

        setCategories(finalCats);
        setProducts(finalProds);
      } catch (err) {
        console.error("Error loading data from Firestore:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const waNumber = '918329732432';
  const t = content[lang];

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  // Dynamic categories based on explicit categories or fallback to current products
  const englishBadges = categories.length > 0 
    ? categories.map(c => c.en) 
    : Array.from(new Set(products.map(p => p.en.badge).filter(Boolean)));
    
  const filterCategories = ['All', ...englishBadges];
  
  const filteredProducts = products.filter(p => {
    const matchesCategory = activeCategory === 'All' || p.en.badge === activeCategory;
    const matchesSearch = p.en.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.kn.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F4EF] flex flex-col items-center justify-center">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-[#3C101B] mb-6 animate-pulse">
          <path d="M12 2C8 6 4 11 4 16C4 20.418 7.582 24 12 24C16.418 24 20 20.418 20 16C20 11 16 6 12 2Z" fill="currentColor" opacity="0.1"/>
          <path d="M12 4.5C9.5 7.5 7 11.5 7 15.5C7 18.5 9.2 21 12 21C14.8 21 17 18.5 17 15.5C17 11.5 14.5 7.5 12 4.5Z" stroke="currentColor" strokeWidth="1.2"/>
          <path d="M10.5 11.5C10.5 10 11.5 9 12.5 9C13.5 9 14.5 10 14 11.5C13 14 10 14.5 10 17C10 18.5 11 19.5 12.5 19" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
        <div className="text-[10px] uppercase tracking-[0.2em] text-[#3C101B]/50 font-medium animate-pulse">Loading / ಲೋಡ್ ಆಗುತ್ತಿದೆ...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F4EF] font-sans text-[#3C101B] selection:bg-[#3C101B] selection:text-white overflow-x-hidden">
      {/* Navigation Bar */}
      <nav className="bg-[#3C101B] text-white w-full">
        {/* Top bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex justify-between items-center h-16 relative">
            <div className="flex items-center gap-4 w-1/3">
              <button className="md:hidden text-white hover:opacity-50 transition-opacity">
                <Menu size={24} strokeWidth={1.5} />
              </button>
              {!isSearchOpen && (
                <button onClick={() => setIsSearchOpen(true)} className="md:hidden text-white hover:opacity-50 transition-opacity">
                  <Search size={20} strokeWidth={1.5} />
                </button>
              )}
              {isSearchOpen ? (
                <div className="hidden md:flex items-center gap-2 bg-white/10 rounded-full px-3 py-1.5 w-48 lg:w-64">
                  <Search size={16} strokeWidth={1.5} className="text-white/50" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="bg-transparent border-none outline-none text-white text-[11px] uppercase tracking-widest placeholder:text-white/50 w-full"
                    autoFocus
                  />
                  <button onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }} className="text-white/50 hover:text-white">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button onClick={() => setIsSearchOpen(true)} className="hidden md:flex items-center justify-center text-white hover:opacity-50 transition-opacity">
                  <Search size={20} strokeWidth={1.5} />
                </button>
              )}
            </div>
            
            {/* Logo */}
            <div className={`flex-1 flex justify-center w-1/3 transition-opacity ${isSearchOpen ? 'opacity-0 md:opacity-100 pointer-events-none md:pointer-events-auto' : 'opacity-100'}`}>
              <a href="#" className="flex items-center gap-2 group">
                <span className="font-logo text-2xl tracking-[0.1em] font-medium text-white uppercase">
                  Shivgouri
                </span>
              </a>
            </div>

            {/* Mobile Search Overlay */}
            {isSearchOpen && (
              <div className="absolute inset-0 bg-[#3C101B] flex md:hidden items-center px-4 z-10">
                <Search size={18} strokeWidth={1.5} className="text-white/50 mr-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="bg-transparent border-none outline-none text-white text-[11px] uppercase tracking-widest placeholder:text-white/50 w-full"
                  autoFocus
                />
                <button onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }} className="text-white ml-3">
                  <X size={20} />
                </button>
              </div>
            )}

            {/* Right Icons */}
            <div className="flex items-center justify-end gap-6 text-[11px] uppercase tracking-widest w-1/3">
              <a href="https://www.instagram.com/shivgouri_silksarees_gokak" target="_blank" rel="noopener noreferrer" className="hidden md:flex items-center gap-2 hover:opacity-70 transition-opacity">
                <span>Instagram</span>
              </a>
              <button onClick={() => setLang(lang === 'en' ? 'kn' : 'en')} className="hover:opacity-70 transition-opacity">
                 {lang === 'en' ? 'ಕನ್ನಡ' : 'EN'}
              </button>
              <button onClick={() => setIsCartOpen(true)} className="hover:opacity-70 transition-opacity flex items-center gap-2">
                <ShoppingBag size={20} strokeWidth={1.5} />
                <span className="hidden sm:inline">Cart ({cart.length})</span>
              </button>
            </div>
          </div>
          
          {/* Bottom Nav Links */}
          <div className="hidden md:flex justify-center items-center gap-8 pb-4 text-[10px] uppercase tracking-widest font-medium text-white/80">
             {filterCategories.slice(0, 5).map(cat => (
               <button 
                 key={cat} 
                 onClick={() => {
                   setActiveCategory(cat);
                   document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' });
                 }}
                 className="hover:text-white transition-colors"
               >
                 {cat === 'All' ? t.collection.filterAll : cat}
               </button>
             ))}
             <a href="#about" className="hover:text-white transition-colors">{t.nav.about}</a>
             <a href="#contact" className="hover:text-white transition-colors">{t.nav.contact}</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col md:flex-row min-h-[70vh] bg-[#F7F4EF]">
        {/* Left Image */}
        <div className="w-full md:w-[55%] relative h-[50vh] md:h-auto md:flex-1">
           <img 
             src="/853180.jpg"
             alt="Shivgouri Elegance"
             className="absolute inset-0 w-full h-full object-cover"
           />
        </div>
        {/* Right Content */}
        <div className="w-full md:w-[45%] flex flex-col justify-center items-center p-12 text-center">
           <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#3C101B] mb-6 leading-tight">
             Where elegance is <br/><span className="italic">quiet.</span>
           </h1>
           <p className="text-[12px] uppercase tracking-widest text-[#3C101B]/80 mb-10 max-w-xs leading-relaxed">
             From the loom. To the woman who knows the difference.
           </p>
           <button 
             onClick={() => document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' })}
             className="bg-[#3C101B] text-white px-8 py-3 rounded-full text-[10px] uppercase tracking-widest font-medium hover:bg-[#2A0B13] transition-colors"
           >
             Shop Collection
           </button>
        </div>
      </section>

      {/* Curation Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto text-center md:text-left">
         <div className="max-w-3xl mx-auto md:mx-0 border-l-2 border-[#A28B55] pl-6 mb-16">
           <h2 className="font-serif text-3xl md:text-4xl text-[#3C101B] mb-4 italic">
             Not everything woven deserves to be worn.
           </h2>
           <p className="text-[#3C101B]/70 font-serif text-lg md:text-xl mb-6">
             For generations, we have chosen — so you never have to settle.
           </p>
           <p className="text-[10px] uppercase tracking-[0.2em] text-[#A28B55] font-medium">
             this is curation, not commerce.
           </p>
         </div>

         {/* Category Feature Slider (1 at a time) */}
         <div className="relative group/catslider mt-12 mb-16 mx-auto max-w-4xl">
           <div className="overflow-hidden rounded-sm relative bg-[#3C101B]">
             <div 
               className={`flex cursor-grab active:cursor-grabbing ${isSwiping ? '' : 'transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]'}`}
               style={{ transform: `translateX(calc(-${currentCategoryIndex * 100}% + ${swipeOffset}px))` }}
               onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
               onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
               onTouchEnd={handleDragEnd}
               onMouseDown={(e) => handleDragStart(e.clientX)}
               onMouseMove={(e) => {
                 if (dragStartX.current !== null) {
                   handleDragMove(e.clientX);
                 }
               }}
               onMouseUp={handleDragEnd}
               onMouseLeave={handleDragEnd}
             >
               {categories.map((cat) => (
                 <div key={cat.id} className="min-w-full flex-shrink-0 relative aspect-[16/9] md:aspect-[21/9]">
                   <div 
                     onClick={() => {
                       setActiveCategory(cat.en);
                       document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' });
                     }}
                     className="w-full h-full cursor-pointer group"
                   >
                     {cat.image ? (
                       <img referrerPolicy="no-referrer" src={cat.image} alt={cat.en} className="w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-1000" />
                     ) : (
                       <div className="w-full h-full flex items-center justify-center text-white/20">
                         <ImageIcon size={64} strokeWidth={1} />
                       </div>
                     )}
                     <div className="absolute inset-0 bg-gradient-to-t from-[#3C101B]/90 via-transparent to-transparent pointer-events-none" />
                     <div className="absolute bottom-8 left-8 right-8 flex flex-col md:flex-row items-start md:items-end justify-between">
                       <div>
                         <span className="text-[10px] uppercase tracking-widest text-[#A28B55] mb-3 block font-medium">Curated Collection</span>
                         <h3 className="font-serif text-3xl md:text-5xl text-white mb-2">{lang === 'en' ? cat.en : cat.kn}</h3>
                       </div>
                       <button className="hidden md:flex items-center gap-2 text-[11px] uppercase tracking-widest text-white/80 hover:text-white transition-colors pb-2">
                         Explore Collection <ArrowRight size={16} />
                       </button>
                     </div>
                   </div>
                 </div>
               ))}
             </div>
           </div>
           
           {/* Slider Navigation Dots */}
           {categories.length > 1 && (
             <div className="flex justify-between items-center mt-6">
               <div className="text-[11px] font-medium text-[#3C101B]/50 font-serif">
                 {String(currentCategoryIndex + 1).padStart(2, '0')} / {String(categories.length).padStart(2, '0')}
               </div>
               <div className="flex gap-1.5">
                 {categories.map((_, idx) => (
                   <button
                     key={idx}
                     onClick={() => setCurrentCategoryIndex(idx)}
                     className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentCategoryIndex ? 'w-6 bg-[#3C101B]' : 'w-1.5 bg-[#3C101B]/20'}`}
                     aria-label={`Go to slide ${idx + 1}`}
                   />
                 ))}
               </div>
             </div>
           )}
         </div>
      </section>

      {/* Main Collection / Sliders */}
      <section id="collection" className="py-20 bg-[#F3EFE8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#A28B55] font-medium mb-4">The Noteworthy</p>
          <h2 className="font-serif text-4xl md:text-5xl text-[#3C101B] italic mb-6">
             Shivgouri by Signatures
          </h2>
          <p className="text-[#3C101B]/80 font-serif text-lg max-w-2xl mb-12">
             Lustrous silks, intricate zari — every piece chosen at the source and held to one standard. Finest. Reserved and preserved.
          </p>

          {/* Category Tabs */}
          <div className="flex overflow-x-auto gap-8 border-b border-[#3C101B]/10 pb-4 mb-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
             <button 
               onClick={() => setActiveCategory('All')}
               className={`whitespace-nowrap flex items-baseline gap-2 transition-colors ${activeCategory === 'All' ? 'text-[#3C101B] border-b border-[#3C101B]' : 'text-[#3C101B]/40 hover:text-[#3C101B]'}`}
             >
               <span className="text-[10px] tracking-widest">00</span>
               <span className="font-serif text-lg">{t.collection.filterAll}</span>
             </button>
             {categories.map((cat, idx) => (
               <button 
                 key={cat.id}
                 onClick={() => setActiveCategory(cat.en)}
                 className={`whitespace-nowrap flex items-baseline gap-2 transition-colors ${activeCategory === cat.en ? 'text-[#3C101B] border-b border-[#3C101B]' : 'text-[#3C101B]/40 hover:text-[#3C101B]'}`}
               >
                 <span className="text-[10px] tracking-widest">{String(idx + 1).padStart(2, '0')}</span>
                 <span className="font-serif text-lg">{lang === 'en' ? cat.en : cat.kn}</span>
               </button>
             ))}
          </div>

          <div className="flex justify-end mb-6">
            <button 
              onClick={() => setActiveCategory('All')}
              className="text-[10px] uppercase tracking-widest font-medium flex items-center gap-1 text-[#A28B55] hover:opacity-70 transition-opacity"
            >
              View All <ArrowRight size={14} />
            </button>
          </div>

          {/* Horizontal Product List */}
          <div className="relative group/slider">
            <div className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]" id="slider">
              {filteredProducts.length > 0 ? filteredProducts.map(product => {
                const pData = product[lang];
                const message = `Hello Shivgouri, I am interested in purchasing the ${pData.name} (${product.price}).`;
                const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
                return (
                  <div key={product.id} className="min-w-[280px] md:min-w-[320px] snap-start flex flex-col group/item">
                    <div className="relative aspect-[4/5] bg-[#EAE5DB] mb-4 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                       {product.image ? (
                         <img referrerPolicy="no-referrer" src={product.image} alt={pData.name} className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-700" />
                       ) : (
                         <div className="w-full h-full flex items-center justify-center text-[#3C101B]/20">
                           <ImageIcon size={48} strokeWidth={1} />
                         </div>
                       )}
                       {/* Add to Cart Overlay */}
                       <div className="absolute bottom-4 left-4 right-4 translate-y-8 opacity-0 group-hover/item:translate-y-0 group-hover/item:opacity-100 transition-all duration-300">
                         <button 
                           onClick={() => addToCart(product)}
                           className="w-full bg-[#3C101B] text-white py-3 text-[10px] uppercase tracking-widest font-medium hover:bg-[#2A0B13] transition-colors"
                         >
                           Add to Cart
                         </button>
                       </div>
                    </div>
                    <div className="flex justify-between items-start gap-4 px-1">
                      <h3 className="font-sans font-medium text-[#3C101B] text-sm md:text-sm leading-snug">{pData.name}</h3>
                      <p className="text-[#A28B55] text-xs md:text-sm whitespace-nowrap font-medium">{product.price}</p>
                    </div>
                  </div>
                );
              }) : (
                <div className="w-full text-center py-20 text-[#3C101B]/50 font-serif italic text-lg">
                  No products found in this category.
                </div>
              )}
            </div>
            {/* Scroll buttons */}
            <button 
              onClick={() => { document.getElementById('slider')?.scrollBy({ left: 340, behavior: 'smooth' }) }}
              className="absolute right-2 top-[40%] -translate-y-1/2 w-12 h-12 bg-white/90 shadow-md rounded-full flex items-center justify-center text-[#3C101B] opacity-0 group-hover/slider:opacity-100 transition-opacity hover:bg-white"
            >
              <ChevronRight size={24} />
            </button>
            <button 
              onClick={() => { document.getElementById('slider')?.scrollBy({ left: -340, behavior: 'smooth' }) }}
              className="absolute left-2 top-[40%] -translate-y-1/2 w-12 h-12 bg-white/90 shadow-md rounded-full flex items-center justify-center text-[#3C101B] opacity-0 group-hover/slider:opacity-100 transition-opacity hover:bg-white"
            >
              <ChevronLeft size={24} />
            </button>
          </div>
        </div>
      </section>

      {/* Gallery / Boutique Visit Section (Dark) */}
      <section id="about" className="bg-[#3C101B] text-white py-24">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1 text-center md:text-left">
             <span className="text-[10px] uppercase tracking-widest text-[#A28B55] mb-4 block font-medium">Visit the Gallery</span>
             <h2 className="font-serif text-3xl md:text-4xl italic mb-6 leading-tight">
               Experience the legacy of Shivgouri.
             </h2>
             <p className="text-white/70 text-sm md:text-base leading-relaxed mb-10 max-w-md mx-auto md:mx-0">
               {t.about.desc}
             </p>
             <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-6 text-[10px] uppercase tracking-widest text-white/70">
               <a href="https://maps.app.goo.gl/Xmbb7zuQgSnhyt58A" target="_blank" rel="noopener noreferrer" className="bg-transparent px-6 py-3 border border-white/20 hover:bg-white/10 transition-colors">Get Directions</a>
               <span>{waNumber}</span>
             </div>
          </div>
          <div className="flex-1 w-full relative aspect-[4/3] md:aspect-[3/2]">
             <img referrerPolicy="no-referrer" src="https://images.unsplash.com/photo-1605705663782-b7bce3e8d9b1?auto=format&fit=crop&q=80&w=1200" className="w-full h-full object-cover opacity-90 shadow-2xl" alt="Boutique" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-[#2A0B13] text-white pt-24 pb-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 text-center">
           <h4 className="text-[11px] font-bold tracking-[0.2em] uppercase mb-4 text-white/80">Register Address</h4>
           <p className="text-[11px] uppercase tracking-widest text-white/50 mb-8 max-w-lg mx-auto leading-relaxed">
             {t.footer.address}, {t.footer.city} <br/>
             Contact us : +91 {waNumber.replace('91', '')}
           </p>

           <div className="w-full h-px bg-white/10 my-16 max-w-4xl mx-auto" />

           <h4 className="text-[11px] font-bold tracking-[0.2em] uppercase mb-4 text-[#A28B55]">Subscribe to our emails</h4>
           <h2 className="font-serif text-3xl md:text-4xl italic mb-6">Join Our Journey</h2>
           <p className="text-sm text-white/60 mb-10 max-w-md mx-auto">
             Be the first to explore special offers, exclusive discounts, and all our latest updates.
           </p>

           <div className="flex flex-col sm:flex-row max-w-md mx-auto gap-4 mb-24">
             <input 
               type="email" 
               placeholder="Email" 
               className="flex-1 bg-white text-[#3C101B] px-6 py-4 rounded-sm focus:outline-none placeholder:text-[#3C101B]/40 text-sm" 
             />
             <button className="bg-[#F7F4EF] text-[#3C101B] px-8 py-4 rounded-sm text-[11px] font-bold uppercase tracking-widest hover:bg-white transition-colors">
               Subscribe
             </button>
           </div>

           <div className="flex flex-col sm:flex-row justify-between items-center text-[10px] uppercase tracking-widest text-white/30">
             <p>&copy; {new Date().getFullYear()} Shivgouri Silk and Saris.</p>
             <button onClick={() => setIsAdminOpen(true)} className="hover:text-white mt-4 sm:mt-0 flex items-center gap-2 transition-colors">
               Admin <Lock size={12} />
             </button>
           </div>
        </div>
      </footer>

      {isAdminOpen && (
        <AdminPanel 
          products={products} 
          setProducts={setProducts} 
          categories={categories}
          setCategories={setCategories}
          onClose={() => setIsAdminOpen(false)} 
        />
      )}

      {/* Cart Sidebar */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
          <div className="relative w-full max-w-md bg-[#F7F4EF] h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between p-6 border-b border-[#3C101B]/10">
              <h2 className="font-serif text-2xl text-[#3C101B] italic">Your Cart</h2>
              <button onClick={() => setIsCartOpen(false)} className="text-[#3C101B] hover:opacity-50">
                <X size={24} strokeWidth={1.5} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                  <ShoppingBag size={48} strokeWidth={1} className="mb-4" />
                  <p className="font-serif text-lg">Your cart is empty.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {cart.map((item, idx) => (
                    <div key={idx} className="flex gap-4 items-center">
                      <div className="w-20 aspect-[4/5] bg-[#EAE5DB] overflow-hidden flex-shrink-0">
                        {item.product.image ? <img referrerPolicy="no-referrer" src={item.product.image} className="w-full h-full object-cover" /> : null}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-[12px] font-medium text-[#3C101B] mb-1 leading-snug">{item.product[lang].name}</h4>
                        <p className="text-[#A28B55] text-[11px] font-medium mb-2">{item.product.price}</p>
                        <div className="flex items-center gap-3">
                           <button 
                             onClick={() => setCart(cart.map(c => c.product.id === item.product.id ? { ...c, quantity: Math.max(1, c.quantity - 1) } : c))}
                             className="w-6 h-6 border border-[#3C101B]/20 flex items-center justify-center text-[#3C101B]"
                           >-</button>
                           <span className="text-[11px]">{item.quantity}</span>
                           <button 
                             onClick={() => setCart(cart.map(c => c.product.id === item.product.id ? { ...c, quantity: c.quantity + 1 } : c))}
                             className="w-6 h-6 border border-[#3C101B]/20 flex items-center justify-center text-[#3C101B]"
                           >+</button>
                           <button 
                             onClick={() => setCart(cart.filter(c => c.product.id !== item.product.id))}
                             className="ml-auto text-[10px] uppercase tracking-widest text-[#3C101B]/50 hover:text-[#3C101B] underline"
                           >Remove</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {cart.length > 0 && (
              <div className="p-6 border-t border-[#3C101B]/10 bg-[#EAE5DB]/50">
                 <button 
                   onClick={() => {
                     const orderText = cart.map(item => `${item.quantity}x ${item.product[lang].name} (${item.product.price})`).join('\\n');
                     const message = `Hello Shivgouri, I would like to order:\\n\\n${orderText}`;
                     const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
                     window.open(waLink, '_blank');
                   }}
                   className="w-full bg-[#3C101B] text-white py-4 text-[11px] uppercase tracking-widest font-bold hover:bg-[#2A0B13] transition-colors"
                 >
                   Checkout via WhatsApp
                 </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
