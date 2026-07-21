/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { Menu, ShoppingBag, ArrowRight, Globe, Lock, ChevronLeft, ChevronRight, ImageIcon, X, Share, ShieldCheck, RefreshCcw, Truck, Phone, Search, Star, Home, ArrowUp, Sun, Moon, Mail, MapPin, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, Offer, Order } from './types';
const AdminPanel = lazy(() => import('./components/AdminPanel'));
import LoginModal from './components/LoginModal';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { fetchProducts, fetchCategories, fetchOffers, saveProduct, saveCategory, saveOffer, saveOrder } from './firebase';

const content = {
  en: {
    nav: { home: 'Home', collection: 'Collection', about: 'About', contact: 'Contact' },
    hero: { pre: 'Celebrate the', title1: 'Essence of', title2: 'Womanhood', desc: 'with Timeless Fashion', explore: 'Shop Collection' },
    collection: { title: 'The Shivgouri Collection', desc: 'Our curated selection of premium silks, organzas, and cottons, ethically sourced directly from master weavers.', viewAll: 'View All', orderBtn: 'Order Now', filterAll: 'All' },
    about: { title: 'Our Heritage', desc: 'Shivgouri is more than a boutique; it is an homage to the intricate craftsmanship of generations past. Every thread we select is a testament to the unparalleled skill of our artisans.' },
    footer: { address: 'Shivgouri Silk Sarees', city: 'Gokak, Karnataka', visit: 'Visit our physical store to experience the textures in person, or order directly online via our dedicated WhatsApp concierge.', rights: 'All rights reserved.' },
    checkout: { title: 'Before you checkout', rule1: 'Parcel opening video is strictly required for any claims.', rule2: ['Please enter correct address and number. ', '₹70 extra charge', ' if details are wrong.'], rule3: 'Check the size properly before ordering.', rule4: 'Please read our return and exchange policy before placing the order.', btn: 'Confirm and Checkout' },
    daily: { tag: 'Limited Time', title: 'Daily Exclusives', desc: 'Special selections for today. These pieces are available at exclusive prices for a limited time.' },
    curation: { title: 'Not everything woven deserves to be worn.', desc: 'For generations, we have chosen — so you never have to settle.', tag: 'this is curation, not commerce.' },
    collectionSection: { tag: 'The Noteworthy', title: 'Shivgouri by Signatures', desc: 'Lustrous silks, intricate zari — every piece chosen at the source and held to one standard. Finest. Reserved and preserved.' },
    gallery: { tag: 'Visit the Gallery', title: 'Experience the legacy of Shivgouri.' },
    newsletter: { tag: 'Subscribe to our emails', title: 'Join Our Journey', desc: 'Be the first to explore special offers, exclusive discounts, and all our latest updates.', btn: 'Subscribe' },
    cart: { title: 'Your Cart', empty: 'Your cart is empty', checkout: 'Proceed to Checkout', total: 'Total' },
    emptyProducts: 'No products found in this category.'
  },
  kn: {
    nav: { home: 'ಮುಖಪುಟ', collection: 'ಸಂಗ್ರಹ', about: 'ಬಗ್ಗೆ', contact: 'ಸಂಪರ್ಕ' },
    hero: { pre: 'ಆಚರಿಸಿ', title1: 'ಸ್ತ್ರೀತ್ವದ', title2: 'ಸಾರವನ್ನು', desc: 'ಸಮಯಾತೀತ ಫ್ಯಾಷನ್‌ನೊಂದಿಗೆ', explore: 'ಸಂಗ್ರಹ ಖರೀದಿಸಿ' },
    collection: { title: 'ಶಿವಗೌರಿ ಸಂಗ್ರಹ', desc: 'ನುರಿತ ನೇಕಾರರಿಂದ ನೇರವಾಗಿ ಪಡೆದ ಪ್ರೀಮಿಯಂ ರೇಷ್ಮೆ, ಆರ್ಗನ್ಜಾ ಮತ್ತು ಕಾಟನ್‌ಗಳ ನಮ್ಮ ವಿಶೇಷ ಆಯ್ಕೆ.', viewAll: 'ಎಲ್ಲ ವೀಕ್ಷಿಸಿ', orderBtn: 'ಈಗಲೇ ಆರ್ಡರ್ ಮಾಡಿ', filterAll: 'ಎಲ್ಲ' },
    about: { title: 'ನಮ್ಮ ಪರಂಪರೆ', desc: 'ಶಿವಗೌರಿ ಕೇವಲ ಒಂದು ಮಳಿಗೆಯಲ್ಲ; ಇದು ಹಿಂದಿನ ತಲೆಮಾರುಗಳ ಸಂಕೀರ್ಣ ಕರಕುಶಲತೆಗೆ ಸಲ್ಲಿಸುವ ಗೌರವ. ನಾವು ಆಯ್ಕೆ ಮಾಡುವ ಪ್ರತಿಯೊಂದು ದಾರವೂ ನಮ್ಮ ಕುಶಲಕರ್ಮಿಗಳ ಅಪ್ರತಿಮ ಕೌಶಲ್ಯಕ್ಕೆ ಸಾಕ್ಷಿಯಾಗಿದೆ.' },
    footer: { address: 'ಶಿವಗೌರಿ ಸಿಲ್ಕ್ ಸೀರೆಗಳು', city: 'ಗೋಕಾಕ್, ಕರ್ನಾಟಕ', visit: 'ಬಟ್ಟೆಗಳನ್ನು ಖುದ್ದಾಗಿ ನೋಡಲು ನಮ್ಮ ಮಳಿಗೆಗೆ ಭೇಟಿ ನೀಡಿ, ಅಥವಾ ವಾಟ್ಸಾಪ್ ಮೂಲಕ ನೇರವಾಗಿ ಆನ್‌ಲೈನ್‌ನಲ್ಲಿ ಆರ್ಡರ್ ಮಾಡಿ.', rights: 'ಎಲ್ಲ ಹಕ್ಕುಗಳನ್ನು ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ.' },
    checkout: { title: 'ನೀವು ಚೆಕ್ ಔಟ್ ಮಾಡುವ ಮೊದಲು', rule1: 'ಯಾವುದೇ ಕ್ಲೈಮ್‌ಗಳಿಗಾಗಿ ಪಾರ್ಸೆಲ್ ತೆರೆಯುವ ವೀಡಿಯೊ ಕಡ್ಡಾಯವಾಗಿದೆ.', rule2: ['ದಯವಿಟ್ಟು ಸರಿಯಾದ ವಿಳಾಸ ಮತ್ತು ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ. ವಿವರಗಳು ತಪ್ಪಾಗಿದ್ದರೆ ', '₹70 ಹೆಚ್ಚುವರಿ ಶುಲ್ಕ', '.'], rule3: 'ಆರ್ಡರ್ ಮಾಡುವ ಮೊದಲು ಗಾತ್ರವನ್ನು ಸರಿಯಾಗಿ ಪರಿಶೀಲಿಸಿ.', rule4: 'ಆರ್ಡರ್ ಮಾಡುವ ಮೊದಲು ದಯವಿಟ್ಟು ನಮ್ಮ ರಿಟರ್ನ್ ಮತ್ತು ಎಕ್ಸ್‌ಚೇಂಜ್ ಪಾಲಿಸಿಯನ್ನು ಓದಿ.', btn: 'ಖಚಿತಪಡಿಸಿ ಮತ್ತು ಚೆಕ್‌ಔಟ್ ಮಾಡಿ' },
    daily: { tag: 'ಸೀಮಿತ ಸಮಯ', title: 'ದೈನಂದಿನ ವಿಶೇಷಗಳು', desc: 'ಇಂದಿನ ವಿಶೇಷ ಆಯ್ಕೆಗಳು. ಇವು ಸೀಮಿತ ಸಮಯದವರೆಗೆ ವಿಶೇಷ ಬೆಲೆಯಲ್ಲಿ ಲಭ್ಯವಿದೆ.' },
    curation: { title: 'ನೇಯ್ದ ಪ್ರತಿಯೊಂದೂ ಧರಿಸಲು ಯೋಗ್ಯವಾಗಿರುವುದಿಲ್ಲ.', desc: 'ತಲೆಮಾರುಗಳಿಂದ ನಾವು ಆಯ್ಕೆ ಮಾಡಿದ್ದೇವೆ — ಆದ್ದರಿಂದ ನೀವು ಎಂದಿಗೂ ರಾಜಿಯಾಗಬೇಕಾಗಿಲ್ಲ.', tag: 'ಇದು ಕ್ಯುರೇಶನ್, ವ್ಯಾಪಾರವಲ್ಲ.' },
    collectionSection: { tag: 'ಗಮನಾರ್ಹವಾದವು', title: 'ಶಿವಗೌರಿಯ ಸಿಗ್ನೇಚರ್ಸ್', desc: 'ಹೊಳಪಿನ ರೇಷ್ಮೆ, ಸಂಕೀರ್ಣ ಜರಿ — ಪ್ರತಿಯೊಂದು ತುಣುಕನ್ನು ಮೂಲದಲ್ಲಿಯೇ ಆಯ್ಕೆಮಾಡಿ ಮತ್ತು ಒಂದೇ ಗುಣಮಟ್ಟಕ್ಕೆ ಒಳಪಡಿಸಲಾಗಿದೆ. ಅತ್ಯುತ್ತಮವಾದವು.' },
    gallery: { tag: 'ಗ್ಯಾಲರಿಗೆ ಭೇಟಿ ನೀಡಿ', title: 'ಶಿವಗೌರಿಯ ಪರಂಪರೆಯನ್ನು ಅನುಭವಿಸಿ.' },
    newsletter: { tag: 'ನಮ್ಮ ಇಮೇಲ್‌ಗಳಿಗೆ ಚಂದಾದಾರರಾಗಿ', title: 'ನಮ್ಮ ಪ್ರಯಾಣದಲ್ಲಿ ಸೇರಿಕೊಳ್ಳಿ', desc: 'ವಿಶೇಷ ಕೊಡುಗೆಗಳು, ರಿಯಾಯಿತಿಗಳು ಮತ್ತು ನಮ್ಮ ಇತ್ತೀಚಿನ ನವೀಕರಣಗಳನ್ನು ಮೊದಲು ಅನ್ವೇಷಿಸಲು ಚಂದಾದಾರರಾಗಿ.', btn: 'ಚಂದಾದಾರರಾಗಿ' },
    cart: { title: 'ನಿಮ್ಮ ಕಾರ್ಟ್', empty: 'ನಿಮ್ಮ ಕಾರ್ಟ್ ಖಾಲಿಯಾಗಿದೆ', checkout: 'ಚೆಕ್ಔಟ್', total: 'ಒಟ್ಟು' },
    emptyProducts: 'ಈ ವಿಭಾಗದಲ್ಲಿ ಯಾವುದೇ ಉತ್ಪನ್ನಗಳು ಕಂಡುಬಂದಿಲ್ಲ.'
  },
  hi: {
    nav: { home: 'होम', collection: 'संग्रह', about: 'हमारे बारे में', contact: 'संपर्क' },
    hero: { pre: 'मनाएं', title1: 'नारीत्व का', title2: 'सार', desc: 'कालातीत फैशन के साथ', explore: 'संग्रह खरीदें' },
    collection: { title: 'शिवगौरी संग्रह', desc: 'हमारे मास्टर बुनकरों से सीधे नैतिक रूप से प्राप्त प्रीमियम रेशम, ऑर्गेना, और कपास का विशेष चयन।', viewAll: 'सभी देखें', orderBtn: 'अभी ऑर्डर करें', filterAll: 'सभी' },
    about: { title: 'हमारी विरासत', desc: 'शिवगौरी एक बुटीक से कहीं अधिक है; यह पिछली पीढ़ियों की जटिल शिल्प कौशल को एक श्रद्धांजलि है। हमारे द्वारा चुना गया प्रत्येक धागा हमारे कारीगरों के अद्वितीय कौशल का प्रमाण है।', },
    footer: { address: 'शिवगौरी सिल्क साड़ी', city: 'गोकक, कर्नाटक', visit: 'बनावट का व्यक्तिगत रूप से अनुभव करने के लिए हमारे स्टोर पर आएं, या हमारे समर्पित WhatsApp के माध्यम से सीधे ऑनलाइन ऑर्डर करें।', rights: 'सभी अधिकार सुरक्षित।' },
    checkout: { title: 'चेकआउट करने से पहले', rule1: 'किसी भी दावे के लिए पार्सल खोलने का वीडियो सख्त रूप से आवश्यक है।', rule2: ['कृपया सही पता और नंबर दर्ज करें। यदि विवरण गलत हैं तो ', '₹70 अतिरिक्त शुल्क', '।'], rule3: 'ऑर्डर करने से पहले आकार की ठीक से जांच करें।', rule4: 'कृपया ऑर्डर देने से पहले हमारी रिटर्न और एक्सचेंज नीति पढ़ें।', btn: 'पुष्टि करें और चेकआउट करें' },
    daily: { tag: 'सीमित समय', title: 'दैनिक विशेष', desc: 'आज के लिए विशेष चयन। ये पीस सीमित समय के लिए विशेष कीमतों पर उपलब्ध हैं।' },
    curation: { title: 'बुनी हुई हर चीज़ पहनने लायक नहीं होती।', desc: 'पीढ़ियों से, हमने चुना है - ताकि आपको कभी समझौता न करना पड़े।', tag: 'यह क्युरेशन है, वाणिज्य नहीं।' },
    collectionSection: { tag: 'उल्लेखनीय', title: 'शिवगौरी सिग्नेचर्स', desc: 'चमकदार रेशम, जटिल ज़री — हर एक पीस को स्रोत पर चुना गया और एक ही मानक पर रखा गया। बेहतरीन।' },
    gallery: { tag: 'गैलरी में आएं', title: 'शिवगौरी की विरासत का अनुभव करें।' },
    newsletter: { tag: 'हमारे ईमेल की सदस्यता लें', title: 'हमारी यात्रा में शामिल हों', desc: 'विशेष प्रस्तावों, अनन्य छूटों और हमारे सभी नवीनतम अपडेटों का पता लगाने वाले पहले व्यक्ति बनें।', btn: 'सदस्यता लें' },
    cart: { title: 'आपका कार्ट', empty: 'आपका कार्ट खाली है', checkout: 'चेकआउट के लिए आगे बढ़ें', total: 'कुल' },
    emptyProducts: 'इस श्रेणी में कोई उत्पाद नहीं मिला।'
  }
};

