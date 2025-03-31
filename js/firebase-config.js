// Firebase configuration
// Tải cấu hình Firebase từ biến môi trường hoặc trực tiếp từ tệp .env
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.FIREBASE_APP_ID || "",
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || ""
};

// Khởi tạo Firebase
export function initializeFirebase() {
  // Kiểm tra xem Firebase đã được khởi tạo chưa
  if (typeof firebase !== 'undefined' && !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  } else if (typeof firebase === 'undefined') {
    console.error("Firebase SDK không được tải. Vui lòng đảm bảo bạn đã thêm script Firebase vào trang.");
    return null;
  }
  return firebase;
}

// Authentication
export const auth = () => {
  const firebaseApp = initializeFirebase();
  return firebaseApp ? firebaseApp.auth() : null;
};

// Firestore database
export const db = () => {
  const firebaseApp = initializeFirebase();
  return firebaseApp ? firebaseApp.firestore() : null;
};

// Storage
export const storage = () => {
  const firebaseApp = initializeFirebase();
  return firebaseApp ? firebaseApp.storage() : null;
};

// Đăng nhập bằng Google
export const signInWithGoogle = async () => {
  const authInstance = auth();
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
};

// Đăng xuất
export const signOut = async () => {
  const authInstance = auth();
  if (!authInstance) {
    throw new Error("Firebase Auth không được khởi tạo");
  }
  
  try {
    await authInstance.signOut();
  } catch (error) {
    console.error("Lỗi đăng xuất:", error);
    throw error;
  }
};

// Lấy người dùng hiện tại
export const getCurrentUser = () => {
  const authInstance = auth();
  if (!authInstance) {
    return Promise.resolve(null);
  }
  
  return new Promise((resolve, reject) => {
    const unsubscribe = authInstance.onAuthStateChanged(user => {
      unsubscribe();
      resolve(user);
    }, reject);
  });
};

// Tải lên tệp lên storage
export const uploadFile = async (file, path) => {
  const storageInstance = storage();
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
};

// Lưu dữ liệu vào Firestore
export const saveToFirestore = async (collection, document, data) => {
  const dbInstance = db();
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
};

// Lấy dữ liệu từ Firestore
export const getFromFirestore = async (collection, document) => {
  const dbInstance = db();
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
};

// Lấy tất cả dữ liệu từ một collection
export const getAllFromCollection = async (collection, queryConstraints = []) => {
  const dbInstance = db();
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
}; 