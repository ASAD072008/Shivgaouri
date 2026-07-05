import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
const app = initializeApp({ projectId: "mineral-tracker-27854" });
const db = getFirestore(app, 'ai-studio-shivgouri-7a968f7b-82ef-4878-874e-59efd0ee8136');
async function list() {
  const prods = await getDocs(collection(db, "products"));
  prods.forEach(d => console.log(d.id, d.data().en?.name));
}
list().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
