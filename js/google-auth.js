/**
 * Google OAuth Integration
 * File này chứa các chức năng xử lý đăng nhập bằng Google Cloud Console
 */

// Thông tin OAuth từ Google Cloud Console
const googleConfig = {
    clientId: '441940370070-npv62v9muludbln5tajte0lhs0t66ggq.apps.googleusercontent.com',
    scopes: 'email profile',
    redirectUri: window.location.origin
};

// Biến toàn cục lưu thông tin người dùng hiện tại
let currentUser = null;

// Tải thư viện Google Identity Services khi trang tải xong
function loadGoogleAuthAPI() {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
    
    script.onload = () => {
        configureGoogleAuth();
    };
}

// Cấu hình Google OAuth
function configureGoogleAuth() {
    // Khởi tạo client Google
    window.googleClient = google.accounts.oauth2.initTokenClient({
        client_id: googleConfig.clientId,
        scope: googleConfig.scopes,
        callback: handleGoogleResponse
    });
    
    // Kiểm tra nếu người dùng đã đăng nhập trước đó
    checkLoginStatus();
    
    // Gắn sự kiện cho các nút đăng nhập
    attachLoginEvents();
}

// Xử lý phản hồi từ Google sau khi xác thực
function handleGoogleResponse(tokenResponse) {
    if (tokenResponse && tokenResponse.access_token) {
        // Lấy thông tin người dùng từ token
        fetchUserInfo(tokenResponse.access_token);
    } else {
        console.error('Đăng nhập Google thất bại:', tokenResponse);
        showAuthError('Đăng nhập Google thất bại. Vui lòng thử lại.');
    }
}

// Lấy thông tin người dùng từ Google API
function fetchUserInfo(accessToken) {
    fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Không thể lấy thông tin người dùng');
        }
        return response.json();
    })
    .then(userData => {
        // Lưu thông tin người dùng
        saveUserData(userData, accessToken);
        // Cập nhật giao diện
        updateUIAfterLogin(userData);
    })
    .catch(error => {
        console.error('Lỗi khi lấy thông tin người dùng:', error);
        showAuthError('Không thể lấy thông tin người dùng. Vui lòng thử lại.');
    });
}

// Lưu thông tin người dùng vào localStorage
function saveUserData(userData, token) {
    console.log('Lưu thông tin người dùng:', userData);
    
    currentUser = {
        id: userData.sub,
        name: userData.name,
        email: userData.email,
        picture: userData.picture,
        token: token,
        loginTime: new Date().getTime()
    };
    
    console.log('Đã chuẩn bị dữ liệu người dùng để lưu:', currentUser);
    
    // Lưu vào localStorage để duy trì đăng nhập
    localStorage.setItem('kalimbaUser', JSON.stringify(currentUser));
    
    // Lưu thông tin người dùng vào Firestore
    if (window.KalimbaFirebase && typeof window.KalimbaFirebase.saveUserToFirestore === 'function') {
        console.log('Tìm thấy hàm saveUserToFirestore, đang lưu dữ liệu vào Firestore...');
        
        // Gọi hàm lưu thông tin vào Firestore - sử dụng async/await
        (async () => {
            try {
                const result = await window.KalimbaFirebase.saveUserToFirestore(currentUser);
                console.log('Đã lưu thông tin người dùng vào Firestore, kết quả:', result);
            } catch (error) {
                console.error('Lỗi khi lưu thông tin người dùng vào Firestore:', error);
                // Không làm gì thêm, vẫn cho phép đăng nhập thành công
            }
        })();
    } else {
        console.warn('Hàm saveUserToFirestore không khả dụng');
        
        if (!window.KalimbaFirebase) {
            console.error('Đối tượng KalimbaFirebase không tồn tại');
        } else {
            console.error('Hàm saveUserToFirestore không tồn tại trong KalimbaFirebase:', window.KalimbaFirebase);
        }
    }
}

// Kiểm tra trạng thái đăng nhập
function checkLoginStatus() {
    const savedUser = localStorage.getItem('kalimbaUser');
    
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            
            // Kiểm tra thời gian token (1 giờ)
            const currentTime = new Date().getTime();
            const tokenAge = currentTime - currentUser.loginTime;
            
            if (tokenAge < 3600000) { // Token còn hiệu lực (1 giờ = 3600000ms)
                updateUIAfterLogin(currentUser);
            } else {
                // Token hết hạn, đăng xuất
                logoutUser();
            }
        } catch (error) {
            console.error('Lỗi khi phân tích dữ liệu người dùng:', error);
            localStorage.removeItem('kalimbaUser');
        }
    }
}

