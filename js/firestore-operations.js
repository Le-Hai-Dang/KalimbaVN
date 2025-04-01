// Xử lý các thao tác với Firestore

// Hàm truy cập Firestore
function db() {
  if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
    return firebase.firestore();
  }
  return null;
}

// Hàm truy cập Authentication
function auth() {
  if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
    return firebase.auth();
  }
  return null;
}

// Hàm truy cập Storage
function storage() {
  if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
    return firebase.storage();
  }
  return null;
}

// Lấy người dùng hiện tại
function getCurrentUser() {
  const authInstance = auth();
  if (!authInstance) {
    return Promise.resolve(null);
  }
  
  return new Promise((resolve, reject) => {
    const unsubscribe = authInstance.onAuthStateChanged(user => {
      unsubscribe();
      resolve(user);
    }, reject);
  });
}

// Lưu dữ liệu vào Firestore
async function saveToFirestore(collection, document, data) {
  const dbInstance = db();
  if (!dbInstance) {
    throw new Error("Firebase Firestore không được khởi tạo");
  }
  
  try {
    if (document) {
      await dbInstance.collection(collection).doc(document).set(data, { merge: true });
      return document;
    } else {
      const docRef = await dbInstance.collection(collection).add(data);
      return docRef.id;
    }
  } catch (error) {
    console.error("Lỗi lưu dữ liệu:", error);
    throw error;
  }
}

// Lấy dữ liệu từ Firestore
async function getFromFirestore(collection, document) {
  const dbInstance = db();
  if (!dbInstance) {
    throw new Error("Firebase Firestore không được khởi tạo");
  }
  
  try {
    const doc = await dbInstance.collection(collection).doc(document).get();
    if (doc.exists) {
      return doc.data();
    }
    return null;
  } catch (error) {
    console.error("Lỗi lấy dữ liệu:", error);
    throw error;
  }
}

// Lấy tất cả dữ liệu từ một collection
async function getAllFromCollection(collection, queryConstraints = []) {
  const dbInstance = db();
  if (!dbInstance) {
    throw new Error("Firebase Firestore không được khởi tạo");
  }
  
  try {
    let query = dbInstance.collection(collection);
    
    // Áp dụng các ràng buộc truy vấn nếu có
    queryConstraints.forEach(constraint => {
      const [field, operator, value] = constraint;
      query = query.where(field, operator, value);
    });
    
    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Lỗi lấy dữ liệu từ collection:", error);
    throw error;
  }
}

// Tải lên tệp lên storage
async function uploadFile(file, path) {
  const storageInstance = storage();
  if (!storageInstance) {
    throw new Error("Firebase Storage không được khởi tạo");
  }
  
  try {
    const storageRef = storageInstance.ref();
    const fileRef = storageRef.child(path);
    await fileRef.put(file);
    return await fileRef.getDownloadURL();
  } catch (error) {
    console.error("Lỗi tải tệp lên:", error);
    throw error;
  }
}

// Lấy danh sách bài hát theo danh mục
async function getSongsByCategory(categoryId) {
  try {
    const songs = await getAllFromCollection('songs', [
      ['categoryId', '==', categoryId]
    ]);
    return songs;
  } catch (error) {
    console.error(`Lỗi khi lấy bài hát theo danh mục ${categoryId}:`, error);
    return [];
  }
}

// Lấy chi tiết bài hát
async function getSongDetails(songId) {
  try {
    const song = await getFromFirestore('songs', songId);
    if (song) {
      // Cập nhật lượt xem
      await incrementViewCount(songId);
    }
    return song;
  } catch (error) {
    console.error(`Lỗi khi lấy chi tiết bài hát ${songId}:`, error);
    return null;
  }
}

// Cập nhật lượt xem bài hát
async function incrementViewCount(songId) {
  try {
    const song = await getFromFirestore('songs', songId);
    if (song) {
      const views = (song.views || 0) + 1;
      await saveToFirestore('songs', songId, { views });
    }
  } catch (error) {
    console.error(`Lỗi khi cập nhật lượt xem bài hát ${songId}:`, error);
  }
}

// Kiểm tra xem người dùng đã yêu thích bài hát chưa
async function checkFavoriteStatus(songId) {
  const user = await getCurrentUser();
  if (!user) return false;

  try {
    const favorites = await getFromFirestore('favorites', user.uid);
    return favorites && favorites.songs && favorites.songs.includes(songId);
  } catch (error) {
    console.error(`Lỗi khi kiểm tra trạng thái yêu thích bài hát ${songId}:`, error);
    return false;
  }
}

