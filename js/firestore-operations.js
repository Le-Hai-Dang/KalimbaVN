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
 * @returns {Promise<Array>} Danh sách ID bài hát yêu thích
 */
async function loadUserFavorites() {
  try {
    console.log('Bắt đầu tải danh sách bài hát yêu thích...');
    
    // Khởi tạo Firestore nếu chưa khởi tạo
    if (typeof initFirestore === 'function' && !db) {
      await initFirestore();
    }
    
    // Kiểm tra xem người dùng đã đăng nhập qua Firebase Auth chưa
    const user = firebase.auth().currentUser;
    let userId = null;
    
    if (user) {
      userId = user.uid;
      console.log('Đã tìm thấy người dùng từ Firebase Auth:', userId);
    } else {
      // Kiểm tra từ localStorage
      const savedUser = localStorage.getItem('kalimbaUser');
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          userId = userData.id;
          console.log('Đã tìm thấy người dùng từ localStorage:', userId);
        } catch (e) {
          console.error('Không thể parse dữ liệu người dùng từ localStorage:', e);
        }
      }
      
      // Nếu không có userId, vẫn thử tải từ localStorage
      if (!userId) {
        console.log('Không có thông tin người dùng, thử tải từ localStorage');
        return loadFavoritesFromLocalStorage();
      }
    }
    
    // Nếu có ID người dùng, lấy danh sách bài hát yêu thích từ Firestore
    if (userId && db) {
      try {
    // Lấy danh sách bài hát yêu thích từ Firestore
        console.log('Đang tải yêu thích từ Firestore cho người dùng', userId);
        const snapshot = await db.collection('users').doc(userId).collection('favorites').get();
    
    // Cập nhật danh sách yêu thích
    userFavorites = [];
    snapshot.forEach(doc => {
      userFavorites.push(doc.id);
    });
    
        // Lưu danh sách yêu thích vào localStorage để dùng trong profile
        localStorage.setItem('kalimbaFavorites', JSON.stringify(userFavorites));
        
        console.log('Đã tải danh sách yêu thích từ Firestore:', userFavorites);
        return userFavorites;
      } catch (firestoreError) {
        console.error('Lỗi khi tải danh sách yêu thích từ Firestore:', firestoreError);
        
        // Khôi phục từ localStorage nếu có lỗi
        return loadFavoritesFromLocalStorage();
      }
    } else {
      console.warn('Không có ID người dùng hoặc Firestore chưa được khởi tạo');
      
      // Khôi phục từ localStorage nếu có
      return loadFavoritesFromLocalStorage();
    }
  } catch (error) {
    console.error('Lỗi khi tải danh sách yêu thích:', error);
    
    // Khôi phục từ localStorage nếu có lỗi
    return loadFavoritesFromLocalStorage();
  }
}

/**
 * Tải danh sách bài hát yêu thích từ localStorage
 * @returns {Array} Danh sách ID bài hát yêu thích
 */
function loadFavoritesFromLocalStorage() {
  try {
    const savedFavorites = localStorage.getItem('kalimbaFavorites');
    if (savedFavorites) {
      userFavorites = JSON.parse(savedFavorites);
      console.log('Đã khôi phục danh sách yêu thích từ localStorage:', userFavorites);
    } else {
      userFavorites = [];
      console.log('Không tìm thấy danh sách yêu thích trong localStorage, khởi tạo mảng rỗng');
    }
  } catch (e) {
    console.error('Không thể khôi phục danh sách yêu thích từ localStorage:', e);
    userFavorites = [];
  }
  
  return userFavorites;
}

/**
 * Lưu danh sách yêu thích vào localStorage
 */
