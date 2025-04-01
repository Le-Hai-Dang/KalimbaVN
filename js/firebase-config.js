// Firebase configuration
// Khởi tạo đối tượng toàn cục cho Firebase

// Sử dụng giá trị cấu hình dự án mới với API key hợp lệ
let firebaseConfig = {
  apiKey: "AIzaSyBP5o1qm-zRADjN4QoQGwNkwhjFaDj40vo",
  authDomain: "project-847603826023.firebaseapp.com",
  projectId: "project-847603826023",
  storageBucket: "project-847603826023.appspot.com",
  messagingSenderId: "847603826023",
  appId: "1:847603826023:web:8a237d2151173ac67a99f9",
  measurementId: "G-9BZC49X07N"
};

// Cập nhật cấu hình từ bên ngoài
window.updateFirebaseConfigFromEnv = function(newConfig) {
  firebaseConfig = { ...newConfig };
  
  // Khởi tạo lại Firebase nếu chưa khởi tạo
  if (typeof firebase !== 'undefined' && firebase.apps.length === 0) {
    initializeFirebase();
  }
};

// Hiển thị cấu hình hiện tại (an toàn)
window.getFirebaseConfig = function() {
  return { ...firebaseConfig };
};

// Khởi tạo Firebase một cách an toàn
function initializeFirebase() {
  try {
    // Kiểm tra xem Firebase đã được khởi tạo chưa
    if (typeof firebase !== 'undefined' && firebase.apps.length === 0) {
      console.log('Khởi tạo Firebase với cấu hình');
      firebase.initializeApp(firebaseConfig);
      console.log("Firebase đã được khởi tạo thành công");
      return true;
    } else if (firebase.apps.length > 0) {
      console.log("Firebase đã được khởi tạo trước đó");
      return true;
    } else {
      console.error("Firebase SDK không được tải. Vui lòng đảm bảo bạn đã thêm script Firebase vào trang.");
      return false;
    }
  } catch (error) {
    console.error("Lỗi khi khởi tạo Firebase:", error);
    return false;
  }
}

// Tự động khởi tạo Firebase khi trang được tải
document.addEventListener('DOMContentLoaded', function() {
  // Thử khởi tạo Firebase
  if (!initializeFirebase()) {
    console.error("Không thể khởi tạo Firebase khi trang được tải");
  }
}); 