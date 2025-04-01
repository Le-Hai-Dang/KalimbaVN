// Script xử lý lỗi và hỗ trợ debug cho Firebase Authentication

// Danh sách mã lỗi Firebase Authentication và mô tả thân thiện với người dùng
const authErrorMessages = {
  // Lỗi Firebase Auth chung
  'auth/app-deleted': 'Ứng dụng Firebase không khả dụng.',
  'auth/app-not-authorized': 'Ứng dụng chưa được cấu hình đúng.',
  'auth/argument-error': 'Tham số không hợp lệ.',
  'auth/invalid-api-key': 'Khóa API không hợp lệ.',
  'auth/invalid-user-token': 'Thông tin xác thực không hợp lệ.',
  'auth/network-request-failed': 'Yêu cầu mạng thất bại, vui lòng kiểm tra kết nối internet.',
  'auth/operation-not-allowed': 'Chức năng này chưa được kích hoạt.',
  'auth/requires-recent-login': 'Vui lòng đăng nhập lại.',
  'auth/too-many-requests': 'Quá nhiều yêu cầu, vui lòng thử lại sau.',
  'auth/unauthorized-domain': 'Tên miền không được phép sử dụng xác thực.',
  'auth/user-disabled': 'Tài khoản người dùng đã bị vô hiệu hóa.',
  'auth/user-token-expired': 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  'auth/web-storage-unsupported': 'Trình duyệt của bạn không hỗ trợ lưu trữ web.',
  
  // Lỗi đăng nhập email/mật khẩu
  'auth/invalid-email': 'Địa chỉ email không hợp lệ.',
  'auth/user-not-found': 'Không tìm thấy tài khoản với email này.',
  'auth/wrong-password': 'Mật khẩu không đúng.',
  
  // Lỗi đăng nhập với nhà cung cấp (Google, Facebook...)
  'auth/account-exists-with-different-credential': 'Email này đã được liên kết với phương thức đăng nhập khác.',
  'auth/auth-domain-config-required': 'Cấu hình domain chưa được thiết lập đúng.',
  'auth/cancelled-popup-request': 'Yêu cầu popup đã bị hủy.',
  'auth/popup-blocked': 'Popup đăng nhập bị chặn bởi trình duyệt.',
  'auth/popup-closed-by-user': 'Người dùng đã đóng cửa sổ đăng nhập.',
  'auth/unauthorized-domain': 'Tên miền này không được phép sử dụng xác thực Firebase.',
  'auth/credential-already-in-use': 'Thông tin đăng nhập này đã được sử dụng bởi một tài khoản khác.',
  'auth/operation-not-supported-in-this-environment': 'Phương thức đăng nhập này không hỗ trợ trong môi trường hiện tại.',
  'auth/timeout': 'Quá thời gian xử lý yêu cầu. Vui lòng thử lại.',
  'auth/missing-android-pkg-name': 'Thiếu tên gói Android khi cấu hình.',
  'auth/missing-continue-uri': 'Thiếu URL tiếp tục.',
  'auth/missing-ios-bundle-id': 'Thiếu ID bundle iOS khi cấu hình.',
  'auth/invalid-continue-uri': 'URL tiếp tục không hợp lệ.',
  'auth/unauthorized-continue-uri': 'URL tiếp tục không được cấp quyền.',
  
  // Lỗi khác
  'auth/api-key-not-valid.-please-pass-a-valid-api-key.': 'Khóa API không hợp lệ. Vui lòng sử dụng khóa API hợp lệ.',
  'auth/internal-error': 'Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.'
};

