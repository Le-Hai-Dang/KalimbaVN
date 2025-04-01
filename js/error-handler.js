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
 * Hiển thị thông báo lỗi
 * @param {Error} error Đối tượng lỗi
 * @param {Object} options Tùy chọn hiển thị
 */
function showError(error, options = {}) {
  const defaultOptions = {
    duration: 5000,
    position: 'top-center',
    showIcon: true,
    showClose: true,
    autoClose: true
  };
  
  const config = { ...defaultOptions, ...options };
  const errorType = classifyError(error);
  
  // Tạo thông báo lỗi
  const errorContainer = document.createElement('div');
  errorContainer.className = `error-message error-${errorType}`;
  
  // Tùy chỉnh vị trí
  let positionStyle = 'top: 20px; left: 50%; transform: translateX(-50%);';
  if (config.position === 'top-right') {
    positionStyle = 'top: 20px; right: 20px;';
  } else if (config.position === 'top-left') {
    positionStyle = 'top: 20px; left: 20px;';
  } else if (config.position === 'bottom-center') {
    positionStyle = 'bottom: 20px; left: 50%; transform: translateX(-50%);';
  } else if (config.position === 'bottom-right') {
    positionStyle = 'bottom: 20px; right: 20px;';
  } else if (config.position === 'bottom-left') {
    positionStyle = 'bottom: 20px; left: 20px;';
  }
  
  // Tạo content cho thông báo
  let message = error.message || 'Đã xảy ra lỗi';
  let icon = 'fa-exclamation-circle';
  let bgColor = '#f8d7da';
  let textColor = '#721c24';
  
  // Điều chỉnh thông báo dựa trên loại lỗi
  if (errorType === ErrorTypes.PERMISSION) {
    message = 'Bạn không có quyền thực hiện thao tác này. Vui lòng đăng nhập lại.';
    icon = 'fa-lock';
  } else if (errorType === ErrorTypes.NETWORK) {
    message = 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet của bạn.';
    icon = 'fa-wifi';
    bgColor = '#fff3cd';
    textColor = '#856404';
  } else if (errorType === ErrorTypes.FIREBASE) {
    message = 'Lỗi kết nối đến Firebase. Vui lòng thử lại sau.';
    icon = 'fa-database';
  }
  
  // CSS inline cho thông báo lỗi
  errorContainer.style.cssText = `
    position: fixed;
    ${positionStyle}
    background-color: ${bgColor};
    color: ${textColor};
    padding: 10px 15px;
    border-radius: 5px;
    box-shadow: 0 0 10px rgba(0,0,0,0.2);
    z-index: 9999;
    max-width: 400px;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: space-between;
  `;
  
  // Tạo HTML cho thông báo
  errorContainer.innerHTML = `
    <div class="error-content" style="display: flex; align-items: center;">
      ${config.showIcon ? `<i class="fas ${icon}" style="margin-right: 10px;"></i>` : ''}
      <span>${message}</span>
    </div>
    ${config.showClose ? `<button class="close-error-btn" style="background: none; border: none; color: inherit; cursor: pointer; margin-left: 10px;"><i class="fas fa-times"></i></button>` : ''}
  `;
  
  document.body.appendChild(errorContainer);
  
  // Thêm sự kiện đóng thông báo
  if (config.showClose) {
    const closeBtn = errorContainer.querySelector('.close-error-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        errorContainer.remove();
      });
    }
  }
  
  // Tự động đóng thông báo sau thời gian đã định
  if (config.autoClose) {
    setTimeout(() => {
      if (errorContainer.parentNode) {
        errorContainer.remove();
      }
    }, config.duration);
  }
  
  // Lưu lỗi vào localStorage để xử lý sau này nếu cần
  localStorage.setItem('last_error', JSON.stringify({
    message: error.message || 'Unknown error',
    code: error.code || 'unknown',
    type: errorType,
    timestamp: new Date().getTime()
  }));
}

// Export các hàm ra window object để sử dụng trong HTML
window.ErrorHandler = {
  show: showError,
  classify: classifyError,
  types: ErrorTypes
}; 