function saveFavoritesToLocalStorage() {
  try {
    localStorage.setItem('kalimbaFavorites', JSON.stringify(userFavorites));
    console.log('Đã lưu danh sách yêu thích vào localStorage:', userFavorites);
  } catch (error) {
    console.error('Lỗi khi lưu danh sách yêu thích vào localStorage:', error);
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
        return []; // Trả về mảng rỗng thay vì mock data
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
          return []; // Trả về mảng rỗng thay vì mock data
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
      return []; // Trả về mảng rỗng thay vì mock data
    }
  } catch (error) {
    console.error('Lỗi khi tải danh sách bài hát:', error);
    return []; // Trả về mảng rỗng thay vì mock data
  }
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
    console.log(`Đang thực hiện thay đổi trạng thái yêu thích cho bài hát: ${songId}`);
    
    // Kiểm tra xem người dùng đã đăng nhập chưa
    const user = firebase.auth().currentUser;
    let userId = null;
    
    if (user) {
      userId = user.uid;
      console.log('Đã tìm thấy người dùng từ Firebase Auth:', userId);
    } else {
      // Kiểm tra từ localStorage
      const savedUser = localStorage.getItem('kalimbaUser');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        userId = userData.id;
        console.log('Đã tìm thấy người dùng từ localStorage:', userId);
      } else {
        if (window.firebaseUtils && window.firebaseUtils.showAlert) {
          window.firebaseUtils.showAlert('Vui lòng đăng nhập để sử dụng tính năng này', 'warning');
        }
        console.warn('Người dùng chưa đăng nhập, không thể thực hiện thao tác yêu thích');
        return null;
      }
    }
    
    // Khởi tạo Firestore nếu chưa khởi tạo
    await initFirestore();
    
    // Kiểm tra xem bài hát đã có trong yêu thích chưa
    const isFavorite = userFavorites.includes(songId);
    
    if (isFavorite) {
      console.log(`Bài hát ${songId} đã có trong yêu thích, tiến hành xóa`);
      // Xóa khỏi danh sách yêu thích
      const index = userFavorites.indexOf(songId);
      if (index !== -1) {
        userFavorites.splice(index, 1);
      }
      
      // Lưu thông tin vào localStorage để dùng trong profile
      saveFavoritesToLocalStorage();
      
      // Xóa khỏi Firestore nếu người dùng đã đăng nhập
      if (userId && db) {
        try {
          await db.collection('users').doc(userId).collection('favorites').doc(songId).delete();
          console.log(`Đã xóa bài hát ${songId} khỏi yêu thích trong Firestore`);
        } catch (error) {
          console.error(`Lỗi khi xóa bài hát ${songId} khỏi Firestore:`, error);
          // Vẫn trả về false vì đã xóa thành công khỏi localStorage
        }
      }
      
      return false;
    } else {
      console.log(`Bài hát ${songId} chưa có trong yêu thích, tiến hành thêm`);
      // Thêm vào yêu thích
      if (!userFavorites.includes(songId)) {
        userFavorites.push(songId);
      }
      
      // Lưu thông tin vào localStorage để dùng trong profile
      saveFavoritesToLocalStorage();
      
      // Thêm vào Firestore nếu người dùng đã đăng nhập
      if (userId && db) {
        try {
          // Lấy thông tin bài hát 
          const songDoc = await db.collection('songs').doc(songId).get();
          const songData = songDoc.exists ? songDoc.data() : {};
          
          // Thêm vào yêu thích với đầy đủ thông tin bài hát
          await db.collection('users').doc(userId).collection('favorites').doc(songId).set({
            addedAt: new Date().toISOString(),
            songId: songId,
            title: songData.title || 'Không có tiêu đề',
            artist: songData.artist || 'Không có nghệ sĩ',
            category: songData.category || 'unknown',
            thumbnail: songData.thumbnail || ''
          });
          
          console.log(`Đã thêm bài hát ${songId} vào yêu thích trong Firestore`);
        } catch (error) {
          console.error(`Lỗi khi thêm bài hát ${songId} vào Firestore:`, error);
          // Vẫn trả về true vì đã thêm thành công vào localStorage
        }
      }
      
      return true;
    }
  } catch (error) {
    console.error('Lỗi khi thay đổi trạng thái yêu thích:', error);
    return null;
  }
}

/**
 * Lấy chi tiết bài hát từ Firestore
 * @param {string} songId ID của bài hát cần lấy chi tiết
 * @returns {Promise<Object|null>} Thông tin chi tiết bài hát hoặc null nếu không tìm thấy
 */
