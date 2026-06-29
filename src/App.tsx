/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
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

export default function App() {
  const [lang, setLang] = useState<'en' | 'kn'>('en');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  const [products, setProducts] = useState<Product[]>([]);

  const [categories, setCategories] = useState<import('./types').Category[]>([]);

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

  // Dynamic categories based on explicit categories or fallback to current products
  const englishBadges = categories.length > 0 
    ? categories.map(c => c.en) 
    : Array.from(new Set(products.map(p => p.en.badge).filter(Boolean)));
    
  const filterCategories = ['All', ...englishBadges];
  
  const filteredProducts = activeCategory === 'All' 
    ? products 
    : products.filter(p => p.en.badge === activeCategory);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-[#8B1C31] mb-6 animate-pulse">
          <path d="M12 2C8 6 4 11 4 16C4 20.418 7.582 24 12 24C16.418 24 20 20.418 20 16C20 11 16 6 12 2Z" fill="currentColor" opacity="0.1"/>
          <path d="M12 4.5C9.5 7.5 7 11.5 7 15.5C7 18.5 9.2 21 12 21C14.8 21 17 18.5 17 15.5C17 11.5 14.5 7.5 12 4.5Z" stroke="currentColor" strokeWidth="1.2"/>
          <path d="M10.5 11.5C10.5 10 11.5 9 12.5 9C13.5 9 14.5 10 14 11.5C13 14 10 14.5 10 17C10 18.5 11 19.5 12.5 19" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
        <div className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-medium animate-pulse">Loading / ಲೋಡ್ ಆಗುತ್ತಿದೆ...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-[#1a1a1a] selection:bg-[#8B1C31] selection:text-white">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#f0f0f0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex justify-between items-center h-16">
            {/* Mobile Menu Icon */}
            <div className="flex md:hidden items-center">
              <button className="text-[#1a1a1a] hover:opacity-50 transition-opacity">
                <Menu size={24} strokeWidth={1.5} />
              </button>
            </div>

            {/* Desktop Links (Left) */}
            <div className="hidden md:flex gap-8 items-center text-[10px] uppercase tracking-[0.2em] font-medium">
              <a href="#" className="text-[#1a1a1a] hover:opacity-50 transition-opacity">{t.nav.home}</a>
              <a href="#collection" className="text-[#1a1a1a] hover:opacity-50 transition-opacity">{t.nav.collection}</a>
            </div>

            {/* Logo (Center) */}
            <div className="flex-shrink-0 flex items-center justify-center">
              <a href="#" className="flex flex-col items-center justify-center group">
                {/* Abstract S-swirl/paisley icon inspired by the logo */}
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-[#8B1C31] mb-1 group-hover:scale-105 transition-transform duration-300">
                  <path d="M12 2C8 6 4 11 4 16C4 20.418 7.582 24 12 24C16.418 24 20 20.418 20 16C20 11 16 6 12 2Z" fill="currentColor" opacity="0.1"/>
                  <path d="M12 4.5C9.5 7.5 7 11.5 7 15.5C7 18.5 9.2 21 12 21C14.8 21 17 18.5 17 15.5C17 11.5 14.5 7.5 12 4.5Z" stroke="currentColor" strokeWidth="1.2"/>
                  <path d="M10.5 11.5C10.5 10 11.5 9 12.5 9C13.5 9 14.5 10 14 11.5C13 14 10 14.5 10 17C10 18.5 11 19.5 12.5 19" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
                <span className="font-logo text-xl tracking-[0.25em] font-medium text-[#8B1C31] uppercase">
                  Shivgouri
                </span>
              </a>
            </div>

            {/* Desktop Links & Icons (Right) */}
            <div className="flex items-center space-x-6">
              <div className="hidden md:flex gap-8 items-center mr-4 text-[10px] uppercase tracking-[0.2em] font-medium">
                <a href="#about" className="text-[#1a1a1a] hover:opacity-50 transition-opacity">{t.nav.about}</a>
                <a href="#contact" className="text-[#1a1a1a] hover:opacity-50 transition-opacity">{t.nav.contact}</a>
              </div>
              <button 
                onClick={() => setLang(lang === 'en' ? 'kn' : 'en')}
                className="flex items-center gap-1 text-[#8B1C31] hover:opacity-50 transition-opacity text-[10px] uppercase tracking-[0.1em] font-medium"
              >
                <Globe size={16} strokeWidth={1.5} />
                <span className="hidden sm:inline">{lang === 'en' ? 'ಕನ್ನಡ' : 'EN'}</span>
              </button>
              <button className="text-[#1a1a1a] hover:opacity-50 transition-opacity hidden sm:block">
                <Search size={20} strokeWidth={1.5} />
              </button>
              <button className="text-[#1a1a1a] hover:opacity-50 transition-opacity">
                <ShoppingBag size={20} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[600px] flex items-center justify-center bg-white overflow-hidden py-10">
        {/* Subtle background image/texture for the hero */}
        <div 
          className="absolute inset-0 opacity-20 mix-blend-multiply"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1584286595398-a59f21d313f5?auto=format&fit=crop&q=80&w=2000")',
            backgroundPosition: 'center',
            backgroundSize: 'cover'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/50 to-transparent" />
        
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto mt-20 flex flex-col items-center">
          <span className="text-[11px] font-medium tracking-[0.3em] uppercase text-gray-400 mb-6 block">{t.hero.pre}</span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif text-[#8B1C31] mb-6 leading-tight italic tracking-tight">
            {t.hero.title1} <br /> <span className="font-light">{t.hero.title2}</span>
          </h1>
          <p className="text-[11px] uppercase tracking-[0.3em] text-gray-400 max-w-xl mx-auto leading-relaxed mb-10">
            {t.hero.desc}
          </p>
          <div className="w-12 h-px bg-[#8B1C31] mb-10 opacity-30"></div>
          <a href="#collection" className="inline-flex items-center space-x-3 border-b-2 border-transparent pb-1 text-[10px] tracking-[0.2em] uppercase font-medium text-[#8B1C31] hover:opacity-50 transition-opacity">
            <span>{t.hero.explore}</span>
            <ArrowRight size={16} strokeWidth={1.5} />
          </a>
        </div>
      </section>

      {/* Product Grid (Saree Catalog) */}
      <section id="collection" className="py-24 sm:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 space-y-6 md:space-y-0">
            <div>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#8B1C31] mb-4 italic tracking-tight">{t.collection.title}</h2>
              <p className="text-[11px] uppercase tracking-[0.3em] text-gray-400 max-w-md leading-relaxed">{t.collection.desc}</p>
            </div>
            <a href="#" className="text-[10px] font-medium tracking-[0.2em] uppercase border-b border-[#f0f0f0] pb-1 hover:border-[#8B1C31] transition-colors text-[#8B1C31]">
              {t.collection.viewAll}
            </a>
          </div>

          {/* Category Slider */}
          {categories.length > 0 && (
            <div className="mb-16 max-w-xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-medium tracking-[0.2em] uppercase text-gray-500">Shop by Category</h3>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setCurrentCategoryIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentCategoryIndex === 0}
                    className="p-2 rounded-full border border-gray-200 disabled:opacity-50 hover:bg-gray-50 transition-colors"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button 
                    onClick={() => setCurrentCategoryIndex(prev => Math.min(categories.length - 1, prev + 1))}
                    disabled={currentCategoryIndex >= categories.length - 1}
                    className="p-2 rounded-full border border-gray-200 disabled:opacity-50 hover:bg-gray-50 transition-colors"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
              
              <div className="overflow-hidden rounded-2xl">
                <div 
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${currentCategoryIndex * 100}%)` }}
                >
                  {categories.map((cat, idx) => {
                    const isActive = activeCategory === cat.en;
                    return (
                      <div key={cat.id} className="min-w-full p-1">
                        <div 
                          onClick={() => {
                            setActiveCategory(cat.en);
                            document.getElementById('product-grid')?.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className={`relative aspect-video sm:aspect-[21/9] cursor-pointer group overflow-hidden rounded-xl border-4 transition-all ${isActive ? 'border-[#8B1C31]' : 'border-transparent hover:border-gray-200'}`}
                        >
                          {cat.image ? (
                            <img src={cat.image} alt={cat.en} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                          ) : (
                            <div className="w-full h-full bg-[#f8f6f2] flex items-center justify-center text-gray-300">
                              <ImageIcon size={48} className="stroke-[1]" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                          <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                            <div>
                              <span className="text-[10px] text-white/80 uppercase tracking-[0.2em] mb-2 block">Collection</span>
                              <h4 className="text-white text-2xl sm:text-3xl font-serif italic tracking-wide">{lang === 'en' ? cat.en : cat.kn}</h4>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                              <ArrowRight size={20} />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Current Active Category Pill */}
          <div id="product-grid" className="flex items-center justify-center gap-4 mb-12">
             <button
               onClick={() => setActiveCategory('All')}
               className={`text-[10px] font-medium tracking-[0.2em] uppercase transition-colors px-4 py-2 rounded-full border ${
                 activeCategory === 'All' ? 'bg-[#8B1C31] text-white border-[#8B1C31]' : 'bg-white text-gray-500 border-gray-200 hover:border-[#8B1C31]'
               }`}
             >
               {t.collection.filterAll}
             </button>
             {activeCategory !== 'All' && (
               <div className="flex items-center gap-2 text-[10px] font-medium tracking-[0.2em] uppercase px-4 py-2 rounded-full bg-[#8B1C31] text-white border border-[#8B1C31]">
                 <span>{lang === 'en' ? activeCategory : categories.find(c => c.en === activeCategory)?.kn || activeCategory}</span>
                 <button onClick={() => setActiveCategory('All')} className="hover:text-black/50 ml-2">
                   <X size={14} />
                 </button>
               </div>
             )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const pData = product[lang];
              const message = `Hello Shivgouri, I am interested in purchasing the ${pData.name} (${product.price}). Is it currently available in stock?`;
              const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;

              return (
                <div key={product.id} className="group flex flex-col cursor-pointer">
                  {/* Image Container */}
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#f8f6f2] border border-[#f0f0f0] mb-4 flex items-center justify-center">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={pData.name}
                        className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-in-out"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <ShoppingBag size={48} className="stroke-[1]" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className="text-[8px] tracking-widest uppercase bg-white px-2 py-1 border border-gray-100 text-[#8B1C31] font-medium">
                        {pData.badge}
                      </span>
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="flex flex-col flex-grow">
                    <h3 className="text-[12px] font-serif text-[#1a1a1a] mb-1">{pData.name}</h3>
                    <p className="text-[11px] text-gray-500 mb-4">{product.price}</p>
                    
                    <div className="mt-auto">
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full bg-[#8B1C31] text-white text-[9px] uppercase tracking-[0.2em] py-3 text-center transition-all hover:bg-[#6A1525]"
                      >
                        {t.collection.orderBtn}
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* About Teaser */}
      <section id="about" className="py-24 bg-[#f8f6f2] border-t border-[#f0f0f0]">
        <div className="max-w-4xl mx-auto px-4 text-center flex flex-col items-center">
          <h2 className="font-serif text-3xl mb-8 italic tracking-tight text-[#8B1C31]">{t.about.title}</h2>
          <p className="text-[11px] uppercase tracking-[0.3em] text-gray-500 max-w-2xl mx-auto leading-relaxed mb-8">
            {t.about.desc}
          </p>
          <div className="w-12 h-px bg-[#8B1C31] mb-8 opacity-30"></div>
          <img 
            src="https://images.unsplash.com/photo-1605705663782-b7bce3e8d9b1?auto=format&fit=crop&q=80&w=1200" 
            alt="Weaving process" 
            className="w-full h-64 object-cover object-center mb-0 border border-[#f0f0f0]"
          />
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-white border-t border-[#f0f0f0] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-8 md:space-y-0">
            <div className="text-center md:text-left flex flex-col items-center md:items-start">
              <span className="font-logo text-xl tracking-[0.25em] uppercase text-[#8B1C31] mb-4">Shivgouri</span>
              <a href="https://maps.app.goo.gl/Xmbb7zuQgSnhyt58A" target="_blank" rel="noopener noreferrer" className="text-[10px] uppercase tracking-[0.15em] text-gray-400 mb-2 hover:text-[#8B1C31] transition-colors text-center md:text-left">
                {t.footer.address}<br/>{t.footer.city}
              </a>
            </div>
            
            <div className="text-center md:text-right max-w-sm">
              <p className="text-[10px] uppercase tracking-[0.15em] text-gray-400 italic leading-relaxed">
                {t.footer.visit}
              </p>
            </div>
          </div>
          
          <div className="mt-16 pt-8 border-t border-[#f0f0f0] flex flex-col sm:flex-row justify-between items-center space-y-6 sm:space-y-0">
            <p className="text-[10px] uppercase tracking-[0.15em] text-gray-400">&copy; {new Date().getFullYear()} Shivgouri. {t.footer.rights}</p>
            <div className="flex space-x-8 text-[10px] uppercase tracking-[0.15em] text-gray-400 font-medium items-center">
              <a href="https://www.instagram.com/shivgouri_silksarees_gokak?igsh=MXRibXhja3AwbmZhNQ==" target="_blank" rel="noopener noreferrer" className="hover:opacity-50 transition-opacity">Instagram</a>
              <button onClick={() => setIsAdminOpen(true)} className="hover:text-[#8B1C31] transition-colors ml-4" title="Admin Login">
                <Lock size={12} strokeWidth={2} />
              </button>
            </div>
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
    </div>
  );
}
