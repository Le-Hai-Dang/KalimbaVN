// Xử lý xác thực người dùng với Firebase

// Biến toàn cục để đánh dấu trạng thái đăng nhập
window.authProcessRunning = false;

// Chỉ cho phép một quá trình xác thực chạy tại một thời điểm
function runSingleAuthProcess(callback) {
  if (window.authProcessRunning) {
    console.log('Có quá trình xác thực đang chạy, bỏ qua yêu cầu mới');
    return Promise.resolve(null);
  }
  
  // Đặt biến cờ trạng thái
  window.authProcessRunning = true;
  console.log('Bắt đầu quá trình xác thực mới');
  
  // Ghi lại thời gian bắt đầu
  window.authStartTime = Date.now();
  
  return new Promise((resolve, reject) => {
    // Đặt timeout để đảm bảo biến cờ sẽ được đặt lại ngay cả khi có lỗi không xử lý được
    const timeoutId = setTimeout(() => {
      console.log('Timeout: Đặt lại biến cờ sau 10 giây');
      window.authProcessRunning = false;
    }, 10000);
    
    try {
      // Gọi callback được cung cấp
      callback()
        .then(result => {
          clearTimeout(timeoutId);
          window.authProcessRunning = false;
          resolve(result);
        })
        .catch(error => {
          clearTimeout(timeoutId);
          window.authProcessRunning = false;
          reject(error);
        });
    } catch (error) {
      clearTimeout(timeoutId);
      window.authProcessRunning = false;
      reject(error);
    }
  });
}

// Hàm truy cập auth
function auth() {
  // Kiểm tra xem Firebase đã được khởi tạo chưa
  if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
    return firebase.auth();
  }
  return null;
}

function signInWithGoogle() {
  return runSingleAuthProcess(() => {
    const authInstance = auth();
    if (!authInstance) {
      console.error("Firebase Auth không được khởi tạo");
      return Promise.reject(new Error("Firebase Auth không được khởi tạo"));
    }
    
    // Xóa bộ nhớ đệm của tiến trình xác thực trước đó
    try {
      authInstance.signOut().catch(() => {});
    } catch (e) {
      console.log("Không thể đăng xuất trước khi đăng nhập lại:", e);
    }
    
    // Lấy và kiểm tra cấu hình Firebase
    const firebaseConfig = window.getFirebaseConfig ? window.getFirebaseConfig() : null;
    if (!firebaseConfig || !firebaseConfig.apiKey) {
      console.error("Không tìm thấy khóa API Firebase hợp lệ");
      return Promise.reject(new Error("Khóa API Firebase không hợp lệ hoặc không tồn tại"));
    }
    
    // Log đầy đủ thông tin cấu hình để debug
    console.log('Đăng nhập với Google sử dụng cấu hình:', {
      apiKey: `${firebaseConfig.apiKey.substring(0, 8)}...`,
      authDomain: firebaseConfig.authDomain,
      projectId: firebaseConfig.projectId,
      appInitialized: firebase.apps.length > 0
    });
    
    // Sử dụng signInWithRedirect để tránh vấn đề popup
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    
    // Lưu URL hiện tại để quay lại sau khi đăng nhập
    localStorage.setItem('auth_redirect_url', window.location.href);
    
    // Luôn sử dụng redirect để tránh lỗi popup và Cross-Origin
    return authInstance.signInWithRedirect(provider)
      .then(() => {
        // Redirect sẽ chuyển hướng đến trang đăng nhập Google, 
        // không có giá trị trả về trực tiếp
        return null;
      })
      .catch(error => {
        console.error("Lỗi đăng nhập với Google (redirect):", error);
        
        // Log chi tiết lỗi và cấu hình
        console.log("Chi tiết lỗi:", {
          code: error.code,
          message: error.message,
          apiKey: firebaseConfig.apiKey ? `${firebaseConfig.apiKey.substring(0, 8)}...` : 'Chưa cấu hình',
          apiKeyLength: firebaseConfig.apiKey ? firebaseConfig.apiKey.length : 0,
          authDomain: firebaseConfig.authDomain,
          firebaseInitialized: firebase.apps.length > 0
        });
        
        window.authProcessRunning = false;
        throw error;
      });
  });
}

function signOut() {
  return runSingleAuthProcess(() => {
    const authInstance = auth();
    if (!authInstance) {
      return Promise.reject(new Error("Firebase Auth không được khởi tạo"));
    }
    
    return authInstance.signOut()
      .catch(error => {
        console.error("Lỗi đăng xuất:", error);
        throw error;
      });
  });
}

