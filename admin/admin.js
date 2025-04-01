/**
 * Admin Dashboard JS
 * Quản lý tất cả các chức năng của trang quản trị
 */

// Kiểm tra và chuyển hướng nếu không phải admin
document.addEventListener('DOMContentLoaded', () => {
    // Kiểm tra quyền admin
    if (window.AdminAuth && !window.AdminAuth.redirectIfNotAdmin()) {
        return; // Nếu không phải admin, dừng lại
    }
    
    // Khởi tạo trang admin
    initAdminPage();
});

// Thêm biến kiểm soát thời gian tải lại dữ liệu 
let lastLoadTime = 0;
let isLoading = false;
const LOAD_THROTTLE_MS = 5000; // Thời gian tối thiểu giữa các lần tải (5 giây)

// Biến toàn cục lưu các instance của Firebase
let allUsers = [];

/**
 * Khởi tạo Firebase và tải dữ liệu
 */
async function initializeFirebaseAndLoadData() {
    try {
        // Kiểm tra xem KalimbaFirebase có tồn tại không
        if (!window.KalimbaFirebase) {
            throw new Error('KalimbaFirebase không được tìm thấy');
        }
        
        // Khởi tạo Firebase
        await KalimbaFirebase.init();
        
        // Kiểm tra kết nối nhanh
        const connectionStatus = await KalimbaFirebase.quickConnectionCheck();
        
        if (!connectionStatus.success) {
            console.warn('Kiểm tra kết nối Firebase không thành công:', connectionStatus.message);
            showOfflineState();
            return false;
        }
        
        console.log('Firebase đã khởi tạo và kiểm tra kết nối thành công');
        
        // Tải dữ liệu bài hát (chỉ tải nếu đã đủ thời gian từ lần tải trước)
        const now = Date.now();
        if (now - lastLoadTime > LOAD_THROTTLE_MS && !isLoading) {
            await loadSongs();
            lastLoadTime = now;
        } else {
            console.log('Bỏ qua tải dữ liệu do mới tải gần đây:', now - lastLoadTime, 'ms');
        }
        
        return true;
    } catch (error) {
        console.error('Lỗi khi khởi tạo Firebase:', error);
        showOfflineState();
        
        // Hiển thị thông báo lỗi
        if (window.ErrorHandler) {
            window.ErrorHandler.show(error);
        }
        
        return false;
    }
}

/**
 * Khởi tạo trang admin và các chức năng
 */
function initAdminPage() {
    // Kiểm tra quyền admin
    if (window.AdminAuth && !window.AdminAuth.redirectIfNotAdmin()) {
        return;
    }
    
    // Ẩn loading overlay khi trang đã tải xong
    hideLoadingOverlay();
    
    // Khởi tạo tabs
    initTabs();
    
    // Khởi tạo chức năng quản lý songs
    initSongForm();
    loadSongs();
    initSearchAndFilter();
    addSongButtonEvents();
    updateSongStats(); // Cập nhật thống kê bài hát
    
    // Khởi tạo chức năng quản lý người dùng
    initUserManagement();
    
    // Khởi tạo menu người dùng
    initUserMenu();
    
    // Hiển thị thông tin người dùng
    loadUserInfo();
}

/**
 * Ẩn overlay loading
 */
function hideLoadingOverlay() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
    }
}

/**
 * Hiển thị trạng thái offline khi không thể kết nối Firebase
 */
function showOfflineState() {
    const songsList = document.getElementById('songs-list');
    if (songsList) {
        songsList.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">
                    <div class="error-message">
                        <i class="fas fa-exclamation-triangle"></i> Không thể kết nối đến Firebase. 
                        <button class="retry-btn" onclick="retryConnection()" style="background-color: #007bff; color: white; border: none; padding: 5px 10px; border-radius: 3px; margin-left: 10px; cursor: pointer;">
                            <i class="fas fa-sync-alt"></i> Thử lại
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }
}

/**
 * Thử kết nối lại với Firebase
 * Hàm này được xuất ra global scope để có thể được gọi từ bất kỳ đâu
 */
function retryConnection() {
    // Kiểm tra nếu đang tải hoặc mới tải gần đây
    if (isLoading) {
        console.log('Đang trong quá trình tải dữ liệu, bỏ qua yêu cầu thử lại kết nối');
        return;
    }
    
    const now = Date.now();
    if (now - lastLoadTime < LOAD_THROTTLE_MS) {
        console.log('Mới tải dữ liệu gần đây, bỏ qua yêu cầu thử lại kết nối:', now - lastLoadTime, 'ms');
        return;
    }
    
    // Hiển thị loading overlay
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'flex';
    }
    
    // Thử khởi tạo lại Firebase và tải dữ liệu
    initializeFirebaseAndLoadData()
        .then(success => {
            hideLoadingOverlay();
            if (!success) {
                showOfflineState();
            }
        })
        .catch(error => {
            console.error('Lỗi khi thử kết nối lại:', error);
            hideLoadingOverlay();
            showOfflineState();
            
            if (window.ErrorHandler) {
                window.ErrorHandler.show(error);
            }
        });
}

// Xuất các hàm cần thiết ra global scope
window.retryConnection = retryConnection;

/**
 * Kiểm tra và sửa chữa thông tin người dùng admin
 */
function debugAdmin() {
    try {
        // Lấy thông tin user từ localStorage
        const savedUser = localStorage.getItem('kalimbaUser');
        if (!savedUser) {
            console.error('Không tìm thấy thông tin người dùng trong localStorage');
            return;
        }
        
        // Parse user data
        const userData = JSON.parse(savedUser);
        
        // Kiểm tra và sửa chữa email nếu là admin
        const adminEmails = ['danghaile2003@gmail.com', 'tranminhchau1904@gmail.com'];
        
        if (userData && userData.email && adminEmails.includes(userData.email)) {
            console.log('Đã xác nhận tài khoản admin:', userData.email);
            
            // Kiểm tra các thông tin cần thiết khác
            if (!userData.uid && userData.googleId) {
                userData.uid = userData.googleId; // Sửa chữa uid nếu thiếu
            }
            
            if (!userData.displayName && userData.name) {
                userData.displayName = userData.name; // Sửa chữa displayName nếu thiếu
            }
            
            // Lưu lại thông tin đã sửa
            localStorage.setItem('kalimbaUser', JSON.stringify(userData));
            console.log('Đã cập nhật thông tin người dùng admin');
        } else {
            console.warn('Người dùng hiện tại không phải là admin:', userData.email);
        }
    } catch (error) {
        console.error('Lỗi khi debug thông tin admin:', error);
    }
}

/**
 * Nạp thông tin người dùng từ localStorage
 */
