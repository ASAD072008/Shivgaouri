import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
const app = initializeApp({ projectId: "mineral-tracker-27854" });
const db = getFirestore(app, 'ai-studio-shivgouri-7a968f7b-82ef-4878-874e-59efd0ee8136');
async function test() {
  const p = {
    id: 12345, price: "100", image: "", images: [], colors: [],
    en: { name: "Test", badge: "Test", description: "" },
    kn: { name: "Test", badge: "Test", description: "" }
  };
  await setDoc(doc(db, "products", p.id.toString()), p);
  console.log("Success");
}
test().catch(console.error);