// Thêm hàm kiểm tra API key chi tiết hơn
function checkApiKeyValidity() {
  try {
    const config = window.getFirebaseConfig ? window.getFirebaseConfig() : null;
    if (!config || !config.apiKey) {
      console.error('Không tìm thấy API key trong cấu hình Firebase');
      return {
        valid: false,
        reason: 'API key không được cấu hình'
      };
    }
    
    // Kiểm tra độ dài cơ bản (API key Firebase thường có độ dài nhất định)
    if (config.apiKey.length < 20) {
      console.error('API key có độ dài không hợp lệ');
      return {
        valid: false,
        reason: 'API key quá ngắn, có vẻ không hợp lệ'
      };
    }
    
    // Kiểm tra định dạng API key (thường bắt đầu bằng AIza)
    if (!config.apiKey.startsWith('AIza')) {
      console.error('API key không đúng định dạng');
      return {
        valid: false,
        reason: 'API key không đúng định dạng, API key Firebase thường bắt đầu bằng AIza'
      };
    }
    
    console.log('API key có vẻ hợp lệ về định dạng:', config.apiKey.substring(0, 8) + '...');
    return {
      valid: true,
      apiKey: config.apiKey.substring(0, 8) + '...'
    };
  } catch (error) {
    console.error('Lỗi khi kiểm tra API key:', error);
    return {
      valid: false,
      reason: 'Lỗi khi kiểm tra API key: ' + error.message
    };
  }
}

// Hàm xử lý cụ thể cho lỗi api-key-not-valid
function handleApiKeyError() {
  const keyStatus = checkApiKeyValidity();
  const config = window.getFirebaseConfig ? window.getFirebaseConfig() : null;
  
  let message = 'Lỗi API key không hợp lệ. ';
  message += keyStatus.valid ? 
    'API key có định dạng hợp lệ nhưng có thể đã hết hạn hoặc bị vô hiệu hóa.' : 
    'Lý do: ' + keyStatus.reason;
  
  message += '\n\nĐể khắc phục:';
  message += '\n1. Kiểm tra lại API key trong Firebase Console';
  message += '\n2. Cập nhật API key trong file js/firebase-constants.js';
  message += '\n3. Làm mới trang sau khi cập nhật';
  
  console.error(message);
  
  // Hiển thị thông báo trên UI
  if (typeof alert === 'function') {
    alert(message);
  }
  
  return {
    message: message,
    config: config ? {
      apiKey: config.apiKey ? (config.apiKey.substring(0, 8) + '...') : 'Không tìm thấy',
      authDomain: config.authDomain,
      projectId: config.projectId
    } : 'Không tìm thấy cấu hình'
  };
}

// Hàm xử lý và hiển thị thông báo lỗi cho người dùng
function handleAuthError(error) {
  console.error('Firebase Auth Error:', error);
  
  // Xử lý riêng cho lỗi api-key-not-valid
  if (error && (error.code === 'auth/api-key-not-valid' || 
      (error.code && error.code.includes('api-key-not-valid')) ||
      (error.message && error.message.includes('api-key-not-valid')))) {
    return handleApiKeyError();
  }
  
  // Lấy mã lỗi từ đối tượng lỗi
  let errorCode = error.code || '';
  // Nếu là chuỗi lỗi thì phân tích
  if (typeof error === 'string') {
    if (error.includes('auth/')) {
      errorCode = error;
    } else {
      errorCode = 'unknown';
    }
  }
  
  // Lấy message từ danh sách đã định nghĩa hoặc sử dụng message gốc
  const friendlyMessage = authErrorMessages[errorCode] || 
                          (error.message ? error.message : 'Đã xảy ra lỗi khi xác thực. Vui lòng thử lại sau.');
  
  // Hiển thị thông báo cho người dùng
  if (typeof alert === 'function') {
    alert('Lỗi đăng nhập: ' + friendlyMessage);
  }
  
  // Ghi log chi tiết cho mục đích debug
  console.log({
    errorCode: errorCode,
    errorMessage: error.message || '',
    stackTrace: error.stack || '',
    friendlyMessage: friendlyMessage,
    firebaseConfig: window.getFirebaseConfig ? window.getFirebaseConfig() : null
  });
  
  // Cài đặt lưu lỗi để xử lý sau
  localStorage.setItem('last_auth_error', JSON.stringify({
    code: errorCode,
    message: error.message || '',
    timestamp: new Date().toISOString()
  }));
  
  return friendlyMessage;
}