function loadUserInfo() {
    try {
        // Lấy thông tin người dùng từ localStorage
        const savedUser = localStorage.getItem('kalimbaUser');
        
        if (savedUser) {
            const user = JSON.parse(savedUser);
            
            // Cập nhật avatar
            const avatarElement = document.getElementById('userAvatar');
            if (avatarElement && user.photoURL) {
                avatarElement.src = user.photoURL;
            }
            
            // Cập nhật tên người dùng nếu có
            const userNameElement = document.querySelector('.user-name');
            if (userNameElement && user.displayName) {
                userNameElement.textContent = user.displayName;
            }
        }
    } catch (error) {
        console.error('Lỗi khi nạp thông tin người dùng:', error);
    }
}

/**
 * Khởi tạo chức năng chuyển tab
 */
function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Xóa class active từ tất cả button và content
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Thêm class active cho button được click
            button.classList.add('active');
            
            // Hiển thị tab content tương ứng
            const tabId = button.getAttribute('data-tab');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
}

/**
 * Tải danh sách bài hát từ Firestore
 */
async function loadSongs() {
    // Ngăn tải lại nếu đang trong quá trình tải
    if (isLoading) {
        console.log('Đang tải dữ liệu, bỏ qua yêu cầu tải mới');
        return;
    }
    
    // Đánh dấu đang trong quá trình tải
    isLoading = true;
    
    try {
        const songsList = document.getElementById('songs-list');
        
        // Xóa dữ liệu cũ và hiển thị loading
        songsList.innerHTML = `
            <tr class="loading-row">
                <td colspan="5" class="text-center">
                    <div class="loading-spinner">
                        <i class="fas fa-spinner fa-spin"></i> Đang tải bài hát...
                    </div>
                </td>
            </tr>
        `;
        
        // Tạo Promise với timeout
        const loadSongsPromise = KalimbaFirebase.getAllSongs();
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Hết thời gian chờ khi tải bài hát')), 10000);
        });
        
        // Chạy cả hai Promise
        const songs = await Promise.race([loadSongsPromise, timeoutPromise])
            .catch(error => {
                console.error('Lỗi timeout hoặc lỗi tải bài hát:', error);
                throw error;
            });
        
        // Nếu là mảng rỗng hoặc không có dữ liệu
        if (!songs || songs.length === 0) {
            songsList.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center">
                        Chưa có bài hát nào. Hãy thêm bài hát mới.
                    </td>
                </tr>
            `;
            isLoading = false;
            return;
        }
        
        // Tạo HTML cho từng bài hát
        let songsHTML = '';
        
        songs.forEach(song => {
            // Kiểm tra và xử lý ngày
            let formattedDate = 'Không có ngày';
            if (song.createdAt) {
                try {
                    const createdDate = new Date(song.createdAt);
                    if (!isNaN(createdDate.getTime())) {
                        formattedDate = `${createdDate.getDate()}/${createdDate.getMonth() + 1}/${createdDate.getFullYear()}`;
                    }
                } catch (e) {
                    console.warn('Lỗi khi xử lý ngày:', e);
                }
            }
            
            // Định dạng thể loại
            let categoryDisplay = 'Không có';
            if (song.category) {
                switch(song.category) {
                    case 'nhac-vang': categoryDisplay = 'Nhạc Vàng'; break;
                    case 'nhac-tre': categoryDisplay = 'Nhạc Trẻ'; break;
                    case 'indie': categoryDisplay = 'Indie Việt'; break;
                    case 'de-choi': categoryDisplay = 'Dễ chơi'; break;
                    case 'du-ca': categoryDisplay = 'Du Ca'; break;
                    case 'canon': categoryDisplay = 'Vòng Canon'; break;
                    case 'c-g-am-f': categoryDisplay = 'Vòng C G Am F'; break;
                    default: categoryDisplay = song.category;
                }
            }
            
            songsHTML += `
                <tr data-id="${song.id || ''}">
                    <td>
                        <img src="${song.thumbnail || '../images/default-song.jpg'}" alt="${song.title || 'Không có tiêu đề'}" class="song-thumbnail" onerror="this.src='../images/default-song.jpg'">
                    </td>
                    <td>${song.title || 'Không có tiêu đề'}</td>
                    <td>${categoryDisplay}</td>
                    <td>${formattedDate}</td>
                    <td>
                        <div class="actions">
                            <button class="edit-btn" data-id="${song.id || ''}"><i class="fas fa-edit"></i></button>
                            <button class="delete-btn" data-id="${song.id || ''}" data-name="${song.title || 'Không có tiêu đề'}"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                </tr>
            `;
        });
        
        // Cập nhật HTML
        songsList.innerHTML = songsHTML;
        
        // Thêm sự kiện cho các nút
        addSongButtonEvents();
        
        // Cập nhật thống kê
        updateSongStats();
        
    } catch (error) {
        console.error('Lỗi khi tải bài hát:', error);
        
        // Hiển thị thông báo lỗi
        if (window.ErrorHandler) {
            const errorMsg = error.message || 'Lỗi không xác định khi tải bài hát';
            window.ErrorHandler.show(new Error(errorMsg), {
                duration: 8000
            });
        }
        
        // Hiển thị trạng thái lỗi trong bảng
        const songsList = document.getElementById('songs-list');
        songsList.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">
                    <div class="error-message">
                        <i class="fas fa-exclamation-triangle"></i> Lỗi khi tải bài hát: ${error.message || 'Không thể tải dữ liệu'}
                        <button class="retry-btn" onclick="loadSongs()" style="background-color: #007bff; color: white; border: none; padding: 5px 10px; border-radius: 3px; margin-left: 10px; cursor: pointer;">
                            <i class="fas fa-sync-alt"></i> Thử lại
                        </button>
                    </div>
                </td>
            </tr>
        `;
    } finally {
        // Đánh dấu đã hoàn thành quá trình tải
        isLoading = false;
        lastLoadTime = Date.now();
    }
}

/**
 * Thêm sự kiện cho các nút trong bảng bài hát
 */
function addSongButtonEvents() {
    // Thêm sự kiện cho nút Edit
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', async () => {
            const songId = button.getAttribute('data-id');
            await openEditSongModal(songId);
        });
    });
    
    // Thêm sự kiện cho nút Delete
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', () => {
            const songId = button.getAttribute('data-id');
            const songName = button.getAttribute('data-name');
            openDeleteConfirmation(songId, songName);
        });
    });
}

/**
 * Cập nhật xem trước bài hát theo layout mới
 */
