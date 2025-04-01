// === DOM Elements ===
// Đảm bảo tham chiếu và sự kiện được đăng ký trong DOMContentLoaded
let menuBtn;
let loginBtn;
let sidebar;
let overlay;
let tabButtons;
let chordSheet;
let kalimbaTab;
let lyricsOnly;
let toneUpBtn;
let toneDownBtn;
let transposeBtn;
let backBtn;
let favoriteButtons;
let sliderWrapper;
let prevBtn;
let nextBtn;
let dots;
let googleLoginButtons;
let categoryItems;

// Thể loại bài hát hiện có
const songCategories = [
  'nhac-vang',
  'nhac-tre',
  'indie',
  'de-choi',
  'du-ca',
  'canon',
  'c-g-am-f'
];

// === Functions ===
// Toggle sidebar
function toggleSidebar() {
    if (sidebar && overlay) {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
        console.log('Sidebar toggled');
    } else {
        console.error('Sidebar or overlay elements not found');
    }
}

// Close sidebar
function closeSidebar() {
    if (sidebar && overlay) {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
    }
}

// Switch tab in song detail
function switchTab(selectedButton) {
    if (!tabButtons || tabButtons.length === 0) {
        console.error('Tab buttons not found');
        return;
    }
    
    // Update active button
    tabButtons.forEach(button => {
        button.classList.remove('active');
    });
    selectedButton.classList.add('active');
    
    // Show related content
    const tabIndex = Array.from(tabButtons).indexOf(selectedButton);
    
    if (chordSheet && kalimbaTab && lyricsOnly) {
        chordSheet.style.display = 'none';
        kalimbaTab.style.display = 'none';
        lyricsOnly.style.display = 'none';
        
        if (tabIndex === 0) {
            chordSheet.style.display = 'block';
        } else if (tabIndex === 1) {
            kalimbaTab.style.display = 'block';
        } else if (tabIndex === 2) {
            lyricsOnly.style.display = 'block';
        }
    } else {
        console.error('One or more tab content elements not found');
    }
}

// Chord transposition
const chords = {
    standard: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],
    flat: ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']
};

function changeTone(semitones) {
    if (!chordSheet) {
        console.error('Chord sheet not found, cannot change tone');
        return;
    }
    
    const allChords = chordSheet.querySelectorAll('.chord');
    if (!allChords || allChords.length === 0) {
        console.log('No chords found in chord sheet');
        return;
    }
    
    console.log(`Changing tone by ${semitones} semitones`);
    
    allChords.forEach(chordElement => {
        const chordText = chordElement.textContent;
        const transposedChord = transposeChord(chordText, semitones);
        chordElement.textContent = transposedChord;
    });
    
    // Update tone info if present
    const toneSpan = document.querySelector('.tone');
    if (toneSpan) {
        const currentTone = toneSpan.textContent.replace('Tone: ', '');
        const newTone = transposeChord(currentTone, semitones).replace('[', '').replace(']', '');
        toneSpan.textContent = 'Tone: ' + newTone;
        console.log(`Updated tone to: ${newTone}`);
    }
}

function transposeChord(chordText, semitones) {
    // Extract chord from brackets like [Em]
    let basePart = chordText.replace('[', '').replace(']', '');
    
    // Handle slash chords like G/B
    let slashPart = '';
    if (basePart.includes('/')) {
        const parts = basePart.split('/');
        basePart = parts[0];
        slashPart = '/' + parts[1];
    }
    
    // Extract root and quality
    let root = '';
    let quality = '';
    
    if (basePart.length > 1 && (basePart[1] === '#' || basePart[1] === 'b')) {
        root = basePart.substring(0, 2);
        quality = basePart.substring(2);
    } else {
        root = basePart.substring(0, 1);
        quality = basePart.substring(1);
    }
    
    // Find index in the chord array
    const useFlat = root.includes('b');
    const chordArray = useFlat ? chords.flat : chords.standard;
    
    let index = chordArray.indexOf(root);
    
    if (index !== -1) {
        // Calculate new index with wrapping
        index = (index + semitones + 12) % 12;
        const newRoot = chordArray[index];
        
        // If slash chord, transpose the bass note too
        let newSlashPart = '';
        if (slashPart) {
            const bassNote = slashPart.substring(1);
            let bassQuality = '';
            let bassRoot = '';
            
            if (bassNote.length > 1 && (bassNote[1] === '#' || bassNote[1] === 'b')) {
                bassRoot = bassNote.substring(0, 2);
                bassQuality = bassNote.substring(2);
            } else {
                bassRoot = bassNote.substring(0, 1);
                bassQuality = bassNote.substring(1);
            }
            
            const bassIndex = chordArray.indexOf(bassRoot);
            if (bassIndex !== -1) {
                const newBassIndex = (bassIndex + semitones + 12) % 12;
                const newBassRoot = chordArray[newBassIndex];
                newSlashPart = '/' + newBassRoot + bassQuality;
            } else {
                newSlashPart = slashPart; // Keep original if not found
            }
        }
        
        return '[' + newRoot + quality + newSlashPart + ']';
    }
    
    return chordText; // Return original if not found
}

