import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyDjRmhcyBkYf2MFBd5nbMMiZhDIXYXzOBI',
  authDomain: 'hireourskills-auth-aa1e8.firebaseapp.com',
  projectId: 'hireourskills-auth-aa1e8',
  storageBucket: 'hireourskills-auth-aa1e8.firebasestorage.app',
  messagingSenderId: '739835744254',
  appId: '1:739835744254:web:090b930cdf8c66fed03aaf',
  measurementId: 'G-KZT530XP1J',
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)

export const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({
  prompt: 'select_account',
})

export default app