function updateSongPreview() {
    const previewContainer = document.getElementById('song-preview');
    const songLineItems = document.querySelectorAll('.song-line-item');
    
    if (songLineItems.length === 0) {
        previewContainer.innerHTML = `
            <div class="preview-placeholder">
                Xem trước nốt nhạc và lời sẽ hiển thị ở đây sau khi nhập
            </div>
        `;
        return;
    }
    
    // Lấy tiêu đề bài hát
    const songTitle = document.getElementById('song-title').value || 'Tên bài hát';
    
    // Tạo HTML xem trước
    let previewHTML = `<h2>${songTitle}</h2>`;
    
    // Thu thập dữ liệu từ form theo cặp
    const pairs = [];
    
    for (let i = 0; i < songLineItems.length; i += 2) {
        const lyricItem = songLineItems[i];
        const noteItem = i + 1 < songLineItems.length ? songLineItems[i + 1] : null;
        
        if (lyricItem && noteItem) {
            const lyricInput = lyricItem.querySelector('.song-lyric');
            const noteInput = noteItem.querySelector('.song-note');
            
            const lyric = lyricInput ? lyricInput.value.trim() : '';
            const note = noteInput ? noteInput.value.trim() : '';
            
            if (note) {
                pairs.push({
                    lyric: lyric,
                    note: note
                });
            }
        }
    }
    
    // Hiển thị lời và nốt xen kẽ nhau cho mỗi dòng
    if (pairs.length === 0) {
        previewHTML += `<div class="preview-no-lyric">Không có lời bài hát</div>`;
    } else {
        pairs.forEach(pair => {
            if (pair.lyric) {
                previewHTML += `<div class="preview-lyric">${pair.lyric}</div>`;
            }
            previewHTML += `<div class="preview-note">${pair.note}</div>`;
        });
    }
    
    // Thêm link video nếu có
    const videoLink = document.getElementById('song-video').value.trim();
    if (videoLink) {
        previewHTML += `
            <div class="preview-video">
                <a href="${videoLink}" target="_blank" class="video-link">
                    <i class="fas fa-link"></i> Link video demo on tiktok
                </a>
            </div>
        `;
    }
    
    // Cập nhật vào container
    previewContainer.innerHTML = previewHTML;
    
    // Cập nhật các textarea ẩn
    updateHiddenFields();
}

/**
 * Cập nhật các trường ẩn với dữ liệu từ form mới
 */
function updateHiddenFields() {
    const notesTextarea = document.getElementById('song-notes');
    const lyricsTextarea = document.getElementById('song-lyrics');
    
    const songLineItems = document.querySelectorAll('.song-line-item');
    
    let notesText = '';
    let lyricsText = '';
    
    // Thu thập dữ liệu theo cặp
    for (let i = 0; i < songLineItems.length; i += 2) {
        const lyricItem = songLineItems[i];
        const noteItem = i + 1 < songLineItems.length ? songLineItems[i + 1] : null;
        
        if (lyricItem && noteItem) {
            const lyricInput = lyricItem.querySelector('.song-lyric');
            const noteInput = noteItem.querySelector('.song-note');
            
            const lyric = lyricInput ? lyricInput.value.trim() : '';
            const note = noteInput ? noteInput.value.trim() : '';
            
            if (note) {
                notesText += note + '\n';
                lyricsText += lyric + '\n';
            }
        }
    }
    
    notesTextarea.value = notesText.trim();
    lyricsTextarea.value = lyricsText.trim();
}

/**
 * Thêm dòng mới vào form song (một cặp lời và nốt)
 */
function addNewSongLine() {
    const container = document.getElementById('song-lines');
    
    // Thêm dòng lời
    const lyricLine = document.createElement('div');
    lyricLine.className = 'song-line-item';
    lyricLine.innerHTML = `
        <div class="form-group">
            <input type="text" class="song-lyric" placeholder="Nơi nhập lời bài hát (không bắt buộc)">
        </div>
    `;
    
    // Thêm dòng nốt
    const noteLine = document.createElement('div');
    noteLine.className = 'song-line-item';
    noteLine.innerHTML = `
        <div class="form-group">
            <input type="text" class="song-note" placeholder="Nơi nhập hợp âm (dạng 1, 2, 3,...)" required>
        </div>
        <button type="button" class="remove-line-btn"><i class="fas fa-times"></i></button>
    `;
    
    // Thêm vào container
    container.appendChild(lyricLine);
    container.appendChild(noteLine);
    
    // Thêm sự kiện xóa dòng
    const removeBtn = noteLine.querySelector('.remove-line-btn');
    if (removeBtn) {
        removeBtn.addEventListener('click', function() {
            container.removeChild(lyricLine);
            container.removeChild(noteLine);
            updateSongPreview();
        });
    }
    
    // Thêm sự kiện cập nhật xem trước khi thay đổi
    const inputs = [
        lyricLine.querySelector('input'),
        noteLine.querySelector('input')
    ];
    
    inputs.forEach(input => {
        if (input) {
            input.addEventListener('input', updateSongPreview);
        }
    });
    
    // Cập nhật xem trước
    updateSongPreview();
}

/**
 * Reset form bài hát
 */
function resetSongForm() {
    document.getElementById('song-id').value = '';
    document.getElementById('song-title').value = '';
    document.getElementById('song-featured').checked = false;
    document.getElementById('song-category').value = '';
    document.getElementById('song-video').value = '';
    document.getElementById('song-notes').value = '';
    document.getElementById('song-lyrics').value = '';
    
    // Reset các trường ẩn
    document.getElementById('song-artist').value = 'Không có';
    document.getElementById('song-thumbnail').value = 'https://kalimbachill.com/images/default-song.jpg';
    
    // Reset các dòng lời và nốt
    const container = document.getElementById('song-lines');
    container.innerHTML = `
        <!-- Cặp đầu tiên -->
        <div class="song-line-item">
            <div class="form-group">
                <label>Lời bài hát (không bắt buộc)</label>
                <input type="text" class="song-lyric" placeholder="Nơi nhập lời bài hát (không bắt buộc)">
            </div>
        </div>
        <div class="song-line-item">
            <div class="form-group">
                <label>Hợp âm <span class="required">*</span></label>
                <input type="text" class="song-note" placeholder="Nơi nhập hợp âm (dạng 1, 2, 3,...)" required>
            </div>
            <button type="button" class="remove-line-btn"><i class="fas fa-times"></i></button>
        </div>
        
        <!-- Cặp thứ hai -->
        <div class="song-line-item">
            <div class="form-group">
                <input type="text" class="song-lyric" placeholder="Nơi nhập lời bài hát (không bắt buộc)">
            </div>
        </div>
        <div class="song-line-item">
            <div class="form-group">
                <input type="text" class="song-note" placeholder="Nơi nhập hợp âm (dạng 1, 2, 3,...)" required>
            </div>
            <button type="button" class="remove-line-btn"><i class="fas fa-times"></i></button>
        </div>
        
        <!-- Cặp thứ ba -->
        <div class="song-line-item">
            <div class="form-group">
                <input type="text" class="song-lyric" placeholder="Nơi nhập lời bài hát (không bắt buộc)">
            </div>
        </div>
        <div class="song-line-item">
            <div class="form-group">
                <input type="text" class="song-note" placeholder="Nơi nhập hợp âm (dạng 1, 2, 3,...)" required>
            </div>
            <button type="button" class="remove-line-btn"><i class="fas fa-times"></i></button>
        </div>
    `;
    
    // Thêm sự kiện xóa dòng
    const removeButtons = container.querySelectorAll('.remove-line-btn');
    removeButtons.forEach((btn, index) => {
        btn.addEventListener('click', function() {
            const position = Math.floor(index / 2) * 2;
            const lyricItem = container.querySelectorAll('.song-line-item')[position];
            const noteItem = container.querySelectorAll('.song-line-item')[position + 1];
            
            if (lyricItem && noteItem) {
                container.removeChild(lyricItem);
                container.removeChild(noteItem);
                updateSongPreview();
            }
        });
    });
    
    // Thêm sự kiện cập nhật xem trước
    const inputs = container.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('input', updateSongPreview);
    });
    
    // Reset xem trước
    document.getElementById('song-preview').innerHTML = `
        <div class="preview-placeholder">
            Xem trước nốt nhạc và lời sẽ hiển thị ở đây sau khi nhập
        </div>
    `;
}