function showTransposeModal() {
    // Simple implementation - in a real app you'd show a modal
    const newTone = prompt('Nhập tone mới (VD: C, Am, G#):');
    if (newTone) {
        const toneSpan = document.querySelector('.tone');
        if (toneSpan) {
            toneSpan.textContent = 'Tone: ' + newTone;
            // Here you would implement logic to transpose to the specific key
        }
    }
}

// Toggle favorite
async function toggleFavorite(event) {
    const button = event.currentTarget;
    const songId = button.dataset.songId;
    const icon = button.querySelector('i');
    
    // Sử dụng firestore-operations nếu có
    if (window.firestoreOperations && typeof window.firestoreOperations.toggleFavoriteSong === 'function' && songId) {
        try {
            const isNowFavorite = await window.firestoreOperations.toggleFavoriteSong(songId);
            if (isNowFavorite !== null) {
                if (isNowFavorite) {
                    icon.classList.remove('far');
                    icon.classList.add('fas');
                    showAlert('Đã thêm vào danh sách yêu thích', 'success');
                } else {
                    icon.classList.remove('fas');
                    icon.classList.add('far');
                    showAlert('Đã xóa khỏi danh sách yêu thích', 'info');
                }
            }
        } catch (error) {
            console.error('Lỗi khi cập nhật trạng thái yêu thích:', error);
            showAlert('Đã xảy ra lỗi khi cập nhật trạng thái yêu thích', 'error');
        }
    } else {
        // Fallback cho trường hợp không có Firebase
        if (icon.classList.contains('far')) {
            icon.classList.remove('far');
            icon.classList.add('fas');
        } else {
            icon.classList.remove('fas');
            icon.classList.add('far');
        }
    }
}

// Handle Google login
function handleGoogleLogin() {
    console.log('Bắt đầu quá trình đăng nhập từ script.js');
    
    // Sử dụng duy nhất firebase-auth.js để xử lý đăng nhập
    if (window.firebaseAuth && typeof window.firebaseAuth.handleGoogleSignIn === 'function') {
        window.firebaseAuth.handleGoogleSignIn();
        return;
    }
    
    // Fallback nếu không có firebase-auth.js
    if (typeof firebase === 'undefined' || !firebase.apps.length) {
        console.error('Firebase chưa được khởi tạo');
        showAlert('Không thể kết nối đến dịch vụ đăng nhập. Vui lòng thử lại sau', 'error');
        return;
    }
    
    showAlert('Hệ thống đăng nhập đang bị lỗi. Vui lòng làm mới trang và thử lại.', 'error');
}