function getCurrentUser() {
  const authInstance = auth();
  if (!authInstance) {
    return Promise.resolve(null);
  }
  
  return Promise.resolve(authInstance.currentUser);
}

function saveUserToFirestore(user) {
  if (!user) return Promise.resolve();

  try {
    const userData = {
      uid: user.uid,
      displayName: user.displayName || 'Người dùng',
      email: user.email,
      photoURL: user.photoURL,
      lastLogin: new Date().toISOString()
    };
    
    if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
      return firebase.firestore().collection('users').doc(user.uid).set(userData, { merge: true })
        .then(() => console.log('Đã lưu thông tin người dùng vào Firestore'))
        .catch(error => console.error('Lỗi khi lưu thông tin người dùng:', error));
    }
    
    return Promise.resolve();
  } catch (error) {
    console.error('Lỗi khi lưu thông tin người dùng:', error);
    return Promise.resolve();
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
    
    // Sử dụng công cụ xử lý lỗi mới nếu có
    if (window.firebaseDebug && typeof window.firebaseDebug.handleAuthError === 'function') {
      window.firebaseDebug.handleAuthError(error);
    } else if (typeof window.firebaseUtils !== 'undefined' && typeof window.firebaseUtils.showAlert === 'function') {
      window.firebaseUtils.showAlert('Đăng nhập không thành công: ' + error.message, 'error');
    } else {
      alert('Đăng nhập không thành công: ' + (error.message || 'Vui lòng thử lại sau'));
    }
    
    // Thử kiểm tra cấu hình để phát hiện vấn đề
    if (window.firebaseDebug && typeof window.firebaseDebug.checkConfig === 'function') {
      window.firebaseDebug.checkConfig();
    }
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

// Xóa tất cả các event listener hiện có
function removeAllAuthEventListeners() {
  const loginButtons = document.querySelectorAll('.login-with-google-btn');
  loginButtons.forEach(button => {
    const newButton = button.cloneNode(true);
    button.parentNode.replaceChild(newButton, button);
  });
  
  const mobileLoginBtn = document.querySelector('.login-btn');
  if (mobileLoginBtn) {
    const newMobileBtn = mobileLoginBtn.cloneNode(true);
    mobileLoginBtn.parentNode.replaceChild(newMobileBtn, mobileLoginBtn);
  }
}

// Thêm sự kiện click cho các nút đăng nhập/đăng xuất
function setupAuthButtons() {
  // Xóa tất cả event listener trước khi thiết lập
  removeAllAuthEventListeners();
  
  console.log('Thiết lập sự kiện cho nút đăng nhập từ firebase-auth.js');
  
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

  // Nút đăng nhập chính trên trang nếu tồn tại
  const mainLoginBtn = document.getElementById('main-login-btn');
  if (mainLoginBtn) {
    console.log('Đã tìm thấy nút đăng nhập chính');
    mainLoginBtn.addEventListener('click', () => {
      if (currentUser) {
        handleSignOut();
      } else {
        handleGoogleSignIn();
      }
    });
  }

  // Nút đăng nhập mobile
  const mobileLoginBtn = document.querySelector('.login-btn');
  if (mobileLoginBtn) {
    mobileLoginBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation(); // Ngăn sự kiện lan ra sidebar toggle
      
      if (currentUser) {
        handleSignOut();
      } else {
        handleGoogleSignIn();
      }
    });
  }
}

// Thêm hàm mới để kiểm tra kết quả từ redirect
function checkRedirectResult() {
  const authInstance = auth();
  if (!authInstance) {
    return Promise.resolve(null);
  }
  
  return authInstance.getRedirectResult()
    .then(result => {
      if (result.user) {
        console.log('Đăng nhập thành công qua redirect');
        
        // Khôi phục URL trước khi chuyển hướng nếu có
        const redirectUrl = localStorage.getItem('auth_redirect_url');
        if (redirectUrl && redirectUrl !== window.location.href) {
          console.log('Chuyển hướng về trang trước khi đăng nhập: ' + redirectUrl);
          // Xóa URL đã lưu
          localStorage.removeItem('auth_redirect_url');
          // Chuyển hướng về trang trước
          setTimeout(() => {
            window.location.href = redirectUrl;
          }, 500);
        }
        
        return result.user;
      }
      return null;
    })
    .catch(error => {
      console.error('Lỗi khi xác thực redirect:', error);
      // Xử lý theo loại lỗi
      if (error.code === 'auth/credential-already-in-use') {
        alert('Tài khoản này đã được liên kết với người dùng khác.');
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        alert('Email này đã được sử dụng với phương thức đăng nhập khác.');
      } else if (error.code === 'auth/auth-domain-config-required') {
        alert('Cấu hình domain cho xác thực chưa đúng. Vui lòng liên hệ quản trị viên.');
      }
      return null;
    });
}

