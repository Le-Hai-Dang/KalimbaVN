/**
 * Cấu hình Firebase cho front-end
 * File này quản lý kết nối với Firebase trên phía trình duyệt
 */

// Biến môi trường được thay thế trong quá trình build bằng process.env.<VARIABLE_NAME>
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyDGS6RibW9FHt83tX2wvVQDo80dwvkIvrY",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "kalimba-chill.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "kalimba-chill",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "kalimba-chill.firebasestorage.app",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "847603826023",
  appId: process.env.FIREBASE_APP_ID || "1:847603826023:web:5d320dfa08eec4135543c2",
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || "G-9V15278SHP"
};

// Biến toàn cục để lưu trữ các dịch vụ Firebase
let firebaseApp = null;
let firebaseAuth = null;
let firebaseFirestore = null;
let firebaseStorage = null;
let firebaseAnalytics = null;

/**
 * Khởi tạo Firebase với lazy-loading (chỉ tải khi cần)
 */
async function initializeFirebase() {
  try {
    // Chỉ tải Firebase khi cần thiết (lazy loading)
    if (!firebaseApp) {
      // Import Firebase modules
      const { initializeApp } = await import('firebase/app');
      firebaseApp = initializeApp(firebaseConfig);
      console.log('Firebase đã được khởi tạo thành công');
    }
    return firebaseApp;
  } catch (error) {
    console.error('Lỗi khi khởi tạo Firebase:', error);
    throw error;
  }
}

/**
 * Lấy instance Firebase Auth
 */
async function getFirebaseAuth() {
  if (!firebaseAuth) {
    await initializeFirebase();
    const { getAuth } = await import('firebase/auth');
    firebaseAuth = getAuth(firebaseApp);
  }
  return firebaseAuth;
}

/**
 * Lấy instance Firestore Database
 */
async function getFirebaseFirestore() {
  if (!firebaseFirestore) {
    await initializeFirebase();
    const { getFirestore } = await import('firebase/firestore');
    firebaseFirestore = getFirestore(firebaseApp);
  }
  return firebaseFirestore;
}

/**
 * Lấy instance Firebase Storage
 */
async function getFirebaseStorage() {
  if (!firebaseStorage) {
    await initializeFirebase();
    const { getStorage } = await import('firebase/storage');
    firebaseStorage = getStorage(firebaseApp);
  }
  return firebaseStorage;
}

/**
 * Lấy instance Firebase Analytics
 */
async function getFirebaseAnalytics() {
  if (!firebaseAnalytics && typeof window !== 'undefined') {
    await initializeFirebase();
    const { getAnalytics } = await import('firebase/analytics');
    firebaseAnalytics = getAnalytics(firebaseApp);
  }
  return firebaseAnalytics;
}

/**
 * Kiểm tra kết nối Firebase
 */
async function checkFirebaseConnection() {
  try {
    const db = await getFirebaseFirestore();
    const { collection, query, limit, getDocs } = await import('firebase/firestore');
    
    // Thử kết nối tới Firestore
    const testQuery = query(collection(db, '_connection_test_'), limit(1));
    await getDocs(testQuery);
    
    return { success: true, message: 'Kết nối Firebase thành công' };
  } catch (error) {
    console.error('Lỗi kết nối Firebase:', error);
    return { 
      success: false, 
      message: 'Không thể kết nối tới Firebase', 
      error: error.message 
    };
  }
}

// Export các hàm
export {
  initializeFirebase,
  getFirebaseAuth,
  getFirebaseFirestore,
  getFirebaseStorage,
  getFirebaseAnalytics,
  checkFirebaseConnection,
  firebaseConfig
}; 