// Cập nhật giao diện khi đăng nhập/đăng xuất
function updateUserInterface(user) {
    const loginButtons = document.querySelectorAll('.login-with-google-btn');
    const userAvatars = document.querySelectorAll('.user-avatar');
    const mobileLoginBtn = document.querySelector('.login-btn');
    const userMenu = document.getElementById('user-menu');
    const userNameElement = userMenu ? userMenu.querySelector('.user-name') : null;
    const userEmailElement = userMenu ? userMenu.querySelector('.user-email') : null;
    
    if (user) {
        // Người dùng đã đăng nhập
        loginButtons.forEach(button => {
            button.innerHTML = `<i class="fas fa-user-circle"></i> ${user.displayName || 'Người dùng'}`;
            
            // Cập nhật sự kiện click để hiển thị menu người dùng
            button.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                toggleUserMenu();
            };
        });
        
        userAvatars.forEach(avatar => {
            if (user.photoURL) {
                avatar.innerHTML = `<img src="${user.photoURL}" alt="Avatar" class="user-photo">`;
            } else {
                avatar.innerHTML = `<i class="fas fa-user-circle"></i>`;
            }
        });
        
        if (mobileLoginBtn) {
            mobileLoginBtn.innerHTML = `<i class="fas fa-user-circle"></i>`;
            
            // Cập nhật sự kiện click cho nút mobile
            mobileLoginBtn.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                toggleUserMenu();
            };
        }
        
        // Cập nhật thông tin trong menu người dùng
        if (userNameElement) {
            userNameElement.textContent = user.displayName || 'Người dùng';
        }
        
        if (userEmailElement) {
            userEmailElement.textContent = user.email || '';
        }
        
        // Thêm các mục menu chỉ hiển thị khi đã đăng nhập (nếu có)
        const userOnlyMenuItems = document.querySelectorAll('.user-only-menu-item');
        userOnlyMenuItems.forEach(item => {
            item.style.display = 'flex';
        });
        
        // Cập nhật nút đăng xuất
        const logoutButton = document.querySelector('.user-menu-item.logout');
        if (logoutButton) {
            logoutButton.textContent = 'Đăng xuất';
            logoutButton.href = '#';
            logoutButton.onclick = function(e) {
                e.preventDefault();
                
                if (window.firebaseAuth && typeof window.firebaseAuth.handleSignOut === 'function') {
                    window.firebaseAuth.handleSignOut();
                } else if (typeof firebase !== 'undefined') {
                    firebase.auth().signOut().then(() => {
                        console.log('Đăng xuất thành công');
                        updateUserInterface(null);
                    }).catch(error => {
                        console.error('Lỗi đăng xuất:', error);
                    });
                }
                
                hideUserMenu();
            };
        }
    } else {
        // Người dùng chưa đăng nhập
        loginButtons.forEach(button => {
            button.innerHTML = `<i class="fab fa-google"></i> Đăng nhập`;
            
            // Cập nhật sự kiện click để đăng nhập
            button.onclick = handleGoogleLogin;
        });
        
        userAvatars.forEach(avatar => {
            avatar.innerHTML = `<i class="fab fa-google"></i>`;
        });
        
        if (mobileLoginBtn) {
            mobileLoginBtn.innerHTML = `<i class="fas fa-sign-in-alt"></i>`;
            
            // Cập nhật sự kiện click cho nút mobile
            mobileLoginBtn.onclick = handleGoogleLogin;
        }
        
        // Cập nhật thông tin trong menu người dùng
        if (userNameElement) {
            userNameElement.textContent = 'Chưa đăng nhập';
        }
        
        if (userEmailElement) {
            userEmailElement.textContent = '';
        }
        
        // Ẩn các mục menu chỉ hiển thị khi đã đăng nhập
        const userOnlyMenuItems = document.querySelectorAll('.user-only-menu-item');
        userOnlyMenuItems.forEach(item => {
            item.style.display = 'none';
        });
        
        // Cập nhật nút đăng xuất thành đăng nhập
        const logoutButton = document.querySelector('.user-menu-item.logout');
        if (logoutButton) {
            logoutButton.textContent = 'Đăng nhập với Google';
            logoutButton.href = '#';
            logoutButton.onclick = function(e) {
                e.preventDefault();
                handleGoogleLogin();
                hideUserMenu();
            };
        }
    }
}

// Hiển thị menu người dùng
function toggleUserMenu() {
    const userMenu = document.getElementById('user-menu');
    if (userMenu) {
        userMenu.classList.toggle('active');
        
        // Thêm sự kiện click bên ngoài để đóng menu
        if (userMenu.classList.contains('active')) {
            document.addEventListener('click', closeUserMenuOnOutsideClick);
        } else {
            document.removeEventListener('click', closeUserMenuOnOutsideClick);
        }
    }
}

