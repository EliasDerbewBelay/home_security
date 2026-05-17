import { initializeApp } from "firebase/app";
// @ts-ignore - Some Firebase SDK versions have missing type definitions for this export in standard auth path
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyAfDynDUfmEoGukM-LW-o09JQhTV-3jF0Y",
  authDomain: "home-security-5bbb0.firebaseapp.com",
  projectId: "home-security-5bbb0",
  storageBucket: "home-security-5bbb0.firebasestorage.app",
  messagingSenderId: "280324081649",
  appId: "1:280324081649:web:6389496d5e683fe9986650"
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});