/**
 * Điền dữ liệu vào form từ bài hát hiện có
 */
function fillSongFormFromData(song) {
    document.getElementById('song-id').value = song.id || '';
    document.getElementById('song-title').value = song.title || '';
    document.getElementById('song-featured').checked = song.featured || false;
    document.getElementById('song-category').value = song.category || '';
    document.getElementById('song-video').value = song.videoLink || '';
    
    // Đặt giá trị mặc định cho các trường ẩn
    document.getElementById('song-artist').value = song.artist || 'Không có';
    document.getElementById('song-thumbnail').value = song.thumbnail || 'https://kalimbachill.com/images/default-song.jpg';
    
    // Xử lý nốt nhạc và lời
    const notesArray = song.notes && Array.isArray(song.notes) ? song.notes : [];
    const lyricsArray = song.lyrics && Array.isArray(song.lyrics) ? song.lyrics : [];
    
    // Xóa tất cả các dòng cũ
    const container = document.getElementById('song-lines');
    container.innerHTML = '';
    
    // Thêm các dòng mới từ dữ liệu
    const maxLines = Math.max(notesArray.length, 3); // Tối thiểu 3 cặp dòng
    
    for (let i = 0; i < maxLines; i++) {
        const note = i < notesArray.length ? notesArray[i] : '';
        const lyric = i < lyricsArray.length ? lyricsArray[i] : '';
        
        // Thêm dòng lời
        const lyricLine = document.createElement('div');
        lyricLine.className = 'song-line-item';
        
        if (i === 0) {
            // Dòng đầu tiên có nhãn
            lyricLine.innerHTML = `
                <div class="form-group">
                    <label>Lời bài hát (không bắt buộc)</label>
                    <input type="text" class="song-lyric" placeholder="Nơi nhập lời bài hát (không bắt buộc)" value="${lyric}">
                </div>
            `;
        } else {
            lyricLine.innerHTML = `
                <div class="form-group">
                    <input type="text" class="song-lyric" placeholder="Nơi nhập lời bài hát (không bắt buộc)" value="${lyric}">
                </div>
            `;
        }
        
        // Thêm dòng nốt
        const noteLine = document.createElement('div');
        noteLine.className = 'song-line-item';
        
        if (i === 0) {
            // Dòng đầu tiên có nhãn
            noteLine.innerHTML = `
                <div class="form-group">
                    <label>Hợp âm <span class="required">*</span></label>
                    <input type="text" class="song-note" placeholder="Nơi nhập hợp âm (dạng 1, 2, 3,...)" required value="${note}">
                </div>
                <button type="button" class="remove-line-btn"><i class="fas fa-times"></i></button>
            `;
        } else {
            noteLine.innerHTML = `
                <div class="form-group">
                    <input type="text" class="song-note" placeholder="Nơi nhập hợp âm (dạng 1, 2, 3,...)" required value="${note}">
                </div>
                <button type="button" class="remove-line-btn"><i class="fas fa-times"></i></button>
            `;
        }
        
        // Thêm vào container
        container.appendChild(lyricLine);
        container.appendChild(noteLine);
        
        // Thêm sự kiện xóa dòng
        const removeBtn = noteLine.querySelector('.remove-line-btn');
        if (removeBtn) {
            removeBtn.addEventListener('click', function() {
                container.removeChild(lyricLine);
                container.removeChild(noteLine);
                updateSongPreview();
            });
        }
    }
    
    // Thêm sự kiện cập nhật xem trước
    const inputs = container.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('input', updateSongPreview);
    });
    
    // Cập nhật textarea ẩn
    updateHiddenFields();
    
    // Cập nhật xem trước
    updateSongPreview();
}

/**
 * Lưu bài hát (thêm hoặc cập nhật)
 */
