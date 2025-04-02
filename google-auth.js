// Gắn sự kiện cho các nút đăng nhập
function attachLoginEvents() {
    // Nút đăng nhập chính
    const mainLoginBtn = document.getElementById('main-login-btn');
    if (mainLoginBtn) {
        mainLoginBtn.addEventListener('click', initiateGoogleLogin);
    }
    
    // Nút đăng nhập trong sidebar
    const sidebarLoginBtn = document.querySelector('.sidebar .login-with-google-btn');
    if (sidebarLoginBtn) {
        sidebarLoginBtn.addEventListener('click', initiateGoogleLogin);
    }
    
    // Nút đăng nhập mobile
    const mobileLoginBtn = document.querySelector('.mobile-header .login-btn');
    if (mobileLoginBtn) {
        mobileLoginBtn.addEventListener('click', initiateGoogleLogin);
    }
    
    // Event listener cho avatar header
    const headerAvatar = document.getElementById('header-avatar');
    const userMenu = document.getElementById('user-menu');
    if (headerAvatar && userMenu) {
        // Tạo overlay để bắt sự kiện click ra ngoài
        let menuOverlay = document.querySelector('.user-menu-overlay');
        if (!menuOverlay) {
            menuOverlay = document.createElement('div');
            menuOverlay.className = 'user-menu-overlay';
            document.body.appendChild(menuOverlay);
        }
        
        // Đóng menu và xóa overlay
        function closeMenu() {
            userMenu.classList.remove('visible');
            headerAvatar.classList.remove('active');
            menuOverlay.classList.remove('visible');
            
            // Sau khi hiệu ứng transition hoàn tất, ẩn menu hoàn toàn
            setTimeout(() => {
                if (!userMenu.classList.contains('visible')) {
                    userMenu.style.display = 'none';
                    menuOverlay.style.display = 'none';
                }
            }, 300);
        }
        
        // Hiển thị menu
        function showMenu() {
            // Di chuyển menu vào body để tránh bị giới hạn trong header
            if (!userMenu.getAttribute('data-moved')) {
                document.body.appendChild(userMenu);
                userMenu.setAttribute('data-moved', 'true');
            }
            
            // Hiển thị overlay để bắt sự kiện click ra ngoài
            menuOverlay.style.display = 'block';
            setTimeout(() => {
                menuOverlay.classList.add('visible');
            }, 10);
            
            // Cập nhật vị trí của menu căn chỉnh với avatar
            const avatarRect = headerAvatar.getBoundingClientRect();
            
            // Đảm bảo menu luôn hiển thị (display: block) trước khi thêm class 'visible'
            userMenu.style.display = 'block';
            
            // Thêm class active cho avatar
            headerAvatar.classList.add('active');
            
            // Căn menu với avatar (cách avatar 10px từ dưới lên)
            userMenu.style.position = 'fixed';
            userMenu.style.top = (avatarRect.bottom + 10) + 'px';
            
            // Căn giữa menu với avatar
            const avatarCenter = avatarRect.left + (avatarRect.width / 2);
            const menuWidth = 220; // Chiều rộng của menu
            
            let leftPosition = avatarCenter - (menuWidth / 2);
            
            // Đảm bảo menu không vượt quá viền phải màn hình
            if (leftPosition + menuWidth > window.innerWidth) {
                leftPosition = window.innerWidth - menuWidth - 10;
            }
            
            // Đảm bảo menu không vượt quá viền trái màn hình
            if (leftPosition < 10) {
                leftPosition = 10;
            }
            
            userMenu.style.left = leftPosition + 'px';
            userMenu.style.right = 'auto'; // Xóa right position cũ
            
            userMenu.style.zIndex = '99999';
            
            // Điều chỉnh vị trí mũi tên chỉ lên avatar
            const arrowPosition = Math.max(20, Math.min(200, avatarCenter - leftPosition));
            userMenu.style.setProperty('--arrow-position', `${arrowPosition}px`);
            
            // Thêm class visible sau khi đã định vị đúng
            setTimeout(() => {
                userMenu.classList.add('visible');
            }, 10);
        }
        
        // Xử lý click vào avatar
        headerAvatar.addEventListener('click', (event) => {
            event.stopPropagation(); // Ngăn sự kiện click lan ra document
            
            // Kiểm tra trạng thái menu
            const isVisible = userMenu.classList.contains('visible');
            
            if (isVisible) {
                closeMenu();
            } else {
                showMenu();
            }
        });
        
        // Xử lý click vào overlay
        menuOverlay.addEventListener('click', (event) => {
            if (userMenu.classList.contains('visible')) {
                closeMenu();
            }
        });
        
        // Ngăn chặn việc đóng menu khi click vào các mục trong menu (trừ nút logout)
        userMenu.addEventListener('click', (event) => {
            // Nếu click vào mục logout, cho phép sự kiện lan ra để menu đóng sau khi đăng xuất
            // Ngược lại, chặn sự kiện để menu không đóng khi click vào các mục khác
            if (!event.target.classList.contains('logout') && 
                !event.target.closest('.logout')) {
                event.stopPropagation();
            }
        });
        
        // Đóng menu khi nhấn phím Escape
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && userMenu.classList.contains('visible')) {
                closeMenu();
            }
        });
    }
    
    // Nút đăng xuất
    document.querySelectorAll('.logout').forEach(logoutBtn => {
        logoutBtn.addEventListener('click', logoutUser);
    });
}

