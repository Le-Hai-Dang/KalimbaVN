/**
 * Cấu hình Firebase
 * File này quản lý kết nối với Firebase và cung cấp instance của các dịch vụ
 */

// Import các module cần thiết từ Firebase
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Đọc biến môi trường từ .env
import dotenv from 'dotenv';
dotenv.config();

// Cấu hình Firebase sử dụng biến môi trường
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

// Khởi tạo ứng dụng Firebase
const app = initializeApp(firebaseConfig);

// Khởi tạo các dịch vụ
let analytics = null;

// Analytics chỉ hoạt động trên trình duyệt, không hoạt động trên Node.js
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

// Khởi tạo và export các dịch vụ Firebase
const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);

export { app, auth, firestore, storage, analytics };

// Export hàm để kiểm tra kết nối Firebase
export const checkFirebaseConnection = async () => {
  try {
    // Thử kết nối với Firestore để kiểm tra kết nối
    const db = getFirestore(app);
    await db.collection('_connection_test_').limit(1).get();
    return { success: true, message: 'Kết nối Firebase thành công' };
  } catch (error) {
    console.error('Lỗi kết nối Firebase:', error);
    return { 
      success: false, 
      message: 'Không thể kết nối tới Firebase', 
      error: error.message 
    };
  }
};

export default app; 