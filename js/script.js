// === DOM Elements ===
const menuBtn = document.getElementById('menu-btn');
const loginBtn = document.querySelector('.login-btn');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');

// Tab buttons in song detail page
const tabButtons = document.querySelectorAll('.tab-controls .tab-btn');
const chordSheet = document.querySelector('.chord-sheet');
const kalimbaTab = document.querySelector('.kalimba-tab');
const lyricsOnly = document.querySelector('.lyrics-only');

// Tone control buttons
const toneUpBtn = document.querySelector('.tone-up');
const toneDownBtn = document.querySelector('.tone-down');
const transposeBtn = document.querySelector('.transpose');

// Back button
const backBtn = document.querySelector('.back-btn');

// Favorite button
const favoriteButtons = document.querySelectorAll('.favorite-btn');

// Slider elements
const sliderWrapper = document.getElementById('slider-wrapper');
const prevBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');
const dots = document.querySelectorAll('.dot');

// Google login buttons
const googleLoginButtons = document.querySelectorAll('.login-with-google-btn');

// === Event Listeners ===
// Toggle sidebar
if (menuBtn && sidebar && overlay) {
    menuBtn.addEventListener('click', toggleSidebar);
    overlay.addEventListener('click', closeSidebar);
}

// Make login button also toggle sidebar on mobile
if (loginBtn && sidebar) {
    loginBtn.addEventListener('click', toggleSidebar);
}

// Tab controls
if (tabButtons.length > 0) {
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
if (favoriteButtons.length > 0) {
    favoriteButtons.forEach(button => {
        button.addEventListener('click', toggleFavorite);
    });
}

// Google login buttons
if (googleLoginButtons.length > 0) {
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

// Slider controls
if (sliderWrapper) {
    let currentSlide = 0;
    const slideCount = document.querySelectorAll('.slide').length;
    
    // Set up slider size
    function setupSlider() {
        const slides = document.querySelectorAll('.slide');
        
        // Update slider position
        updateSliderPosition();
    }
    
    // Update slider position based on current slide
    function updateSliderPosition() {
        if (sliderWrapper) {
            sliderWrapper.style.transform = `translateX(-${currentSlide * 100}%)`;
            
            // Update active dot
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentSlide);
            });
        }
    }
    
    // Go to next slide
    function nextSlide() {
        currentSlide = (currentSlide + 1) % slideCount;
        updateSliderPosition();
    }
    
    // Go to previous slide
    function prevSlide() {
        currentSlide = (currentSlide - 1 + slideCount) % slideCount;
        updateSliderPosition();
    }
    
    // Go to specific slide
    function goToSlide(index) {
        currentSlide = index;
        updateSliderPosition();
    }
    
    // Event listeners
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);
    
    // Dot navigation
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => goToSlide(index));
    });
    
    // Auto slide
    let slideInterval = setInterval(nextSlide, 5000);
    
    // Pause auto slide on hover
    if (sliderWrapper) {
        sliderWrapper.addEventListener('mouseenter', () => {
            clearInterval(slideInterval);
        });
        
        sliderWrapper.addEventListener('mouseleave', () => {
            slideInterval = setInterval(nextSlide, 5000);
        });
    }
    
    // Initialize slider
    setupSlider();
    
    // Update slider on window resize
    window.addEventListener('resize', setupSlider);
}

// === Functions ===
// Toggle sidebar
function toggleSidebar() {
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
}

// Close sidebar
function closeSidebar() {
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
}

// Switch tab in song detail
function switchTab(selectedButton) {
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
    }
}

// Chord transposition
const chords = {
    standard: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],
    flat: ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']
};

function changeTone(semitones) {
    if (!chordSheet) return;
    
    const allChords = chordSheet.querySelectorAll('.chord');
    
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

// Handle login button click
if (document.querySelector('.login-btn')) {
    document.querySelector('.login-btn').addEventListener('click', function() {
        // Kiểm tra nếu có firebaseAuth
        if (window.firebaseAuth && typeof window.firebaseAuth.handleGoogleSignIn === 'function') {
            window.firebaseAuth.handleGoogleSignIn();
        } else {
            // Xử lý này sẽ được thay thế bởi toggleSidebar
            toggleSidebar();
        }
    });
}

// === Initialize ===
document.addEventListener('DOMContentLoaded', () => {
    // Set active menu item in sidebar based on current page
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const sidebarMenuItems = document.querySelectorAll('.sidebar-menu ul li a');
    
    if (sidebarMenuItems.length > 0) {
        if (currentPage === 'index.html' || currentPage === '') {
            // Mark "Trang chủ" as active
            sidebarMenuItems[0].classList.add('active');
        }
    }
    
    // Link category items to songs.html
    const categoryItems = document.querySelectorAll('.category-item');
    if (categoryItems.length > 0) {
        categoryItems.forEach(item => {
            item.addEventListener('click', () => {
                window.location.href = 'songs.html';
            });
        });
    }
    
    // Link song items to song-detail.html
    const songItems = document.querySelectorAll('.song-item');
    if (songItems.length > 0) {
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
    if (featuredSongItems.length > 0) {
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
    
    // Kiểm tra trạng thái đăng nhập nếu Firebase đã tải
    if (window.firebaseAuth && typeof window.firebaseAuth.checkAuthStateOnLoad === 'function') {
        window.firebaseAuth.checkAuthStateOnLoad();
    }
});

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

// Thay thế export với window object để sử dụng trong môi trường browser
window.firebaseUtils = {
    isFirebaseInitialized,
    waitForFirebase,
    showLoading,
    hideLoading,
    showAlert
}; 