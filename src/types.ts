export type Category = {
  id: string;
  en: string;
  kn: string;
  hi?: string;
  image?: string;
  section?: string;
  subcategories?: { id: string; en: string; kn: string; hi?: string }[];
};

export type Offer = {
  id: string;
  isActive: boolean;
  image?: string;
  en: { title: string; description: string; buttonText: string };
  kn: { title: string; description: string; buttonText: string };
  hi?: { title: string; description: string; buttonText: string };
};

export type Product = {
  id: number;
  price: string;
  image: string;
  images?: string[];
  colors?: string[];
  en: { name: string; badge: string; description?: string; subcategory?: string; };
  kn: { name: string; badge: string; description?: string; subcategory?: string; };
  hi?: { name: string; badge: string; description?: string; subcategory?: string; };
  categoryId?: string; // Optional reference
  subcategoryId?: string;
  inOffer?: boolean;
  isDailyOffer?: boolean;
  discountRate?: string;
  offerPrice?: string;
  stock?: number;
  specifications?: { key: string; value: string }[];
};

export type Order = {
  id?: string;
  customerDetails: {
    mobileNumber: string;
    alternateNumber?: string;
    address: string;
    landmark?: string;
    city: string;
    district: string;
    pincode: string;
    name?: string;
  };
  products: {
    productId: number;
    name: string;
    price: string;
    quantity: number;
    color?: string;
  }[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: number; // timestamp
};