// Ẩn menu người dùng
function hideUserMenu() {
    const userMenu = document.getElementById('user-menu');
    if (userMenu) {
        userMenu.classList.remove('active');
        document.removeEventListener('click', closeUserMenuOnOutsideClick);
    }
}

// Đóng menu người dùng khi click bên ngoài
function closeUserMenuOnOutsideClick(event) {
    const userMenu = document.getElementById('user-menu');
    const loginButtons = document.querySelectorAll('.login-with-google-btn');
    const mobileLoginBtn = document.querySelector('.login-btn');
    
    // Kiểm tra xem click có phải bên trong menu hoặc nút đăng nhập không
    let isClickInside = false;
    
    if (userMenu && userMenu.contains(event.target)) {
        isClickInside = true;
    }
    
    loginButtons.forEach(button => {
        if (button.contains(event.target)) {
            isClickInside = true;
        }
    });
    
    if (mobileLoginBtn && mobileLoginBtn.contains(event.target)) {
        isClickInside = true;
    }
    
    if (!isClickInside && userMenu) {
        hideUserMenu();
    }
}

// === Initialize ===

// Slider variables and functions
let currentSlide = 0;
let slideCount = 0;
let slideInterval;

// Set up slider size
function setupSlider() {
    if (!sliderWrapper) {
        console.log('Slider wrapper not found, cannot setup slider');
        return;
    }
    
    console.log('Setting up slider');
    
    const slides = document.querySelectorAll('.slide');
    if (!slides || slides.length === 0) {
        console.log('No slides found, cannot setup slider');
        return;
    }
    
    slideCount = slides.length;
    console.log(`Found ${slideCount} slides`);
    
    // Update slider position
    updateSliderPosition();
}

// Update slider position based on current slide
function updateSliderPosition() {
    if (!sliderWrapper) {
        console.log('Slider wrapper not found, cannot update position');
        return;
    }
    
    if (slideCount <= 0) {
        console.log('No slides to position');
        return;
    }
    
    console.log('Updating slider position to slide', currentSlide);
    
    sliderWrapper.style.transform = `translateX(-${currentSlide * 100}%)`;
    
    // Update active dot
    if (dots && dots.length > 0) {
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSlide);
        });
    }
}

// Go to next slide
function nextSlide() {
    if (!sliderWrapper) {
        console.log('Slider wrapper not found, cannot go to next slide');
        return;
    }
    
    if (slideCount <= 0) {
        console.log('No slides to navigate');
        return;
    }
    
    console.log('Going to next slide');
    
    currentSlide = (currentSlide + 1) % slideCount;
    updateSliderPosition();
}

// Go to previous slide
function prevSlide() {
    if (!sliderWrapper) {
        console.log('Slider wrapper not found, cannot go to previous slide');
        return;
    }
    
    if (slideCount <= 0) {
        console.log('No slides to navigate');
        return;
    }
    
    console.log('Going to previous slide');
    
    currentSlide = (currentSlide - 1 + slideCount) % slideCount;
    updateSliderPosition();
}

// Go to specific slide
function goToSlide(index) {
    if (!sliderWrapper) {
        console.log('Slider wrapper not found, cannot go to specific slide');
        return;
    }
    
    if (slideCount <= 0) {
        console.log('No slides to navigate');
        return;
    }
    
    if (index >= 0 && index < slideCount) {
        console.log('Going to slide', index);
        currentSlide = index;
        updateSliderPosition();
    } else {
        console.log('Invalid slide index:', index);
    }
}

// Initialize slider
function initSlider() {
    if (!sliderWrapper) {
        console.log('Slider wrapper not found, skipping slider initialization');
        return;
    }
    
    // Set up slider
    setupSlider();
    
    // Event listeners for slider controls
    if (nextBtn) {
        console.log('Next button found, setting up event listener');
        nextBtn.addEventListener('click', function(e) {
            e.preventDefault();
            nextSlide();
        });
    }
    
    if (prevBtn) {
        console.log('Previous button found, setting up event listener');
        prevBtn.addEventListener('click', function(e) {
            e.preventDefault();
            prevSlide();
        });
    }
    
    // Dot navigation
    if (dots && dots.length > 0) {
        console.log('Dots found, setting up event listeners');
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => goToSlide(index));
        });
    }
    
    // Auto slide
    clearInterval(slideInterval);
    slideInterval = setInterval(nextSlide, 5000);
    
    console.log('Setting up hover events for slider');
    // Pause auto slide on hover
    sliderWrapper.addEventListener('mouseenter', () => {
        clearInterval(slideInterval);
    });
    
    sliderWrapper.addEventListener('mouseleave', () => {
        clearInterval(slideInterval);
        slideInterval = setInterval(nextSlide, 5000);
    });
}