// Cập nhật giao diện người dùng sau khi đăng nhập
function updateUIAfterLogin(userData) {
    console.log('Cập nhật UI sau khi đăng nhập:', userData);
    
    // Ẩn tất cả các nút đăng nhập
    document.querySelectorAll('.login-btn, .login-with-google-btn').forEach(btn => {
        btn.style.display = 'none';
    });
    
    // Hiển thị avatar đã đăng nhập
    const headerAvatar = document.getElementById('header-avatar');
    if (headerAvatar) {
        headerAvatar.style.display = 'flex';
        headerAvatar.classList.add('logged-in');
        
        // Reset nội dung
        headerAvatar.innerHTML = '';
        
        // Thiết lập avatar nếu có
        if (userData.picture) {
            const avatar = document.createElement('img');
            avatar.src = userData.picture;
            avatar.alt = userData.name;
            avatar.className = 'avatar-img';
            headerAvatar.appendChild(avatar);
        } else {
            // Nếu không có ảnh, hiển thị chữ cái đầu của tên người dùng
            const initial = document.createElement('div');
            initial.className = 'avatar-initial';
            initial.textContent = userData.name ? userData.name.charAt(0).toUpperCase() : 'U';
            headerAvatar.appendChild(initial);
        }
    }
    
    // Cập nhật avatar trong mobile header
    const mobileAvatar = document.querySelector('.mobile-header .header-avatar');
    if (mobileAvatar) {
        mobileAvatar.style.display = 'flex';
        mobileAvatar.classList.add('logged-in');
        
        // Reset nội dung
        mobileAvatar.innerHTML = '';
        
        // Thiết lập avatar nếu có
        if (userData.picture) {
            const avatar = document.createElement('img');
            avatar.src = userData.picture;
            avatar.alt = userData.name;
            avatar.className = 'avatar-img';
            mobileAvatar.appendChild(avatar);
        } else {
            // Nếu không có ảnh, hiển thị chữ cái đầu của tên người dùng
            const initial = document.createElement('div');
            initial.className = 'avatar-initial';
            initial.textContent = userData.name ? userData.name.charAt(0).toUpperCase() : 'U';
            mobileAvatar.appendChild(initial);
        }
    }
    
    // Cập nhật user menu với thông tin người dùng
    const userMenu = document.getElementById('user-menu');
    if (userMenu) {
        // Cập nhật tên người dùng và email
        const userName = userMenu.querySelector('.user-name');
        if (userName) {
            userName.textContent = userData.name || 'Người dùng';
        }
        
        const userEmail = userMenu.querySelector('.user-email');
        if (userEmail) {
            userEmail.textContent = userData.email || '';
        }
        
        // Cập nhật avatar
        const menuAvatar = userMenu.querySelector('.user-menu-header .user-avatar');
        if (menuAvatar) {
            menuAvatar.innerHTML = '';
            
            if (userData.picture) {
                const avatar = document.createElement('img');
                avatar.src = userData.picture;
                avatar.alt = userData.name;
                avatar.className = 'avatar-img';
                menuAvatar.appendChild(avatar);
            } else {
                const initial = document.createElement('div');
                initial.className = 'avatar-initial';
                initial.textContent = userData.name ? userData.name.charAt(0).toUpperCase() : 'U';
                menuAvatar.appendChild(initial);
            }
        }
    }
    
    // Cập nhật avatar trong sidebar
    updateSidebarAvatar();
    
    // Kiểm tra quyền admin
    checkAdminStatus(userData.uid);
}

// Khởi tạo Firebase Auth và kiểm tra trạng thái đăng nhập khi trang được tải
document.addEventListener('DOMContentLoaded', function() {
    // Khởi tạo Firebase Auth
    initFirebaseAuth();
    
    // Kiểm tra xem người dùng đã đăng nhập chưa
    checkLoginStatus();
    
    // Gắn sự kiện vào các nút đăng nhập
    attachLoginEvents();
}); 