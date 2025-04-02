/**
 * Admin Authentication Module
 * Quản lý các chức năng xác thực dành cho admin
 */

// Danh sách email được cấp quyền admin
const ADMIN_EMAILS = [
  'danghaile2003@gmail.com',
  'tranminhchau1904@gmail.com'
];

// Biến lưu trạng thái admin
let isAdminUser = false;

/**
 * Kiểm tra xem người dùng hiện tại có phải là admin không
 * @returns {Boolean} True nếu là admin, False nếu không phải
 */
function checkAdminStatus() {
  try {
    // Kiểm tra xem đã có trạng thái admin trong sessionStorage chưa
    const savedAdminStatus = sessionStorage.getItem('kalimbaAdminStatus');
    if (savedAdminStatus === 'true') {
      isAdminUser = true;
      return true;
    }
    
    // Nếu chưa có trong sessionStorage, kiểm tra từ localStorage
    const savedUser = localStorage.getItem('kalimbaUser');
    
    if (!savedUser) {
      // Không có thông tin người dùng
      isAdminUser = false;
      sessionStorage.setItem('kalimbaAdminStatus', 'false');
      return false;
    }
    
    const user = JSON.parse(savedUser);
    
    // Kiểm tra email có trong danh sách admin không
    if (user && user.email && ADMIN_EMAILS.includes(user.email)) {
      isAdminUser = true;
      // Lưu trạng thái admin vào sessionStorage để duy trì trong phiên làm việc
      sessionStorage.setItem('kalimbaAdminStatus', 'true');
      return true;
    }
    
    isAdminUser = false;
    sessionStorage.setItem('kalimbaAdminStatus', 'false');
    return false;
  } catch (error) {
    console.error('Lỗi khi kiểm tra quyền admin:', error);
    isAdminUser = false;
    sessionStorage.setItem('kalimbaAdminStatus', 'false');
    return false;
  }
}

/**
 * Chuyển hướng người dùng không phải admin ra khỏi trang admin
 */
function redirectIfNotAdmin() {
  // Kiểm tra xem có đang ở trang admin không
  const isAdminPage = window.location.href.includes('/admin/');
  
  // Nếu không phải trang admin, không cần kiểm tra
  if (!isAdminPage) {
    return true;
  }
  
  // Kiểm tra quyền admin
  if (!checkAdminStatus()) {
    // Kiểm tra thời điểm lần cuối hiển thị thông báo lỗi
    const lastErrorTime = localStorage.getItem('admin_error_timestamp');
    const now = new Date().getTime();
    
    // Nếu đã hiển thị thông báo lỗi trong vòng 1 phút, không hiển thị lại
    if (lastErrorTime && (now - parseInt(lastErrorTime)) < 60000) {
      return false;
    }
    
    // Lưu thời điểm hiển thị thông báo lỗi
    localStorage.setItem('admin_error_timestamp', now.toString());
    
    // Hiển thị thông báo lỗi
    if (window.ErrorHandler) {
      const error = new Error('Bạn không có quyền truy cập trang quản trị');
      error.code = 'permission-denied';
      window.ErrorHandler.show(error, {
        duration: 10000,
        position: 'top-center',
        autoClose: false
      });
    } else {
      alert('Bạn không có quyền truy cập trang quản trị');
    }
    
    // Hiển thị thông báo đếm ngược và nút dừng chuyển hướng
    let countdownSeconds = 5;
    const countdownId = setInterval(() => {
      const errorMessage = document.querySelector('.error-message span');
      if (errorMessage) {
        errorMessage.textContent = `Bạn không có quyền thực hiện thao tác này. Vui lòng đăng nhập lại. (Chuyển về trang chủ sau ${countdownSeconds}s)`;
      }
      
      countdownSeconds--;
      
      if (countdownSeconds < 0) {
        clearInterval(countdownId);
        window.location.href = '../index.html';
      }
    }, 1000);
    
    // Tạo nút dừng chuyển hướng
    const stopRedirectBtn = document.createElement('button');
    stopRedirectBtn.textContent = 'Dừng chuyển hướng';
    stopRedirectBtn.style.cssText = `
      background-color: #007bff;
      color: white;
      border: none;
      padding: 5px 10px;
      border-radius: 3px;
      margin-left: 10px;
      cursor: pointer;
    `;
    stopRedirectBtn.addEventListener('click', () => {
      clearInterval(countdownId);
      const errorMessage = document.querySelector('.error-message span');
      if (errorMessage) {
        errorMessage.textContent = 'Bạn không có quyền thực hiện thao tác này. Vui lòng đăng nhập lại.';
      }
    });
    
    // Thêm nút vào thông báo lỗi sau 500ms (đảm bảo thông báo đã hiển thị)
    setTimeout(() => {
      const errorContent = document.querySelector('.error-content');
      if (errorContent) {
        errorContent.appendChild(stopRedirectBtn);
      }
    }, 500);
    
    return false;
  }
  
  return true;
}

/**
 * Kiểm tra và hiển thị nút Admin trong menu nếu người dùng là admin
 */
function showAdminMenuItem() {
  if (checkAdminStatus()) {
    // Thêm nút Admin vào menu người dùng desktop
    const userMenu = document.querySelector('.user-menu-items');
    if (userMenu) {
      // Kiểm tra xem đã có menu item admin chưa
      if (!userMenu.querySelector('.admin-menu-item')) {
        // Tạo phần tử menu Admin
        const adminMenuItem = document.createElement('a');
        adminMenuItem.href = 'admin/index.html';
        adminMenuItem.className = 'user-menu-item admin-menu-item';
        adminMenuItem.innerHTML = '<i class="fas fa-user-shield"></i> Quản trị viên';
        
        // Thêm vào trước nút đăng xuất
        const logoutItem = userMenu.querySelector('.logout');
        if (logoutItem) {
          userMenu.insertBefore(adminMenuItem, logoutItem);
        } else {
          userMenu.appendChild(adminMenuItem);
        }
      }
    }
    
    // Thêm mục admin vào sidebar mobile
    const sidebarMenu = document.querySelector('.sidebar-menu ul');
    if (sidebarMenu) {
      // Kiểm tra xem đã có menu item admin trong sidebar chưa
      if (!sidebarMenu.querySelector('.admin-sidebar-item')) {
        // Tạo phần tử menu Admin cho sidebar
        const adminSidebarItem = document.createElement('li');
        adminSidebarItem.innerHTML = '<a href="admin/index.html" class="admin-sidebar-item"><i class="fas fa-user-shield"></i> Quản trị viên</a>';
        
        // Thêm vào trước mục cài đặt hoặc mục cuối cùng
        const settingsItem = sidebarMenu.querySelector('li:last-child');
        if (settingsItem) {
          sidebarMenu.insertBefore(adminSidebarItem, settingsItem);
        } else {
          sidebarMenu.appendChild(adminSidebarItem);
        }
      }
    }
  }
}

// Khởi tạo khi trang tải xong
document.addEventListener('DOMContentLoaded', () => {
  // Kiểm tra và hiển thị menu Admin nếu có quyền
  checkAdminStatus();
  showAdminMenuItem();
  
  // Kiểm tra điều hướng nếu đang ở trang admin
  if (window.location.href.includes('/admin/')) {
    redirectIfNotAdmin();
  }
});

// Export các hàm ra window object để sử dụng trong HTML
window.AdminAuth = {
  checkAdminStatus,
  redirectIfNotAdmin,
  showAdminMenuItem,
  isAdmin: () => isAdminUser
}; 