type CartItem = { product: Product; quantity: number; selectedColor?: string };

const formatDiscount = (d: string | undefined) => {
  if (!d) return '';
  let val = d.trim();
  if (val.toLowerCase().includes('off')) {
    val = val.replace(/off/i, '').trim();
    return val.includes('%') ? `${val} OFF` : `${val}% OFF`;
  }
  return val.includes('%') ? val : `${val}%`;
};

const formatPrice = (p: string | undefined) => {
  if (!p) return '';
  return p.includes('₹') ? p : `₹${p}`;
};

export default function App() {
  const [lang, setLang] = useState<'en' | 'kn' | 'hi'>('en');
  const [addingToCartState, setAddingToCartState] = useState<'idle' | 'adding' | 'added'>('idle');
  const [flyingItem, setFlyingItem] = useState<{ id: string, image: string, startX: number, startY: number, endX: number, endY: number } | null>(null);
  const [cartBump, setCartBump] = useState(false);
  
  const [toastMessage, setToastMessage] = useState<{show: boolean, msg: string}>({show: false, msg: ''});
  const showToast = (msg: string) => {
    setToastMessage({show: true, msg});
    setTimeout(() => setToastMessage({show: false, msg: ''}), 4000);
  };
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [user, setUser] = React.useState<any>(null);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        const mockUser = localStorage.getItem('mock_user');
        if (mockUser) {
          setUser(JSON.parse(mockUser));
        } else {
          setUser(null);
        }
      }
    });
    return () => unsubscribe();
  }, []);
  const [activeSection, setActiveSection] = useState<string>('Saree');
  const [searchQuery, setSearchQuery] = useState('');
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
  const [showCheckoutWarning, setShowCheckoutWarning] = useState(false);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [customerDetails, setCustomerDetails] = useState({ name: '', mobileNumber: '', alternateNumber: '', address: '', landmark: '', city: '', district: '', pincode: '' });
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);

  useEffect(() => {
    if (selectedProduct?.reviews && selectedProduct.reviews.length > 1) {
      const timer = setInterval(() => {
        setCurrentReviewIndex((prev) => (prev + 1) % selectedProduct.reviews.length);
      }, 3000);
      return () => clearInterval(timer);
    }
  }, [selectedProduct]);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        const fetchedCats = await fetchCategories();
        const fetchedProds = await fetchProducts();
        const fetchedOffers = await fetchOffers();
        
        fetchedCats.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
        fetchedProds.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
        
        setCategories(fetchedCats);
        setProducts(fetchedProds);
        setOffers(fetchedOffers);
        
        if (fetchedOffers.some(o => o.isActive)) {
          setTimeout(() => setShowOffer(true), 2000);
        }

        const params = new URLSearchParams(window.location.search);
        const sharedProductId = params.get('product');
        if (sharedProductId) {
          const sharedProduct = fetchedProds.find(p => String(p.id) === sharedProductId);
          if (sharedProduct) {
            setSelectedProduct(sharedProduct);
          }
        }
      } catch (err) {
        console.error("Error loading data from localStorage:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const waNumber = '918329732432';

  const t = content[lang];

  const handleSubmitReview = async () => {
    if (!selectedProduct || !reviewName.trim() || !reviewText.trim()) return;
    const newReview = {
      id: Date.now().toString(),
      name: reviewName,
      rating: reviewRating,
      text: reviewText,
      date: Date.now()
    };
    const updatedProduct = {
      ...selectedProduct,
      reviews: [...(selectedProduct.reviews || []), newReview]
    };
    try {
      const { saveProduct } = await import('./firebase');
      await saveProduct(updatedProduct);
      setSelectedProduct(updatedProduct);
      setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
      setReviewName('');
      setReviewText('');
      setReviewRating(5);
    } catch (e) {
      console.error("Error saving review", e);
      alert("Failed to save review");
    }
  };

  const handleCheckout = () => {
    setShowCheckoutWarning(false);
    setShowCheckoutForm(true);
  };

  const processToPayment = () => {
    if (!customerDetails.name || !customerDetails.mobileNumber || !customerDetails.address || !customerDetails.city || !customerDetails.district || !customerDetails.pincode) {
      alert("Please fill all mandatory fields (Name, Mobile, Address, City, District, Pincode).");
      return;
    }
    setShowPaymentOptions(true);
  };

    const submitOrder = async (paymentMethod: 'cod' | 'online') => {
    const totalAmount = cart.reduce((total, item) => {
      const price = (item.product.inOffer || item.product.isDailyOffer) && item.product.offerPrice ? item.product.offerPrice : item.product.price;
      const parsedPrice = parseInt(String(price).replace(/\D/g, ''), 10) || 0;
      return total + (parsedPrice * item.quantity);
    }, 0);

    const handleSuccess = async (method: 'cod' | 'online') => {
      try {
        const orderData = {
          customerDetails,
          products: cart.map(item => ({
            productId: item.product.id,
            name: item.product.en?.name,
            price: (item.product.inOffer || item.product.isDailyOffer) && item.product.offerPrice ? item.product.offerPrice : item.product.price,
            quantity: item.quantity,
            color: item.selectedColor
          })),
          totalAmount,
          status: 'pending' as const,
          paymentMethod: method,
          createdAt: Date.now()
        };

        const { saveOrder, saveProduct } = await import('./firebase');
        await saveOrder(orderData);

        for (const item of cart) {
          if (item.product.stock !== undefined && item.product.id) {
            const newStock = Math.max(0, item.product.stock - item.quantity);
            await saveProduct({ ...item.product, stock: newStock });
            setProducts(prev => prev.map(p => p.id === item.product.id ? { ...p, stock: newStock } : p));
          }
        }

        setCart([]);
        setCustomerDetails({ name: '', mobileNumber: '', alternateNumber: '', address: '', landmark: '', city: '', district: '', pincode: '' });
        setShowCheckoutForm(false);
        setIsCartOpen(false);
        setShowPaymentOptions(false);
        setShowOrderSuccess(true);
      } catch (e: any) {
        console.error(e);
        alert(e.message || 'Error saving order, please contact support.');
      }
    };

    if (paymentMethod === 'online') {
      try {
        const res = await fetch('/api/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: totalAmount * 100, currency: 'INR' })
        });
        
        if (!res.ok) {
          throw new Error('Failed to create Razorpay order. Backend is likely not running or misconfigured.');
        }

        const data = await res.json();
        const options = {
          key: data.key_id || import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: data.amount,
          currency: data.currency,
          name: 'Shivgouri Silk Sarees',
          description: 'Order Payment',
          order_id: data.order_id,
          handler: async function (response: any) {
            try {
              const verifyRes = await fetch('/api/verify-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(response)
              });
              const verifyData = await verifyRes.json();
              
              if (verifyData.success) {
                await handleSuccess('online');
              } else {
                alert('Payment verification failed. If money was deducted, please contact support.');
              }
            } catch (err) {
              console.error(err);
              alert('Error verifying payment.');
            }
          },
          prefill: {
            name: customerDetails.name,
            contact: customerDetails.mobileNumber,
          },
          theme: {
            color: '#3C101B'
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response: any){
          alert('Payment failed: ' + response.error.description);
        });
        rzp.open();
      } catch (err: any) {
        console.error(err);
        alert(err.message || 'Error initiating online payment.');
      }
    } else {
      await handleSuccess('cod');
    }
  };

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
    : Array.from(new Set(products.map(p => p.en?.badge).filter(Boolean)));
    
  const filterCategories = ['All', ...englishBadges];
  
  const heroCategories = categories.length > 0 
    ? categories 
    : Array.from(new Set(products.map(p => p.en?.badge).filter(Boolean))).map((badge, idx) => {
        const prod = products.find(p => p.en?.badge === badge);
        return {
          id: `fallback-${idx}`,
          en: badge,
          kn: prod?.kn?.badge || badge,
          image: prod?.image || prod?.images?.[0] || '',
          section: 'Saree'
        };
      });

  const filteredCategories = categories.length > 0 
    ? categories.filter(c => (c.section || 'Saree') === activeSection)
    : heroCategories.filter(c => c.section === activeSection);
  
  const filteredProducts = products.filter(p => {
    const pCat = categories.find(c => c.en === p.en?.badge);
    const pSection = pCat?.section || 'Saree';
    
    const matchesSection = pSection === activeSection;
    const matchesCategory = activeCategory === 'All' || p.en?.badge === activeCategory;
    const matchesSubcategory = activeSubcategory === 'All' || p.en?.subcategory === activeSubcategory;
    
    let matchesSearch = true;
    if (searchQuery.trim() !== '') {
      const lowerQuery = searchQuery.toLowerCase();
      const nameMatches = p.en?.name?.toLowerCase().includes(lowerQuery) || p.hi?.name?.toLowerCase().includes(lowerQuery) || p.kn?.name?.toLowerCase().includes(lowerQuery);
      const fabricMatches = p.en?.fabric?.toLowerCase().includes(lowerQuery) || p.hi?.fabric?.toLowerCase().includes(lowerQuery) || p.kn?.fabric?.toLowerCase().includes(lowerQuery);
      const colorMatches = p.colors?.some(c => c.toLowerCase().includes(lowerQuery));
      matchesSearch = !!(nameMatches || fabricMatches || colorMatches);
    }

    return matchesSection && matchesCategory && matchesSubcategory && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center">
        <div className="relative w-20 h-20 mb-8">
          <div className="absolute inset-0 rounded-full border-t-2 border-[var(--accent-secondary)] animate-slow-spin"></div>
          <div className="absolute inset-2 rounded-full border-b-2 border-[#CBA135] animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
          <div className="absolute inset-0 flex items-center justify-center">
             <img src="/logo.jpg" alt="Logo" className="w-12 h-12 object-contain rounded-full " />
          </div>
        </div>
        <div className="skeleton h-4 w-48 mb-3 opacity-60"></div>
        <div className="skeleton h-3 w-32 opacity-40"></div>
        <div className="mt-8 text-[11px] uppercase tracking-[0.25em] text-[var(--accent-secondary)] font-bold animate-pulse text-center">
           Loading Collection<br/><span className="text-gray-500 font-medium text-[9px] mt-1 block">Please wait</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] font-sans text-[var(--text-primary)] selection:bg-[var(--bg-dark)] selection:text-white overflow-x-hidden">
      {toastMessage.show && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] bg-[var(--bg-dark)] text-white px-6 py-3 rounded-md shadow-2xl animate-in fade-in slide-in-from-top-4 flex items-center gap-3">
          <ShieldCheck size={18} className="text-[var(--accent)]" />
          <span className="text-xs uppercase tracking-widest font-medium">{toastMessage.msg}</span>
        </div>
      )}
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-[100] bg-[var(--bg-dark)] text-white w-full transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          {/* Top row */}
          <div className="flex justify-between items-center h-16 relative">
            <div className="flex-1 flex items-center justify-start">
              <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden text-white hover:opacity-50 transition-opacity">
                <Menu size={24} strokeWidth={1.5} />
              </button>
            </div>
            
            {/* Logo */}
            <div className="absolute left-1/2 -translate-x-1/2 flex justify-center text-center transition-opacity opacity-100">
              <a href="#" className="flex items-center gap-2 group">
                <span className="font-serif text-2xl tracking-[0.15em] font-medium text-white uppercase whitespace-nowrap">
                  SHIVGOURI
                </span>
              </a>
            </div>

            {/* Right Icons */}
            <div className="flex-1 flex items-center justify-end gap-3 sm:gap-6 text-[10px] sm:text-[11px] uppercase tracking-widest">
              <a href="https://www.instagram.com/shivgouri_silksarees_gokak" target="_blank" rel="noopener noreferrer" className="hidden lg:flex items-center gap-2 hover:opacity-70 transition-opacity font-medium">
                INSTAGRAM
              </a>
              {user ? (
                <button onClick={() => {
                    localStorage.removeItem('mock_user');
                    signOut(auth);
                    setUser(null);
                  }} className="hidden sm:block hover:opacity-70 transition-opacity font-medium">Logout</button>
              ) : (
                <button onClick={() => setIsLoginOpen(true)} className="hidden sm:block hover:opacity-70 transition-opacity font-medium">Login</button>
              )}
              <div className="hidden sm:flex items-center gap-2 font-medium">
                
                <button onClick={() => setLang('en')} className={`hover:opacity-70 transition-opacity ${lang === 'en' ? 'text-white' : 'text-white/50'}`}>EN</button>
                <span className="text-white/30">|</span>
                <button onClick={() => setLang('hi')} className={`hover:opacity-70 transition-opacity ${lang === 'hi' ? 'text-white' : 'text-white/50'}`}>HI</button>
                <span className="text-white/30">|</span>
                <button onClick={() => setLang('kn')} className={`hover:opacity-70 transition-opacity ${lang === 'kn' ? 'text-white' : 'text-white/50'}`}>KN</button>
              </div>
              <button id="cart-icon-nav" onClick={() => setIsCartOpen(true)} className={`hover:opacity-70 transition-opacity flex items-center gap-2 relative font-medium ${cartBump ? 'scale-125 transition-transform duration-300' : 'scale-100 transition-transform duration-300'}`}>
                <ShoppingBag size={18} strokeWidth={1.5} />
                <span className="hidden sm:inline">({cart.length})</span>
                {cart.length > 0 && <span className="sm:hidden absolute -top-1 -right-1 bg-white text-[var(--text-primary)] text-[8px] font-bold w-3.5 h-3.5 flex items-center justify-center rounded-full">{cart.length}</span>}
              </button>
            </div>
          </div>
          
          {/* Bottom Nav Links */}
          <div className="hidden md:flex justify-center items-center gap-8 pb-4 pt-1 text-[11px] uppercase tracking-widest font-medium text-white/90">
             <button onClick={() => {setActiveCategory('All'); document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' });}} className="hover:text-white transition-colors">All</button>
             {categories.slice(0, 4).map(cat => (
               <button 
                 key={cat.id} 
                 onClick={() => {
                   setActiveCategory(cat.en);
                   document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' });
                 }}
                 className="hover:text-white transition-colors"
               >
                 {cat.en}
               </button>
             ))}
             <button className="hover:text-white transition-colors ml-4">ABOUT</button>
             <button className="hover:text-white transition-colors">CONTACT</button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="relative w-[80%] max-w-sm bg-[var(--bg-dark)] h-full flex flex-col p-6 animate-in slide-in-from-left duration-300">
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute right-4 top-4 text-white hover:opacity-50"
            >
              <X size={24} />
            </button>
            <img src="/logo.jpg" alt="Shivgouri Logo" className="h-12 object-contain mb-12 mt-4" />
            <div className="flex flex-col gap-6 text-white text-sm uppercase tracking-widest">
              <a href="#" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[var(--accent)] transition-colors">{t.nav.home}</a>
              <a href="#collection" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[var(--accent)] transition-colors">{t.nav.collection}</a>
              <a href="#about" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[var(--accent)] transition-colors">{t.nav.about}</a>
              <a href="#contact" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[var(--accent)] transition-colors">{t.nav.contact}</a>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative w-full min-h-[85vh] bg-[#C5BBAC] flex items-center overflow-hidden pt-16">
        {/* Desktop Image */}
        <div className="absolute right-0 top-0 w-full md:w-1/2 h-full hidden md:block">
           <img src="/853180.jpg" alt="Shivgouri Woman" className="w-full h-full object-cover object-[center_15%]" />
           <div className="absolute inset-0 bg-gradient-to-r from-[#C5BBAC] via-transparent to-transparent" />
        </div>
        
        {/* Mobile Image */}
        <div className="absolute inset-0 w-full h-full block md:hidden">
           <img src="/853180.jpg" alt="Shivgouri Elegance" className="w-full h-full object-cover object-[65%_top]" />
           <div className="absolute inset-0 bg-gradient-to-t from-[#C5BBAC]/80 via-transparent to-[#C5BBAC]/50" />
           <div className="absolute inset-0 bg-[#C5BBAC]/20" />
        </div>
        
        <div className="max-w-7xl mx-auto px-6 sm:px-6 lg:px-12 w-full relative z-10 flex flex-col md:flex-row items-center">
           <div className="w-full md:w-[60%] text-left pt-12 md:pt-0 pb-16 md:pb-0">
             <p className="text-2xl sm:text-4xl font-serif text-[var(--text-primary)] mb-2 tracking-wide">
               {t.hero.pre}
             </p>
             <h1 className="font-serif text-5xl sm:text-7xl lg:text-[8rem] text-[var(--text-primary)] mb-6 leading-[1.05]">
               {t.hero.title1}<br/>{t.hero.title2}
             </h1>
             <p className="text-lg sm:text-3xl text-[var(--text-primary)] mb-8 font-serif tracking-wide">
               {t.hero.desc}
             </p>
             <button 
               onClick={() => document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' })}
               className="bg-[var(--bg-dark)] text-white px-8 py-4 rounded-full text-[11px] uppercase tracking-[0.15em] font-bold hover:bg-black transition-all duration-300 shadow-lg inline-flex hover:scale-105 active:scale-95"
             >
               {t.hero.explore}
             </button>
           </div>
        </div>
      </section>

      {/* Offer Announcement Bar */}
      {offers.filter(o => o.isActive).length > 0 && (
        <div className="bg-[var(--accent-secondary)] text-white overflow-hidden py-3 border-y border-[var(--text-primary)]/20 shadow-inner">
          <div className="whitespace-nowrap animate-marquee flex items-center gap-8 w-max">
            {[...offers.filter(o => o.isActive), ...offers.filter(o => o.isActive), ...offers.filter(o => o.isActive), ...offers.filter(o => o.isActive)].map((offer, idx) => (
              <span key={idx} className="text-[11px] font-bold tracking-widest uppercase flex items-center gap-8">
                 <span>{(offer[lang] || offer.en)?.title}</span>
                 <span className="opacity-50 text-[var(--accent)]">✦</span>
                 <span>{(offer[lang] || offer.en)?.description}</span>
                 <span className="opacity-50 text-[var(--accent)]">✦</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Daily Offers Section */}
      {products.filter(p => p.isDailyOffer).length > 0 && (
        <section className="py-16 md:py-24 bg-[var(--bg-dark)] relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#A28B55 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--accent)] font-medium mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> {t.daily.tag}
                </p>
                <h2 className="font-serif text-4xl md:text-5xl text-[var(--bg-secondary)] italic">
                   {t.daily.title}
                </h2>
              </div>
              <p className="text-[var(--bg-secondary)]/70 text-sm max-w-sm md:text-right">
                {t.daily.desc}
              </p>
            </div>
            
            <div className="relative group/daily-slider">
              <div className="flex overflow-x-auto gap-4 md:gap-6 pb-8 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]" id="daily-offer-slider">
                {products.filter(p => p.isDailyOffer).map(product => {
                  const pData = product[lang] || product.en;
                  return (
                    <div key={product.id} className="w-[calc(50%_-_8px)] md:w-[calc(33.333%_-_16px)] lg:w-[calc(25%_-_18px)] flex-none snap-start flex flex-col group cursor-pointer card-hover" onClick={() => setSelectedProduct(product)}>
                    <div className="relative aspect-[4/5] bg-[var(--bg-secondary)] mb-4 overflow-hidden rounded-lg shadow-lg border border-white/10">
                       {product.image ? (
                         <img referrerPolicy="no-referrer" src={product.image} loading="lazy" alt={pData.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                       ) : (
                         <div className="w-full h-full flex items-center justify-center text-[var(--text-primary)]/20">
                           <ImageIcon size={48} strokeWidth={1} />
                         </div>
                       )}
                       
                       <div className="absolute top-3 left-3 bg-[var(--accent)] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 shadow-md">
                         Daily Offer
                       </div>
                       
                       {(product.inOffer || product.isDailyOffer) && product.discountRate && (
                         <div className="absolute top-12 left-3 bg-[var(--accent-secondary)] text-white text-[9px] font-bold uppercase tracking-widest px-2 py-1 shadow-sm mt-1">
                           {formatDiscount(product.discountRate)}
                         </div>
                       )}

                       {product.stock !== undefined && product.stock > 0 && product.stock < 5 && (
                         <div className="absolute top-3 right-3 bg-orange-500 text-white text-[9px] font-bold uppercase tracking-widest px-2 py-1 shadow-sm">
                           Low Stock
                         </div>
                       )}
                       
                       <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 md:translate-y-2 md:opacity-0 opacity-100 translate-y-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                         {product.stock !== undefined && product.stock <= 0 ? (
                           <button 
                             onClick={async (e) => {
                               e.stopPropagation();
                               try {
                                 const updatedProduct = { ...product, restockRequests: (product.restockRequests || 0) + 1 };
                                 const { saveProduct } = await import('./firebase');
                                 await saveProduct(updatedProduct);
                                 setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
                                 showToast("Thanks for your request! We will try to restock this soon.");
                               } catch (err) {
                                 console.error(err);
                                 alert("Failed to send request. Please try again.");
                               }
                             }}
                             className="w-full bg-[var(--accent-secondary)] text-white py-3 text-[10px] uppercase tracking-widest font-bold hover:bg-[#6A1525] transition-colors flex items-center justify-center gap-2"
                           >
                             <RefreshCcw size={14} /> Request Restock
                           </button>
                         ) : (
                           <button 
                             onClick={(e) => { 
                               e.stopPropagation(); 
                               const colorToAdd = product.colors && product.colors.length > 0 ? product.colors[0] : undefined;
                               addToCart(product, colorToAdd); 
                             }}
                             className="w-full bg-white text-[var(--text-primary)] py-3 text-[10px] uppercase tracking-widest font-bold hover:bg-[var(--accent)] hover:text-white transition-colors"
                           >
                             Add to Cart
                           </button>
                         )}
                       </div>
                    </div>
                    <div className="px-1 text-[var(--bg-secondary)]">
                      <h4 className="font-serif text-lg mb-1 group-hover:text-[var(--accent)] transition-colors line-clamp-1">{pData.name}</h4>
                      <div className="flex flex-col items-start gap-1">
                        {(product.inOffer || product.isDailyOffer) && product.offerPrice ? (
                          <div className="flex items-center gap-3">
                            <p className="text-[var(--accent)] font-bold">{formatPrice(product.offerPrice)}</p>
                            <p className="text-white/40 text-[11px] line-through">{formatPrice(product.price)}</p>
                          </div>
                        ) : (
                          <p className="text-[var(--accent)] font-medium">{formatPrice(product.price)}</p>
                        )}
                        {product.stock !== undefined && (
                          <p className={`text-[9px] md:text-[10px] whitespace-nowrap font-medium ${product.stock > 0 ? 'text-[var(--bg-secondary)]/50' : 'text-red-400'}`}>
                            {product.stock > 0 ? `${product.stock} left` : 'Out of stock'}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              </div>
              <button 
                onClick={() => { document.getElementById('daily-offer-slider')?.scrollBy({ left: 300, behavior: 'smooth' }) }}
                className="absolute right-0 top-[40%] -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white opacity-0 group-hover/daily-slider:opacity-100 transition-opacity hover:bg-white hover:text-[var(--text-primary)]"
              >
                <ChevronRight size={20} />
              </button>
              <button 
                onClick={() => { document.getElementById('daily-offer-slider')?.scrollBy({ left: -300, behavior: 'smooth' }) }}
                className="absolute left-0 top-[40%] -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white opacity-0 group-hover/daily-slider:opacity-100 transition-opacity hover:bg-white hover:text-[var(--text-primary)]"
              >
                <ChevronLeft size={20} />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Curation Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto text-center md:text-left">
         <div className="max-w-3xl mx-auto md:mx-0 border-l-2 border-[var(--accent)] pl-6 mb-16">
           <h2 className="font-serif text-3xl md:text-4xl text-[var(--text-primary)] mb-4 italic">
             {t.curation.title}
           </h2>
           <p className="text-[var(--text-primary)]/70 font-serif text-lg md:text-xl mb-6">
             {t.curation.desc}
           </p>
           <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--accent)] font-medium">
             {t.curation.tag}
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
                     <div className="w-full h-full flex items-center justify-center bg-[var(--bg-dark)] text-white/20">
                       <img src="/team-shivgouri.png" alt="Shivgouri Team" className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity" />
                     </div>
                   )}
                   <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-dark)]/90 via-[var(--bg-dark)]/20 to-transparent pointer-events-none" />
                   <div className="absolute bottom-6 left-6 right-6 flex flex-col items-start justify-end">
                     <span className="text-[10px] uppercase tracking-widest text-[var(--accent)] mb-2 block font-medium shadow-black drop-shadow-md">Curated</span>
                     <h3 className="font-serif text-2xl md:text-3xl text-white mb-2 drop-shadow-lg">{lang === 'hi' ? (cat.hi || cat.en) : lang === 'kn' ? (cat.kn || cat.en) : cat.en}</h3>
                   </div>
                 </div>
               </div>
             ))}
           </div>
           
           {/* Navigation Buttons */}
           <div className="absolute top-1/2 -translate-y-1/2 left-2 md:left-4 z-10 hidden md:block">
             <button 
               onClick={() => document.getElementById('category-slider')?.scrollBy({ left: -400, behavior: 'smooth' })}
               className="w-10 h-10 rounded-full bg-white/90 shadow-md flex items-center justify-center text-[var(--text-primary)] hover:bg-white transition-colors"
             >
               <ChevronLeft size={20} />
             </button>
           </div>
           <div className="absolute top-1/2 -translate-y-1/2 right-2 md:right-4 z-10 hidden md:block">
             <button 
               onClick={() => document.getElementById('category-slider')?.scrollBy({ left: 400, behavior: 'smooth' })}
               className="w-10 h-10 rounded-full bg-white/90 shadow-md flex items-center justify-center text-[var(--text-primary)] hover:bg-white transition-colors"
             >
               <ChevronRight size={20} />
             </button>
           </div>
         </div>
      </section>

            

            

      {/* Main Collection / Sliders */}
      <section id="collection" className="py-20 bg-[var(--bg-secondary)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--accent)] font-medium mb-4">{t.collectionSection.tag}</p>
          <h2 className="font-serif text-4xl md:text-5xl text-[var(--text-primary)] italic mb-6">
             {t.collectionSection.title}
          </h2>
          <p className="text-[var(--text-primary)]/80 font-serif text-lg max-w-2xl mb-12">
             {t.collectionSection.desc}
          </p>

          {/* Section Tabs and Search */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-[var(--text-primary)]/10 pb-4 mb-4 gap-4">
             <div className="flex gap-8">
               <button 
                 onClick={() => { setActiveSection('Saree'); setActiveCategory('All'); }}
                 className={`whitespace-nowrap transition-colors text-lg font-serif ${activeSection === 'Saree' ? 'text-[var(--text-primary)] border-b border-[var(--text-primary)]' : 'text-[var(--text-primary)]/40 hover:text-[var(--text-primary)]'}`}
               >
                 Sarees
               </button>
               <button 
                 onClick={() => { setActiveSection('Kurti'); setActiveCategory('All'); }}
                 className={`whitespace-nowrap transition-colors text-lg font-serif ${activeSection === 'Kurti' ? 'text-[var(--text-primary)] border-b border-[var(--text-primary)]' : 'text-[var(--text-primary)]/40 hover:text-[var(--text-primary)]'}`}
               >
                 Kurti
               </button>
             </div>
             <div className="relative w-full md:w-64">
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products, fabric, color..."
                  className="w-full bg-white border border-[var(--text-primary)]/10 text-[var(--text-primary)] px-4 py-2 pr-10 rounded-sm focus:outline-none focus:border-[var(--text-primary)]/30 placeholder:text-[var(--text-primary)]/40 text-sm"
                />
                <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-primary)]/40" />
             </div>
          </div>

          {/* Category Tabs */}
          <div className="flex overflow-x-auto gap-3 py-2 mb-6 scrollbar-hide relative">
             <button 
               onClick={() => { setActiveCategory('All'); setActiveSubcategory('All'); }}
               className={`relative px-6 py-2.5 rounded-full whitespace-nowrap text-sm font-medium transition-colors z-10 ${activeCategory === 'All' ? 'text-[var(--accent)]' : 'bg-[var(--bg-primary)] border border-[var(--accent)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'}`}
             >
               {activeCategory === 'All' && (
                 <motion.div
                   layoutId="activeCategory"
                   className="absolute inset-0 bg-[var(--bg-dark)] rounded-full shadow-[0_0_15px_rgba(162,139,85,0.3)] -z-10"
                   transition={{ type: "spring", stiffness: 300, damping: 30 }}
                 />
               )}
               <span className="relative z-20">{t.collection.filterAll}</span>
             </button>
             {filteredCategories.map((cat, idx) => (
               <button 
                 key={cat.id}
                 onClick={() => { setActiveCategory(cat.en); setActiveSubcategory('All'); }}
                 className={`relative px-6 py-2.5 rounded-full whitespace-nowrap text-sm font-medium transition-colors z-10 ${activeCategory === cat.en ? 'text-[var(--accent)]' : 'bg-[var(--bg-primary)] border border-[var(--accent)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'}`}
               >
                 {activeCategory === cat.en && (
                   <motion.div
                     layoutId="activeCategory"
                     className="absolute inset-0 bg-[var(--bg-dark)] rounded-full shadow-[0_0_15px_rgba(162,139,85,0.3)] -z-10"
                     transition={{ type: "spring", stiffness: 300, damping: 30 }}
                   />
                 )}
                 <span className="relative z-20">{lang === 'hi' ? (cat.hi || cat.en) : lang === 'kn' ? (cat.kn || cat.en) : cat.en}</span>
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
                  className={`whitespace-nowrap flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-medium transition-colors ${activeSubcategory === 'All' ? 'bg-[var(--bg-dark)] text-white border-[var(--text-primary)]' : 'bg-transparent text-[var(--text-primary)]/60 border-[var(--text-primary)]/20 hover:border-[var(--text-primary)]/40'}`}
                >
                  All {lang === 'hi' ? (currentCat.hi || currentCat.en) : lang === 'kn' ? (currentCat.kn || currentCat.en) : currentCat.en}
                </button>
                {currentCat.subcategories.map(subcat => (
                  <button 
                    key={subcat.id}
                    onClick={() => setActiveSubcategory(subcat.en)}
                    className={`whitespace-nowrap flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-medium transition-colors ${activeSubcategory === subcat.en ? 'bg-[var(--bg-dark)] text-white border-[var(--text-primary)]' : 'bg-transparent text-[var(--text-primary)]/60 border-[var(--text-primary)]/20 hover:border-[var(--text-primary)]/40'}`}
                  >
                    {lang === 'hi' ? (subcat.hi || subcat.en) : lang === 'kn' ? (subcat.kn || subcat.en) : subcat.en}
                  </button>
                ))}
              </div>
            );
          })()}

          <div className="flex justify-end mb-6">
            <button 
              onClick={() => setActiveCategory('All')}
              className="text-[10px] uppercase tracking-widest font-medium flex items-center gap-1 text-[var(--accent)] hover:opacity-70 transition-opacity"
            >
              View All <ArrowRight size={14} />
            </button>
          </div>

          {/* Grid Product List */}
          <div className="relative">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 pb-8" id="slider">
              {filteredProducts.length > 0 ? filteredProducts.map(product => {
                const pData = product[lang] || product.en;
                const message = `Hello Shivgouri, I am interested in purchasing the ${pData.name} (${formatPrice(product.price)}).`;
                const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
                return (
                  <div key={product.id} className="flex flex-col group/item card-hover rounded-lg">
                    <div className="relative aspect-[4/5] bg-[var(--bg-secondary)] mb-4 overflow-hidden rounded-lg shadow-sm transition-shadow cursor-pointer" onClick={() => setSelectedProduct(product)}>
                       {product.image ? (
                         <img referrerPolicy="no-referrer" src={product.image} loading="lazy" alt={pData.name} className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-700" />
                       ) : (
                         <div className="w-full h-full flex items-center justify-center text-[var(--text-primary)]/20">
                           <ImageIcon size={48} strokeWidth={1} />
                         </div>
                       )}
                       {(product.inOffer || product.isDailyOffer) && (
                         <div className="absolute top-3 left-3 bg-[var(--accent-secondary)] text-white text-[9px] font-bold uppercase tracking-widest px-2 py-1 shadow-sm">
                           {product.discountRate ? formatDiscount(product.discountRate) : "Offer"}
                         </div>
                       )}
                       {product.stock !== undefined && product.stock > 0 && product.stock < 5 && (
                         <div className="absolute top-3 right-3 bg-orange-500 text-white text-[9px] font-bold uppercase tracking-widest px-2 py-1 shadow-sm">
                           Low Stock
                         </div>
                       )}
                       {/* Add to Cart Overlay */}
                       <div className="absolute bottom-4 left-4 right-4 md:translate-y-8 md:opacity-0 opacity-100 translate-y-0 group-hover/item:translate-y-0 group-hover/item:opacity-100 transition-all duration-300">
                         {product.stock !== undefined && product.stock <= 0 ? (
                           <button 
                             onClick={async (e) => {
                               e.stopPropagation();
                               try {
                                 const updatedProduct = { ...product, restockRequests: (product.restockRequests || 0) + 1 };
                                 const { saveProduct } = await import('./firebase');
                                 await saveProduct(updatedProduct);
                                 setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
                                 showToast("Thanks for your request! We will try to restock this soon.");
                               } catch (err) {
                                 console.error(err);
                                 alert("Failed to send request. Please try again.");
                               }
                             }}
                             className="w-full bg-[var(--accent-secondary)] text-white py-3 text-[10px] uppercase tracking-widest font-bold hover:bg-[#6A1525] transition-colors flex items-center justify-center gap-2 shadow-lg"
                           >
                             <RefreshCcw size={14} /> Request Restock
                           </button>
                         ) : (
                           <button 
                             onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                             className="w-full bg-[var(--bg-dark)] text-white py-3 text-[10px] uppercase tracking-widest font-medium hover:bg-[var(--bg-dark)] transition-colors"
                           >
                             Add to Cart
                           </button>
                         )}
                       </div>
                    </div>
                    <div className="flex justify-between items-start gap-4 px-1 cursor-pointer" onClick={() => setSelectedProduct(product)}>
                      <div className="flex flex-col gap-1">
                        <h3 className="font-sans font-medium text-[var(--text-primary)] text-sm md:text-sm leading-snug">{pData.name}</h3>
                        {product.colors && product.colors.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {product.colors.map((c, i) => (
                              <span key={i} className="text-[9px] px-1.5 py-0.5 bg-[var(--bg-secondary)] text-[var(--text-primary)]/80 rounded-sm">{c}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end">
                        {(product.inOffer || product.isDailyOffer) && product.offerPrice ? (
                          <>
                            <p className="text-[var(--accent-secondary)] text-xs md:text-sm whitespace-nowrap font-bold">{formatPrice(product.offerPrice)}</p>
                            <p className="text-gray-400 text-[10px] md:text-xs whitespace-nowrap font-medium line-through">{formatPrice(product.price)}</p>
                          </>
                        ) : (
                          <p className="text-[var(--accent)] text-xs md:text-sm whitespace-nowrap font-medium">{formatPrice(product.price)}</p>
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
                <div className="w-full text-center py-20 text-[var(--text-primary)]/50 font-serif italic text-lg col-span-full">
                  {t.emptyProducts}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Gallery / Boutique Visit Section (Dark) */}
      <section id="about" className="bg-[var(--bg-dark)] text-white py-24">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1 text-center md:text-left">
             <span className="text-[10px] uppercase tracking-widest text-[var(--accent)] mb-4 block font-medium">{t.gallery.tag}</span>
             <h2 className="font-serif text-3xl md:text-4xl italic mb-6 leading-tight">
               {t.gallery.title}
             </h2>
             <p className="text-white/70 text-sm md:text-base leading-relaxed mb-10 max-w-md mx-auto md:mx-0">
               {t.about.desc}
             </p>

          </div>
           <div className="w-full h-[300px] md:h-auto md:aspect-[3/2] md:flex-1 relative bg-[var(--bg-secondary)]/10 overflow-hidden rounded-lg md:rounded-none mt-8 md:mt-0 shadow-xl">
             <img src="/team-shivgouri.png" alt="Shivgouri Team" className="absolute inset-0 w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </section>

      {/* Footer */}
      {/* Trust Features */}
      <section className="py-16 bg-[var(--bg-secondary)] border-t border-[var(--text-primary)]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full border border-[var(--accent)] flex items-center justify-center text-[var(--accent)] mb-4">
                <ShieldCheck size={24} strokeWidth={1.5} />
              </div>
              <h4 className="font-serif text-lg text-[var(--text-primary)] mb-2">Authenticity Guarantee</h4>
              <p className="text-xs text-[var(--text-primary)]/60 max-w-[150px]">100% genuine handloom products sourced directly from weavers.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full border border-[var(--accent)] flex items-center justify-center text-[var(--accent)] mb-4">
                <RefreshCcw size={24} strokeWidth={1.5} />
              </div>
              <h4 className="font-serif text-lg text-[var(--text-primary)] mb-2">Easy Returns</h4>
              <p className="text-xs text-[var(--text-primary)]/60 max-w-[150px]">Hassle-free 7-day return and exchange policy on all purchases.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full border border-[var(--accent)] flex items-center justify-center text-[var(--accent)] mb-4">
                <Truck size={24} strokeWidth={1.5} />
              </div>
              <h4 className="font-serif text-lg text-[var(--text-primary)] mb-2">Express Shipping</h4>
              <p className="text-xs text-[var(--text-primary)]/60 max-w-[150px]">Free shipping pan-India with real-time order tracking.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full border border-[var(--accent)] flex items-center justify-center text-[var(--accent)] mb-4">
                <Lock size={24} strokeWidth={1.5} />
              </div>
              <h4 className="font-serif text-lg text-[var(--text-primary)] mb-2">Secure Payments</h4>
              <p className="text-xs text-[var(--text-primary)]/60 max-w-[150px]">SSL-encrypted transactions with UPI, Cards, and COD options.</p>
            </div>
          </div>
        </div>
      </section>

      <footer id="contact" className="bg-[var(--bg-dark)] text-[var(--bg-secondary)] pt-16 pb-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-16 items-center">
              <div className="flex flex-col md:items-start text-left lg:pr-12">
                 <h3 className="font-serif text-3xl md:text-5xl mb-6 text-white">Visit Our Store</h3>
                 <div className="w-16 h-px bg-[var(--accent)] mb-8"></div>
                 <h4 className="text-[11px] font-bold tracking-[0.2em] uppercase mb-4 text-[var(--accent)]">Register Address</h4>
                 <p className="text-[13px] uppercase tracking-widest text-[var(--bg-secondary)]/70 mb-8 max-w-sm leading-relaxed">
                   SHIVGOURI SILK SAREES<br/>GOKAK, KARNATAKA, INDIA
                 </p>
                 <div className="flex flex-col gap-6 w-full max-w-sm">
                   <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-6 text-[11px] font-bold uppercase tracking-widest text-white hover:text-[var(--accent)] transition-colors group">
                     <span className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:border-[var(--accent)] transition-colors">
                       <MessageCircle size={18} />
                     </span>
                     +91 {waNumber.replace('91', '')}
                   </a>
                   <a href="mailto:info@shivgouri.com" className="flex items-center gap-6 text-[11px] font-bold uppercase tracking-widest text-white hover:text-[var(--accent)] transition-colors group">
                     <span className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:border-[var(--accent)] transition-colors">
                       <Mail size={18} />
                     </span>
                     info@shivgouri.com
                   </a>
                   <a href="https://maps.app.goo.gl/eZ7rtcwVjUid7vPo9" target="_blank" rel="noopener noreferrer" className="flex items-center gap-6 text-[11px] font-bold uppercase tracking-widest text-white hover:text-[var(--accent)] transition-colors group mt-2">
                     <span className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:border-[var(--accent)] transition-colors">
                       <MapPin size={18} />
                     </span>
                     Get Directions
                   </a>
                 </div>
              </div>
              <div className="relative w-full h-[350px] md:h-[450px] rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3824.234674718301!2d74.8187768!3d16.1704487!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc0afd607bbeddb%3A0x9cc509dd5b0afbb7!2sShiv%20Gouri%20(Silk%20And%20Sarees)!5e1!3m2!1sen!2sin" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen={false} 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  className="filter grayscale-[40%] contrast-125 opacity-90 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
                ></iframe>
                <div className="absolute inset-0 border border-white/10 rounded-2xl pointer-events-none"></div>
              </div>
           </div>

           <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/10 text-[var(--bg-secondary)]/50 text-[10px] tracking-widest uppercase">
              <p>&copy; {new Date().getFullYear()} Shivgouri Silk and Sarees. All rights reserved.</p>
              <button onClick={() => setIsAdminOpen(true)} className="flex items-center gap-2 hover:text-white transition-colors mt-4 md:mt-0">
                <Lock size={12} /> Admin
              </button>
           </div>
        </div>
      </footer>

      {isAdminOpen && (
        <Suspense fallback={<div className="fixed inset-0 bg-white z-[60] flex items-center justify-center font-serif text-xl animate-pulse text-[var(--accent-secondary)]">Loading Admin Panel...</div>}>
          <AdminPanel 
            products={products} 
            setProducts={setProducts} 
            categories={categories}
            setCategories={setCategories}
            offers={offers}
            setOffers={setOffers}
            onClose={() => setIsAdminOpen(false)} 
          />
        </Suspense>
      )}

      {isLoginOpen && <LoginModal onClose={() => setIsLoginOpen(false)} />}
      {/* Product Details Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-0 md:p-6 lg:p-12">
          <div className="absolute inset-0 bg-[var(--bg-dark)]/80 backdrop-blur-sm" onClick={() => setSelectedProduct(null)}></div>
          <div className="relative bg-[#FAFAFA] w-full h-full md:max-w-6xl md:h-[90vh] md:rounded-xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
            <button 
              onClick={() => {
                const url = `${window.location.origin}?product=${selectedProduct.id}`;
                if (navigator.share) {
                  navigator.share({
                    title: (selectedProduct[lang] || selectedProduct.en).name,
                    text: `Check out ${(selectedProduct[lang] || selectedProduct.en)?.name} at Shivgouri`,
                    url: url
                  }).catch(console.error);
                } else {
                  navigator.clipboard.writeText(url);
                  alert('Link copied to clipboard!');
                }
              }}
              className="absolute right-14 top-4 md:right-16 md:top-6 z-20 w-10 h-10 flex items-center justify-center bg-white/90 backdrop-blur-md shadow-sm rounded-full text-[var(--text-primary)] hover:bg-white transition-colors"
              title="Share or copy link"
            >
              <Share size={18} />
            </button>
            <button 
              onClick={() => setSelectedProduct(null)}
              className="absolute right-4 top-4 md:right-6 md:top-6 z-20 w-10 h-10 flex items-center justify-center bg-white/90 backdrop-blur-md shadow-sm rounded-full text-[var(--text-primary)] hover:bg-white transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="w-full md:w-[55%] lg:w-3/5 bg-[var(--bg-secondary)] relative h-[50vh] md:h-full">
              <div 
                className="relative w-full h-full overflow-hidden hidden md:block group"
              >
                {selectedProduct.image ? (
                  <img 
                    referrerPolicy="no-referrer" 
                    src={selectedProduct.image} 
                    loading="lazy" 
                    alt={(selectedProduct[lang] || selectedProduct.en)?.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[var(--text-primary)]/20">
                    <img src="/team-shivgouri.png" alt="Shivgouri Team" className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity" />
                  </div>
                )}
              </div>
              
              {/* Mobile version without hover magnifier (using standard CSS touch zoom if enabled by browser or just standard image) */}
              <div className="relative w-full h-full overflow-hidden block md:hidden">
                {selectedProduct.image ? (
                  <img 
                    referrerPolicy="no-referrer" 
                    src={selectedProduct.image} 
                    loading="lazy" 
                    alt={(selectedProduct[lang] || selectedProduct.en)?.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[var(--text-primary)]/20">
                    <img src="/team-shivgouri.png" alt="Shivgouri Team" className="w-full h-full object-cover opacity-80" />
                  </div>
                )}
              </div>
            </div>
            
            {/* Scrollable Details Area */}
            <div className="w-full md:w-[45%] lg:w-2/5 p-6 md:p-10 lg:p-14 flex flex-col h-[50vh] md:h-full overflow-y-auto bg-[#FAFAFA]">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[10px] uppercase tracking-widest text-[var(--accent)] block">{(selectedProduct[lang] || selectedProduct.en)?.badge} {(selectedProduct[lang] || selectedProduct.en)?.subcategory ? `/ ${(selectedProduct[lang] || selectedProduct.en)?.subcategory}` : ''}</span>
                {(selectedProduct.inOffer || selectedProduct.isDailyOffer) && (
                  <span className="bg-[var(--accent-secondary)] text-white text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm">{selectedProduct.discountRate ? formatDiscount(selectedProduct.discountRate) : "Offer"}</span>
                )}
                {selectedProduct.stock !== undefined && selectedProduct.stock > 0 && selectedProduct.stock < 5 && (
                  <span className="bg-orange-500 text-white text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm">Low Stock</span>
                )}
              </div>
              <h2 className="font-serif text-3xl md:text-4xl text-[var(--text-primary)] mb-3 leading-tight">{(selectedProduct[lang] || selectedProduct.en)?.name}</h2>
              
              <div className="flex items-end gap-4 mb-8">
                {(selectedProduct.inOffer || selectedProduct.isDailyOffer) && selectedProduct.offerPrice ? (
                  <>
                    <p className="text-3xl font-bold text-[var(--accent-secondary)]">{formatPrice(selectedProduct.offerPrice)}</p>
                    <p className="text-lg font-medium text-gray-400 line-through pb-0.5">{formatPrice(selectedProduct.price)}</p>
                  </>
                ) : (
                  <p className="text-2xl font-medium text-[var(--accent)]">{formatPrice(selectedProduct.price)}</p>
                )}
                {selectedProduct.stock !== undefined && (
                  <p className={`text-sm font-medium mb-1 ${selectedProduct.stock > 0 ? 'text-gray-500' : 'text-red-500'}`}>
                    {selectedProduct.stock > 0 ? `${selectedProduct.stock} in stock` : 'Out of stock'}
                  </p>
                )}
              </div>
              
              {selectedProduct.images && selectedProduct.images.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-[10px] uppercase tracking-widest text-[var(--text-primary)]/50 mb-4 border-b border-[var(--text-primary)]/10 pb-2">More Views</h4>
                  <div className="flex gap-3 overflow-x-auto pb-2 snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {selectedProduct.images.map((img, i) => (
                      <div key={i} className="w-20 aspect-[4/5] flex-shrink-0 bg-[var(--bg-secondary)] snap-start cursor-pointer hover:opacity-80 transition-opacity rounded-md overflow-hidden" onClick={() => setSelectedProduct({...selectedProduct, image: img, images: [selectedProduct.image!, ...selectedProduct.images!.filter((_, idx) => idx !== i)]})}>
                        <img referrerPolicy="no-referrer" src={img} loading="lazy" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {(selectedProduct[lang] || selectedProduct.en)?.description && (
                <div className="mb-8">
                  <h4 className="text-[10px] uppercase tracking-widest text-[var(--text-primary)]/50 mb-4 border-b border-[var(--text-primary)]/10 pb-2">Description</h4>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line font-medium">
                    {(selectedProduct[lang] || selectedProduct.en)?.description}
                  </p>
                </div>
              )}

              {selectedProduct.colors && selectedProduct.colors.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-[10px] uppercase tracking-widest text-[var(--text-primary)]/50 mb-4 border-b border-[var(--text-primary)]/10 pb-2">Available Colors</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.colors.map((c, i) => (
                      <button 
                        key={i} 
                        onClick={() => setSelectedColor(c)}
                        className={`px-4 py-2 border rounded-md text-[11px] font-medium uppercase tracking-widest shadow-sm transition-colors ${selectedColor === c || (!selectedColor && i === 0) ? 'bg-[var(--bg-dark)] text-white border-[var(--text-primary)]' : 'bg-white border-[var(--text-primary)]/10 text-[var(--text-primary)] hover:bg-[var(--bg-dark)]/5'}`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedProduct.specifications && selectedProduct.specifications.length > 0 && (
                <div className="mb-8 bg-[var(--bg-primary)] p-6 rounded-lg border border-[var(--text-primary)]/5">
                  <h4 className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-primary)] mb-6 border-b border-[var(--text-primary)]/10 pb-4 flex items-center gap-2">
                    Product Specifications
                  </h4>
                  <div className="flex flex-col">
                    {selectedProduct.specifications.map((spec, i) => (
                      <div key={i} className={`flex py-3 ${i !== selectedProduct.specifications!.length - 1 ? 'border-b border-[var(--text-primary)]/5' : ''}`}>
                        <span className="w-1/3 text-sm text-[var(--text-primary)]/60 font-medium">{spec.key}</span>
                        <span className="w-2/3 text-sm text-[var(--text-primary)] font-bold">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews Section */}
              <div className="mb-8 border-t border-[var(--text-primary)]/10 pt-8">
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-primary)] mb-6 flex items-center gap-2">
                  Customer Reviews
                </h4>
                <div className="mb-8 relative" style={{ minHeight: '140px' }}>
                  {selectedProduct.reviews && selectedProduct.reviews.length > 0 ? (
                    <div className="relative w-full overflow-hidden h-[140px]">
                      <AnimatePresence mode="wait">
                        {selectedProduct.reviews.map((review, idx) => idx === (currentReviewIndex % selectedProduct.reviews.length) && (
                          <motion.div
                            key={review.id}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.5 }}
                            className="absolute inset-0 bg-white p-4 rounded-lg shadow-sm border border-[var(--text-primary)]/5 overflow-y-auto custom-scrollbar"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-bold text-sm text-[var(--text-primary)]">{review.name}</span>
                              <div className="flex text-[var(--accent)]">
                                {[1, 2, 3, 4, 5].map(star => (
                                  <Star key={star} size={12} fill={star <= review.rating ? "currentColor" : "none"} className={star <= review.rating ? "text-[var(--accent)]" : "text-gray-300"} />
                                ))}
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{review.text}</p>
                            <span className="text-[10px] text-gray-400 uppercase tracking-widest">{new Date(review.date).toLocaleDateString()}</span>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No reviews yet. Be the first to review!</p>
                  )}
                </div>
                
                <div className="bg-[var(--bg-primary)] p-6 rounded-lg border border-[var(--text-primary)]/5">
                  <h5 className="text-[10px] uppercase tracking-widest text-[var(--text-primary)]/50 mb-4 border-b border-[var(--text-primary)]/10 pb-2">Add Your Review</h5>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-[var(--text-primary)]/70 mb-1">Name</label>
                      <input type="text" value={reviewName} onChange={e => setReviewName(e.target.value)} className="w-full bg-white border border-[var(--text-primary)]/10 text-[var(--text-primary)] px-3 py-2 rounded-sm focus:outline-none focus:border-[var(--text-primary)]/30 text-sm" placeholder="Your name" />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-[var(--text-primary)]/70 mb-1">Rating</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button key={star} onClick={() => setReviewRating(star)} className="focus:outline-none">
                            <Star size={18} fill={star <= reviewRating ? "currentColor" : "none"} className={star <= reviewRating ? "text-[var(--accent)]" : "text-gray-300 hover:text-[var(--accent)]/50"} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-[var(--text-primary)]/70 mb-1">Review</label>
                      <textarea value={reviewText} onChange={e => setReviewText(e.target.value)} className="w-full bg-white border border-[var(--text-primary)]/10 text-[var(--text-primary)] px-3 py-2 rounded-sm focus:outline-none focus:border-[var(--text-primary)]/30 text-sm min-h-[80px]" placeholder="Share your experience..."></textarea>
                    </div>
                    <button 
                      onClick={handleSubmitReview}
                      disabled={!reviewName.trim() || !reviewText.trim()}
                      className="bg-[var(--bg-dark)] text-white px-4 py-2 text-[10px] uppercase tracking-widest font-bold hover:bg-[var(--accent)] transition-colors rounded-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Submit Review
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-8">
                {selectedProduct.stock !== undefined && selectedProduct.stock <= 0 ? (
                  <button 
                    onClick={async () => {
                      try {
                        const updatedProduct = { ...selectedProduct, restockRequests: (selectedProduct.restockRequests || 0) + 1 };
                        const { saveProduct } = await import('./firebase');
                        await saveProduct(updatedProduct);
                        setSelectedProduct(updatedProduct);
                        setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
                        showToast("Thanks for your request! We will try to restock this soon.");
                      } catch (e) {
                        console.error(e);
                        alert("Failed to send request. Please try again.");
                      }
                    }}
                    className="w-full bg-[var(--accent-secondary)] text-white py-4 text-xs uppercase tracking-widest font-bold hover:bg-[#6A1525] transition-colors shadow-lg flex items-center justify-center gap-2"
                  >
                    <RefreshCcw size={16} /> Request Restock
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
                    className="w-full bg-[var(--bg-dark)] text-white py-4 text-xs uppercase tracking-widest font-bold hover:bg-[var(--bg-dark)] transition-colors shadow-lg"
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
        <div className="fixed inset-0 z-[60] flex justify-end">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
          <div className="relative w-full max-w-md bg-[var(--bg-primary)] h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between p-6 border-b border-[var(--text-primary)]/10">
              <h2 className="font-serif text-2xl text-[var(--text-primary)] italic">{t.cart.title}</h2>
              <button onClick={() => setIsCartOpen(false)} className="text-[var(--text-primary)] hover:opacity-50">
                <X size={24} strokeWidth={1.5} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                  <ShoppingBag size={48} strokeWidth={1} className="mb-4" />
                  <p className="font-serif text-lg">{t.cart.empty}</p>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {cart.map((item, idx) => (
                    <div key={idx} className="flex gap-4 items-center">
                      <div className="w-20 aspect-[4/5] bg-[var(--bg-secondary)] overflow-hidden flex-shrink-0">
                        {item.product.image ? <img referrerPolicy="no-referrer" src={item.product.image} className="w-full h-full object-cover" /> : null}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-[12px] font-medium text-[var(--text-primary)] mb-1 leading-snug">{(item.product[lang] || item.product.en).name}</h4>
                        {item.selectedColor && (
                          <p className="text-[10px] text-[var(--text-primary)]/70 mb-1 uppercase tracking-widest">Color: {item.selectedColor}</p>
                        )}
                        <p className="text-[var(--accent)] text-[11px] font-medium mb-2">{formatPrice(item.product.price)}</p>
                        <div className="flex items-center gap-3">
                           <button 
                             onClick={() => setCart(cart.map(c => c.product.id === item.product.id && c.selectedColor === item.selectedColor ? { ...c, quantity: Math.max(1, c.quantity - 1) } : c))}
                             className="w-6 h-6 border border-[var(--text-primary)]/20 flex items-center justify-center text-[var(--text-primary)]"
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
                             className="w-6 h-6 border border-[var(--text-primary)]/20 flex items-center justify-center text-[var(--text-primary)]"
                           >+</button>
                           <button 
                             onClick={() => setCart(cart.filter(c => !(c.product.id === item.product.id && c.selectedColor === item.selectedColor)))}
                             className="ml-auto text-[10px] uppercase tracking-widest text-[var(--text-primary)]/50 hover:text-[var(--text-primary)] underline"
                           >Remove</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {cart.length > 0 && (
              <div className="p-6 border-t border-[var(--text-primary)]/10 bg-[var(--bg-secondary)]/50">
                 <button 
                   onClick={() => setShowCheckoutWarning(true)}
                   className="w-full bg-[var(--bg-dark)] text-white py-4 text-[11px] uppercase tracking-widest font-bold hover:bg-[var(--bg-dark)] transition-colors"
                 >
                   {t.cart.checkout}
                 </button>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Checkout Warning Popup */}
      {showCheckoutWarning && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCheckoutWarning(false)}></div>
          <div className="relative bg-[#FAFAFA] w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <button 
              onClick={() => setShowCheckoutWarning(false)}
              className="absolute right-4 top-4 z-10 w-8 h-8 flex items-center justify-center bg-[var(--bg-secondary)] rounded-full text-[var(--text-primary)] hover:bg-[var(--bg-dark)] hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
            <div className="p-8 max-h-[90vh] overflow-y-auto">
              <h2 className="font-serif text-2xl text-[var(--text-primary)] mb-6 italic border-b border-[var(--text-primary)]/10 pb-4">
                {content.en.checkout.title} / {content.hi.checkout.title}
                {lang === 'kn' && ` / ${content.kn.checkout.title}`}
              </h2>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <span className="text-[var(--accent-secondary)] mt-1">✦</span>
                  <div className="text-sm text-gray-700 font-medium space-y-1">
                    <p>{content.en.checkout.rule1}</p>
                    <p className="text-gray-500">{content.hi.checkout.rule1}</p>
                    {lang === 'kn' && <p className="text-gray-500">{content.kn.checkout.rule1}</p>}
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[var(--accent-secondary)] mt-1">✦</span>
                  <div className="text-sm text-gray-700 font-medium space-y-1">
                    <p>{content.en.checkout.rule2[0]}<span className="text-[var(--accent-secondary)] font-bold">{content.en.checkout.rule2[1]}</span>{content.en.checkout.rule2[2]}</p>
                    <p className="text-gray-500">{content.hi.checkout.rule2[0]}<span className="text-[var(--accent-secondary)] font-bold">{content.hi.checkout.rule2[1]}</span>{content.hi.checkout.rule2[2]}</p>
                    {lang === 'kn' && <p className="text-gray-500">{content.kn.checkout.rule2[0]}<span className="text-[var(--accent-secondary)] font-bold">{content.kn.checkout.rule2[1]}</span>{content.kn.checkout.rule2[2]}</p>}
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[var(--accent-secondary)] mt-1">✦</span>
                  <div className="text-sm text-gray-700 font-medium space-y-1">
                    <p>{content.en.checkout.rule3}</p>
                    <p className="text-gray-500">{content.hi.checkout.rule3}</p>
                    {lang === 'kn' && <p className="text-gray-500">{content.kn.checkout.rule3}</p>}
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[var(--accent-secondary)] mt-1">✦</span>
                  <div className="text-sm text-gray-700 font-medium space-y-1">
                    <p>{content.en.checkout.rule4}</p>
                    <p className="text-gray-500">{content.hi.checkout.rule4}</p>
                    {lang === 'kn' && <p className="text-gray-500">{content.kn.checkout.rule4}</p>}
                  </div>
                </li>
              </ul>

              <button 
                onClick={handleCheckout}
                className="w-full bg-[var(--bg-dark)] text-white py-4 text-[12px] font-bold tracking-[0.1em] uppercase hover:bg-black transition-colors rounded-md shadow-lg"
              >
                {t.checkout.btn}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Form Popup */}
      {showCheckoutForm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCheckoutForm(false)}></div>
          <div className="relative bg-[#FAFAFA] w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <button 
              onClick={() => setShowCheckoutForm(false)}
              className="absolute right-4 top-4 z-10 w-8 h-8 flex items-center justify-center bg-[var(--bg-secondary)] rounded-full text-[var(--text-primary)] hover:bg-[var(--bg-dark)] hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
            <div className="p-8 max-h-[90vh] overflow-y-auto">
              <h2 className="font-serif text-2xl text-[var(--text-primary)] mb-6 italic border-b border-[var(--text-primary)]/10 pb-4">
                Delivery Details
              </h2>
              
              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-primary)]/70 uppercase tracking-widest mb-2">Name *</label>
                  <input type="text" minLength={2} value={customerDetails.name} onChange={(e) => setCustomerDetails({...customerDetails, name: e.target.value})} className="w-full border border-gray-300 rounded px-4 py-3 text-sm focus:outline-none focus:border-[var(--text-primary)]" placeholder="Enter your name" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-primary)]/70 uppercase tracking-widest mb-2">Mobile Number *</label>
                  <input type="tel" pattern="[0-9]{10}" maxLength={10} minLength={10} value={customerDetails.mobileNumber} onChange={(e) => setCustomerDetails({...customerDetails, mobileNumber: e.target.value})} className="w-full border border-gray-300 rounded px-4 py-3 text-sm focus:outline-none focus:border-[var(--text-primary)]" placeholder="Enter mobile number" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-primary)]/70 uppercase tracking-widest mb-2">Alternate Number</label>
                  <input type="tel" value={customerDetails.alternateNumber} onChange={(e) => setCustomerDetails({...customerDetails, alternateNumber: e.target.value})} className="w-full border border-gray-300 rounded px-4 py-3 text-sm focus:outline-none focus:border-[var(--text-primary)]" placeholder="Enter alternate number (optional)" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-primary)]/70 uppercase tracking-widest mb-2">Address *</label>
                  <textarea value={customerDetails.address} onChange={(e) => setCustomerDetails({...customerDetails, address: e.target.value})} className="w-full border border-gray-300 rounded px-4 py-3 text-sm focus:outline-none focus:border-[var(--text-primary)] min-h-[100px]" placeholder="Enter full delivery address"></textarea>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-primary)]/70 uppercase tracking-widest mb-2">Landmark</label>
                  <input type="text" value={customerDetails.landmark} onChange={(e) => setCustomerDetails({...customerDetails, landmark: e.target.value})} className="w-full border border-gray-300 rounded px-4 py-3 text-sm focus:outline-none focus:border-[var(--text-primary)]" placeholder="Enter landmark (optional)" />
                </div>
                <div className="flex gap-4">
                  <div className="w-1/2">
                    <label className="block text-xs font-bold text-[var(--text-primary)]/70 uppercase tracking-widest mb-2">City *</label>
                    <input type="text" value={customerDetails.city} onChange={(e) => setCustomerDetails({...customerDetails, city: e.target.value})} className="w-full border border-gray-300 rounded px-4 py-3 text-sm focus:outline-none focus:border-[var(--text-primary)]" placeholder="Enter city" />
                  </div>
                  <div className="w-1/2">
                    <label className="block text-xs font-bold text-[var(--text-primary)]/70 uppercase tracking-widest mb-2">District *</label>
                    <input type="text" value={customerDetails.district} onChange={(e) => setCustomerDetails({...customerDetails, district: e.target.value})} className="w-full border border-gray-300 rounded px-4 py-3 text-sm focus:outline-none focus:border-[var(--text-primary)]" placeholder="Enter district" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-primary)]/70 uppercase tracking-widest mb-2">Pincode *</label>
                  <input type="text" pattern="[0-9]{6}" maxLength={6} minLength={6} value={customerDetails.pincode} onChange={(e) => setCustomerDetails({...customerDetails, pincode: e.target.value})} className="w-full border border-gray-300 rounded px-4 py-3 text-sm focus:outline-none focus:border-[var(--text-primary)]" placeholder="Enter pincode" />
                </div>
              </div>

              <button 
                onClick={processToPayment}
                className="w-full bg-[var(--bg-dark)] text-white py-4 text-[12px] font-bold tracking-[0.1em] uppercase hover:bg-black transition-colors rounded-md shadow-lg"
              >
                Confirm Delivery Details
              </button>
            </div>
          </div>
        </div>
      )}
      
            {/* Payment Options Popup */}
      {showPaymentOptions && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowPaymentOptions(false)}></div>
          <div className="relative bg-[#FAFAFA] w-full max-w-sm rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <button 
              onClick={() => setShowPaymentOptions(false)}
              className="absolute right-4 top-4 z-10 w-8 h-8 flex items-center justify-center bg-[var(--bg-secondary)] rounded-full text-[var(--text-primary)] hover:bg-[var(--bg-dark)] hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
            <div className="p-8">
              <h2 className="font-serif text-2xl text-[var(--text-primary)] mb-2 italic">
                Payment Method
              </h2>
              <p className="text-sm text-gray-500 mb-6">How would you like to pay for your order?</p>
              
              <div className="space-y-4">
                <button 
                  onClick={() => submitOrder('cod')}
                  className="w-full bg-white border border-gray-200 p-4 rounded-lg flex items-center justify-between hover:border-[var(--text-primary)] hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[var(--bg-secondary)] rounded-full flex items-center justify-center text-[var(--text-primary)] group-hover:bg-[var(--bg-dark)] group-hover:text-white transition-colors">
                      <span className="font-bold">₹</span>
                    </div>
                    <div className="text-left">
                      <h4 className="font-bold text-[var(--text-primary)] text-sm">Cash on Delivery</h4>
                      <p className="text-xs text-gray-500">Pay when your order arrives</p>
                    </div>
                  </div>
                </button>
                
                <button 
                  onClick={() => submitOrder('online')}
                  className="w-full bg-white border border-gray-200 p-4 rounded-lg flex items-center justify-between hover:border-[var(--text-primary)] hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[var(--bg-secondary)] rounded-full flex items-center justify-center text-[var(--text-primary)] group-hover:bg-[var(--bg-dark)] group-hover:text-white transition-colors">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
                    </div>
                    <div className="text-left">
                      <h4 className="font-bold text-[var(--text-primary)] text-sm">Online Payment</h4>
                      <p className="text-xs text-gray-500">UPI, Cards, NetBanking</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Success Popup */}
      {showOrderSuccess && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowOrderSuccess(false)}></div>
          <div className="relative bg-[#FAFAFA] w-full max-w-md rounded-xl shadow-2xl p-8 text-center animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldCheck size={32} />
            </div>
            <h2 className="text-2xl font-serif text-[var(--text-primary)] mb-4">Order Confirmed!</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Thank you for shopping with Shivgouri. Your product will be shipped within <strong className="text-[var(--text-primary)]">5-7 business days</strong>.
            </p>
            <button 
              onClick={() => setShowOrderSuccess(false)}
              className="w-full bg-[var(--bg-dark)] text-white py-3 text-[12px] uppercase tracking-widest font-bold hover:bg-[var(--accent)] transition-colors rounded-md shadow-lg"
            >
              Continue Shopping
            </button>
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
              className="absolute right-4 top-4 z-10 w-8 h-8 flex items-center justify-center bg-white/80 rounded-full text-[var(--text-primary)] hover:bg-white transition-colors"
            >
              <X size={18} />
            </button>
            {offers.find(o => o.isActive)?.image && (
              <div className="w-full aspect-video bg-[var(--bg-secondary)]">
                <img referrerPolicy="no-referrer" src={offers.find(o => o.isActive)?.image} alt="Offer" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-8 text-center">
              <span className="text-[10px] uppercase tracking-widest text-[var(--accent)] mb-2 block font-bold">Special Offer</span>
              <h2 className="font-serif text-2xl md:text-3xl text-[var(--text-primary)] mb-3 leading-tight">{(offers.find(o => o.isActive)?.[lang] || offers.find(o => o.isActive)?.en)?.title}</h2>
              <p className="text-gray-600 mb-6 text-sm">{(offers.find(o => o.isActive)?.[lang] || offers.find(o => o.isActive)?.en)?.description}</p>
              {(offers.find(o => o.isActive)?.[lang] || offers.find(o => o.isActive)?.en)?.buttonText && (
                <button 
                  onClick={() => setShowOffer(false)}
                  className="bg-[var(--bg-dark)] text-white px-8 py-3 text-[11px] font-bold tracking-[0.2em] uppercase hover:bg-black transition-colors"
                >
                  {(offers.find(o => o.isActive)?.[lang] || offers.find(o => o.isActive)?.en)?.buttonText}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Floating Call Button (Desktop Only) */}
      <a
        href="tel:9620779955"
        className="hidden md:flex fixed bottom-6 right-6 z-40 w-14 h-14 bg-[var(--bg-dark)] text-white rounded-full items-center justify-center shadow-2xl hover:bg-[var(--accent)] transition-all hover:scale-110 duration-300 animate-gentle-pulse"
        aria-label="Call Shop"
      >
        <Phone size={24} />
      </a>

      {/* Back to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-24 right-6 md:bottom-24 md:right-6 z-40 w-12 h-12 bg-white text-[var(--text-primary)] rounded-full flex items-center justify-center shadow-lg border border-gray-200 hover:bg-[var(--bg-primary)] transition-colors"
          >
            <ArrowUp size={20} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Bottom Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-light text-[var(--text-primary)] px-8 py-3 flex justify-between items-center shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-safe">
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex flex-col items-center gap-1 hover:text-[var(--accent-secondary)] transition-colors active:scale-95">
          <Home size={20} />
          <span className="text-[9px] uppercase tracking-widest font-medium">Home</span>
        </button>
        <button onClick={() => document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' })} className="flex flex-col items-center gap-1 hover:text-[var(--accent-secondary)] transition-colors active:scale-95">
          <Search size={20} />
          <span className="text-[9px] uppercase tracking-widest font-medium">Shop</span>
        </button>
        <button id="cart-icon-mobile" onClick={() => setIsCartOpen(true)} className={`flex flex-col items-center gap-1 hover:text-[var(--accent-secondary)] transition-colors active:scale-95 relative ${cartBump ? 'scale-125 transition-transform duration-300' : 'scale-100 transition-transform duration-300'}`}>
          <ShoppingBag size={20} />
          {cart.length > 0 && (
            <span className="absolute -top-1 -right-2 bg-[var(--accent-secondary)] text-white text-[8px] font-bold w-4 h-4 flex items-center justify-center rounded-full animate-pulse">
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          )}
          <span className="text-[9px] uppercase tracking-widest font-medium">Cart</span>
        </button>
      </div>
    </div>
  );
}