// Kiểm tra trạng thái đăng nhập khi tải trang
async function checkAuthStateOnLoad() {
  try {
    // Kiểm tra kết quả từ redirect trước
    const redirectUser = await checkRedirectResult();
    if (redirectUser) {
      currentUser = redirectUser;
      updateUIForAuthState(redirectUser);
      return;
    }
    
    const user = await getCurrentUser();
    currentUser = user;
    updateUIForAuthState(user);
  } catch (error) {
    console.error('Lỗi kiểm tra trạng thái đăng nhập:', error);
  }
}

// Kiểm tra kết nối Firebase sớm khi trang được tải
function testFirebaseConnection() {
  try {
    // Kiểm tra xem Firebase đã được khởi tạo chưa
    if (typeof firebase === 'undefined' || firebase.apps.length === 0) {
      console.error('Firebase chưa được khởi tạo khi thử kiểm tra kết nối');
      return Promise.resolve(false);
    }
    
    const config = window.getFirebaseConfig ? window.getFirebaseConfig() : null;
    if (!config || !config.apiKey) {
      console.error('Cấu hình Firebase không hợp lệ khi thử kiểm tra kết nối');
      return Promise.resolve(false);
    }
    
    console.log('Đang kiểm tra kết nối Firebase với API key:', config.apiKey.substring(0, 8) + '...');
    
    // Thử một yêu cầu đơn giản tới Firebase Auth
    return firebase.auth().fetchSignInMethodsForEmail('test@example.com')
      .then(() => {
        console.log('Kết nối Firebase thành công và API key hợp lệ');
        return true;
      })
      .catch(error => {
        // Một số lỗi là chấp nhận được (như email không tồn tại)
        if (error.code === 'auth/invalid-email' || error.code === 'auth/user-not-found') {
          console.log('Kết nối Firebase thành công, API key hợp lệ');
          return true;
        }
        
        // Lỗi API key không hợp lệ
        if (error.code === 'auth/api-key-not-valid' || 
            (error.message && error.message.includes('api-key-not-valid'))) {
          console.error('API key không hợp lệ khi kiểm tra kết nối Firebase:', error);
          
          // Thông báo lỗi API key nếu cần
          if (window.firebaseDebug && typeof window.firebaseDebug.handleApiKeyError === 'function') {
            window.firebaseDebug.handleApiKeyError();
          }
          
          return false;
        }
        
        // Các lỗi khác (có thể là lỗi mạng hoặc cấu hình)
        console.warn('Có lỗi khi kiểm tra kết nối Firebase, nhưng có thể không phải lỗi API key:', error);
        return false;
      });
  } catch (error) {
    console.error('Lỗi không mong đợi khi kiểm tra kết nối Firebase:', error);
    return Promise.resolve(false);
  }
}

// Khởi tạo khi tài liệu được tải
document.addEventListener('DOMContentLoaded', () => {
  console.log("Khởi tạo firebase-auth.js");
  
  setTimeout(() => {
    // Kiểm tra kết nối Firebase trước
    testFirebaseConnection()
      .then(isConnected => {
        if (isConnected) {
          // Tiếp tục khởi tạo auth nếu kết nối thành công
          initializeAuthListener();
          setupAuthButtons();
          checkAuthStateOnLoad();
        } else {
          console.warn('Không thể kết nối đến Firebase, chức năng xác thực có thể không hoạt động');
          
          // Vẫn thiết lập các nút đăng nhập để người dùng có thể thử lại
          setupAuthButtons();
        }
      });
  }, 1500); // Tăng thời gian chờ lên 1.5 giây để đảm bảo Firebase đã khởi tạo
});

// Xuất các hàm để có thể sử dụng từ bên ngoài
window.firebaseAuth = {
  signInWithGoogle,
  signOut,
  getCurrentUser,
  handleGoogleSignIn,
  handleSignOut,
  checkAuthStateOnLoad,
  setupAuthButtons,
  checkRedirectResult,
  testFirebaseConnection
}; 