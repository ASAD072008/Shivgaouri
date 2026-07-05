import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, updateDoc } from "firebase/firestore";

const firebaseConfig = {
  projectId: "mineral-tracker-27854",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, 'ai-studio-shivgouri-7a968f7b-82ef-4878-874e-59efd0ee8136');

async function migrate() {
  const categoriesRef = collection(db, "categories");
  const querySnapshot = await getDocs(categoriesRef);
  querySnapshot.forEach(async (document) => {
    const data = document.data();
    if (data.section === "Womens") {
      await updateDoc(doc(db, "categories", document.id), { section: "Saree" });
      console.log(`Updated category ${document.id} to Saree`);
    } else if (data.section === "Kids") {
      await updateDoc(doc(db, "categories", document.id), { section: "Kurti" });
      console.log(`Updated category ${document.id} to Kurti`);
    }
  });
}

migrate();
