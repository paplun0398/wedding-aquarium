import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-app.js";
import { getDatabase, ref, onChildAdded } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-database.js";
import { getStorage, ref as storageRef, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyA_LZENgeCagnnlWnw1z0rnyGoEeH-tgok",
    authDomain: "wedding-aquarium.firebaseapp.com",
    databaseURL: "https://wedding-aquarium-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "wedding-aquarium",
    storageBucket: "wedding-aquarium.appspot.com",
    messagingSenderId: "320193570935",
    appId: "1:320193570935:web:d45aeb9ed136ed91733e72",
    measurementId: "G-JY4742WS4K"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const storage = getStorage(app);