// Kiểm tra và hiển thị thông tin cấu hình Firebase
function checkFirebaseConfig() {
  if (typeof firebase === 'undefined') {
    console.error('Firebase SDK chưa được tải');
    return false;
  }
  
  try {
    // Lấy cấu hình hiện tại từ firebase-constants.js
    const config = window.getFirebaseConfig ? window.getFirebaseConfig() : null;
    if (!config) {
      console.error('Không thể lấy cấu hình Firebase từ firebase-constants.js');
      return false;
    }
    
    // Kiểm tra các thông số bắt buộc
    const requiredFields = ['apiKey', 'authDomain', 'projectId'];
    const missingFields = requiredFields.filter(field => !config[field]);
    
    if (missingFields.length > 0) {
      console.error('Thiếu các trường bắt buộc trong cấu hình Firebase:', missingFields.join(', '));
      return false;
    }
    
    // In thông tin cấu hình ẩn danh
    console.log('Firebase Config OK:', {
      apiKeyValid: config.apiKey && config.apiKey.length > 10,
      authDomain: config.authDomain,
      projectId: config.projectId
    });
    
    // Kiểm tra xem Firebase đã khởi tạo chưa
    if (firebase.apps.length === 0) {
      console.error('Firebase chưa được khởi tạo');
      return false;
    }
    
    console.log('Firebase đã được khởi tạo thành công');
    return true;
  } catch (err) {
    console.error('Lỗi khi kiểm tra cấu hình Firebase:', err);
    return false;
  }
}

// Thêm hàm kiểm tra API key
function testApiKey() {
  try {
    const config = window.getFirebaseConfig ? window.getFirebaseConfig() : null;
    if (!config || !config.apiKey) {
      console.error('Không tìm thấy API key trong cấu hình Firebase');
      return false;
    }
    
    console.log('Đang kiểm tra API key Firebase:', config.apiKey.substring(0, 10) + '...');
    
    // Hiển thị đầy đủ thông tin cấu hình cho debug
    console.log('Cấu hình Firebase đầy đủ:', {
      apiKey: config.apiKey.substring(0, 10) + '...',
      authDomain: config.authDomain,
      projectId: config.projectId,
      storageBucket: config.storageBucket,
      appInitialized: firebase.apps.length > 0
    });
    
    return true;
  } catch (error) {
    console.error('Lỗi khi kiểm tra API key:', error);
    return false;
  }
}

// Thêm hàm kiểm tra domain
function checkAllowedDomains() {
  try {
    const currentDomain = window.location.hostname;
    console.log('Tên miền hiện tại:', currentDomain);
    console.log('Vui lòng đảm bảo tên miền này đã được thêm vào danh sách được phép trong Firebase Console');
    
    return {
      currentDomain: currentDomain,
      isLocalhost: currentDomain === 'localhost' || currentDomain === '127.0.0.1'
    };
  } catch (error) {
    console.error('Lỗi khi kiểm tra domain:', error);
    return null;
  }
}

// Thêm hàm khởi động lại Firebase
function reinitializeFirebase() {
  try {
    // Đảm bảo đã tải các script cần thiết
    if (typeof firebase === 'undefined') {
      console.error('Firebase SDK chưa được tải, không thể khởi động lại');
      return false;
    }
    
    // Lấy cấu hình
    const config = window.getFirebaseConfig ? window.getFirebaseConfig() : null;
    if (!config) {
      console.error('Không thể lấy cấu hình Firebase');
      return false;
    }
    
    // Xóa tất cả các phiên bản Firebase đã khởi tạo
    firebase.apps.forEach(app => {
      try {
        app.delete();
      } catch (e) {
        console.error('Không thể xóa ứng dụng Firebase:', e);
      }
    });
    
    // Khởi tạo lại Firebase
    firebase.initializeApp(config);
    console.log('Đã khởi động lại Firebase thành công');
    return true;
  } catch (error) {
    console.error('Lỗi khi khởi động lại Firebase:', error);
    return false;
  }
}

// Thêm các thông tin debug vào window
window.firebaseDebug = {
  checkConfig: checkFirebaseConfig,
  handleAuthError: handleAuthError,
  clearAuthErrors: () => localStorage.removeItem('last_auth_error'),
  getLastError: () => JSON.parse(localStorage.getItem('last_auth_error') || 'null'),
  testApiKey: testApiKey,
  checkApiKeyValidity: checkApiKeyValidity,
  checkAllowedDomains: checkAllowedDomains,
  reinitializeFirebase: reinitializeFirebase
};

// Kiểm tra cấu hình khi tải trang
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(checkFirebaseConfig, 2000);
}); 