async function getSongDetails(songId) {
  try {
    if (!songId) {
      console.error('ID bài hát không hợp lệ');
      return null;
    }

    // Khởi tạo Firestore nếu chưa khởi tạo
    await initFirestore();
    
    console.log(`Đang tải chi tiết bài hát ${songId}...`);
    
    // Lấy thông tin bài hát từ Firestore
    const songDoc = await db.collection('songs').doc(songId).get();
    
    if (!songDoc.exists) {
      console.error(`Không tìm thấy bài hát với ID ${songId}`);
      return null;
    }
    
    // Lấy dữ liệu bài hát
    const songData = songDoc.data() || {};
    
    // Debug: In dữ liệu bài hát
    console.log('Dữ liệu bài hát từ Firestore:', songData);
    console.log('Loại dữ liệu chordSheet:', typeof songData.chordSheet);
    
    // Xử lý chordSheet
    let parsedChordSheet = null;
    
    // Chỉ xử lý nếu chordSheet tồn tại
    if (songData.chordSheet) {
      // Nếu là chuỗi
      if (typeof songData.chordSheet === 'string') {
        // Kiểm tra xem có phải chuỗi JSON không
        if (songData.chordSheet.trim().startsWith('[') || songData.chordSheet.trim().startsWith('{')) {
          try {
            parsedChordSheet = JSON.parse(songData.chordSheet);
            console.log('Đã parse chordSheet từ JSON string thành object');
          } catch (parseError) {
            console.error('Lỗi khi parse chordSheet:', parseError);
            parsedChordSheet = songData.chordSheet; // Giữ nguyên chuỗi nếu parse lỗi
          }
        } else {
          // Nếu không phải JSON, giữ nguyên chuỗi
          parsedChordSheet = songData.chordSheet;
        }
      } else {
        // Nếu không phải chuỗi, sử dụng trực tiếp (có thể là object)
        parsedChordSheet = songData.chordSheet;
      }
    }
    
    // Trả về thông tin chi tiết bài hát
    return {
      id: songDoc.id,
      title: songData.title || 'Không có tiêu đề',
      artist: songData.artist || 'Không có nghệ sĩ',
      category: songData.category || 'unknown',
      tone: songData.tone || 'C',
      capo: songData.capo !== undefined ? songData.capo : 0,
      chordSheet: parsedChordSheet,
      notes: Array.isArray(songData.notes) ? songData.notes : [],
      lyrics: songData.lyrics || '',
      thumbnail: songData.thumbnail || '',
      createdAt: songData.createdAt || null,
      isFavorite: userFavorites.includes(songDoc.id),
      // Thêm các trường khác nếu có
    };
  } catch (error) {
    console.error('Lỗi khi tải chi tiết bài hát:', error);
    return null; // Trả về null thay vì throw error
  }
}

/**
 * Lưu bài hát vừa xem vào lịch sử xem gần đây
 * @param {string} songId ID của bài hát vừa xem
 * @returns {Promise<boolean>} True nếu lưu thành công, False nếu thất bại
 */
async function saveRecentView(songId) {
  try {
    // Kiểm tra xem người dùng đã đăng nhập chưa
    const user = firebase.auth().currentUser;
    if (!user) {
      return false; // Không lưu nếu chưa đăng nhập
    }
    
    // Khởi tạo Firestore nếu chưa khởi tạo
    await initFirestore();
    
    // Lưu thông tin bài hát vừa xem vào collection "recent_views"
    await db.collection('users').doc(user.uid).collection('recent_views').doc(songId).set({
      songId: songId,
      viewedAt: new Date().toISOString()
    });
    
    return true;
  } catch (error) {
    console.error('Lỗi khi lưu bài hát vừa xem:', error);
    return false;
  }
}

/**
 * Lấy danh sách bình luận của một bài hát
 * @param {string} songId ID của bài hát cần lấy bình luận
 * @returns {Promise<Array>} Danh sách bình luận
 */
async function getComments(songId) {
  try {
    // Khởi tạo Firestore nếu chưa khởi tạo
    await initFirestore();
    
    console.log(`Đang tải bình luận cho bài hát ${songId}...`);
    
    // Lấy danh sách bình luận từ Firestore
    const commentsSnapshot = await db.collection('songs').doc(songId)
      .collection('comments')
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();
    
    if (commentsSnapshot.empty) {
      return [];
    }
    
    // Xử lý kết quả
    const comments = [];
    
    // Lấy thông tin người dùng hiện tại từ localStorage để so sánh
    let currentUser = null;
    const savedUser = localStorage.getItem('kalimbaUser');
    if (savedUser) {
      try {
        currentUser = JSON.parse(savedUser);
      } catch (error) {
        console.error('Lỗi khi parse thông tin người dùng:', error);
      }
    }
    
    for (const doc of commentsSnapshot.docs) {
      const commentData = doc.data();
      
      // Sử dụng thông tin người dùng đã được lưu trong bình luận
      let userName = commentData.userName || 'Người dùng ẩn danh';
      let userAvatar = commentData.userAvatar || null;
      
      // Nếu bình luận thuộc về người dùng hiện tại, cập nhật tên và avatar từ localStorage
      if (currentUser && commentData.userId === currentUser.id) {
        userName = currentUser.name;
        userAvatar = currentUser.picture;
      }
      
      comments.push({
        id: doc.id,
        content: commentData.content || '',
        userId: commentData.userId || null,
        userName: userName,
        userAvatar: userAvatar,
        createdAt: commentData.createdAt || new Date().toISOString(),
        isCurrentUser: currentUser && commentData.userId === currentUser.id
      });
    }
    
    return comments;
  } catch (error) {
    console.error('Lỗi khi tải bình luận:', error);
    return [];
  }
}

/**
 * Thêm bình luận vào bài hát
 * @param {string} songId ID của bài hát cần thêm bình luận
 * @param {string} content Nội dung bình luận
 * @returns {Promise<boolean>} True nếu thêm thành công, False nếu thất bại
 */
