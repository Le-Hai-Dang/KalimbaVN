/**
 * File xử lý các thao tác với Firestore
 * Tất cả các hoạt động liên quan đến Firestore nên được tập trung vào file này
 */

// Biến toàn cục cho đối tượng Firestore
let db = null;

// Danh sách bài hát yêu thích của người dùng hiện tại
let userFavorites = [];

// Danh sách ánh xạ tên danh mục
const categoryNames = {
  'nhac-vang': 'Nhạc Vàng Tuyển Chọn',
  'nhac-tre': 'Nhạc Trẻ',
  'indie': 'Indie Việt',
  'de-choi': 'Người Mới Tập Chơi',
  'du-ca': 'Du Ca',
  'canon': 'Vòng Canon',
  'c-g-am-f': 'Vòng Hợp Âm C-G-Am-F'
};

/**
 * Khởi tạo kết nối Firestore
 * @returns {Promise<void>}
 */
async function initFirestore() {
  if (db) return; // Đã khởi tạo rồi
  
  try {
    // Khởi tạo Firebase nếu chưa khởi tạo
    if (!firebase.apps.length) {
      if (window.getFirebaseConfig) {
        const config = window.getFirebaseConfig();
        firebase.initializeApp(config);
      } else {
        throw new Error('Không tìm thấy cấu hình Firebase');
      }
    }
    
    // Lấy đối tượng Firestore
    db = firebase.firestore();
    console.log('Firestore đã được khởi tạo');
    
    // Tải danh sách bài hát yêu thích của người dùng hiện tại
    await loadUserFavorites();
  } catch (error) {
    console.error('Lỗi khi khởi tạo Firestore:', error);
    throw error;
  }
}

/**
 * Tải danh sách bài hát yêu thích của người dùng hiện tại
 * @returns {Promise<void>}
 */
async function loadUserFavorites() {
  try {
    // Kiểm tra xem người dùng đã đăng nhập chưa
    const user = firebase.auth().currentUser;
    if (!user) {
      userFavorites = [];
      return;
    }
    
    // Lấy danh sách bài hát yêu thích từ Firestore
    const snapshot = await db.collection('users').doc(user.uid).collection('favorites').get();
    
    // Cập nhật danh sách yêu thích
    userFavorites = [];
    snapshot.forEach(doc => {
      userFavorites.push(doc.id);
    });
    
    console.log('Đã tải danh sách yêu thích:', userFavorites);
  } catch (error) {
    console.error('Lỗi khi tải danh sách yêu thích:', error);
    userFavorites = [];
  }
}

/**
 * Lấy danh sách bài hát theo thể loại
 * @param {string} categoryId ID của thể loại cần lấy (nhac-vang, nhac-tre, indie, de-choi, du-ca, canon, c-g-am-f)
 * @param {number} limit Số lượng bài hát tối đa cần lấy
 * @returns {Promise<Array>} Danh sách bài hát
 */