async function saveSong() {
    // Nếu đang tải dữ liệu thì không thực hiện
    if (isLoading) {
        console.log('Đang tải dữ liệu, bỏ qua yêu cầu lưu bài hát');
        if (window.ErrorHandler) {
            window.ErrorHandler.show({
                message: 'Hệ thống đang bận, vui lòng thử lại sau vài giây',
                type: 'warning'
            }, { 
                duration: 3000 
            });
        }
        return false;
    }
    
    try {
        // Lấy form bài hát
        const songForm = document.getElementById('song-form');
        
        // Kiểm tra valid
        if (!songForm.checkValidity()) {
            songForm.reportValidity();
            return false;
        }
        
        // Hiển thị loading overlay
        document.getElementById('loading-overlay').style.display = 'flex';
        
        // Lấy thông tin form
        const songId = document.getElementById('song-id').value;
        const title = document.getElementById('song-title').value;
        const category = document.getElementById('song-category').value;
        const featured = document.getElementById('song-featured').checked;
        const videoLink = document.getElementById('song-video').value || '';
        
        // Các trường ẩn
        const artist = document.getElementById('song-artist').value || 'Không có';
        const thumbnail = document.getElementById('song-thumbnail').value || 'https://kalimbachill.com/images/default-song.jpg';
        
        // Thu thập note và lyrics
        const lyricsArray = [];
        const notesArray = [];
        
        document.querySelectorAll('.song-line-item .song-lyric').forEach(input => {
            const lyric = input.value.trim();
            lyricsArray.push(lyric);
        });
        
        document.querySelectorAll('.song-line-item .song-note').forEach(input => {
            const note = input.value.trim();
            notesArray.push(note);
        });
        
        // Kiểm tra note
        if (notesArray.length === 0 || notesArray.every(note => !note)) {
            throw new Error('Vui lòng nhập ít nhất một dòng hợp âm');
        }
        
        // Kiểm tra title
        if (!title) {
            throw new Error('Vui lòng nhập tên bài hát');
        }
        
        // Kiểm tra category
        if (!category) {
            throw new Error('Vui lòng chọn phân loại bài hát');
        }
        
        // Tạo đối tượng bài hát
        const songData = {
            title,
            artist,
            thumbnail,
            category,
            featured,
            notes: notesArray,
            lyrics: lyricsArray,
            videoLink
        };
        
        console.log('Dữ liệu bài hát cần lưu:', songData);
        
        // Lưu vào Firestore
        let result;
        let successMessage;
        
        if (songId) {
            // Cập nhật bài hát
            console.log('Cập nhật bài hát ID:', songId);
            await KalimbaFirebase.updateSong(songId, songData);
            successMessage = 'Đã cập nhật bài hát thành công';
            result = { id: songId, ...songData };
        } else {
            // Thêm bài hát mới
            console.log('Thêm bài hát mới');
            const newSongId = await KalimbaFirebase.addSong(songData);
            successMessage = 'Đã thêm bài hát mới thành công';
            result = { id: newSongId, ...songData };
        }
        
        // Đóng modal
        document.getElementById('song-modal').style.display = 'none';
        
        // Reset form
        resetSongForm();
        
        // Hiển thị thông báo thành công
        if (window.ErrorHandler) {
            window.ErrorHandler.show({ message: successMessage }, {
                duration: 3000,
                position: 'top-center',
                bgColor: '#d4edda',
                textColor: '#155724'
            });
        }
        
        // Cập nhật thời gian trước khi tải lại - đảm bảo được tải
        lastLoadTime = 0;
        
        // Tải lại danh sách bài hát
        await loadSongs();
        
        // Cập nhật thống kê
        updateSongStats();
        
        return result;
    } catch (error) {
        console.error('Lỗi khi lưu bài hát:', error);
        
        // Hiển thị thông báo lỗi
        if (window.ErrorHandler) {
            window.ErrorHandler.show(error);
        }
        
        return false;
    } finally {
        // Ẩn loading overlay
        document.getElementById('loading-overlay').style.display = 'none';
    }
}

/**
 * Mở modal để chỉnh sửa bài hát
 * @param {String} songId ID của bài hát cần chỉnh sửa
 */
async function openEditSongModal(songId) {
    try {
        // Hiển thị loading overlay
        document.getElementById('loading-overlay').style.display = 'flex';
        
        // Lấy thông tin bài hát
        const song = await KalimbaFirebase.getSongById(songId);
        
        if (!song) {
            throw new Error('Không tìm thấy bài hát');
        }
        
        // Cập nhật tiêu đề modal
        document.getElementById('modal-title').textContent = 'Chỉnh sửa bài hát';
        
        // Điền thông tin vào form
        fillSongFormFromData(song);
        
        // Hiển thị modal
        document.getElementById('song-modal').style.display = 'block';
    } catch (error) {
        console.error('Lỗi khi mở modal chỉnh sửa:', error);
        if (window.ErrorHandler) {
            window.ErrorHandler.show(error);
        }
    } finally {
        // Ẩn loading overlay
        document.getElementById('loading-overlay').style.display = 'none';
    }
}

/**
 * Mở modal xác nhận xóa bài hát
 * @param {String} songId ID của bài hát cần xóa
 * @param {String} songName Tên bài hát để hiển thị
 */
function openDeleteConfirmation(songId, songName) {
    // Cập nhật thông tin vào modal
    document.getElementById('delete-song-name').textContent = songName;
    
    // Lưu ID bài hát vào nút xác nhận
    const confirmButton = document.getElementById('confirm-delete');
    confirmButton.setAttribute('data-id', songId);
    
    // Hiển thị modal
    document.getElementById('confirm-modal').style.display = 'block';
}

/**
 * Khởi tạo form thêm/chỉnh sửa bài hát
 */
function initSongForm() {
    // Nút thêm bài hát mới
    document.getElementById('add-song-btn').addEventListener('click', () => {
        // Reset form
        resetSongForm();
        
        // Cập nhật tiêu đề modal
        document.getElementById('modal-title').textContent = 'Thêm bài hát mới';
        
        // Hiển thị modal
        document.getElementById('song-modal').style.display = 'block';
    });
    
    // Nút thêm dòng mới
    document.getElementById('add-line-btn').addEventListener('click', addNewSongLine);
    
    // Thêm sự kiện cập nhật xem trước cho các trường nhập liệu ban đầu
    const initialInputs = document.querySelectorAll('.song-line-item input');
    initialInputs.forEach(input => {
        input.addEventListener('input', updateSongPreview);
    });
    
    // Các nút đóng modal
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', () => {
            // Đóng tất cả các modal
            document.querySelectorAll('.modal').forEach(modal => {
                modal.style.display = 'none';
            });
        });
    });
    
    // Nút hủy trong form bài hát
    document.getElementById('cancel-song').addEventListener('click', () => {
        document.getElementById('song-modal').style.display = 'none';
    });
    
    // Nút hủy trong form xác nhận xóa
    document.getElementById('cancel-delete').addEventListener('click', () => {
        document.getElementById('confirm-modal').style.display = 'none';
    });
    
    // Nút xác nhận xóa
    document.getElementById('confirm-delete').addEventListener('click', async () => {
        const songId = document.getElementById('confirm-delete').getAttribute('data-id');
        await deleteSong(songId);
    });
    
    // Sự kiện submit form bài hát
    document.getElementById('song-form').addEventListener('submit', async (event) => {
        event.preventDefault();
        await saveSong();
    });
    
    // Sự kiện xem trước bài hát cho các trường khác
    document.getElementById('song-title').addEventListener('input', updateSongPreview);
    document.getElementById('song-video').addEventListener('input', updateSongPreview);
}

/**
 * Xóa bài hát
 * @param {String} songId ID của bài hát cần xóa
 */
