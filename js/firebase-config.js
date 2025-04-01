// Firebase configuration
// Khởi tạo đối tượng toàn cục cho Firebase

// Cấu hình Firebase - thay thế thông tin này bằng thông tin cấu hình thực tế của bạn
let firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};

// Cập nhật cấu hình từ bên ngoài
window.updateFirebaseConfigFromEnv = function(newConfig) {
  firebaseConfig = { ...newConfig };
  // Khởi tạo lại Firebase nếu đã được khởi tạo trước đó
  if (typeof firebase !== 'undefined' && firebase.apps.length === 0) {
    initializeFirebase();
  }
};

// Khởi tạo Firebase
function initializeFirebase() {
  // Kiểm tra xem Firebase đã được khởi tạo chưa
  if (typeof firebase !== 'undefined' && firebase.apps.length === 0) {
    firebase.initializeApp(firebaseConfig);
    console.log("Firebase đã được khởi tạo thành công");
  } else if (typeof firebase === 'undefined') {
    console.error("Firebase SDK không được tải. Vui lòng đảm bảo bạn đã thêm script Firebase vào trang.");
    return null;
  }
  return firebase;
}

// Tạo đối tượng toàn cục để lưu trữ các phương thức Firebase
window.firebaseApp = {
  // Kích hoạt khởi tạo
  init: function() {
    return initializeFirebase();
  },
  
  // Lấy cấu hình hiện tại
  getConfig: function() {
    return { ...firebaseConfig };
  },
  
  // Truy cập vào Firebase Auth
  auth: function() {
    if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
      return firebase.auth();
    }
    return null;
  },
  
  // Truy cập vào Firestore
  db: function() {
    if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
      return firebase.firestore();
    }
    return null;
  },
  
  // Truy cập vào Storage
  storage: function() {
    if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
      return firebase.storage();
    }
    return null;
  },
  
  // Đăng nhập với Google
  signInWithGoogle: async function() {
    if (typeof firebase === 'undefined' || firebase.apps.length === 0) {
      this.init();
    }
    
    const authInstance = this.auth();
    if (!authInstance) {
      throw new Error("Firebase Auth không được khởi tạo");
    }
    
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
      const result = await authInstance.signInWithPopup(provider);
      return result.user;
    } catch (error) {
      console.error("Lỗi đăng nhập với Google:", error);
      throw error;
    }
  },
  
  // Đăng xuất
  signOut: async function() {
    const authInstance = this.auth();
    if (!authInstance) {
      throw new Error("Firebase Auth không được khởi tạo");
    }
    
    try {
      await authInstance.signOut();
    } catch (error) {
      console.error("Lỗi đăng xuất:", error);
      throw error;
    }
  },
  
  // Lấy người dùng hiện tại
  getCurrentUser: function() {
    const authInstance = this.auth();
    if (!authInstance) {
      return Promise.resolve(null);
    }
    
    return new Promise((resolve, reject) => {
      const unsubscribe = authInstance.onAuthStateChanged(user => {
        unsubscribe();
        resolve(user);
      }, reject);
    });
  },
  
  // Tải lên tệp lên storage
  uploadFile: async function(file, path) {
    const storageInstance = this.storage();
    if (!storageInstance) {
      throw new Error("Firebase Storage không được khởi tạo");
    }
    
    try {
      const storageRef = storageInstance.ref();
      const fileRef = storageRef.child(path);
      await fileRef.put(file);
      return await fileRef.getDownloadURL();
    } catch (error) {
      console.error("Lỗi tải tệp lên:", error);
      throw error;
    }
  },
  
  // Lưu dữ liệu vào Firestore
  saveToFirestore: async function(collection, document, data) {
    const dbInstance = this.db();
    if (!dbInstance) {
      throw new Error("Firebase Firestore không được khởi tạo");
    }
    
    try {
      if (document) {
        await dbInstance.collection(collection).doc(document).set(data, { merge: true });
        return document;
      } else {
        const docRef = await dbInstance.collection(collection).add(data);
        return docRef.id;
      }
    } catch (error) {
      console.error("Lỗi lưu dữ liệu:", error);
      throw error;
    }
  },
  
  // Lấy dữ liệu từ Firestore
  getFromFirestore: async function(collection, document) {
    const dbInstance = this.db();
    if (!dbInstance) {
      throw new Error("Firebase Firestore không được khởi tạo");
    }
    
    try {
      const doc = await dbInstance.collection(collection).doc(document).get();
      if (doc.exists) {
        return doc.data();
      }
      return null;
    } catch (error) {
      console.error("Lỗi lấy dữ liệu:", error);
      throw error;
    }
  },
  
  // Lấy tất cả dữ liệu từ một collection
  getAllFromCollection: async function(collection, queryConstraints = []) {
    const dbInstance = this.db();
    if (!dbInstance) {
      throw new Error("Firebase Firestore không được khởi tạo");
    }
    
    try {
      let query = dbInstance.collection(collection);
      
      // Áp dụng các ràng buộc truy vấn nếu có
      queryConstraints.forEach(constraint => {
        const [field, operator, value] = constraint;
        query = query.where(field, operator, value);
      });
      
      const snapshot = await query.get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Lỗi lấy dữ liệu từ collection:", error);
      throw error;
    }
  }
};

// Tự động khởi tạo Firebase khi trang được tải
document.addEventListener('DOMContentLoaded', function() {
  window.firebaseApp.init();
}); 