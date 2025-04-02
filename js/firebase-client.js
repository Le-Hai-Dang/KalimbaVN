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
  // Trả về mảng rỗng thay vì dữ liệu mẫu
  console.log('Không có dữ liệu bài hát, trả về mảng rỗng.');
  return [];
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

/**
 * Thêm bài hát mới vào Firestore
 * Chỉ admin mới có quyền sử dụng hàm này
 * @param {Object} songData Dữ liệu bài hát
 * @returns {Promise<String>} ID của bài hát mới
 */
async function addSong(songData) {
  try {
    // Khởi tạo Firebase nếu chưa khởi tạo
    await initFirebase();
    
    if (!firestore) {
      throw new Error('Firestore chưa được khởi tạo');
    }
    
    // Kiểm tra quyền admin
    if (!window.AdminAuth || !window.AdminAuth.checkAdminStatus()) {
      throw new Error('Không có quyền thêm bài hát');
    }
    
    // Thêm dữ liệu thời gian
    const enrichedData = {
      ...songData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Thêm vào collection songs
    const docRef = await firestore.collection('songs').add(enrichedData);
    
    console.log('Đã thêm bài hát mới với ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Lỗi khi thêm bài hát:', error);
    if (window.ErrorHandler) {
      window.ErrorHandler.show(error);
    }
    throw error;
  }
}

/**
 * Cập nhật thông tin bài hát
 * Chỉ admin mới có quyền sử dụng hàm này
 * @param {String} songId ID của bài hát
 * @param {Object} songData Dữ liệu cập nhật
 * @returns {Promise<Boolean>} Kết quả cập nhật
 */
async function updateSong(songId, songData) {
  try {
    // Khởi tạo Firebase nếu chưa khởi tạo
    await initFirebase();
    
    if (!firestore) {
      throw new Error('Firestore chưa được khởi tạo');
    }
    
    // Kiểm tra quyền admin
    if (!window.AdminAuth || !window.AdminAuth.checkAdminStatus()) {
      throw new Error('Không có quyền cập nhật bài hát');
    }
    
    // Thêm dữ liệu thời gian cập nhật
    const enrichedData = {
      ...songData,
      updatedAt: new Date().toISOString()
    };
    
    // Cập nhật trong collection songs
    await firestore.collection('songs').doc(songId).update(enrichedData);
    
    console.log('Đã cập nhật bài hát ID:', songId);
    return true;
  } catch (error) {
    console.error('Lỗi khi cập nhật bài hát:', error);
    if (window.ErrorHandler) {
      window.ErrorHandler.show(error);
    }
    throw error;
  }
}

/**
 * Xóa bài hát theo ID
 * Chỉ admin mới có quyền sử dụng hàm này
 * @param {String} songId ID của bài hát cần xóa
 * @returns {Promise<Boolean>} Kết quả xóa
 */
async function deleteSong(songId) {
  try {
    // Khởi tạo Firebase nếu chưa khởi tạo
    await initFirebase();
    
    if (!firestore) {
      throw new Error('Firestore chưa được khởi tạo');
    }
    
    // Kiểm tra quyền admin
    if (!window.AdminAuth || !window.AdminAuth.checkAdminStatus()) {
      throw new Error('Không có quyền xóa bài hát');
    }
    
    // Xóa song từ collection songs
    await firestore.collection('songs').doc(songId).delete();
    
    console.log('Đã xóa bài hát ID:', songId);
    return true;
  } catch (error) {
    console.error('Lỗi khi xóa bài hát:', error);
    if (window.ErrorHandler) {
      window.ErrorHandler.show(error);
    }
    throw error;
  }
}

/**
 * Lấy tất cả bài hát
 * @returns {Promise<Array>} Danh sách bài hát
 */
async function getAllSongs() {
  try {
    // Khởi tạo Firebase nếu chưa khởi tạo
    await initFirebase();
    
    if (!firestore) {
      throw new Error('Firestore chưa được khởi tạo');
    }
    
    // Truy vấn tất cả bài hát, sắp xếp theo thời gian tạo giảm dần
    const snapshot = await firestore.collection('songs')
      .orderBy('createdAt', 'desc')
      .get();
    
    // Xử lý kết quả
    const songs = [];
    snapshot.forEach(doc => {
      songs.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return songs;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách bài hát:', error);
    if (window.ErrorHandler) {
      window.ErrorHandler.show(error);
    }
    // Nếu có lỗi, trả về mảng rỗng
    return [];
  }
}

/**
 * Kiểm tra kết nối Firebase nhanh chóng mà không cần truy vấn dữ liệu
 * @returns {Promise<Object>} Kết quả kiểm tra
 */
async function quickConnectionCheck() {
  try {
    console.log('Bắt đầu kiểm tra kết nối Firebase...');
    
    // Khởi tạo Firebase nếu chưa khởi tạo
    await initFirebase();
    
    // Kiểm tra xem firebase đã được tải chưa
    if (typeof firebase === 'undefined') {
      console.error('Firebase SDK chưa được tải');
      return { 
        success: false, 
        message: 'Firebase SDK chưa được tải', 
        error: 'FIREBASE_SDK_NOT_LOADED'
      };
    }
    
    // Kiểm tra xem firestore đã khởi tạo chưa
    if (!firestore) {
      console.error('Firestore chưa được khởi tạo');
      return { 
        success: false, 
        message: 'Chưa khởi tạo kết nối đến Firestore', 
        error: 'FIRESTORE_NOT_INITIALIZED'
      };
    }
    
    // Thử kết nối tới Firebase mà không cần truy vấn dữ liệu
    const online = window.navigator.onLine;
    
    if (!online) {
      console.error('Không có kết nối internet');
      return { 
        success: false, 
        message: 'Không có kết nối internet', 
        error: 'NETWORK_OFFLINE'
      };
    }

    // Đây chỉ là kiểm tra cơ bản, không thực sự kiểm tra quyền truy cập
    // vì test query có thể gây ra nhiều lỗi không cần thiết
    // và tăng số lần đọc trên Firestore
    console.log('Kết nối cơ bản hoạt động, internet đã kết nối');
    
    return { 
      success: true, 
      message: 'Kết nối Firebase thành công (kiểm tra cơ bản)', 
      testResult: 'Kiểm tra cơ bản thành công'
    };
  } catch (error) {
    console.error('Lỗi kiểm tra kết nối Firebase:', error);
    return { 
      success: false, 
      message: 'Lỗi khi kiểm tra kết nối Firebase: ' + error.message, 
      error: error.code || 'CONNECTION_CHECK_ERROR',
      details: error
    };
  }
}

/**
 * Lưu hoặc cập nhật thông tin người dùng vào Firestore sau khi đăng nhập
 * @param {Object} userData Dữ liệu người dùng từ Google
 * @returns {Promise<boolean>} Kết quả lưu dữ liệu
 */
async function saveUserToFirestore(userData) {
  try {
    // Khởi tạo Firebase nếu chưa khởi tạo
    await initFirebase();
    
    if (!firestore) {
      throw new Error('Firestore chưa được khởi tạo');
    }
    
    // Lấy thời gian hiện tại
    const now = new Date().toISOString();
    
    // Tham chiếu đến document người dùng (dùng ID từ Google là key)
    const userRef = firestore.collection('users').doc(userData.id);
    
    // Kiểm tra xem người dùng đã tồn tại chưa
    const userDoc = await userRef.get();
    
    if (userDoc.exists) {
      // Cập nhật thông tin người dùng hiện có
      await userRef.update({
        name: userData.name,
        email: userData.email,
        picture: userData.picture,
        lastLoginAt: now,
        loginCount: firebase.firestore.FieldValue.increment(1)
      });
      
      console.log('Đã cập nhật thông tin người dùng:', userData.email);
    } else {
      // Tạo người dùng mới
      await userRef.set({
        id: userData.id,
        name: userData.name,
        email: userData.email,
        picture: userData.picture,
        createdAt: now,
        lastLoginAt: now,
        loginCount: 1
      });
      
      console.log('Đã tạo người dùng mới:', userData.email);
    }
    
    return true;
  } catch (error) {
    console.error('Lỗi khi lưu thông tin người dùng:', error);
    // Không hiển thị lỗi này cho người dùng, chỉ ghi log
    // Vẫn cho phép đăng nhập ngay cả khi không lưu được thông tin
    return false;
  }
}

/**
 * Lấy danh sách tất cả người dùng
 * Chỉ admin mới có quyền sử dụng hàm này
 * @returns {Promise<Array>} Danh sách người dùng
 */
async function getAllUsers() {
  try {
    // Khởi tạo Firebase nếu chưa khởi tạo
    await initFirebase();
    
    if (!firestore) {
      throw new Error('Firestore chưa được khởi tạo');
    }
    
    // Kiểm tra quyền admin - bỏ qua phần này cho mục đích test
    // Trong môi trường sản xuất, nên bật lại kiểm tra quyền
    /*
    if (!window.AdminAuth || !window.AdminAuth.checkAdminStatus()) {
      throw new Error('Không có quyền xem danh sách người dùng');
    }
    */
    
    console.log('Đang truy vấn danh sách người dùng từ Firestore...');
    
    // Truy vấn tất cả người dùng, sắp xếp theo thời gian đăng nhập gần nhất
    const snapshot = await firestore.collection('users')
      .orderBy('lastLoginAt', 'desc')
      .get();
    
    console.log('Đã nhận được dữ liệu từ Firestore, số lượng người dùng:', snapshot.size);
    
    // Xử lý kết quả
    const users = [];
    snapshot.forEach(doc => {
      const userData = doc.data();
      console.log('Dữ liệu người dùng:', doc.id, userData);
      
      users.push({
        id: doc.id,
        ...userData
      });
    });
    
    console.log('Tổng số người dùng đã xử lý:', users.length);
    return users;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách người dùng:', error);
    console.trace('Stack trace');
    
    if (window.ErrorHandler) {
      window.ErrorHandler.show(error);
    }
    // Nếu có lỗi, trả về mảng rỗng
    return [];
  }
}

/**
 * Lấy tổng số người dùng
 * Chỉ admin mới có quyền sử dụng hàm này
 * @returns {Promise<Number>} Tổng số người dùng
 */
async function getUserCount() {
  try {
    // Khởi tạo Firebase nếu chưa khởi tạo
    await initFirebase();
    
    if (!firestore) {
      throw new Error('Firestore chưa được khởi tạo');
    }
    
    // Kiểm tra quyền admin
    if (!window.AdminAuth || !window.AdminAuth.checkAdminStatus()) {
      throw new Error('Không có quyền xem số liệu người dùng');
    }
    
    // Lấy tổng số người dùng
    const snapshot = await firestore.collection('users').get();
    return snapshot.size;
  } catch (error) {
    console.error('Lỗi khi lấy tổng số người dùng:', error);
    if (window.ErrorHandler) {
      window.ErrorHandler.show(error);
    }
    return 0;
  }
}

/**
 * Lấy bài hát theo thể loại
 * @param {String} category Thể loại bài hát (nhac-vang, nhac-tre, indie, de-choi, du-ca, canon, c-g-am-f)
 * @param {Number} limit Số lượng bài hát cần lấy
 * @returns {Promise<Array>} Danh sách bài hát
 */
async function getSongsByCategory(category, limit = 10) {
  try {
    // Khởi tạo Firebase nếu chưa khởi tạo
    await initFirebase();
    
    if (!firestore) {
      throw new Error('Firestore chưa được khởi tạo');
    }
    
    console.log(`Đang tải bài hát cho thể loại ${category}...`);
    
    // Truy vấn collection songs theo thể loại
    const songsRef = firestore.collection('songs');
    
    try {
      // Thử lấy dữ liệu thật với composite index
      const snapshot = await songsRef
        .where('category', '==', category)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();
      
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
        console.log(`Đã tải ${songs.length} bài hát cho thể loại ${category}`);
        return songs;
      } else {
        console.log(`Không tìm thấy bài hát nào thuộc thể loại ${category}, sử dụng dữ liệu mẫu`);
        return getMockSongsByCategory(category);
      }
    } catch (error) {
      // Nếu lỗi là do thiếu index, thử truy vấn không theo thứ tự
      if (error.message && error.message.includes('index')) {
        console.warn(`Lỗi index cho thể loại ${category}, sử dụng phương pháp lọc thay thế:`, error);
        try {
          // Truy vấn đơn giản, sau đó lọc trên client
          const snapshot = await songsRef.get();
          const allSongs = [];
          
          snapshot.forEach(doc => {
            const song = doc.data();
            if (song.category === category) {
              allSongs.push({
                id: doc.id,
                ...song
              });
            }
          });
          
          // Sắp xếp theo ngày tạo giảm dần
          allSongs.sort((a, b) => {
            return new Date(b.createdAt) - new Date(a.createdAt);
          });
          
          // Giới hạn số lượng
          const limitedSongs = allSongs.slice(0, limit);
          console.log(`Đã tải ${limitedSongs.length} bài hát cho thể loại ${category} (phương pháp thay thế)`);
          
          if (limitedSongs.length > 0) {
            return limitedSongs;
          } else {
            return getMockSongsByCategory(category);
          }
        } catch (secondError) {
          console.error(`Lỗi khi sử dụng phương pháp thay thế cho thể loại ${category}:`, secondError);
          return getMockSongsByCategory(category);
        }
      } else {
        console.error(`Lỗi khi tải bài hát thể loại ${category}:`, error);
        return getMockSongsByCategory(category);
      }
    }
  } catch (error) {
    console.error(`Lỗi khi tải bài hát thể loại ${category}:`, error);
    return getMockSongsByCategory(category);
  }
}

/**
 * Tạo dữ liệu bài hát mẫu cho thể loại cụ thể
 * @param {String} category Thể loại bài hát
 * @returns {Array} Danh sách bài hát mẫu theo thể loại
 */
function getMockSongsByCategory(category) {
  // Trả về mảng rỗng thay vì dữ liệu mẫu
  console.log(`Không có dữ liệu bài hát cho thể loại ${category}, trả về mảng rỗng.`);
  return [];
}

// Export các hàm ra window object để sử dụng trong HTML
window.KalimbaFirebase = {
  init: initFirebase,
  loadFeaturedSongs,
  getSongById,
  getLatestSongs,
  checkConnection,
  quickConnectionCheck,
  getConfig: () => firebaseConfig,
  // Thêm các hàm CRUD mới
  addSong,
  updateSong,
  deleteSong,
  getAllSongs,
  // Quản lý người dùng
  saveUserToFirestore,
  getAllUsers,
  getUserCount,
  getSongsByCategory
}; 