async function deleteSong(songId) {
    try {
        // Hiển thị loading overlay
        document.getElementById('loading-overlay').style.display = 'flex';
        
        // Kiểm tra xem songId có tồn tại không
        if (!songId) {
            throw new Error('Không tìm thấy ID bài hát');
        }
        
        // Gọi API để xóa bài hát
        await KalimbaFirebase.deleteSong(songId);
        
        // Đóng modal xác nhận
        document.getElementById('confirm-modal').style.display = 'none';
        
        // Hiển thị thông báo thành công
        if (window.ErrorHandler) {
            const successMsg = { message: 'Đã xóa bài hát thành công' };
            window.ErrorHandler.show(successMsg, {
                duration: 3000,
                position: 'top-center',
                bgColor: '#d4edda',
                textColor: '#155724'
            });
        }
        
        // Cập nhật thời gian trước khi tải lại - đảm bảo được tải
        lastLoadTime = 0;
        
        // Tải lại danh sách bài hát
        await loadSongs();
        
        // Cập nhật thống kê
        updateSongStats();
        
    } catch (error) {
        console.error('Lỗi khi xóa bài hát:', error);
        if (window.ErrorHandler) {
            window.ErrorHandler.show(error);
        }
    } finally {
        // Ẩn loading overlay
        document.getElementById('loading-overlay').style.display = 'none';
    }
}

/**
 * Khởi tạo chức năng tìm kiếm và lọc
 */
function initSearchAndFilter() {
    // Tìm kiếm theo tên bài hát và thể loại
    const searchInput = document.getElementById('song-search');
    searchInput.addEventListener('input', () => {
        const searchText = searchInput.value.toLowerCase();
        
        document.querySelectorAll('#songs-list tr').forEach(row => {
            if (row.classList.contains('loading-row')) return;
            
            const songTitle = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
            const songCategory = row.querySelector('td:nth-child(3)').textContent.toLowerCase();
            
            if (songTitle.includes(searchText) || songCategory.includes(searchText)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });
    
    // Lọc theo loại bài hát
    const filterSelect = document.getElementById('song-filter');
    filterSelect.addEventListener('change', () => {
        const filterValue = filterSelect.value;
        
        document.querySelectorAll('#songs-list tr').forEach(row => {
            if (row.classList.contains('loading-row')) return;
            
            if (filterValue === 'all') {
                row.style.display = '';
            } else if (filterValue === 'recent') {
                // Hiển thị 10 bài hát đầu tiên (đã sắp xếp theo thời gian giảm dần)
                const allRows = Array.from(document.querySelectorAll('#songs-list tr'));
                const index = allRows.indexOf(row);
                row.style.display = index < 10 ? '' : 'none';
            } else {
                // Lọc theo thể loại nhạc
                const categoryCell = row.querySelector('td:nth-child(3)');
                const categoryText = categoryCell ? categoryCell.textContent.trim() : '';
                
                // So sánh thể loại hiển thị với giá trị lọc
                let matches = false;
                switch(filterValue) {
                    case 'nhac-vang': matches = categoryText === 'Nhạc Vàng'; break;
                    case 'nhac-tre': matches = categoryText === 'Nhạc Trẻ'; break;
                    case 'indie': matches = categoryText === 'Indie Việt'; break;
                    case 'de-choi': matches = categoryText === 'Dễ chơi'; break;
                    case 'du-ca': matches = categoryText === 'Du Ca'; break;
                    case 'canon': matches = categoryText === 'Vòng Canon'; break;
                    case 'c-g-am-f': matches = categoryText === 'Vòng C G Am F'; break;
                    default: matches = false;
                }
                
                row.style.display = matches ? '' : 'none';
            }
        });
    });
}

/**
 * Khởi tạo menu người dùng và sự kiện đăng xuất
 */
function initUserMenu() {
    // Xử lý sự kiện click vào avatar
    const avatar = document.querySelector('.header-avatar');
    const userMenu = document.querySelector('.user-menu');
    
    if (avatar && userMenu) {
        avatar.addEventListener('click', function(e) {
            e.stopPropagation();
            userMenu.classList.toggle('visible');
        });
        
        // Đóng menu khi click bên ngoài
        document.addEventListener('click', function(e) {
            if (!userMenu.contains(e.target) && !avatar.contains(e.target)) {
                userMenu.classList.remove('visible');
            }
        });
    }
    
    // Xử lý sự kiện đăng xuất
    const logoutButton = document.querySelector('.user-menu-item.logout');
    if (logoutButton) {
        logoutButton.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Xóa dữ liệu người dùng khỏi localStorage
            localStorage.removeItem('kalimbaUser');
            
            // Chuyển hướng về trang chủ
            window.location.href = '../index.html';
        });
    }
}

/**
 * Quản lý người dùng
 */

/**
 * Khởi tạo các thành phần quản lý người dùng
 */
function initUserManagement() {
    console.log('Khởi tạo chức năng quản lý người dùng');
    
    // Load user data khi tab người dùng được hiển thị
    const usersTabBtn = document.querySelector('.tab-btn[data-tab="users"]');
    if (usersTabBtn) {
        usersTabBtn.addEventListener('click', async () => {
            console.log('Tab người dùng được nhấp, đang tải dữ liệu...');
            await loadUsers();
            updateUserCount();
        });
    } else {
        console.error('Không tìm thấy nút tab người dùng');
    }
    
    // Nếu tab người dùng đang được hiển thị, tải ngay dữ liệu
    if (document.getElementById('users-tab').classList.contains('active')) {
        console.log('Tab người dùng đang hiển thị, tải dữ liệu ngay lập tức');
        setTimeout(async () => {
            await loadUsers();
            updateUserCount();
        }, 500);
    }
    
    // Khởi tạo chức năng tìm kiếm
    const searchBtn = document.getElementById('user-search-btn');
    const searchInput = document.getElementById('user-search');
    
    if (!searchBtn) {
        console.error('KHÔNG TÌM THẤY nút tìm kiếm với id="user-search-btn"');
    }
    
    if (!searchInput) {
        console.error('KHÔNG TÌM THẤY ô input tìm kiếm với id="user-search"');
        // Thử tìm kiếm theo cách khác
        const altInput = document.querySelector('input[placeholder*="Tìm kiếm theo tên"]');
        if (altInput) {
            console.log('Tìm thấy input tìm kiếm thay thế:', altInput);
        }
    } else {
        console.log('Đã tìm thấy ô input tìm kiếm:', searchInput);
    }
    
    // Chỉ thêm sự kiện nếu tìm thấy các phần tử
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            console.log('Nút tìm kiếm được nhấn');
            filterUsers();
        });
    }
    
    if (searchInput) {
        // Thêm sự kiện khi click vào ô input
        searchInput.addEventListener('click', () => {
            console.log('Ô tìm kiếm được click');
        });
        
        // Thêm sự kiện khi focus vào ô input
        searchInput.addEventListener('focus', () => {
            console.log('Ô tìm kiếm được focus');
        });
        
        searchInput.addEventListener('keyup', (event) => {
            console.log('Phím được nhấn trong ô tìm kiếm:', event.key, 'Giá trị hiện tại:', searchInput.value);
            if (event.key === 'Enter') {
                filterUsers();
            }
        });
        
        // Thêm sự kiện input để tìm kiếm ngay khi người dùng gõ
        searchInput.addEventListener('input', () => {
            console.log('Sự kiện input được kích hoạt. Giá trị hiện tại:', searchInput.value);
            filterUsers();
        });
        
        // Log giá trị ban đầu của ô tìm kiếm
        console.log('Giá trị ban đầu của ô tìm kiếm:', searchInput.value);
    }
    
    // Thêm sự kiện click toàn document để kiểm tra việc hủy click
    document.addEventListener('click', (event) => {
        const searchInput = document.getElementById('user-search');
        if (searchInput && event.target !== searchInput) {
            console.log('Click bên ngoài ô tìm kiếm. Giá trị hiện tại của ô tìm kiếm:', searchInput.value);
        }
    });
    
    // Khởi tạo chức năng lọc
    const filterSelect = document.getElementById('user-filter');
    if (filterSelect) {
        filterSelect.addEventListener('change', () => {
            filterUsers();
        });
    } else {
        console.error('KHÔNG TÌM THẤY select lọc với id="user-filter"');
    }
    
    // Khởi tạo sự kiện cho modal người dùng
    const cancelRoleBtn = document.getElementById('cancel-role-change');
    if (cancelRoleBtn) {
        cancelRoleBtn.addEventListener('click', () => {
            document.getElementById('user-role-modal').style.display = 'none';
        });
    }
    
    // Đóng modal khi nhấp vào nút x
    const closeButtons = document.querySelectorAll('#user-role-modal .close-modal');
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            document.getElementById('user-role-modal').style.display = 'none';
        });
    });
    
    // Khởi tạo sự kiện cho nút tải lại danh sách người dùng
    const reloadBtn = document.getElementById('reload-users-btn');
    if (reloadBtn) {
        reloadBtn.addEventListener('click', async () => {
            console.log('Đang tải lại danh sách người dùng...');
            await loadUsers();
            updateUserCount();
        });
    } else {
        console.error('KHÔNG TÌM THẤY nút tải lại với id="reload-users-btn"');
    }
}