async function addComment(songId, content) {
  try {
    // Kiểm tra xem người dùng đã đăng nhập chưa
    const user = firebase.auth().currentUser;
    
    // Nếu không có người dùng từ Firebase Auth, kiểm tra từ localStorage
    let userId = null;
    let userName = null;
    let userPhoto = null;
    
    if (user) {
      userId = user.uid;
      userName = user.displayName || 'Người dùng ẩn danh';
      userPhoto = user.photoURL;
      
      // Kiểm tra thêm từ localStorage để đảm bảo thông tin đầy đủ
      const savedUser = localStorage.getItem('kalimbaUser');
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          if (userData && userData.name) {
            userName = userData.name;
          }
          if (userData && userData.picture) {
            userPhoto = userData.picture;
          }
        } catch (error) {
          console.error('Lỗi khi parse thông tin người dùng từ localStorage:', error);
        }
      }
    } else {
      // Kiểm tra từ localStorage
      const savedUser = localStorage.getItem('kalimbaUser');
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          userId = userData.id;
          userName = userData.name || 'Người dùng ẩn danh';
          userPhoto = userData.picture;
        } catch (error) {
          console.error('Lỗi khi parse thông tin người dùng từ localStorage:', error);
          throw 'not-logged-in';
        }
      } else {
        throw 'not-logged-in';
      }
    }
    
    console.log('Thông tin người dùng bình luận:', { userId, userName, userPhoto });
    
    // Khởi tạo Firestore nếu chưa khởi tạo
    await initFirestore();
    
    // Thêm bình luận vào Firestore
    const commentRef = await db.collection('songs').doc(songId).collection('comments').add({
      content: content,
      userId: userId,
      userName: userName || 'Người dùng ẩn danh',
      userAvatar: userPhoto || null,
      createdAt: new Date().toISOString()
    });
    
    console.log('Đã thêm bình luận:', commentRef.id);
    return true;
  } catch (error) {
    console.error('Lỗi khi thêm bình luận:', error);
    throw error;
  }
}

/**
 * Lấy danh sách bài hát yêu thích của người dùng hiện tại
 * @returns {Promise<Array>} Danh sách bài hát yêu thích
 */
async function getFavoriteSongs() {
  try {
    // Kiểm tra xem người dùng đã đăng nhập chưa
    const user = firebase.auth().currentUser;
    let userId = null;
    
    if (user) {
      userId = user.uid;
    } else {
      // Kiểm tra từ localStorage
      const savedUser = localStorage.getItem('kalimbaUser');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        userId = userData.id;
      } else {
        return [];
      }
    }
    
    // Khởi tạo Firestore nếu chưa khởi tạo
    await initFirestore();
    
    // Lấy danh sách bài hát yêu thích từ Firestore
    const snapshot = await db.collection('users').doc(userId).collection('favorites')
      .orderBy('addedAt', 'desc')
      .get();
    
    if (snapshot.empty) {
      return [];
    }
    
    // Xử lý kết quả
    const songs = [];
    snapshot.forEach(doc => {
      const songData = doc.data();
      songs.push({
        id: doc.id,
        title: songData.title || 'Không có tiêu đề',
        artist: songData.artist || 'Không có nghệ sĩ',
        category: songData.category || 'unknown',
        thumbnail: songData.thumbnail || '',
        addedAt: songData.addedAt || new Date().toISOString()
      });
    });
    
    return songs;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách bài hát yêu thích:', error);
    return [];
  }
}

// Kiểm tra nếu đang ở môi trường Node.js
if (typeof module !== 'undefined' && module.exports) {
  // Export các hàm để sử dụng trong Node.js
  module.exports = {
    initFirestore,
    getUserByEmail,
    saveUserToFirestore,
    getUserDocumentById,
    getAllSongs,
    getSongsByCategory,
    getSongDetails,
    loadUserFavorites,
    checkFavoriteStatus,
    toggleFavoriteSong,
    saveFavoritesToLocalStorage,
    saveRecentView,
    getRecentViews,
    searchSongs,
    getFavoriteSongs,
    addComment,
    getComments
  };
} else {
  // Hiển thị các hàm như global cho client-side
window.firestoreOperations = {
  initFirestore,
    getUserByEmail,
    saveUserToFirestore,
    getUserDocumentById,
    getAllSongs,
  getSongsByCategory,
    getSongDetails,
    loadUserFavorites,
  checkFavoriteStatus,
    toggleFavoriteSong,
    saveFavoritesToLocalStorage,
    saveRecentView,
    getRecentViews,
    searchSongs,
    getFavoriteSongs,
    addComment,
    getComments
  };
  
  // Hàm kiểm tra xem Firestore đã được khởi tạo chưa
  window.isFirestoreInitialized = function() {
    return db !== null;
  };
} 