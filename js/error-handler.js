/**
 * File xử lý lỗi cho ứng dụng Kalimba Chill
 * Cung cấp các hàm tiện ích để xử lý và hiển thị lỗi
 */

// Các loại lỗi
const ErrorTypes = {
  FIREBASE: 'firebase',
  NETWORK: 'network',
  PERMISSION: 'permission',
  VALIDATION: 'validation',
  UNKNOWN: 'unknown'
};

/**
 * Phân loại lỗi dựa trên thông báo lỗi
 * @param {Error} error Đối tượng lỗi
 * @returns {String} Loại lỗi
 */
function classifyError(error) {
  const message = error.message || '';
  const code = error.code || '';
  
  if (message.includes('firebase') || code.includes('firebase') || code.includes('permission-denied')) {
    if (message.includes('permission') || code.includes('permission-denied')) {
      return ErrorTypes.PERMISSION;
    }
    return ErrorTypes.FIREBASE;
  }
  
  if (message.includes('network') || message.includes('connection') || message.includes('internet')) {
    return ErrorTypes.NETWORK;
  }
  
  if (message.includes('validation') || message.includes('invalid')) {
    return ErrorTypes.VALIDATION;
  }
  
  return ErrorTypes.UNKNOWN;
}

/**
 * Xử lý hiển thị thông báo lỗi
 */
(function() {
    // Tránh tải nhiều lần
    if (window.ErrorHandler) {
        console.log('ErrorHandler đã được tải trước đó, bỏ qua');
        return;
    }
    
    // Thời gian mặc định hiển thị lỗi
    const DEFAULT_ERROR_DURATION = 5000;
    
    // Vị trí mặc định
    const DEFAULT_POSITION = 'top-right';
    
    // Biến lưu khoảng thời gian kiểm tra
    let checkInterval = null;
    
    // Biến lưu danh sách thông báo lỗi đang hiển thị
    const activeErrors = new Set();
    
    /**
     * Hiển thị thông báo lỗi
     * @param {Error|Object|String} error - Đối tượng lỗi hoặc chuỗi thông báo
     * @param {Object} options - Tùy chọn hiển thị
     */
    function show(error, options = {}) {
        // Ngăn hiển thị quá nhiều lỗi cùng lúc
        if (activeErrors.size >= 3) {
            console.warn('Đã đạt giới hạn hiển thị lỗi (3), bỏ qua lỗi mới');
            console.error('Lỗi bị bỏ qua:', error);
            return;
        }
        
        let errorMessage = '';
        
        // Xử lý các loại tham số lỗi khác nhau
  if (typeof error === 'string') {
            errorMessage = error;
        } else if (error instanceof Error) {
            errorMessage = error.message || 'Đã xảy ra lỗi không xác định';
        } else if (error && typeof error === 'object') {
            errorMessage = error.message || 'Đã xảy ra lỗi không xác định';
    } else {
            errorMessage = 'Đã xảy ra lỗi không xác định';
        }
        
        // Tạo ID duy nhất cho thông báo lỗi này
        const errorId = 'error-' + Date.now() + '-' + Math.round(Math.random() * 1000);
        
        // Cài đặt tùy chọn
        const {
            duration = DEFAULT_ERROR_DURATION,
            position = DEFAULT_POSITION,
            bgColor = '#f8d7da',
            textColor = '#721c24'
        } = options;
        
        // Tạo phần tử thông báo lỗi
        const errorElement = document.createElement('div');
        errorElement.id = errorId;
        errorElement.className = 'error-message';
        
        // Thêm vào danh sách active
        activeErrors.add(errorId);
        
        // Thêm nội dung
        errorElement.innerHTML = `
            <div class="error-content">
                <i class="fas fa-exclamation-circle"></i>
                <span>${errorMessage}</span>
                <button class="close-error-btn"><i class="fas fa-times"></i></button>
            </div>
        `;
        
        // Áp dụng CSS
        errorElement.style.cssText = `
            position: fixed;
            ${getPositionStyles(position)}
            background-color: ${bgColor};
            color: ${textColor};
            padding: 10px 15px;
            border-radius: 5px;
            box-shadow: 0 0 10px rgba(0,0,0,0.2);
            z-index: 9999;
            max-width: 400px;
            min-width: 250px;
            opacity: 0;
            transition: opacity 0.3s ease-in-out;
            margin: 10px;
        `;
        
        // Thêm vào DOM
        document.body.appendChild(errorElement);
        
        // Thêm sự kiện đóng
        const closeBtn = errorElement.querySelector('.close-error-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                closeError(errorElement, errorId);
            });
        }
        
        // Hiển thị với hiệu ứng
        setTimeout(() => {
            errorElement.style.opacity = '1';
        }, 10);
        
        // Tự động đóng sau khoảng thời gian nhất định
        if (duration > 0) {
            setTimeout(() => {
                closeError(errorElement, errorId);
            }, duration);
        }
        
        // Ghi log
        console.error('Lỗi:', error);
        
        return errorId;
    }
    
    /**
     * Lấy CSS cho vị trí
     * @param {String} position - Vị trí thông báo
     * @returns {String} - CSS cho vị trí
     */
    function getPositionStyles(position) {
        switch (position) {
            case 'top-left':
                return 'top: 20px; left: 20px;';
            case 'top-center':
                return 'top: 20px; left: 50%; transform: translateX(-50%);';
            case 'bottom-left':
                return 'bottom: 20px; left: 20px;';
            case 'bottom-right':
                return 'bottom: 20px; right: 20px;';
            case 'bottom-center':
                return 'bottom: 20px; left: 50%; transform: translateX(-50%);';
            case 'top-right':
            default:
                return 'top: 20px; right: 20px;';
        }
    }
    
    /**
     * Đóng thông báo lỗi
     * @param {HTMLElement} element - Phần tử cần đóng
     * @param {String} errorId - ID của thông báo lỗi
     */
    function closeError(element, errorId) {
        if (!element) return;
        
        // Ẩn dần
        element.style.opacity = '0';
        
        // Xóa khỏi DOM sau khi hoàn thành hiệu ứng
        setTimeout(() => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
            // Xóa khỏi danh sách active
            activeErrors.delete(errorId);
        }, 300);
    }
    
    /**
     * Đóng tất cả thông báo lỗi
     */
    function dismiss() {
        const errorMessages = document.querySelectorAll('.error-message');
        errorMessages.forEach(element => {
            element.style.opacity = '0';
            setTimeout(() => {
                if (element.parentNode) {
                    element.parentNode.removeChild(element);
                }
            }, 300);
        });
        
        // Xóa tất cả từ danh sách active
        activeErrors.clear();
    }
    
    /**
     * Bắt đầu kiểm tra định kỳ lỗi Firebase
     */
    function startErrorCheck() {
        // Nếu đã có interval đang chạy thì dừng lại
        if (checkInterval) {
            clearInterval(checkInterval);
        }
        
        // Thiết lập kiểm tra mới
        checkInterval = setInterval(() => {
            try {
                // Lấy lỗi từ localStorage nếu có
                const lastErrorJson = localStorage.getItem('last_firebase_error');
                
                if (lastErrorJson) {
                    const lastError = JSON.parse(lastErrorJson);
                    
                    // Chỉ hiển thị lỗi nếu nó mới xảy ra trong vòng 10 giây
                    const now = new Date().getTime();
                    const errorAge = now - lastError.timestamp;
                    
                    if (errorAge < 10000) {
                        show({ message: lastError.message }, { duration: 5000 });
                        // Xóa khỏi localStorage để không hiển thị lại
                        localStorage.removeItem('last_firebase_error');
                    }
                }
  } catch (error) {
                console.error('Lỗi khi kiểm tra lỗi Firebase:', error);
            }
        }, 3000); // Kiểm tra mỗi 3 giây thay vì 1 giây
    }
    
    // Bắt đầu kiểm tra sau khi trang đã tải
    document.addEventListener('DOMContentLoaded', startErrorCheck);
    
    // Xuất các hàm ra window object
    window.ErrorHandler = {
        show,
        dismiss,
        startErrorCheck,
    };
})();

