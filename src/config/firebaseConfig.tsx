import { initializeApp } from "firebase/app";

import { getFirestore } from "firebase/firestore"; // Import the necessary types

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDgGPRysd_OTkZZi4n3McNiM0PBVf6G_LI",
  authDomain: "safeapp-41573.firebaseapp.com",
  projectId: "safeapp-41573",
  storageBucket: "safeapp-41573.appspot.com",
  messagingSenderId: "1065121992344",
  appId: "1:1065121992344:web:f634329562e13099eb4aed",
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