async function getSongsByCategory(categoryId, limit = 20) {
  try {
    // Khởi tạo Firestore nếu chưa khởi tạo
    await initFirestore();
    
    console.log(`Đang tải danh sách bài hát cho thể loại ${categoryId}...`);
    
    // Lấy tên danh mục từ ID
    const categoryName = categoryNames[categoryId] || 'Danh sách bài hát';
    
    // Truy vấn danh sách bài hát từ Firestore
    let query = db.collection('songs').where('category', '==', categoryId);
    
    try {
      // Thử lấy danh sách bài hát có sẵp xếp
      const snapshot = await query.orderBy('createdAt', 'desc').limit(limit).get();
      
      // Kiểm tra kết quả
      if (snapshot.empty) {
        console.log(`Không tìm thấy bài hát nào thuộc thể loại ${categoryId}`);
        return getMockSongsByCategory(categoryId);
      }
      
      // Xử lý kết quả
      const songs = [];
      snapshot.forEach(doc => {
        const songData = doc.data();
        songs.push({
          id: doc.id,
          title: songData.title || 'Không có tiêu đề',
          artist: songData.artist || 'Không có nghệ sĩ',
          category: categoryId,
          categoryName: categoryName,
          preview: songData.notes ? songData.notes[0] : null,
          isFavorite: userFavorites.includes(doc.id)
        });
      });
      
      console.log(`Đã tải ${songs.length} bài hát cho thể loại ${categoryId}`);
      return songs;
    } catch (error) {
      // Nếu lỗi do thiếu composite index
      if (error.message && error.message.includes('index')) {
        console.warn('Lỗi index, thử phương pháp thay thế');
        
        // Thử lại với phương pháp đơn giản hơn (không orderBy)
        const snapshot = await query.limit(limit).get();
        
        if (snapshot.empty) {
          return getMockSongsByCategory(categoryId);
        }
        
        // Xử lý kết quả
        const songs = [];
        snapshot.forEach(doc => {
          const songData = doc.data();
          songs.push({
            id: doc.id,
            title: songData.title || 'Không có tiêu đề',
            artist: songData.artist || 'Không có nghệ sĩ',
            category: categoryId,
            categoryName: categoryName,
            preview: songData.notes ? songData.notes[0] : null,
            isFavorite: userFavorites.includes(doc.id)
          });
        });
        
        console.log(`Đã tải ${songs.length} bài hát cho thể loại ${categoryId} (phương pháp thay thế)`);
        return songs;
      }
      
      // Lỗi khác
      console.error('Lỗi khi tải danh sách bài hát:', error);
      return getMockSongsByCategory(categoryId);
    }
  } catch (error) {
    console.error('Lỗi khi tải danh sách bài hát:', error);
    return getMockSongsByCategory(categoryId);
  }
}

/**
 * Trả về danh sách bài hát mẫu khi không thể tải từ Firestore
 * @param {string} categoryId ID của thể loại
 * @returns {Array} Danh sách bài hát mẫu
 */
function getMockSongsByCategory(categoryId) {
  const categoryName = categoryNames[categoryId] || 'Danh sách bài hát';
  
  // Các bài hát mẫu cho mỗi thể loại
  const mockSongs = {
    'nhac-vang': [
      { id: 'mock-nv-1', title: 'Dấu Tình Sầu', artist: 'Quang Lê', preview: '1 3 5 5 4 3 1' },
      { id: 'mock-nv-2', title: 'Mưa Nửa Đêm', artist: 'Trường Vũ', preview: '5 5 6 5 3 2 1' },
      { id: 'mock-nv-3', title: 'Nối Lại Tình Xưa', artist: 'Như Quỳnh', preview: '1 2 3 2 1 6 5' }
    ],
    'nhac-tre': [
      { id: 'mock-nt-1', title: 'Nơi Này Có Anh', artist: 'Sơn Tùng MTP', preview: '3 5 6 5 3 5 6' },
      { id: 'mock-nt-2', title: 'Có Chàng Trai Viết Lên Cây', artist: 'Phan Mạnh Quỳnh', preview: '1 1 5 6 5 3 2' }
    ],
    'indie': [
      { id: 'mock-in-1', title: 'Từng Là Của Nhau', artist: 'Bùi Anh Tuấn', preview: '5 3 2 1 2 3 5 6' },
      { id: 'mock-in-2', title: 'Thích Quá Rùi Nà', artist: 'CARA', preview: '1 2 3 5 6 5 3 2' }
    ],
    'de-choi': [
      { id: 'mock-dc-1', title: 'Happy Birthday', artist: 'Traditional', preview: '1 1 2 1 4 3' },
      { id: 'mock-dc-2', title: 'Twinkle Little Star', artist: 'Traditional', preview: '1 1 5 5 6 6 5' }
    ],
    'du-ca': [
      { id: 'mock-duc-1', title: 'Cát Bụi', artist: 'Trịnh Công Sơn', preview: '3 3 5 6 5 3 2 1' },
      { id: 'mock-duc-2', title: 'Diễm Xưa', artist: 'Trịnh Công Sơn', preview: '5 3 2 3 5 6 5 3' }
    ],
    'canon': [
      { id: 'mock-ca-1', title: 'Canon in D', artist: 'Pachelbel', preview: '5 3 4 1 5 3 4 1' },
      { id: 'mock-ca-2', title: 'Cannon Rock', artist: 'JerryC', preview: '5 3 4 1 5 3 4 1' }
    ],
    'c-g-am-f': [
      { id: 'mock-cgamf-1', title: 'Let It Be', artist: 'The Beatles', preview: 'C G Am F' },
      { id: 'mock-cgamf-2', title: 'No Woman No Cry', artist: 'Bob Marley', preview: 'C G Am F' }
    ]
  };
  
  // Nếu có mockSongs cho thể loại này, trả về danh sách tương ứng
  if (mockSongs[categoryId]) {
    return mockSongs[categoryId].map(song => ({
      ...song,
      category: categoryId,
      categoryName: categoryName,
      isFavorite: false
    }));
  }
  
  // Trường hợp không có mockSongs cho thể loại, trả về danh sách mặc định
  return [
    {
      id: 'mock-default-1',
      title: 'Bài hát mẫu 1',
      artist: 'Ca sĩ không rõ',
      category: categoryId,
      categoryName: categoryName,
      preview: '1 2 3 4 5 6 7',
      isFavorite: false
    },
    {
      id: 'mock-default-2',
      title: 'Bài hát mẫu 2',
      artist: 'Ca sĩ không rõ',
      category: categoryId,
      categoryName: categoryName,
      preview: '7 6 5 4 3 2 1',
      isFavorite: false
    }
  ];
}

