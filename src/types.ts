export type Category = {
  id: string;
  en: string;
  kn: string;
  image?: string;
};

export type Product = {
  id: number;
  price: string;
  image: string;
  en: { name: string; badge: string; };
  kn: { name: string; badge: string; };
  categoryId?: string; // Optional reference
};