// Trạng thái đang tải
let loadingState = false;

// Hiển thị trạng thái đang tải
function showLoading() {
    if (loadingState) return;
    
    loadingState = true;
    
    const loadingEl = document.createElement('div');
    loadingEl.className = 'loading-overlay';
    loadingEl.innerHTML = `
        <div class="loading-spinner">
            <i class="fas fa-spinner fa-spin"></i>
            <span>Đang tải...</span>
        </div>
    `;
    
    document.body.appendChild(loadingEl);
}

// Ẩn trạng thái đang tải
function hideLoading() {
    loadingState = false;
    
    const loadingEl = document.querySelector('.loading-overlay');
    if (loadingEl) {
        loadingEl.remove();
    }
}

// Hiển thị thông báo
function showAlert(message, type = 'info', duration = 3000) {
    const alertEl = document.createElement('div');
    alertEl.className = `alert alert-${type}`;
    alertEl.innerHTML = message;
    
    document.body.appendChild(alertEl);
    
    // Ẩn thông báo sau duration
    setTimeout(() => {
        alertEl.classList.add('fade-out');
        setTimeout(() => {
            alertEl.remove();
        }, 300);
    }, duration);
}

// Hàm kiểm tra Firebase đã được khởi tạo chưa
function isFirebaseInitialized() {
    return typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length > 0;
}

// Hàm chờ Firebase được khởi tạo
function waitForFirebase(timeout = 10000) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        
        const checkFirebase = () => {
            // Nếu Firebase đã khởi tạo, resolve promise
            if (isFirebaseInitialized()) {
                resolve(firebase);
                return;
            }
            
            // Kiểm tra timeout
            if (Date.now() - startTime > timeout) {
                reject(new Error('Timeout waiting for Firebase to initialize'));
                return;
            }
            
            // Kiểm tra lại sau 100ms
            setTimeout(checkFirebase, 100);
        };
        
        checkFirebase();
    });
}

