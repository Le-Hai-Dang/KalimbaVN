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

// Hàm xử lý và hiển thị thông báo lỗi cho người dùng
function handleAuthError(error) {
  console.error('Firebase Auth Error:', error);
  
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
    friendlyMessage: friendlyMessage
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

// Thêm các thông tin debug vào window
window.firebaseDebug = {
  checkConfig: checkFirebaseConfig,
  handleAuthError: handleAuthError,
  clearAuthErrors: () => localStorage.removeItem('last_auth_error'),
  getLastError: () => JSON.parse(localStorage.getItem('last_auth_error') || 'null')
};

// Kiểm tra cấu hình khi tải trang
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(checkFirebaseConfig, 2000);
}); 