/**
 * Tải danh sách người dùng
 */
async function loadUsers() {
    try {
        console.log('Bắt đầu tải danh sách người dùng...');
        
        // Hiển thị loading
        document.getElementById('users-list').innerHTML = `
            <tr class="loading-row">
                <td colspan="7" class="text-center">
                    <div class="loading-spinner">
                        <i class="fas fa-spinner fa-spin"></i> Đang tải danh sách người dùng...
                    </div>
                </td>
            </tr>
        `;
        
        // Kiểm tra xem KalimbaFirebase đã được khởi tạo chưa
        if (!window.KalimbaFirebase) {
            console.error('KalimbaFirebase chưa được khởi tạo');
            throw new Error('KalimbaFirebase chưa được khởi tạo');
        }
        
        console.log('Gọi hàm getAllUsers từ KalimbaFirebase...');
        
        // Tải danh sách người dùng từ Firestore
        allUsers = await window.KalimbaFirebase.getAllUsers();
        
        console.log('Đã nhận được danh sách người dùng:', allUsers);
        
        // Hiển thị danh sách người dùng
        renderUsers(allUsers);
    } catch (error) {
        console.error('Lỗi khi tải danh sách người dùng:', error);
        document.getElementById('users-list').innerHTML = `
            <tr>
                <td colspan="7" class="text-center">
                    <div class="alert alert-error">
                        <i class="fas fa-exclamation-triangle"></i> 
                        Lỗi khi tải danh sách người dùng: ${error.message}
                    </div>
                </td>
            </tr>
        `;
        
        if (window.ErrorHandler) {
            window.ErrorHandler.show(error);
        }
    }
}

/**
 * Hiển thị danh sách người dùng
 * @param {Array} users Danh sách người dùng
 */