// Initialize all DOM elements and event listeners
function initElements() {
    console.log('Initializing elements');
    
    // Get DOM elements
    menuBtn = document.getElementById('menu-btn');
    loginBtn = document.querySelector('.login-btn');
    sidebar = document.getElementById('sidebar');
    overlay = document.getElementById('overlay');
    tabButtons = document.querySelectorAll('.tab-controls .tab-btn');
    chordSheet = document.querySelector('.chord-sheet');
    kalimbaTab = document.querySelector('.kalimba-tab');
    lyricsOnly = document.querySelector('.lyrics-only');
    toneUpBtn = document.querySelector('.tone-up');
    toneDownBtn = document.querySelector('.tone-down');
    transposeBtn = document.querySelector('.transpose');
    backBtn = document.querySelector('.back-btn');
    favoriteButtons = document.querySelectorAll('.favorite-btn');
    sliderWrapper = document.getElementById('slider-wrapper');
    prevBtn = document.querySelector('.prev-btn');
    nextBtn = document.querySelector('.next-btn');
    dots = document.querySelectorAll('.dot');
    googleLoginButtons = document.querySelectorAll('.login-with-google-btn');
    categoryItems = document.querySelectorAll('.category-item');
    
    // Log element status
    console.log('Menu button found:', !!menuBtn);
    console.log('Sidebar found:', !!sidebar);
    console.log('Slider wrapper found:', !!sliderWrapper);
    console.log('Tab buttons found:', tabButtons ? tabButtons.length : 0);
    console.log('Favorite buttons found:', favoriteButtons ? favoriteButtons.length : 0);
    
    // Toggle sidebar
    if (menuBtn && sidebar && overlay) {
        console.log('Setting up menu button event');
        menuBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Menu button clicked');
            toggleSidebar();
        });
        
        overlay.addEventListener('click', closeSidebar);
    }
    
    // Make login button also toggle sidebar on mobile
    if (loginBtn && sidebar) {
        loginBtn.addEventListener('click', toggleSidebar);
    }
    
    // Tab controls
    if (tabButtons && tabButtons.length > 0) {
        console.log('Setting up tab button events');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => switchTab(button));
        });
    }
    
    // Tone controls
    if (toneUpBtn) toneUpBtn.addEventListener('click', () => changeTone(1));
    if (toneDownBtn) toneDownBtn.addEventListener('click', () => changeTone(-1));
    if (transposeBtn) transposeBtn.addEventListener('click', showTransposeModal);
    
    // Back navigation
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.history.back();
        });
    }
    
    // Favorite buttons
    if (favoriteButtons && favoriteButtons.length > 0) {
        console.log('Setting up favorite button events');
        favoriteButtons.forEach(button => {
            button.addEventListener('click', toggleFavorite);
        });
    }
    
    // Google login buttons
    if (googleLoginButtons && googleLoginButtons.length > 0) {
        console.log('Sử dụng firebase-auth.js để thiết lập các nút đăng nhập');
        // Gọi đến firebase-auth.js để thiết lập các nút đăng nhập
        if (window.firebaseAuth && typeof window.firebaseAuth.setupAuthButtons === 'function') {
            // Chờ một chút để đảm bảo DOM đã sẵn sàng
            setTimeout(() => {
                window.firebaseAuth.setupAuthButtons();
            }, 100);
        }
    }
    
    // Mobile login button không cần thiết lập ở đây nữa vì đã được xử lý bởi firebase-auth.js
    
    // Initialize slider if present
    if (sliderWrapper) {
        console.log('Initializing slider');
        initSlider();
    }
    
    // Set active menu item in sidebar based on current page
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const sidebarMenuItems = document.querySelectorAll('.sidebar-menu ul li a');
    
    if (sidebarMenuItems && sidebarMenuItems.length > 0) {
        console.log('Setting up sidebar menu items');
        sidebarMenuItems.forEach(link => {
            const href = link.getAttribute('href');
            if (href && (href === currentPage || (currentPage === 'index.html' && href === '/'))) {
                link.classList.add('active');
            }
        });
    }
    
    // Link category items to songs.html
    if (categoryItems && categoryItems.length > 0) {
        console.log('Setting up category item events');
        categoryItems.forEach(item => {
            item.addEventListener('click', () => {
                window.location.href = 'songs.html';
            });
        });
    }
    
    // Link song items to song-detail.html
    const songItems = document.querySelectorAll('.song-item');
    if (songItems && songItems.length > 0) {
        console.log('Setting up song item events');
        songItems.forEach(item => {
            item.addEventListener('click', (event) => {
                // Don't navigate if clicking the favorite button
                if (!event.target.closest('.favorite-btn')) {
                    window.location.href = 'song-detail.html';
                }
            });
        });
    }
    
    // Link featured song items to song-detail.html
    const featuredSongItems = document.querySelectorAll('.featured-song-item');
    if (featuredSongItems && featuredSongItems.length > 0) {
        console.log('Setting up featured song item events');
        featuredSongItems.forEach(item => {
            item.addEventListener('click', () => {
                window.location.href = 'song-detail.html';
            });
        });
    }
    
    // Search form
    const searchBox = document.querySelector('.search-box');
    if (searchBox) {
        const searchInput = searchBox.querySelector('input');
        const searchButton = searchBox.querySelector('button');
        
        if (searchButton && searchInput) {
            console.log('Setting up search form events');
            searchButton.addEventListener('click', () => {
                const query = searchInput.value.trim();
                if (query) {
                    // In a real app, this would navigate to search results page
                    alert(`Tìm kiếm cho: ${query}`);
                    // Example: window.location.href = `search-results.html?q=${encodeURIComponent(query)}`;
                }
            });
            
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    searchButton.click();
                }
            });
        }
    }
    
    // Kiểm tra trạng thái đăng nhập nếu Firebase đã tải
    if (window.firebaseAuth && typeof window.firebaseAuth.checkAuthStateOnLoad === 'function') {
        console.log('Sử dụng firebase-auth.js để kiểm tra trạng thái đăng nhập');
        window.firebaseAuth.checkAuthStateOnLoad();
    } else {
        console.log('Sử dụng cách dự phòng để kiểm tra trạng thái đăng nhập');
        // Phương thức dự phòng
        waitForFirebase(5000)
            .then(firebase => {
                console.log('Firebase đã được khởi tạo, kiểm tra xác thực');
                firebase.auth().onAuthStateChanged(user => {
                    console.log('Trạng thái người dùng:', user ? 'đã đăng nhập' : 'chưa đăng nhập');
                    updateUserInterface(user);
                });
            })
            .catch(error => {
                console.error('Không thể khởi tạo Firebase:', error);
            });
    }
}

