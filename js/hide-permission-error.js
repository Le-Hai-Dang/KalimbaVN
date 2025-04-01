/**
 * Script tự động ẩn thông báo lỗi quyền không đủ
 */

// Hàm ẩn thông báo lỗi quyền
function hidePermissionErrors() {
  // Tìm tất cả thông báo lỗi (dựa vào màu và nội dung)
  const errorElements = document.querySelectorAll('div[style*="background-color: #f8d7da"], .firebase-error-message, .error-message');
  
  errorElements.forEach(element => {
    // Kiểm tra nội dung
    const content = element.textContent || '';
    if (content.includes('không có quyền') || 
        content.includes('đăng nhập lại') || 
        content.includes('permission') ||
        content.includes('Bạn không có quyền')) {
      // Ẩn ngay lập tức
      element.style.display = 'none';
      
      // Xóa khỏi DOM sau 100ms
      setTimeout(() => {
        if (element.parentNode) {
          element.parentNode.removeChild(element);
        }
      }, 100);
    }
  });
}

// Thực thi ngay khi script được tải
document.addEventListener('DOMContentLoaded', () => {
  // Thực thi ban đầu
  hidePermissionErrors();
  
  // Thiết lập thực thi định kỳ
  setInterval(hidePermissionErrors, 500);
  
  console.log('Đã thiết lập tự động ẩn thông báo lỗi quyền');
});

// Thực thi một lần nữa sau khi trang đã tải
window.addEventListener('load', hidePermissionErrors);

// Thêm vào window object để sử dụng từ bên ngoài nếu cần
window.hidePermissionErrors = hidePermissionErrors;