function renderUsers(users) {
    const usersList = document.getElementById('users-list');
    
    if (!users || users.length === 0) {
        usersList.innerHTML = `
            <tr>
                <td colspan="6">
                    <div class="no-users">
                        <i class="fas fa-users-slash"></i>
                        <p>Không có người dùng nào.</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    let html = '';
    
    users.forEach(user => {
        // Format thời gian đăng nhập
        const loginDate = user.lastLoginAt ? new Date(user.lastLoginAt) : null;
        const formattedLoginDate = loginDate ? 
            loginDate.toLocaleDateString('vi-VN', { 
                year: 'numeric', 
                month: '2-digit', 
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            }) : 'Chưa có';
        
        html += `
            <tr data-user-id="${user.id}">
                <td>
                    <div class="user-avatar-cell">
                        <img src="${user.picture || 'images/default-avatar.png'}" alt="${user.name}">
                    </div>
                </td>
                <td>${user.name || 'Không có tên'}</td>
                <td>${user.email || 'Không có email'}</td>
                <td><span class="last-login">${formattedLoginDate}</span></td>
                <td><span class="login-count">${user.loginCount || 1}</span></td>
                <td>
                    <button class="secondary-btn" onclick="window.open('mailto:${user.email}', '_blank')">
                        <i class="fas fa-envelope"></i> Liên hệ
                    </button>
                </td>
            </tr>
        `;
    });
    
    usersList.innerHTML = html;
}

/**
 * Lọc danh sách người dùng
 */
function filterUsers() {
    // Lấy giá trị tìm kiếm bằng nhiều cách khác nhau để đảm bảo nó hoạt động
    let searchText = '';
    try {
        const searchInput = document.getElementById('user-search');
        if (searchInput) {
            searchText = searchInput.value.toLowerCase();
            console.log('Lấy giá trị từ getElementById:', searchText);
        } else {
            const altInput = document.querySelector('input[name="user-search"]');
            if (altInput) {
                searchText = altInput.value.toLowerCase();
                console.log('Lấy giá trị từ querySelector[name]:', searchText);
            } else {
                const placeholder = document.querySelector('input[placeholder*="Tìm kiếm theo tên"]');
                if (placeholder) {
                    searchText = placeholder.value.toLowerCase();
                    console.log('Lấy giá trị từ querySelector[placeholder]:', searchText);
                } else {
                    console.error('Không thể tìm thấy ô input tìm kiếm bằng bất kỳ cách nào');
                }
            }
        }
    } catch (error) {
        console.error('Lỗi khi lấy giá trị tìm kiếm:', error);
    }
    
    const filterValue = document.getElementById('user-filter')?.value || 'all';
    
    console.log('Đang lọc người dùng với từ khóa:', searchText);
    console.log('Bộ lọc đang sử dụng:', filterValue);
    console.log('Tổng số người dùng trước khi lọc:', allUsers ? allUsers.length : 0);
    
    // Kiểm tra nếu allUsers chưa được khởi tạo
    if (!allUsers || !Array.isArray(allUsers) || allUsers.length === 0) {
        console.warn('Danh sách người dùng trống hoặc chưa được khởi tạo');
        return;
    }
    
    // Tìm kiếm và lọc người dùng
    const filteredUsers = allUsers.filter(user => {
        // Kiểm tra nếu user không hợp lệ
        if (!user) return false;
        
        // Tìm kiếm theo tên hoặc email
        const userName = user.name ? user.name.toLowerCase() : '';
        const userEmail = user.email ? user.email.toLowerCase() : '';
        
        const matchesSearch = !searchText || 
            userName.includes(searchText) || 
            userEmail.includes(searchText);
        
        console.log(`Người dùng ${user.name || 'không tên'} - khớp tìm kiếm: ${matchesSearch}`);
        
        // Lọc theo tất cả hoặc đăng nhập gần đây
        let matchesFilter = true;
        if (filterValue === 'recent') {
            // Lấy những người đăng nhập trong vòng 7 ngày gần đây
            const now = new Date();
            const lastLogin = user.lastLoginAt ? new Date(user.lastLoginAt) : null;
            if (!lastLogin) return false;
            
            const diffTime = Math.abs(now - lastLogin);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            matchesFilter = diffDays <= 7;
        }
        
        return matchesSearch && matchesFilter;
    });
    
    console.log('Số người dùng sau khi lọc:', filteredUsers.length);
    
    // Hiển thị kết quả lọc
    renderUsers(filteredUsers);
}

/**
 * Cập nhật tổng số người dùng
 */
async function updateUserCount() {
    try {
        const userCount = await KalimbaFirebase.getUserCount();
        document.getElementById('total-users-card').querySelector('.stat-value').textContent = userCount;
    } catch (error) {
        console.error('Lỗi khi lấy tổng số người dùng:', error);
        document.getElementById('total-users-card').querySelector('.stat-value').textContent = '--';
    }
}

/**
 * Kiểm tra chức năng tìm kiếm người dùng
 */
function testUserSearch() {
    console.log('Bắt đầu kiểm tra chức năng tìm kiếm');
    
    // Lấy đối tượng input tìm kiếm
    const searchInput = document.getElementById('user-search');
    
    if (!searchInput) {
        console.error('KHÔNG TÌM THẤY ô input tìm kiếm với id="user-search"');
        // Thử tìm bằng query selector
        const altInput = document.querySelector('input[placeholder*="Tìm kiếm theo tên"]');
        if (altInput) {
            console.log('Tìm thấy ô input qua placeholder:', altInput);
        } else {
            console.error('Không tìm thấy ô input tìm kiếm nào phù hợp');
        }
        return;
    }
    
    console.log('Đã tìm thấy ô input tìm kiếm:', searchInput);
    
    // Kiểm tra giá trị hiện tại
    console.log('Giá trị hiện tại của ô tìm kiếm:', searchInput.value);
    
    // Thử thiết lập giá trị mẫu và kích hoạt tìm kiếm
    searchInput.value = 'test';
    console.log('Đã thiết lập giá trị:', searchInput.value);
    
    // Kích hoạt sự kiện input
    const inputEvent = new Event('input', { bubbles: true });
    searchInput.dispatchEvent(inputEvent);
    console.log('Đã kích hoạt sự kiện input');
    
    // Kích hoạt tìm kiếm thủ công
    filterUsers();
    console.log('Đã kích hoạt tìm kiếm thủ công');
}

// Kích hoạt kiểm tra sau khi trang đã tải
setTimeout(testUserSearch, 3000);

/**
 * Cập nhật thống kê bài hát
 */
async function updateSongStats() {
    try {
        // Kiểm tra KalimbaFirebase có được khởi tạo chưa
        if (!window.KalimbaFirebase) {
            console.error('KalimbaFirebase chưa được khởi tạo');
            return;
        }
        
        // Hiển thị loading trên các thẻ thống kê
        document.getElementById('total-songs-card').querySelector('.stat-value').textContent = '...';
        document.getElementById('nhac-vang-songs-card').querySelector('.stat-value').textContent = '...';
        document.getElementById('nhac-tre-songs-card').querySelector('.stat-value').textContent = '...';
        document.getElementById('recent-songs-card').querySelector('.stat-value').textContent = '...';
        
        // Lấy tất cả bài hát
        const songs = await KalimbaFirebase.getAllSongs();
        
        if (!songs || !Array.isArray(songs)) {
            console.error('Không thể lấy danh sách bài hát');
            return;
        }
        
        // Tính toán thống kê
        const totalSongs = songs.length;
        
        // Đếm bài hát theo phân loại
        const nhacVangSongs = songs.filter(song => song.category === 'nhac-vang').length;
        const nhacTreSongs = songs.filter(song => song.category === 'nhac-tre').length;
        
        // Đếm bài hát thêm trong 7 ngày gần đây
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const recentSongs = songs.filter(song => {
            if (!song.createdAt) return false;
            const createdDate = new Date(song.createdAt);
            return createdDate >= sevenDaysAgo;
        }).length;
        
        // Cập nhật giao diện
        document.getElementById('total-songs-card').querySelector('.stat-value').textContent = totalSongs;
        document.getElementById('nhac-vang-songs-card').querySelector('.stat-value').textContent = nhacVangSongs;
        document.getElementById('nhac-tre-songs-card').querySelector('.stat-value').textContent = nhacTreSongs;
        document.getElementById('recent-songs-card').querySelector('.stat-value').textContent = recentSongs;
        
        console.log('Đã cập nhật thống kê bài hát:', { 
            totalSongs, 
            nhacVangSongs, 
            nhacTreSongs, 
            recentSongs 
        });
    } catch (error) {
        console.error('Lỗi khi cập nhật thống kê bài hát:', error);
        document.getElementById('total-songs-card').querySelector('.stat-value').textContent = '--';
        document.getElementById('nhac-vang-songs-card').querySelector('.stat-value').textContent = '--';
        document.getElementById('nhac-tre-songs-card').querySelector('.stat-value').textContent = '--';
        document.getElementById('recent-songs-card').querySelector('.stat-value').textContent = '--';
    }
} 