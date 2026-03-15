import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyDylx86bjgsKUp0j7RQgZ8ODYU8VaMmIBU",
  authDomain: "wedding-quest-eca57.firebaseapp.com",
  projectId: "wedding-quest-eca57",
  storageBucket: "wedding-quest-eca57.firebasestorage.app",
  messagingSenderId: "428147141726",
  appId: "1:428147141726:web:e88ddd9526c564262f98cf",
  measurementId: "G-JME9R6ZDMT"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
