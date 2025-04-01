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
    // Fallback cho chức năng đăng nhập
    alert('Chức năng đăng nhập với Google sẽ được triển khai trong tương lai.');
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
        console.log('Setting up Google login button events');
        googleLoginButtons.forEach(button => {
            // Sử dụng firebase-auth.js
            button.addEventListener('click', () => {
                if (window.firebaseAuth && typeof window.firebaseAuth.handleGoogleSignIn === 'function') {
                    window.firebaseAuth.handleGoogleSignIn();
                } else {
                    handleGoogleLogin();
                }
            });
        });
    }
    
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
    const categoryItems = document.querySelectorAll('.category-item');
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
        window.firebaseAuth.checkAuthStateOnLoad();
    }
}

// Initialize on DOM content loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM content loaded');
    initElements();
    
    // Update slider on window resize if exists
    if (sliderWrapper) {
        window.addEventListener('resize', setupSlider);
        console.log('Added resize listener for slider');
    }
});

// Thay thế export với window object để sử dụng trong môi trường browser
window.firebaseUtils = {
    isFirebaseInitialized,
    waitForFirebase,
    showLoading,
    hideLoading,
    showAlert
}; 