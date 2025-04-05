// Script sửa menu admin
(function() {
  // Hàm kiểm tra và thêm menu admin
  function checkAndAddAdminMenu() {
    console.log("Đang kiểm tra và thêm menu admin...");
    
    // Kiểm tra xem người dùng có phải là admin không
    if (!window.AdminAuth || typeof window.AdminAuth.checkAdminStatus !== "function") {
      console.warn("AdminAuth không khả dụng");
      return;
    }
    
    const isAdmin = window.AdminAuth.checkAdminStatus();
    console.log("Kết quả kiểm tra admin:", isAdmin);
    
    if (!isAdmin) {
      console.log("Người dùng không phải là admin, không thêm menu");
      return;
    }
    
    // Thêm nút Admin vào menu người dùng desktop
    const userMenu = document.querySelector(".user-menu-items");
    if (userMenu) {
      // Kiểm tra xem đã có menu item admin chưa
      if (!userMenu.querySelector(".admin-menu-item")) {
        // Tạo phần tử menu Admin
        const adminMenuItem = document.createElement("a");
        adminMenuItem.href = "admin/index.html";
        adminMenuItem.className = "user-menu-item admin-menu-item";
        adminMenuItem.innerHTML = "<i class=\"fas fa-user-shield\"></i> Quản trị viên";
        
        // Thêm vào trước nút đăng xuất
        const logoutItem = userMenu.querySelector(".logout");
        if (logoutItem) {
          userMenu.insertBefore(adminMenuItem, logoutItem);
        } else {
          userMenu.appendChild(adminMenuItem);
        }
        
        console.log("Đã thêm menu admin vào menu desktop");
      }
    }
    
    // Thêm mục admin vào sidebar mobile
    const sidebarMenu = document.querySelector(".sidebar-menu ul");
    if (sidebarMenu) {
      // Kiểm tra xem đã có menu item admin trong sidebar chưa
      if (!sidebarMenu.querySelector(".admin-sidebar-item")) {
        // Tạo phần tử menu Admin cho sidebar
        const adminSidebarItem = document.createElement("li");
        adminSidebarItem.innerHTML = "<a href=\"admin/index.html\" class=\"admin-sidebar-item\"><i class=\"fas fa-user-shield\"></i> Quản trị viên</a>";
        
        // Thêm vào trước mục cài đặt hoặc mục cuối cùng
        const settingsItem = sidebarMenu.querySelector("li:last-child");
        if (settingsItem) {
          sidebarMenu.insertBefore(adminSidebarItem, settingsItem);
        } else {
          sidebarMenu.appendChild(adminSidebarItem);
        }
        
        console.log("Đã thêm menu admin vào sidebar mobile");
      }
    }
  }
  
  // Kiểm tra và thêm menu sau khi trang tải
  document.addEventListener("DOMContentLoaded", function() {
    // Thực hiện kiểm tra đầu tiên
    checkAndAddAdminMenu();
    
    // Kiểm tra mỗi khi người dùng click vào avatar
    const headerAvatar = document.getElementById("header-avatar");
    if (headerAvatar) {
      headerAvatar.addEventListener("click", function() {
        setTimeout(checkAndAddAdminMenu, 100);
      });
    }
    
    // Kiểm tra lại sau 2 giây
    setTimeout(checkAndAddAdminMenu, 2000);
    
    // Kiểm tra định kỳ
    setInterval(checkAndAddAdminMenu, 5000);
  });
  
  // Thực hiện kiểm tra ngay lập tức
  checkAndAddAdminMenu();
  
  // Kiểm tra lại sau 1 giây
  setTimeout(checkAndAddAdminMenu, 1000);
})();
