// Cấu hình Firebase cố định
const FIREBASE_CONFIG = {
    apiKey: "AIzaSyBP5o1qm-zRADjN4QoQGwNkwhjFaDj40vo",
    authDomain: "project-847603826023.firebaseapp.com",
    projectId: "project-847603826023",
    storageBucket: "project-847603826023.appspot.com",
    messagingSenderId: "847603826023",
    appId: "1:847603826023:web:8a237d2151173ac67a99f9",
    measurementId: "G-9BZC49X07N"
};

// Hàm lấy cấu hình đồng bộ
function getFirebaseConfig() {
    return { ...FIREBASE_CONFIG };
}

// Xuất hàm để sử dụng từ bên ngoài
window.getFirebaseConfig = getFirebaseConfig;
