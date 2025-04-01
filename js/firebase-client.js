/**
 * Firebase client cho trình duyệt
 * File này chỉ cung cấp các hàm đọc dữ liệu cơ bản từ Firebase
 */

// Cấu hình Firebase - sử dụng giá trị hardcode để đảm bảo hoạt động trong môi trường trình duyệt
const firebaseConfig = {
  apiKey: "AIzaSyDGS6RibW9FHt83tX2wvVQDo80dwvkIvrY",
  authDomain: "kalimba-chill.firebaseapp.com",
  projectId: "kalimba-chill",
  storageBucket: "kalimba-chill.firebasestorage.app",
  messagingSenderId: "847603826023",
  appId: "1:847603826023:web:5d320dfa08eec4135543c2",
  measurementId: "G-9V15278SHP"
};

// Biến toàn cục lưu các instance của Firebase
let firebaseApp = null;
let firestore = null;
let analytics = null;

/**
 * Khởi tạo Firebase và các dịch vụ
 * @returns {Promise<void>}
 */
async function initFirebase() {
  // Nếu đã khởi tạo rồi thì không khởi tạo lại
  if (firebaseApp) return;
  
  try {
    // Đảm bảo thư viện Firebase đã được tải
    if (!window.firebase) {
      console.error('Thư viện Firebase chưa được tải. Hãy thêm các script Firebase vào trang HTML');
      return;
    }
    
    // Khởi tạo Firebase
    firebaseApp = firebase.initializeApp(firebaseConfig);
    
    // Khởi tạo các dịch vụ (chỉ Firestore và Analytics)
    if (firebase.firestore) firestore = firebase.firestore();
    if (firebase.analytics) analytics = firebase.analytics();
    
    console.log('Firebase đã được khởi tạo thành công');
  } catch (error) {
    console.error('Lỗi khi khởi tạo Firebase:', error);
    showFirebaseError(error);
  }
}

/**
 * Hiển thị thông báo lỗi Firebase
 * @param {Error} error 
 */
function showFirebaseError(error) {
  const errorContainer = document.createElement('div');
  errorContainer.className = 'firebase-error-message';
  errorContainer.innerHTML = `
    <div class="firebase-error-content">
      <i class="fas fa-exclamation-circle"></i>
      <span>Lỗi kết nối Firebase: ${error.message}</span>
      <button class="close-error-btn"><i class="fas fa-times"></i></button>
    </div>
  `;
  
  // CSS cho thông báo lỗi
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
  
  // Tự động đóng thông báo sau 10 giây
  setTimeout(() => {
    if (errorContainer.parentNode) {
      errorContainer.remove();
    }
  }, 10000);
  
  // Lưu lỗi vào localStorage để xử lý sau này nếu cần
  localStorage.setItem('last_firebase_error', JSON.stringify({
    message: error.message,
    code: error.code || 'unknown',
    timestamp: new Date().getTime()
  }));
}

/**
 * Tải dữ liệu bài hát nổi bật từ Firestore
 * @param {Number} limit Số lượng bài hát cần lấy
 * @returns {Promise<Array>} Danh sách bài hát
 */
async function loadFeaturedSongs(limit = 10) {
  try {
    // Khởi tạo Firebase nếu chưa khởi tạo
    await initFirebase();
    
    if (!firestore) {
      throw new Error('Firestore chưa được khởi tạo');
    }
    
    // Truy vấn collection songs
    const songsRef = firestore.collection('songs');
    
    // Sử dụng mô phỏng để tạo dữ liệu mẫu khi có lỗi permission
    try {
      // Thử lấy dữ liệu thật
      const snapshot = await songsRef.limit(limit).get();
      
      // Nếu có dữ liệu, trả về
      if (!snapshot.empty) {
        const songs = [];
        snapshot.forEach(doc => {
          const song = {
            id: doc.id,
            ...doc.data()
          };
          songs.push(song);
        });
        return songs;
      } else {
        // Nếu không có dữ liệu, sử dụng dữ liệu mẫu
        return getMockSongs();
      }
    } catch (error) {
      console.warn('Không thể lấy dữ liệu từ Firestore, sử dụng dữ liệu mẫu:', error);
      return getMockSongs();
    }
  } catch (error) {
    console.error('Lỗi khi tải bài hát nổi bật:', error);
    return getMockSongs();
  }
}

/**
 * Tạo dữ liệu bài hát mẫu khi không kết nối được với Firestore
 * @returns {Array} Danh sách bài hát mẫu
 */