/**
 * Kiểm tra xem một bài hát có trong danh sách yêu thích không
 * @param {string} songId ID của bài hát cần kiểm tra
 * @returns {Promise<boolean>} True nếu bài hát đã trong yêu thích, False nếu chưa
 */
async function checkFavoriteStatus(songId) {
  try {
    // Kiểm tra từ cache
    if (userFavorites.includes(songId)) {
      return true;
    }
    
    // Kiểm tra từ Firestore nếu người dùng đã đăng nhập
    const user = firebase.auth().currentUser;
    if (!user) {
      return false;
    }
    
    // Khởi tạo Firestore nếu chưa khởi tạo
    await initFirestore();
    
    // Kiểm tra từ Firestore
    const docRef = await db.collection('users').doc(user.uid).collection('favorites').doc(songId).get();
    return docRef.exists;
  } catch (error) {
    console.error('Lỗi khi kiểm tra trạng thái yêu thích:', error);
    return false;
  }
}

/**
 * Thêm hoặc xóa bài hát khỏi danh sách yêu thích
 * @param {string} songId ID của bài hát cần thêm/xóa
 * @returns {Promise<boolean>} True nếu đã thêm, False nếu đã xóa, null nếu có lỗi
 */
async function toggleFavoriteSong(songId) {
  try {
    // Kiểm tra xem người dùng đã đăng nhập chưa
    const user = firebase.auth().currentUser;
    if (!user) {
      if (window.firebaseUtils && window.firebaseUtils.showAlert) {
        window.firebaseUtils.showAlert('Vui lòng đăng nhập để sử dụng tính năng này', 'warning');
      }
      return null;
    }
    
    // Khởi tạo Firestore nếu chưa khởi tạo
    await initFirestore();
    
    // Kiểm tra xem bài hát đã có trong yêu thích chưa
    const docRef = db.collection('users').doc(user.uid).collection('favorites').doc(songId);
    const doc = await docRef.get();
    
    if (doc.exists) {
      // Xóa khỏi yêu thích
      await docRef.delete();
      
      // Cập nhật cache
      const index = userFavorites.indexOf(songId);
      if (index !== -1) {
        userFavorites.splice(index, 1);
      }
      
      return false;
    } else {
      // Thêm vào yêu thích
      await docRef.set({
        addedAt: new Date().toISOString()
      });
      
      // Cập nhật cache
      if (!userFavorites.includes(songId)) {
        userFavorites.push(songId);
      }
      
      return true;
    }
  } catch (error) {
    console.error('Lỗi khi thay đổi trạng thái yêu thích:', error);
    return null;
  }
}

// Export các hàm ra window object để sử dụng
window.firestoreOperations = {
  initFirestore,
  getSongsByCategory,
  checkFavoriteStatus,
  toggleFavoriteSong
}; 