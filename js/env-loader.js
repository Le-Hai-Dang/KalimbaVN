// Script để tải cấu hình Firebase

// Tạo đối tượng lưu trữ biến môi trường
window.ENV = window.ENV || {};

// Hàm khởi tạo biến môi trường - Cấu hình Firebase thực tế
function initializeEnv() {
  // Đặt cấu hình Firebase thực tế
  window.ENV = {
    FIREBASE_API_KEY: "AIzaSyBP5o1qm-zRADjN4QoQGwNkwhjFaDj40vo",
    FIREBASE_AUTH_DOMAIN: "project-847603826023.firebaseapp.com",
    FIREBASE_PROJECT_ID: "project-847603826023",
    FIREBASE_STORAGE_BUCKET: "project-847603826023.appspot.com",
    FIREBASE_MESSAGING_SENDER_ID: "847603826023",
    FIREBASE_APP_ID: "1:847603826023:web:8a237d2151173ac67a99f9",
    FIREBASE_MEASUREMENT_ID: "G-9BZC49X07N"
  };
  
  console.log('Cấu hình Firebase đã được khởi tạo.');

  // Cập nhật cấu hình Firebase trong firebase-config.js
  updateFirebaseConfig();
}

// Hàm cập nhật cấu hình Firebase
function updateFirebaseConfig() {
  // Kiểm tra nếu đối tượng firebaseConfig đã được định nghĩa
  if (typeof window.updateFirebaseConfigFromEnv === 'function') {
    window.updateFirebaseConfigFromEnv(getFirebaseConfig());
  }
}

// Cung cấp hàm truy xuất biến môi trường an toàn
window.getEnv = function(key, defaultValue = '') {
  return window.ENV[key] || defaultValue;
};

// Hàm để truy xuất các thông số cấu hình Firebase
window.getFirebaseConfig = function() {
  return {
    apiKey: window.getEnv('FIREBASE_API_KEY', ''),
    authDomain: window.getEnv('FIREBASE_AUTH_DOMAIN', ''),
    projectId: window.getEnv('FIREBASE_PROJECT_ID', ''),
    storageBucket: window.getEnv('FIREBASE_STORAGE_BUCKET', ''),
    messagingSenderId: window.getEnv('FIREBASE_MESSAGING_SENDER_ID', ''),
    appId: window.getEnv('FIREBASE_APP_ID', ''),
    measurementId: window.getEnv('FIREBASE_MEASUREMENT_ID', '')
  };
};

// Khởi tạo khi trang được tải
document.addEventListener('DOMContentLoaded', initializeEnv); 