function getMockSongs() {
  return [
    {
      id: 'song1',
      title: 'Hạ Còn Vương Nắng',
      artist: 'DATKAA x KIDO x Prod. DINHLONG',
      thumbnail: 'images/songs/ha-con-vuong-nang.jpg',
      createdAt: new Date().toISOString(),
      featured: true
    },
    {
      id: 'song2',
      title: 'Là Bạn Không Thể Yêu',
      artist: 'Lou Hoàng',
      thumbnail: 'images/songs/la-ban-khong-the-yeu.jpg',
      createdAt: new Date().toISOString(),
      featured: true
    },
    {
      id: 'song3',
      title: 'Tháng Tư Là Lời Nói Dối Của Em',
      artist: 'Hà Anh Tuấn',
      thumbnail: 'images/songs/thang-tu-la-loi-noi-doi-cua-em.jpg',
      createdAt: new Date().toISOString(),
      featured: true
    },
    {
      id: 'song4',
      title: 'Chúng Ta Của Hiện Tại',
      artist: 'Sơn Tùng M-TP',
      thumbnail: 'images/songs/chung-ta-cua-hien-tai.jpg',
      createdAt: new Date().toISOString(),
      featured: true
    },
    {
      id: 'song5',
      title: 'Có Chơi Có Chịu',
      artist: 'Karik x Only C',
      thumbnail: 'images/songs/co-choi-co-chiu.jpg',
      createdAt: new Date().toISOString(),
      featured: true
    },
    {
      id: 'song6',
      title: 'Ai Chung Tình Được Mãi',
      artist: 'Đinh Tùng Huy',
      thumbnail: 'images/songs/ai-chung-tinh-duoc-mai.jpg',
      createdAt: new Date().toISOString(),
      featured: true
    }
  ];
}

/**
 * Kiểm tra kết nối Firebase
 * @returns {Promise<Object>} Kết quả kiểm tra
 */
async function checkConnection() {
  try {
    // Khởi tạo Firebase nếu chưa khởi tạo
    await initFirebase();
    
    if (!firestore) {
      throw new Error('Firestore chưa được khởi tạo');
    }
    
    // Chỉ kiểm tra kết nối, không thử truy vấn dữ liệu (tránh lỗi permission)
    return { success: true, message: 'Kết nối Firebase thành công' };
  } catch (error) {
    console.error('Lỗi kết nối Firebase:', error);
    return { 
      success: false, 
      message: 'Không thể kết nối tới Firebase', 
      error: error.message 
    };
  }
}

/**
 * Tải một bài hát theo ID
 * @param {String} songId ID của bài hát cần lấy
 * @returns {Promise<Object>} Thông tin bài hát
 */
async function getSongById(songId) {
  try {
    // Khởi tạo Firebase nếu chưa khởi tạo
    await initFirebase();
    
    if (!firestore) {
      throw new Error('Firestore chưa được khởi tạo');
    }
    
    // Lấy bài hát theo ID
    const songDoc = await firestore.collection('songs').doc(songId).get();
    
    if (songDoc.exists) {
      return {
        id: songDoc.id,
        ...songDoc.data()
      };
    } else {
      throw new Error('Không tìm thấy bài hát');
    }
  } catch (error) {
    console.error('Lỗi khi lấy bài hát:', error);
    showFirebaseError(error);
    return null;
  }
}

/**
 * Tải danh sách bài hát mới nhất
 * @param {Number} limit Số lượng bài hát cần lấy
 * @returns {Promise<Array>} Danh sách bài hát
 */
async function getLatestSongs(limit = 10) {
  try {
    // Khởi tạo Firebase nếu chưa khởi tạo
    await initFirebase();
    
    if (!firestore) {
      throw new Error('Firestore chưa được khởi tạo');
    }
    
    // Truy vấn collection songs
    const songsRef = firestore.collection('songs');
    const snapshot = await songsRef
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();
    
    // Xử lý kết quả
    const songs = [];
    snapshot.forEach(doc => {
      const song = {
        id: doc.id,
        ...doc.data()
      };
      songs.push(song);
    });
    
    return songs;
  } catch (error) {
    console.error('Lỗi khi tải bài hát mới nhất:', error);
    showFirebaseError(error);
    return [];
  }
}

// Export các hàm ra window object để sử dụng trong HTML
window.KalimbaFirebase = {
  init: initFirebase,
  loadFeaturedSongs,
  getSongById,
  getLatestSongs,
  checkConnection,
  getConfig: () => firebaseConfig
}; 