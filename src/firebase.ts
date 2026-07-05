import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { Product, Category, Offer, Order } from './types';

const firebaseConfig = {
  apiKey: "AIzaSyDUco6pzduuuNw7ClLxYNtnSAC8rhZBtpE",
  authDomain: "mineral-tracker-27854.firebaseapp.com",
  projectId: "mineral-tracker-27854",
  storageBucket: "mineral-tracker-27854.firebasestorage.app",
  messagingSenderId: "168925865415",
  appId: "1:168925865415:web:3fdd0beae54c4da3fc25e2"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, 'ai-studio-shivgouri-7a968f7b-82ef-4878-874e-59efd0ee8136');
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function fetchProducts(): Promise<Product[]> {
  const path = 'products';
  try {
    const querySnapshot = await getDocs(collection(db, path));
    const list: Product[] = [];
    querySnapshot.forEach((doc) => {
      list.push(doc.data() as Product);
    });
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function saveProduct(product: Product): Promise<void> {
  const path = `products/${product.id}`;
  try {
    const docRef = doc(db, 'products', product.id.toString());
    const cleanProduct = JSON.parse(JSON.stringify(product));
    await setDoc(docRef, cleanProduct);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteProduct(id: number): Promise<void> {
  const path = `products/${id}`;
  try {
    const docRef = doc(db, 'products', id.toString());
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function fetchCategories(): Promise<Category[]> {
  const path = 'categories';
  try {
    const querySnapshot = await getDocs(collection(db, path));
    const list: Category[] = [];
    querySnapshot.forEach((doc) => {
      list.push(doc.data() as Category);
    });
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function saveCategory(category: Category): Promise<void> {
  const path = `categories/${category.id}`;
  try {
    const docRef = doc(db, 'categories', category.id);
    const cleanCategory = JSON.parse(JSON.stringify(category));
    await setDoc(docRef, cleanCategory);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteCategory(id: string): Promise<void> {
  const path = `categories/${id}`;
  try {
    const docRef = doc(db, 'categories', id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function fetchOffers(): Promise<Offer[]> {
  const path = 'offers';
  try {
    const querySnapshot = await getDocs(collection(db, path));
    const list: Offer[] = [];
    querySnapshot.forEach((doc) => {
      list.push(doc.data() as Offer);
    });
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function saveOffer(offer: Offer): Promise<void> {
  const path = `offers/${offer.id}`;
  try {
    const docRef = doc(db, 'offers', offer.id);
    const cleanOffer = JSON.parse(JSON.stringify(offer));
    await setDoc(docRef, cleanOffer);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteOffer(id: string): Promise<void> {
  const path = `offers/${id}`;
  try {
    const docRef = doc(db, 'offers', id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function fetchOrders(): Promise<Order[]> {
  const path = 'orders';
  try {
    const querySnapshot = await getDocs(collection(db, path));
    const list: Order[] = [];
    querySnapshot.forEach((doc) => {
      list.push(doc.data() as Order);
    });
    return list.sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function saveOrder(order: Order): Promise<void> {
  // If no ID is provided, create a new one based on timestamp
  if (!order.id) {
    order.id = `ORD-${Date.now()}`;
  }
  const path = `orders/${order.id}`;
  try {
    const docRef = doc(db, 'orders', order.id);
    const cleanOrder = JSON.parse(JSON.stringify(order));
    await setDoc(docRef, cleanOrder);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteOrder(id: string): Promise<void> {
  const path = `orders/${id}`;
  try {
    const docRef = doc(db, 'orders', id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
