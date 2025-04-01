// Cấu hình Firebase cố định
const FIREBASE_CONFIG = {
    apiKey: "AIzaSyDGS6RibW9FHt83tX2wvVQDo80dwvkIvrY",
    authDomain: "project-847603826023.firebaseapp.com",
    projectId: "project-847603826023",
    storageBucket: "project-847603826023.appspot.com",
    messagingSenderId: "847603826023",
    appId: "1:847603826023:web:8a237d2151173ac67a99f9",
    measurementId: "G-9BZC49X07N"
};

// Hàm lấy cấu hình đồng bộ
function getFirebaseConfig() {
    // Kiểm tra xem có cấu hình trong localStorage không (cho phép ghi đè trong runtime)
    const savedConfig = localStorage.getItem('firebase_runtime_config');
    if (savedConfig) {
        try {
            const parsedConfig = JSON.parse(savedConfig);
            console.log('Đang sử dụng cấu hình Firebase từ localStorage');
            return parsedConfig;
        } catch (e) {
            console.error('Lỗi khi đọc cấu hình từ localStorage:', e);
            localStorage.removeItem('firebase_runtime_config');
        }
    }
    
    return { ...FIREBASE_CONFIG };
}

// Hàm cập nhật API key trong runtime
function updateFirebaseApiKey(newApiKey) {
    if (!newApiKey || typeof newApiKey !== 'string' || newApiKey.length < 20) {
        console.error('API key không hợp lệ:', newApiKey);
        return false;
    }
    
    try {
        // Lấy cấu hình hiện tại
        const currentConfig = getFirebaseConfig();
        
        // Cập nhật API key
        currentConfig.apiKey = newApiKey;
        
        // Lưu vào localStorage
        localStorage.setItem('firebase_runtime_config', JSON.stringify(currentConfig));
        
        console.log('Đã cập nhật API key thành công, khởi động lại Firebase...');
        
        // Khởi động lại Firebase nếu có hàm reinitializeFirebase
        if (window.firebaseDebug && typeof window.firebaseDebug.reinitializeFirebase === 'function') {
            return window.firebaseDebug.reinitializeFirebase();
        }
        
        return true;
    } catch (error) {
        console.error('Lỗi khi cập nhật API key:', error);
        return false;
    }
}

// Hàm xóa cấu hình runtime và sử dụng lại cấu hình mặc định
function resetFirebaseConfig() {
    localStorage.removeItem('firebase_runtime_config');
    console.log('Đã xóa cấu hình runtime, sẽ sử dụng cấu hình mặc định sau khi làm mới trang');
    
    // Khởi động lại Firebase nếu có hàm reinitializeFirebase
    if (window.firebaseDebug && typeof window.firebaseDebug.reinitializeFirebase === 'function') {
        return window.firebaseDebug.reinitializeFirebase();
    }
    
    return true;
}

// Xuất hàm để sử dụng từ bên ngoài
window.getFirebaseConfig = getFirebaseConfig;
window.firebaseConfigManager = {
    updateApiKey: updateFirebaseApiKey,
    resetConfig: resetFirebaseConfig,
    getDefaultConfig: () => ({ ...FIREBASE_CONFIG })
};
