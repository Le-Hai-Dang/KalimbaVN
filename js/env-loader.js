// Script để tải cấu hình Firebase

// Tạo đối tượng lưu trữ biến môi trường
window.ENV = window.ENV || {};

// Hàm khởi tạo biến môi trường - Thay đổi thông tin này thành cấu hình Firebase thực tế
function initializeEnv() {
  // Đặt cấu hình Firebase của bạn trực tiếp vào đây
  window.ENV = {
    FIREBASE_API_KEY: "YOUR_API_KEY",
    FIREBASE_AUTH_DOMAIN: "YOUR_AUTH_DOMAIN",
    FIREBASE_PROJECT_ID: "YOUR_PROJECT_ID",
    FIREBASE_STORAGE_BUCKET: "YOUR_STORAGE_BUCKET",
    FIREBASE_MESSAGING_SENDER_ID: "YOUR_MESSAGING_SENDER_ID",
    FIREBASE_APP_ID: "YOUR_APP_ID",
    FIREBASE_MEASUREMENT_ID: "YOUR_MEASUREMENT_ID"
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