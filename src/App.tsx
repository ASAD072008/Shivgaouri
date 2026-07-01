/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Menu, ShoppingBag, ArrowRight, Globe, Lock, ChevronLeft, ChevronRight, ImageIcon, X, Share } from 'lucide-react';
import { Product, Offer } from './types';
import AdminPanel from './components/AdminPanel';
import { fetchProducts, fetchCategories, fetchOffers } from './firebase';

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

type CartItem = { product: Product; quantity: number; selectedColor?: string };

export default function App() {
  const [lang, setLang] = useState<'en' | 'kn'>('en');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('Womens');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeSubcategory, setActiveSubcategory] = useState<string>('All');
  const [isLoading, setIsLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  const [products, setProducts] = useState<Product[]>([]);

  const [categories, setCategories] = useState<import('./types').Category[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [showOffer, setShowOffer] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('');

  useEffect(() => {
    async function loadData() {
      try {
        const fetchedCats = await fetchCategories();
        const fetchedProds = await fetchProducts();
        const fetchedOffers = await fetchOffers();
        
        let finalCats = fetchedCats;
        let finalProds = fetchedProds;

        setCategories(finalCats);
        setProducts(finalProds);
        setOffers(fetchedOffers);
        
        if (fetchedOffers.some(o => o.isActive)) {
          setTimeout(() => setShowOffer(true), 2000);
        }

        const params = new URLSearchParams(window.location.search);
        const sharedProductId = params.get('product');
        if (sharedProductId) {
          const sharedProduct = finalProds.find(p => String(p.id) === sharedProductId);
          if (sharedProduct) {
            setSelectedProduct(sharedProduct);
          }
        }
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

  const addToCart = (product: Product, selectedColor?: string) => {
    if (product.stock !== undefined && product.stock <= 0) {
      alert('Out of stock');
      return;
    }
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id && item.selectedColor === selectedColor);
      if (existing) {
        if (product.stock !== undefined && existing.quantity >= product.stock) {
          alert('Maximum stock reached');
          return prev;
        }
        return prev.map(item => item.product.id === product.id && item.selectedColor === selectedColor ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1, selectedColor }];
    });
    setIsCartOpen(true);
  };

  // Dynamic categories based on explicit categories or fallback to current products
  const englishBadges = categories.length > 0 
    ? categories.map(c => c.en) 
    : Array.from(new Set(products.map(p => p.en.badge).filter(Boolean)));
    
  const filterCategories = ['All', ...englishBadges];
  
  const heroCategories = categories.length > 0 
    ? categories 
    : Array.from(new Set(products.map(p => p.en.badge).filter(Boolean))).map((badge, idx) => {
        const prod = products.find(p => p.en.badge === badge);
        return {
          id: `fallback-${idx}`,
          en: badge,
          kn: prod?.kn.badge || badge,
          image: prod?.image || prod?.images?.[0] || '',
          section: 'Womens'
        };
      });

  const filteredCategories = categories.length > 0 
    ? categories.filter(c => (c.section || 'Womens') === activeSection)
    : heroCategories.filter(c => c.section === activeSection);
  
  const filteredProducts = products.filter(p => {
    const pCat = categories.find(c => c.en === p.en.badge);
    const pSection = pCat?.section || 'Womens';
    
    const matchesSection = pSection === activeSection;
    const matchesCategory = activeCategory === 'All' || p.en.badge === activeCategory;
    const matchesSubcategory = activeSubcategory === 'All' || p.en.subcategory === activeSubcategory;
                          
    return matchesSection && matchesCategory && matchesSubcategory;
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
            </div>
            
            {/* Logo */}
            <div className="flex-1 flex justify-center w-1/3 transition-opacity opacity-100">
              <a href="#" className="flex items-center gap-2 group">
                <span className="font-logo text-2xl tracking-[0.1em] font-medium text-white uppercase">
                  Shivgouri
                </span>
              </a>
            </div>

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

      {/* Offer Announcement Bar */}
      {offers.filter(o => o.isActive).length > 0 && (
        <div className="bg-[#8B1C31] text-white overflow-hidden py-3 border-y border-[#3C101B]/20 shadow-inner">
          <div className="whitespace-nowrap animate-marquee flex items-center gap-8 w-max">
            {[...offers.filter(o => o.isActive), ...offers.filter(o => o.isActive), ...offers.filter(o => o.isActive), ...offers.filter(o => o.isActive)].map((offer, idx) => (
              <span key={idx} className="text-[11px] font-bold tracking-widest uppercase flex items-center gap-8">
                 <span>{offer[lang].title}</span>
                 <span className="opacity-50 text-[#A28B55]">✦</span>
                 <span>{offer[lang].description}</span>
                 <span className="opacity-50 text-[#A28B55]">✦</span>
              </span>
            ))}
          </div>
        </div>
      )}

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

         {/* Category Feature Slider (Native Scroll) */}
         <div className="relative group/catslider mt-12 mb-16 mx-auto w-full max-w-[100vw] overflow-hidden">
           <div 
             id="category-slider"
             className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-8 px-6 md:px-12"
             style={{ scrollBehavior: 'smooth' }}
           >
             {heroCategories.map((cat) => (
               <div key={cat.id} className="w-[85%] md:w-[40%] flex-shrink-0 snap-center relative aspect-[4/3] md:aspect-[16/9] rounded-xl overflow-hidden shadow-lg">
                 <div 
                   onClick={() => {
                     if (cat.section) setActiveSection(cat.section);
                     setActiveCategory(cat.en);
                     document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' });
                   }}
                   className="w-full h-full cursor-pointer group"
                 >
                   {cat.image ? (
                     <img draggable="false" referrerPolicy="no-referrer" src={cat.image} alt={cat.en} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000" />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center bg-[#3C101B] text-white/20">
                       <ImageIcon size={64} strokeWidth={1} />
                     </div>
                   )}
                   <div className="absolute inset-0 bg-gradient-to-t from-[#3C101B]/90 via-[#3C101B]/20 to-transparent pointer-events-none" />
                   <div className="absolute bottom-6 left-6 right-6 flex flex-col items-start justify-end">
                     <span className="text-[10px] uppercase tracking-widest text-[#A28B55] mb-2 block font-medium shadow-black drop-shadow-md">Curated</span>
                     <h3 className="font-serif text-2xl md:text-3xl text-white mb-2 drop-shadow-lg">{lang === 'en' ? cat.en : cat.kn}</h3>
                   </div>
                 </div>
               </div>
             ))}
           </div>
           
           {/* Navigation Buttons */}
           <div className="absolute top-1/2 -translate-y-1/2 left-2 md:left-4 z-10 hidden md:block">
             <button 
               onClick={() => document.getElementById('category-slider')?.scrollBy({ left: -400, behavior: 'smooth' })}
               className="w-10 h-10 rounded-full bg-white/90 shadow-md flex items-center justify-center text-[#3C101B] hover:bg-white transition-colors"
             >
               <ChevronLeft size={20} />
             </button>
           </div>
           <div className="absolute top-1/2 -translate-y-1/2 right-2 md:right-4 z-10 hidden md:block">
             <button 
               onClick={() => document.getElementById('category-slider')?.scrollBy({ left: 400, behavior: 'smooth' })}
               className="w-10 h-10 rounded-full bg-white/90 shadow-md flex items-center justify-center text-[#3C101B] hover:bg-white transition-colors"
             >
               <ChevronRight size={20} />
             </button>
           </div>
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

          {/* Section Tabs */}
          <div className="flex gap-8 border-b border-[#3C101B]/10 pb-4 mb-4">
             <button 
               onClick={() => { setActiveSection('Womens'); setActiveCategory('All'); }}
               className={`whitespace-nowrap transition-colors text-lg font-serif ${activeSection === 'Womens' ? 'text-[#3C101B] border-b border-[#3C101B]' : 'text-[#3C101B]/40 hover:text-[#3C101B]'}`}
             >
               Women's
             </button>
             <button 
               onClick={() => { setActiveSection('Kids'); setActiveCategory('All'); }}
               className={`whitespace-nowrap transition-colors text-lg font-serif ${activeSection === 'Kids' ? 'text-[#3C101B] border-b border-[#3C101B]' : 'text-[#3C101B]/40 hover:text-[#3C101B]'}`}
             >
               Kids
             </button>
          </div>

          {/* Category Tabs */}
          <div className="flex overflow-x-auto gap-8 border-b border-[#3C101B]/10 pb-4 mb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
             <button 
               onClick={() => { setActiveCategory('All'); setActiveSubcategory('All'); }}
               className={`whitespace-nowrap flex items-baseline gap-2 transition-colors ${activeCategory === 'All' ? 'text-[#3C101B] border-b border-[#3C101B]' : 'text-[#3C101B]/40 hover:text-[#3C101B]'}`}
             >
               <span className="text-[10px] tracking-widest">00</span>
               <span className="font-serif text-lg">{t.collection.filterAll}</span>
             </button>
             {filteredCategories.map((cat, idx) => (
               <button 
                 key={cat.id}
                 onClick={() => { setActiveCategory(cat.en); setActiveSubcategory('All'); }}
                 className={`whitespace-nowrap flex items-baseline gap-2 transition-colors ${activeCategory === cat.en ? 'text-[#3C101B] border-b border-[#3C101B]' : 'text-[#3C101B]/40 hover:text-[#3C101B]'}`}
               >
                 <span className="text-[10px] tracking-widest">{String(idx + 1).padStart(2, '0')}</span>
                 <span className="font-serif text-lg">{lang === 'en' ? cat.en : cat.kn}</span>
               </button>
             ))}
          </div>

          {/* Subcategory Tabs */}
          {(() => {
            if (activeCategory === 'All') return null;
            const currentCat = filteredCategories.find(c => c.en === activeCategory);
            if (!currentCat || !currentCat.subcategories || currentCat.subcategories.length === 0) return null;
            
            return (
              <div className="flex overflow-x-auto gap-6 pb-4 mb-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <button 
                  onClick={() => setActiveSubcategory('All')}
                  className={`whitespace-nowrap flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-medium transition-colors ${activeSubcategory === 'All' ? 'bg-[#3C101B] text-white border-[#3C101B]' : 'bg-transparent text-[#3C101B]/60 border-[#3C101B]/20 hover:border-[#3C101B]/40'}`}
                >
                  All {lang === 'en' ? currentCat.en : currentCat.kn}
                </button>
                {currentCat.subcategories.map(subcat => (
                  <button 
                    key={subcat.id}
                    onClick={() => setActiveSubcategory(subcat.en)}
                    className={`whitespace-nowrap flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-medium transition-colors ${activeSubcategory === subcat.en ? 'bg-[#3C101B] text-white border-[#3C101B]' : 'bg-transparent text-[#3C101B]/60 border-[#3C101B]/20 hover:border-[#3C101B]/40'}`}
                  >
                    {lang === 'en' ? subcat.en : subcat.kn}
                  </button>
                ))}
              </div>
            );
          })()}

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
                    <div className="relative aspect-[4/5] bg-[#EAE5DB] mb-4 overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedProduct(product)}>
                       {product.image ? (
                         <img referrerPolicy="no-referrer" src={product.image} alt={pData.name} className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-700" />
                       ) : (
                         <div className="w-full h-full flex items-center justify-center text-[#3C101B]/20">
                           <ImageIcon size={48} strokeWidth={1} />
                         </div>
                       )}
                       {product.inOffer && (
                         <div className="absolute top-3 left-3 bg-[#8B1C31] text-white text-[9px] font-bold uppercase tracking-widest px-2 py-1 shadow-sm">
                           {product.discountRate || 'Offer'}
                         </div>
                       )}
                       {/* Add to Cart Overlay */}
                       <div className="absolute bottom-4 left-4 right-4 translate-y-8 opacity-0 group-hover/item:translate-y-0 group-hover/item:opacity-100 transition-all duration-300">
                         {product.stock !== undefined && product.stock <= 0 ? (
                           <button 
                             disabled
                             className="w-full bg-gray-200 text-gray-500 py-3 text-[10px] uppercase tracking-widest font-medium cursor-not-allowed"
                           >
                             Out of Stock
                           </button>
                         ) : (
                           <button 
                             onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                             className="w-full bg-[#3C101B] text-white py-3 text-[10px] uppercase tracking-widest font-medium hover:bg-[#2A0B13] transition-colors"
                           >
                             Add to Cart
                           </button>
                         )}
                       </div>
                    </div>
                    <div className="flex justify-between items-start gap-4 px-1 cursor-pointer" onClick={() => setSelectedProduct(product)}>
                      <div className="flex flex-col gap-1">
                        <h3 className="font-sans font-medium text-[#3C101B] text-sm md:text-sm leading-snug">{pData.name}</h3>
                        {product.colors && product.colors.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {product.colors.map((c, i) => (
                              <span key={i} className="text-[9px] px-1.5 py-0.5 bg-[#EAE5DB] text-[#3C101B]/80 rounded-sm">{c}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end">
                        {product.inOffer && product.offerPrice ? (
                          <>
                            <p className="text-[#8B1C31] text-xs md:text-sm whitespace-nowrap font-bold">{product.offerPrice}</p>
                            <p className="text-gray-400 text-[10px] md:text-xs whitespace-nowrap font-medium line-through">{product.price}</p>
                          </>
                        ) : (
                          <p className="text-[#A28B55] text-xs md:text-sm whitespace-nowrap font-medium">{product.price}</p>
                        )}
                        {product.stock !== undefined && (
                          <p className={`text-[9px] md:text-[10px] whitespace-nowrap font-medium mt-1 ${product.stock > 0 ? 'text-gray-500' : 'text-red-500'}`}>
                            {product.stock > 0 ? `${product.stock} left` : 'Out of stock'}
                          </p>
                        )}
                      </div>
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
          <div className="flex-1 w-full relative aspect-[4/3] md:aspect-[3/2] bg-[#EAE5DB]/10 flex items-center justify-center text-white/20">
             <ImageIcon size={64} strokeWidth={1} />
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
          offers={offers}
          setOffers={setOffers}
          onClose={() => setIsAdminOpen(false)} 
        />
      )}

      {/* Product Details Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-6 lg:p-12">
          <div className="absolute inset-0 bg-[#3C101B]/80 backdrop-blur-sm" onClick={() => setSelectedProduct(null)}></div>
          <div className="relative bg-[#FAFAFA] w-full h-full md:max-w-6xl md:h-[90vh] md:rounded-xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
            <button 
              onClick={() => {
                const url = `${window.location.origin}?product=${selectedProduct.id}`;
                if (navigator.share) {
                  navigator.share({
                    title: selectedProduct[lang].name,
                    text: `Check out ${selectedProduct[lang].name} at Shivgouri`,
                    url: url
                  }).catch(console.error);
                } else {
                  navigator.clipboard.writeText(url);
                  alert('Link copied to clipboard!');
                }
              }}
              className="absolute right-14 top-4 md:right-16 md:top-6 z-20 w-10 h-10 flex items-center justify-center bg-white/90 backdrop-blur-md shadow-sm rounded-full text-[#3C101B] hover:bg-white transition-colors"
              title="Share or copy link"
            >
              <Share size={18} />
            </button>
            <button 
              onClick={() => setSelectedProduct(null)}
              className="absolute right-4 top-4 md:right-6 md:top-6 z-20 w-10 h-10 flex items-center justify-center bg-white/90 backdrop-blur-md shadow-sm rounded-full text-[#3C101B] hover:bg-white transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="w-full md:w-[55%] lg:w-3/5 bg-[#EAE5DB] relative h-[50vh] md:h-full">
              <div className="relative w-full h-full">
                {selectedProduct.image ? (
                  <img referrerPolicy="no-referrer" src={selectedProduct.image} alt={selectedProduct[lang].name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#3C101B]/20">
                    <ImageIcon size={64} strokeWidth={1} />
                  </div>
                )}
              </div>
            </div>
            
            {/* Scrollable Details Area */}
            <div className="w-full md:w-[45%] lg:w-2/5 p-6 md:p-10 lg:p-14 flex flex-col h-[50vh] md:h-full overflow-y-auto bg-[#FAFAFA]">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[10px] uppercase tracking-widest text-[#A28B55] block">{selectedProduct[lang].badge} {selectedProduct[lang].subcategory ? `/ ${selectedProduct[lang].subcategory}` : ''}</span>
                {selectedProduct.inOffer && (
                  <span className="bg-[#8B1C31] text-white text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm">{selectedProduct.discountRate || 'Offer'}</span>
                )}
              </div>
              <h2 className="font-serif text-3xl md:text-4xl text-[#3C101B] mb-3 leading-tight">{selectedProduct[lang].name}</h2>
              
              <div className="flex items-end gap-4 mb-8">
                {selectedProduct.inOffer && selectedProduct.offerPrice ? (
                  <>
                    <p className="text-3xl font-bold text-[#8B1C31]">{selectedProduct.offerPrice}</p>
                    <p className="text-lg font-medium text-gray-400 line-through pb-0.5">{selectedProduct.price}</p>
                  </>
                ) : (
                  <p className="text-2xl font-medium text-[#A28B55]">{selectedProduct.price}</p>
                )}
                {selectedProduct.stock !== undefined && (
                  <p className={`text-sm font-medium mb-1 ${selectedProduct.stock > 0 ? 'text-gray-500' : 'text-red-500'}`}>
                    {selectedProduct.stock > 0 ? `${selectedProduct.stock} in stock` : 'Out of stock'}
                  </p>
                )}
              </div>
              
              {selectedProduct.images && selectedProduct.images.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-[10px] uppercase tracking-widest text-[#3C101B]/50 mb-4 border-b border-[#3C101B]/10 pb-2">More Views</h4>
                  <div className="flex gap-3 overflow-x-auto pb-2 snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {selectedProduct.images.map((img, i) => (
                      <div key={i} className="w-20 aspect-[4/5] flex-shrink-0 bg-[#EAE5DB] snap-start cursor-pointer hover:opacity-80 transition-opacity rounded-md overflow-hidden" onClick={() => setSelectedProduct({...selectedProduct, image: img, images: [selectedProduct.image!, ...selectedProduct.images!.filter((_, idx) => idx !== i)]})}>
                        <img referrerPolicy="no-referrer" src={img} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedProduct[lang].description && (
                <div className="mb-8">
                  <h4 className="text-[10px] uppercase tracking-widest text-[#3C101B]/50 mb-4 border-b border-[#3C101B]/10 pb-2">Description</h4>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line font-medium">
                    {selectedProduct[lang].description}
                  </p>
                </div>
              )}

              {selectedProduct.colors && selectedProduct.colors.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-[10px] uppercase tracking-widest text-[#3C101B]/50 mb-4 border-b border-[#3C101B]/10 pb-2">Available Colors</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.colors.map((c, i) => (
                      <button 
                        key={i} 
                        onClick={() => setSelectedColor(c)}
                        className={`px-4 py-2 border rounded-md text-[11px] font-medium uppercase tracking-widest shadow-sm transition-colors ${selectedColor === c || (!selectedColor && i === 0) ? 'bg-[#3C101B] text-white border-[#3C101B]' : 'bg-white border-[#3C101B]/10 text-[#3C101B] hover:bg-[#3C101B]/5'}`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-auto pt-8">
                {selectedProduct.stock !== undefined && selectedProduct.stock <= 0 ? (
                  <button 
                    disabled
                    className="w-full bg-gray-300 text-gray-500 py-4 text-xs uppercase tracking-widest font-bold cursor-not-allowed shadow-inner"
                  >
                    Out of Stock
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      const colorToAdd = selectedProduct.colors && selectedProduct.colors.length > 0 
                        ? (selectedColor || selectedProduct.colors[0]) 
                        : undefined;
                      addToCart(selectedProduct, colorToAdd);
                      setSelectedProduct(null);
                      setSelectedColor('');
                    }}
                    className="w-full bg-[#3C101B] text-white py-4 text-xs uppercase tracking-widest font-bold hover:bg-[#2A0B13] transition-colors shadow-lg"
                  >
                    Add to Cart
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
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
                        {item.selectedColor && (
                          <p className="text-[10px] text-[#3C101B]/70 mb-1 uppercase tracking-widest">Color: {item.selectedColor}</p>
                        )}
                        <p className="text-[#A28B55] text-[11px] font-medium mb-2">{item.product.price}</p>
                        <div className="flex items-center gap-3">
                           <button 
                             onClick={() => setCart(cart.map(c => c.product.id === item.product.id && c.selectedColor === item.selectedColor ? { ...c, quantity: Math.max(1, c.quantity - 1) } : c))}
                             className="w-6 h-6 border border-[#3C101B]/20 flex items-center justify-center text-[#3C101B]"
                           >-</button>
                           <span className="text-[11px]">{item.quantity}</span>
                           <button 
                             onClick={() => {
                               if (item.product.stock !== undefined && item.quantity >= item.product.stock) {
                                 alert('Maximum stock reached');
                                 return;
                               }
                               setCart(cart.map(c => c.product.id === item.product.id && c.selectedColor === item.selectedColor ? { ...c, quantity: c.quantity + 1 } : c));
                             }}
                             className="w-6 h-6 border border-[#3C101B]/20 flex items-center justify-center text-[#3C101B]"
                           >+</button>
                           <button 
                             onClick={() => setCart(cart.filter(c => !(c.product.id === item.product.id && c.selectedColor === item.selectedColor)))}
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
                   onClick={async () => {
                     const orderText = cart.map(item => {
                       const colorStr = item.selectedColor ? ` - Color: ${item.selectedColor}` : '';
                       const price = item.product.inOffer && item.product.offerPrice ? item.product.offerPrice : item.product.price;
                       return `${item.quantity}x ${item.product[lang].name}${colorStr} (${price})`;
                     }).join('\\n');
                     const message = `Hello Shivgouri, I would like to order:\\n\\n${orderText}`;
                     const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
                     window.open(waLink, '_blank');
                     
                     try {
                       const { saveProduct } = await import('./firebase');
                       for (const item of cart) {
                         if (item.product.stock !== undefined && item.product.id) {
                           const newStock = Math.max(0, item.product.stock - item.quantity);
                           await saveProduct({ ...item.product, stock: newStock });
                           setProducts(prev => prev.map(p => p.id === item.product.id ? { ...p, stock: newStock } : p));
                         }
                       }
                       setCart([]);
                       setIsCartOpen(false);
                     } catch (e) {
                       console.error('Failed to update stock:', e);
                     }
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
      {/* Offer Popup */}
      {showOffer && offers.filter(o => o.isActive).length > 0 && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowOffer(false)}></div>
          <div className="relative bg-[#FAFAFA] w-full max-w-lg rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <button 
              onClick={() => setShowOffer(false)}
              className="absolute right-4 top-4 z-10 w-8 h-8 flex items-center justify-center bg-white/80 rounded-full text-[#3C101B] hover:bg-white transition-colors"
            >
              <X size={18} />
            </button>
            {offers.find(o => o.isActive)?.image && (
              <div className="w-full aspect-video bg-[#EAE5DB]">
                <img referrerPolicy="no-referrer" src={offers.find(o => o.isActive)?.image} alt="Offer" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-8 text-center">
              <span className="text-[10px] uppercase tracking-widest text-[#A28B55] mb-2 block font-bold">Special Offer</span>
              <h2 className="font-serif text-2xl md:text-3xl text-[#3C101B] mb-3 leading-tight">{offers.find(o => o.isActive)?.[lang].title}</h2>
              <p className="text-gray-600 mb-6 text-sm">{offers.find(o => o.isActive)?.[lang].description}</p>
              {offers.find(o => o.isActive)?.[lang].buttonText && (
                <button 
                  onClick={() => setShowOffer(false)}
                  className="bg-[#3C101B] text-white px-8 py-3 text-[11px] font-bold tracking-[0.2em] uppercase hover:bg-black transition-colors"
                >
                  {offers.find(o => o.isActive)?.[lang].buttonText}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