// Thêm hoặc xóa bài hát yêu thích
async function toggleFavoriteSong(songId) {
  const user = await getCurrentUser();
  if (!user) {
    alert('Vui lòng đăng nhập để sử dụng tính năng này.');
    return false;
  }

  try {
    const dbInstance = db();
    const docRef = dbInstance.collection('favorites').doc(user.uid);
    const doc = await docRef.get();
    
    if (doc.exists) {
      const data = doc.data();
      const songs = data.songs || [];
      const index = songs.indexOf(songId);
      
      if (index >= 0) {
        // Xóa khỏi danh sách yêu thích
        songs.splice(index, 1);
        await docRef.update({ songs });
        return false; // Đã xóa khỏi yêu thích
      } else {
        // Thêm vào danh sách yêu thích
        songs.push(songId);
        await docRef.update({ songs });
        return true; // Đã thêm vào yêu thích
      }
    } else {
      // Tạo mới document favorites
      await docRef.set({
        userId: user.uid,
        songs: [songId],
        updatedAt: new Date().toISOString()
      });
      return true; // Đã thêm vào yêu thích
    }
  } catch (error) {
    console.error(`Lỗi khi thay đổi trạng thái yêu thích bài hát ${songId}:`, error);
    alert('Đã xảy ra lỗi khi cập nhật trạng thái yêu thích.');
    return null;
  }
}

// Lấy danh sách bài hát yêu thích của người dùng
async function getFavoriteSongs() {
  const user = await getCurrentUser();
  if (!user) return [];

  try {
    const favorites = await getFromFirestore('favorites', user.uid);
    if (!favorites || !favorites.songs || !favorites.songs.length) {
      return [];
    }

    // Lấy thông tin chi tiết của mỗi bài hát yêu thích
    const songIds = favorites.songs;
    const songs = [];
    
    for (const songId of songIds) {
      const song = await getFromFirestore('songs', songId);
      if (song) {
        songs.push({
          id: songId,
          ...song
        });
      }
    }
    
    return songs;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách bài hát yêu thích:', error);
    return [];
  }
}

// Gửi phản hồi (feedback)
async function submitFeedback(feedbackData) {
  try {
    const user = await getCurrentUser();
    const data = {
      ...feedbackData,
      userId: user ? user.uid : null,
      userEmail: user ? user.email : null,
      createdAt: new Date().toISOString(),
      status: 'new'
    };
    
    const feedbackId = await saveToFirestore('feedback', null, data);
    return feedbackId;
  } catch (error) {
    console.error('Lỗi khi gửi phản hồi:', error);
    throw error;
  }
}

// Lấy danh sách danh mục
async function getCategories() {
  try {
    const categories = await getAllFromCollection('categories');
    return categories;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách danh mục:', error);
    return [];
  }
}

// Lưu lượt xem gần đây
async function saveRecentView(songId) {
  const user = await getCurrentUser();
  if (!user) return;

  try {
    const dbInstance = db();
    const docRef = dbInstance.collection('recentViews').doc(user.uid);
    const timestamp = new Date().toISOString();
    
    const doc = await docRef.get();
    if (doc.exists) {
      const data = doc.data();
      let recentSongs = data.songs || [];
      
      // Xóa bài hát này nếu đã tồn tại trong danh sách
      recentSongs = recentSongs.filter(item => item.songId !== songId);
      
      // Thêm bài hát vào đầu danh sách
      recentSongs.unshift({
        songId,
        viewedAt: timestamp
      });
      
      // Giới hạn danh sách chỉ giữ 20 bài hát gần nhất
      if (recentSongs.length > 20) {
        recentSongs = recentSongs.slice(0, 20);
      }
      
      await docRef.update({
        songs: recentSongs,
        updatedAt: timestamp
      });
    } else {
      // Tạo mới nếu chưa có
      await docRef.set({
        userId: user.uid,
        songs: [{ songId, viewedAt: timestamp }],
        updatedAt: timestamp
      });
    }
  } catch (error) {
    console.error(`Lỗi khi lưu lượt xem gần đây cho bài hát ${songId}:`, error);
  }
}

// Lấy danh sách bài hát xem gần đây
async function getRecentSongs() {
  const user = await getCurrentUser();
  if (!user) return [];

  try {
    const recentViews = await getFromFirestore('recentViews', user.uid);
    if (!recentViews || !recentViews.songs || !recentViews.songs.length) {
      return [];
    }

    // Lấy thông tin chi tiết của mỗi bài hát gần đây
    const songItems = recentViews.songs;
    const songs = [];
    
    for (const item of songItems) {
      const song = await getFromFirestore('songs', item.songId);
      if (song) {
        songs.push({
          id: item.songId,
          viewedAt: item.viewedAt,
          ...song
        });
      }
    }
    
    return songs;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách bài hát xem gần đây:', error);
    return [];
  }
}

// Xuất các hàm để có thể sử dụng từ bên ngoài
window.firestoreOperations = {
  getSongsByCategory,
  getSongDetails,
  checkFavoriteStatus,
  toggleFavoriteSong,
  saveRecentView,
  getFavoriteSongs,
  getCategories,
  getRecentSongs,
  submitFeedback,
  uploadFile
}; 