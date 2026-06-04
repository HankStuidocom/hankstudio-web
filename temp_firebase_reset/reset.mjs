import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDN95soIqy3L9dDyp8K82gWIyUnR95VAcQ",
  authDomain: "hankstudio-web.firebaseapp.com",
  projectId: "hankstudio-web",
  storageBucket: "hankstudio-web.firebasestorage.app",
  messagingSenderId: "45331467819",
  appId: "1:45331467819:web:7234241582696fa8aaa46e",
  measurementId: "G-L21CJ76K0V"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function resetData() {
  console.log("Deleting reviews...");
  const reviewsRef = collection(db, "apps/attendease-app/reviews");
  const snap = await getDocs(reviewsRef);
  let deletedCount = 0;
  for (const docSnap of snap.docs) {
    await deleteDoc(docSnap.ref);
    deletedCount++;
  }
  console.log(`Deleted ${deletedCount} reviews.`);

  console.log("Resetting app document rating metrics...");
  const appRef = doc(db, "apps/attendease-app");
  await setDoc(appRef, {
    totalStars: 0,
    totalVotes: 0,
    rating: 0,
    reviewCount: 0
  }, { merge: true });
  console.log("App document reset.");
  
  process.exit(0);
}

resetData().catch(e => {
  console.error("Error:", e);
  process.exit(1);
});