// Cập nhật giao diện sau khi đăng nhập
function updateUIAfterLogin(user) {
    // Cập nhật avatar và thông tin người dùng
    document.querySelectorAll('.user-avatar').forEach(avatar => {
        avatar.innerHTML = `<img src="${user.picture}" alt="${user.name}">`;
    });
    
    // Hiển thị avatar trên header
    const headerAvatar = document.getElementById('header-avatar');
    if (headerAvatar) {
        headerAvatar.style.display = 'block';
        headerAvatar.classList.add('logged-in');
    }
    
    // Cập nhật menu người dùng
    const userMenu = document.getElementById('user-menu');
    if (userMenu) {
        const userName = userMenu.querySelector('.user-name');
        const userEmail = userMenu.querySelector('.user-email');
        
        if (userName) userName.textContent = user.name;
        if (userEmail) userEmail.textContent = user.email;
        
        // Ẩn menu người dùng (sẽ hiển thị khi click vào avatar)
        userMenu.style.display = 'none';
        userMenu.classList.remove('visible');
    }
    
    // Ẩn nút đăng nhập, hiển thị menu user
    document.querySelectorAll('.login-with-google-btn').forEach(btn => {
        btn.style.display = 'none';
    });
    
    // Hiển thị phần tử chỉ dành cho người dùng đã đăng nhập
    document.querySelectorAll('.user-only-menu-item').forEach(item => {
        item.style.display = 'flex';
    });
    
    // Hiển thị nút đăng xuất
    document.querySelectorAll('.logout').forEach(btn => {
        btn.style.display = 'flex';
    });
    
    // Cập nhật sidebar nếu có
    const sidebarLoginSection = document.querySelector('.sidebar .login-section');
    if (sidebarLoginSection) {
        sidebarLoginSection.innerHTML = `
            <div class="user-info">
                <div class="user-name">${user.name}</div>
                <div class="user-email">${user.email}</div>
                <button class="logout-btn">
                    <i class="fas fa-sign-out-alt"></i> Đăng xuất
                </button>
            </div>
        `;
        
        // Gắn sự kiện đăng xuất cho nút mới
        const logoutBtn = sidebarLoginSection.querySelector('.logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', logoutUser);
        }
    }
}

// Xử lý đăng xuất
function logoutUser() {
    // Xóa dữ liệu người dùng
    currentUser = null;
    localStorage.removeItem('kalimbaUser');
    
    // Ẩn avatar trên header
    const headerAvatar = document.getElementById('header-avatar');
    if (headerAvatar) {
        headerAvatar.style.display = 'none';
        headerAvatar.classList.remove('logged-in');
    }
    
    // Hiển thị lại nút đăng nhập
    document.querySelectorAll('.login-with-google-btn').forEach(btn => {
        btn.style.display = 'flex';
    });
    
    // Ẩn menu người dùng (trên desktop)
    const userMenu = document.getElementById('user-menu');
    if (userMenu) {
        userMenu.style.display = 'none';
    }
    
    // Ẩn các phần tử chỉ dành cho người dùng đã đăng nhập
    document.querySelectorAll('.user-only-menu-item').forEach(item => {
        item.style.display = 'none';
    });
    
    // Ẩn nút đăng xuất
    document.querySelectorAll('.logout').forEach(btn => {
        btn.style.display = 'none';
    });
    
    // Cập nhật avatar
    document.querySelectorAll('.user-avatar').forEach(avatar => {
        avatar.innerHTML = `<i class="fab fa-google"></i>`;
    });
    
    // Cập nhật menu người dùng
    if (userMenu) {
        const userName = userMenu.querySelector('.user-name');
        const userEmail = userMenu.querySelector('.user-email');
        
        if (userName) userName.textContent = 'Chưa đăng nhập';
        if (userEmail) userEmail.textContent = '';
    }
    
    // Cập nhật sidebar nếu có
    const sidebarLoginSection = document.querySelector('.sidebar .login-section');
    if (sidebarLoginSection) {
        sidebarLoginSection.innerHTML = `
            <button class="login-with-google-btn">
                <i class="fab fa-google"></i> Đăng nhập
            </button>
        `;
        
        // Gắn lại sự kiện đăng nhập
        const loginBtn = sidebarLoginSection.querySelector('.login-with-google-btn');
        if (loginBtn) {
            loginBtn.addEventListener('click', initiateGoogleLogin);
        }
    }
}

// Kích hoạt đăng nhập Google
function initiateGoogleLogin() {
    if (window.googleClient) {
        window.googleClient.requestAccessToken();
    } else {
        console.error('Google client chưa được khởi tạo');
        showAuthError('Không thể kết nối với Google. Vui lòng thử lại sau.');
    }
}

// Hiển thị thông báo lỗi
function showAuthError(message) {
    const errorContainer = document.createElement('div');
    errorContainer.className = 'auth-error-message';
    errorContainer.innerHTML = `
        <div class="auth-error-content">
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
            <button class="close-error-btn"><i class="fas fa-times"></i></button>
        </div>
    `;
    
    // Thêm CSS inline cho thông báo lỗi
    errorContainer.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background-color: #f8d7da;
        color: #721c24;
        padding: 10px 15px;
        border-radius: 5px;
        box-shadow: 0 0 10px rgba(0,0,0,0.2);
        z-index: 9999;
        max-width: 400px;
        text-align: center;
    `;
    
    document.body.appendChild(errorContainer);
    
    // Thêm sự kiện đóng thông báo
    const closeBtn = errorContainer.querySelector('.close-error-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            errorContainer.remove();
        });
    }
    
    // Tự động đóng thông báo sau 5 giây
    setTimeout(() => {
        if (errorContainer.parentNode) {
            errorContainer.remove();
        }
    }, 5000);
}

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

// Khởi tạo khi trang tải xong
document.addEventListener('DOMContentLoaded', loadGoogleAuthAPI); 