/**
 * Tự động ẩn thông báo lỗi quyền không đủ
 * Hàm này sẽ tự động tìm và ẩn thông báo lỗi quyền không đủ
 */
function autoHidePermissionErrors() {
  // Tìm tất cả thông báo lỗi
  const errorMessages = document.querySelectorAll('.error-message');
  
  // Kiểm tra từng thông báo
  errorMessages.forEach(msg => {
    // Kiểm tra nội dung thông báo
    const messageText = msg.textContent || '';
    if (messageText.includes('không có quyền') || 
        messageText.includes('đăng nhập lại') ||
        messageText.includes('permission-denied')) {
      // Ẩn thông báo
      msg.style.display = 'none';
      
      // Xóa khỏi DOM sau 100ms để tránh lỗi
      setTimeout(() => {
        if (msg.parentNode) {
          msg.parentNode.removeChild(msg);
        }
      }, 100);
    }
  });
}

// Thực thi hàm ngay khi script được tải
autoHidePermissionErrors();

// Thực thi hàm định kỳ mỗi 500ms để ẩn thông báo mới
setInterval(autoHidePermissionErrors, 500);

// Thêm vào window object để sử dụng từ bên ngoài
window.ErrorHandler.hidePermissionErrors = autoHidePermissionErrors;

// Export các hàm ra window object để sử dụng trong HTML
window.ErrorHandler = {
  show: show,
  classify: classifyError,
  types: ErrorTypes,
  dismiss: dismiss
}; 