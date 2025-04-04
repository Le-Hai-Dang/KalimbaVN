/**
 * Cấu hình Firebase cho ứng dụng
 * File này chứa các thông tin cấu hình cho Firebase
 * 
 * CHÚ Ý: File này chỉ chứa các thông tin công khai. KHÔNG lưu trữ bí mật API trong file này.
 */

// Cấu hình Firebase cho Kalimba Chill
const FIREBASE_CONFIG = {
    apiKey: "AIzaSyD8EUP5uWVs4QyJJO3ITOj1DjVNIWnIJfI",
    authDomain: "kalimba-chill.firebaseapp.com", 
    projectId: "kalimba-chill",
    storageBucket: "kalimba-chill.appspot.com",
    messagingSenderId: "441940370070",
    appId: "1:441940370070:web:cd8e6d22c51c2aab2ce43a",
    measurementId: "G-9TL9YH7NB2"
};

// Thêm các domain cho OAuth
// Quan trọng: Thêm localhost cho development
const OAUTH_DOMAINS = [
    'kalimba-chill.firebaseapp.com',
    'kalimba-chill.web.app',
    'localhost',
    '127.0.0.1'
];

// Lấy cấu hình Firebase
function getFirebaseConfig() {
    // Log để debug
    console.log("Lấy cấu hình Firebase:", FIREBASE_CONFIG);
    
    // Kiểm tra hostname và thông báo nếu domain không được cho phép
    const hostname = window.location.hostname;
    if (!OAUTH_DOMAINS.includes(hostname)) {
        console.warn(`Domain hiện tại (${hostname}) không nằm trong danh sách domain được phép cho OAuth. Có thể gặp lỗi khi đăng nhập.`);
    }
    
    return FIREBASE_CONFIG;
}

// Export function để sử dụng ở nơi khác
window.getFirebaseConfig = getFirebaseConfig; 