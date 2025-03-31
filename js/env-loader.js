// Script để tải biến môi trường cho client-side

// Tạo đối tượng lưu trữ biến môi trường
window.ENV = window.ENV || {};

// Hàm để tải file .env
async function loadEnvFile() {
  try {
    const response = await fetch('/.env');
    
    // Nếu file .env không thể truy cập trực tiếp, sử dụng các giá trị mặc định hoặc tải từ server
    if (!response.ok) {
      console.warn('.env file không thể truy cập trực tiếp. Đảm bảo API keys được cấu hình đúng trên server.');
      return;
    }
    
    const text = await response.text();
    
    // Parse nội dung file .env
    const lines = text.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Bỏ qua dòng trống và comment
      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }
      
      // Tách key và value
      const parts = trimmed.split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join('=').trim();
        
        // Chỉ lấy các biến bắt đầu bằng FIREBASE_
        if (key.startsWith('FIREBASE_')) {
          window.ENV[key] = value;
        }
      }
    }
    
    console.log('Biến môi trường đã được tải.');
    
  } catch (error) {
    console.error('Lỗi khi tải file .env:', error);
  }
}

// Cung cấp hàm truy xuất biến môi trường an toàn
window.getEnv = function(key, defaultValue = '') {
  return window.ENV[key] || defaultValue;
};

// Hàm để truy xuất các thông số cấu hình Firebase
window.getFirebaseConfig = function() {
  return {
    apiKey: window.getEnv('FIREBASE_API_KEY'),
    authDomain: window.getEnv('FIREBASE_AUTH_DOMAIN'),
    projectId: window.getEnv('FIREBASE_PROJECT_ID'),
    storageBucket: window.getEnv('FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: window.getEnv('FIREBASE_MESSAGING_SENDER_ID'),
    appId: window.getEnv('FIREBASE_APP_ID'),
    measurementId: window.getEnv('FIREBASE_MEASUREMENT_ID')
  };
};

// Tải biến môi trường khi trang được tải
document.addEventListener('DOMContentLoaded', loadEnvFile); 