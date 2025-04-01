/**
 * Cấu hình Firebase
 * Lưu trữ các thông tin cấu hình Firebase trong một file riêng
 */

// Cấu hình Firebase mặc định
const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyDGS6RibW9FHt83tX2wvVQDo80dwvkIvrY",
  authDomain: "kalimba-chill.firebaseapp.com",
  projectId: "kalimba-chill",
  storageBucket: "kalimba-chill.firebasestorage.app",
  messagingSenderId: "847603826023",
  appId: "1:847603826023:web:5d320dfa08eec4135543c2",
  measurementId: "G-9V15278SHP"
};

/**
 * Lấy cấu hình Firebase
 * @returns {Object} Cấu hình Firebase
 */
function getFirebaseConfig() {
  // Kiểm tra xem có cấu hình tùy chỉnh trong localStorage không
  const customConfig = localStorage.getItem('firebase_config');
  if (customConfig) {
    try {
      return JSON.parse(customConfig);
    } catch (e) {
      console.error('Lỗi khi phân tích cấu hình Firebase tùy chỉnh:', e);
    }
  }
  
  // Trả về cấu hình mặc định
  return DEFAULT_FIREBASE_CONFIG;
}

// Xuất hàm getFirebaseConfig ra window object
window.getFirebaseConfig = getFirebaseConfig; 