// Khởi tạo khi DOM đã tải xong
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM đã tải xong, khởi tạo...');
    
    // Tải dữ liệu trang
    loadPageData();
    
    // Sidebar toggle
    menuBtn = document.getElementById('menu-btn');
    sidebar = document.getElementById('sidebar');
    overlay = document.getElementById('overlay');
    
    if (menuBtn) {
        menuBtn.addEventListener('click', toggleSidebar);
        console.log('Đã gắn sự kiện cho nút menu');
    }
    
    if (overlay) {
        overlay.addEventListener('click', closeSidebar);
        console.log('Đã gắn sự kiện cho overlay');
    }
    
    // Xử lý đăng nhập Google
    if (window.location.hash && window.location.hash.includes('access_token')) {
        console.log('Phát hiện token xác thực trong URL');
        if (typeof handleGoogleResponse === 'function') {
            handleGoogleResponse({ access_token: window.location.hash.match(/access_token=([^&]*)/)[1] });
        }
        
        // Xóa hash từ URL
        history.pushState("", document.title, window.location.pathname + window.location.search);
    }
    
    // Login buttons
    if (googleLoginButtons) {
        googleLoginButtons.forEach(button => {
            button.addEventListener('click', handleGoogleLogin);
        });
    }
    
    // Khởi tạo người dùng
    const savedUser = localStorage.getItem('kalimbaUser');
    if (savedUser) {
        try {
            const user = JSON.parse(savedUser);
            updateUserInterface(user);
        } catch (e) {
            console.error('Lỗi khi phân tích dữ liệu người dùng:', e);
        }
    }
    
    // Hiển thị UI đăng nhập nếu có JS
    const loginElements = document.querySelectorAll('.login-requires-js');
    loginElements.forEach(el => {
        el.style.display = 'inline-flex';
    });
    
    // Khởi tạo các tính năng khác
    initOtherFeatures();
});

// Thay thế export với window object để sử dụng trong môi trường browser
window.firebaseUtils = {
    isFirebaseInitialized,
    waitForFirebase,
    showLoading,
    hideLoading,
    showAlert
};

/**
 * Tải bài hát theo thể loại
 * @param {String} category Thể loại bài hát (nhac-vang, nhac-tre, indie, de-choi, du-ca, canon, c-g-am-f)
 */
