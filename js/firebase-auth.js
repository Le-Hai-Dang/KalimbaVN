// Xử lý xác thực người dùng với Firebase

// Hàm truy cập auth
function auth() {
  // Kiểm tra xem Firebase đã được khởi tạo chưa
  if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
    return firebase.auth();
  }
  return null;
}

function signInWithGoogle() {
  // Ưu tiên sử dụng window.firebaseApp nếu có
  if (window.firebaseApp && typeof window.firebaseApp.signInWithGoogle === 'function') {
    return window.firebaseApp.signInWithGoogle();
  }

  const authInstance = auth();
  if (!authInstance) {
    throw new Error("Firebase Auth không được khởi tạo");
  }
  
  const provider = new firebase.auth.GoogleAuthProvider();
  return authInstance.signInWithPopup(provider)
    .then(result => result.user)
    .catch(error => {
      console.error("Lỗi đăng nhập với Google:", error);
      throw error;
    });
}

function signOut() {
  // Ưu tiên sử dụng window.firebaseApp nếu có
  if (window.firebaseApp && typeof window.firebaseApp.signOut === 'function') {
    return window.firebaseApp.signOut();
  }

  const authInstance = auth();
  if (!authInstance) {
    throw new Error("Firebase Auth không được khởi tạo");
  }
  
  return authInstance.signOut()
    .catch(error => {
      console.error("Lỗi đăng xuất:", error);
      throw error;
    });
}

function getCurrentUser() {
  // Ưu tiên sử dụng window.firebaseApp nếu có
  if (window.firebaseApp && typeof window.firebaseApp.getCurrentUser === 'function') {
    return window.firebaseApp.getCurrentUser();
  }

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
}

function saveUserToFirestore(user) {
  if (!user) return;

  try {
    const userData = {
      uid: user.uid,
      displayName: user.displayName || 'Người dùng',
      email: user.email,
      photoURL: user.photoURL,
      lastLogin: new Date().toISOString()
    };
    
    // Ưu tiên sử dụng window.firebaseApp nếu có
    if (window.firebaseApp && typeof window.firebaseApp.saveToFirestore === 'function') {
      window.firebaseApp.saveToFirestore('users', user.uid, userData)
        .then(() => console.log('Đã lưu thông tin người dùng vào Firestore'))
        .catch(error => console.error('Lỗi khi lưu thông tin người dùng:', error));
    } else if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
      firebase.firestore().collection('users').doc(user.uid).set(userData, { merge: true })
        .then(() => console.log('Đã lưu thông tin người dùng vào Firestore'))
        .catch(error => console.error('Lỗi khi lưu thông tin người dùng:', error));
    }
  } catch (error) {
    console.error('Lỗi khi lưu thông tin người dùng:', error);
  }
}

// Biến lưu trạng thái người dùng
let currentUser = null;

// Lắng nghe sự thay đổi trạng thái xác thực
function initializeAuthListener() {
  const authInstance = auth();
  if (!authInstance) {
    console.error("Firebase Auth chưa được khởi tạo.");
    return;
  }

  authInstance.onAuthStateChanged(user => {
    currentUser = user;
    updateUIForAuthState(user);
    
    if (user) {
      // Lưu thông tin người dùng vào Firestore
      saveUserToFirestore(user);
    }
  });
}

// Cập nhật giao diện dựa trên trạng thái đăng nhập
function updateUIForAuthState(user) {
  const loginButtons = document.querySelectorAll('.login-with-google-btn');
  const userAvatars = document.querySelectorAll('.user-avatar');
  const userMenuItems = document.querySelectorAll('.user-menu-item');
  
  if (user) {
    // Người dùng đã đăng nhập
    loginButtons.forEach(button => {
      button.innerHTML = `<i class="fas fa-user-circle"></i> ${user.displayName || 'Người dùng'}`;
    });
    
    userAvatars.forEach(avatar => {
      if (user.photoURL) {
        avatar.innerHTML = `<img src="${user.photoURL}" alt="Avatar" class="user-photo">`;
      } else {
        avatar.innerHTML = `<i class="fas fa-user-circle"></i>`;
      }
    });
    
    // Hiển thị các mục menu dành cho người dùng đã đăng nhập
    userMenuItems.forEach(item => {
      item.style.display = 'block';
    });
    
  } else {
    // Người dùng chưa đăng nhập
    loginButtons.forEach(button => {
      button.innerHTML = `<i class="fab fa-google"></i> Đăng nhập`;
    });
    
    userAvatars.forEach(avatar => {
      avatar.innerHTML = `<i class="fab fa-google"></i>`;
    });
    
    // Ẩn các mục menu dành cho người dùng đã đăng nhập
    userMenuItems.forEach(item => {
      item.style.display = 'none';
    });
  }
}

// Xử lý đăng nhập bằng Google
async function handleGoogleSignIn() {
  try {
    await signInWithGoogle();
    console.log('Đăng nhập thành công');
  } catch (error) {
    console.error('Lỗi đăng nhập:', error);
    alert('Đăng nhập không thành công: ' + error.message);
  }
}

// Xử lý đăng xuất
async function handleSignOut() {
  try {
    await signOut();
    console.log('Đăng xuất thành công');
  } catch (error) {
    console.error('Lỗi đăng xuất:', error);
    alert('Đăng xuất không thành công: ' + error.message);
  }
}

// Thêm sự kiện click cho các nút đăng nhập/đăng xuất
function setupAuthButtons() {
  // Các nút đăng nhập bằng Google
  const loginButtons = document.querySelectorAll('.login-with-google-btn');
  loginButtons.forEach(button => {
    button.addEventListener('click', () => {
      if (currentUser) {
        handleSignOut();
      } else {
        handleGoogleSignIn();
      }
    });
  });

  // Nút đăng nhập mobile
  const mobileLoginBtn = document.querySelector('.login-btn');
  if (mobileLoginBtn) {
    mobileLoginBtn.addEventListener('click', () => {
      if (currentUser) {
        handleSignOut();
      } else {
        handleGoogleSignIn();
      }
    });
  }
}

// Kiểm tra trạng thái đăng nhập khi tải trang
async function checkAuthStateOnLoad() {
  try {
    const user = await getCurrentUser();
    currentUser = user;
    updateUIForAuthState(user);
  } catch (error) {
    console.error('Lỗi kiểm tra trạng thái đăng nhập:', error);
  }
}

// Khởi tạo khi tài liệu được tải
document.addEventListener('DOMContentLoaded', () => {
  // Đảm bảo Firebase được khởi tạo trước
  if (window.firebaseApp && typeof window.firebaseApp.init === 'function') {
    window.firebaseApp.init();
  }
  
  initializeAuthListener();
  setupAuthButtons();
  checkAuthStateOnLoad();
});

// Xuất các hàm để có thể sử dụng từ bên ngoài
window.firebaseAuth = {
  signInWithGoogle,
  signOut,
  getCurrentUser,
  handleGoogleSignIn,
  handleSignOut,
  checkAuthStateOnLoad
}; 