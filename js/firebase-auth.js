// Xử lý xác thực người dùng với Firebase

// Import các hàm từ firebase-config.js (đảm bảo rằng module được hỗ trợ)
import { 
  auth, 
  signInWithGoogle, 
  signOut, 
  getCurrentUser,
  saveToFirestore 
} from './firebase-config.js';

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

// Lưu thông tin người dùng vào Firestore
async function saveUserToFirestore(user) {
  if (!user) return;

  try {
    const userData = {
      uid: user.uid,
      displayName: user.displayName || 'Người dùng',
      email: user.email,
      photoURL: user.photoURL,
      lastLogin: new Date().toISOString()
    };
    
    await saveToFirestore('users', user.uid, userData);
    console.log('Đã lưu thông tin người dùng vào Firestore');
  } catch (error) {
    console.error('Lỗi khi lưu thông tin người dùng:', error);
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
  initializeAuthListener();
  setupAuthButtons();
  checkAuthStateOnLoad();
});

// Xuất các hàm để có thể sử dụng từ bên ngoài
export {
  handleGoogleSignIn,
  handleSignOut,
  currentUser,
  checkAuthStateOnLoad
}; 