async function loadSongsByCategory(category) {
  try {
    console.log(`Bắt đầu tải bài hát cho thể loại ${category}...`);
    
    if (!window.KalimbaFirebase || typeof window.KalimbaFirebase.getSongsByCategory !== 'function') {
      console.error('Chức năng tải bài hát theo thể loại chưa khởi tạo');
      return;
    }
    
    const containerId = `${category}-songs-container`;
    const sectionId = `${category}-songs`;
    const loadingContainer = document.querySelector(`#${sectionId} .loading-container`);
    const songsContainer = document.getElementById(containerId);
    
    console.log(`Kiểm tra container: section=${!!document.getElementById(sectionId)}, songs=${!!songsContainer}, loading=${!!loadingContainer}`);
    
    if (!songsContainer) {
      console.warn(`Không tìm thấy container với ID ${containerId} để hiển thị bài hát`);
      return;
    }
    
    // Hiển thị loading
    if (loadingContainer) {
      loadingContainer.style.display = 'flex';
    } else {
      console.warn(`Không tìm thấy loading container cho ${category}`);
    }
    
    if (songsContainer) {
      songsContainer.style.display = 'none';
    }
    
    // Tải bài hát theo thể loại
    console.log(`Gọi API để lấy bài hát thể loại ${category}...`);
    const songs = await window.KalimbaFirebase.getSongsByCategory(category, 6);
    console.log(`Đã nhận ${songs ? songs.length : 0} bài hát cho thể loại ${category}`);
    
    // Nếu không có bài hát, hiển thị thông báo
    if (!songs || songs.length === 0) {
      if (loadingContainer) {
        loadingContainer.style.display = 'none';
      }
      songsContainer.innerHTML = `<p class="no-songs">Không có bài hát nào thuộc thể loại này.</p>`;
      songsContainer.style.display = 'block';
      return;
    }
    
    // Tạo HTML cho bài hát
    let songsHTML = '';
    
    songs.forEach(song => {
      songsHTML += `
        <div class="featured-song-item">
          <div class="song-thumb">
            <img src="${song.thumbnail || 'images/default-song.jpg'}" alt="${song.title || 'Bài hát'}" onerror="this.src='images/default-song.jpg'">
            <div class="play-icon">
              <i class="fas fa-music"></i>
            </div>
          </div>
          <div class="song-info">
            <h3>${song.title || 'Không có tiêu đề'}</h3>
            <p>${song.artist || 'Không có nghệ sĩ'}</p>
          </div>
          <a href="song-detail.html?id=${song.id}" class="song-link"></a>
        </div>
      `;
    });
    
    // Cập nhật HTML và hiển thị
    songsContainer.innerHTML = songsHTML;
    if (loadingContainer) {
      loadingContainer.style.display = 'none';
    }
    songsContainer.style.display = 'grid';
    console.log(`Hoàn tất hiển thị bài hát thể loại ${category}`);
    
  } catch (error) {
    console.error(`Lỗi khi tải bài hát thể loại ${category}:`, error);
    const containerId = `${category}-songs-container`;
    const sectionId = `${category}-songs`;
    const loadingContainer = document.querySelector(`#${sectionId} .loading-container`);
    const songsContainer = document.getElementById(containerId);
    
    if (loadingContainer) {
      loadingContainer.style.display = 'none';
    }
    
    if (songsContainer) {
      songsContainer.innerHTML = `<p class="no-songs">Đã xảy ra lỗi khi tải bài hát. Vui lòng thử lại sau.</p>`;
      songsContainer.style.display = 'block';
    }
  }
}

// Hàm chính để tải tất cả dữ liệu cần thiết
async function loadPageData() {
  try {
    console.log('Bắt đầu tải dữ liệu trang...');
    
    // Khởi tạo các phần tử DOM
    initElements();
    
    // Chờ Firebase được khởi tạo
    await waitForFirebase();
    
    // Khởi tạo slider
    initSlider();
    
    // Hiển thị thông báo lỗi nếu có
    const lastError = localStorage.getItem('last_firebase_error');
    if (lastError) {
      try {
        const errorObj = JSON.parse(lastError);
        if (new Date().getTime() - errorObj.timestamp < 10000) {
          showAlert(errorObj.message, 'error', 5000);
        }
      } catch (e) {
        console.error('Lỗi khi phân tích lỗi:', e);
      }
    }
    
    // Thiết lập sự kiện cho danh mục
    setupCategoryEvents();
    
    console.log('Tải dữ liệu trang hoàn tất');
  } catch (error) {
    console.error('Lỗi khi tải dữ liệu trang:', error);
  }
}

// Thiết lập sự kiện cho danh mục
function setupCategoryEvents() {
  // Link category items để tải bài hát theo thể loại khi click
  if (categoryItems && categoryItems.length > 0) {
    categoryItems.forEach(item => {
      item.addEventListener('click', function() {
        const category = this.getAttribute('data-category');
        if (category) {
          // Chuyển hướng sang trang songs.html với tham số category
          window.location.href = `songs.html?category=${category}`;
        }
      });
    });
  }
}

// Khởi tạo các tính năng khác
function initOtherFeatures() {
  // Cập nhật slider khi thay đổi kích thước cửa sổ
  if (sliderWrapper) {
    window.addEventListener('resize', setupSlider);
    console.log('Đã thêm sự kiện resize cho slider');
  }
  
  // Khởi tạo các tính năng khác nếu cần
  console.log('Đã khởi tạo các tính năng khác');
} 