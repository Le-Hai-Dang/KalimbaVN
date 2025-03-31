// Xử lý các thao tác với Firestore
import { 
  db, 
  saveToFirestore, 
  getFromFirestore, 
  getAllFromCollection,
  getCurrentUser
} from './firebase-config.js';

// Lấy danh sách bài hát theo danh mục
export async function getSongsByCategory(categoryId) {
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
export async function getSongDetails(songId) {
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
export async function checkFavoriteStatus(songId) {
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
export async function toggleFavoriteSong(songId) {
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
export async function getFavoriteSongs() {
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
export async function submitFeedback(feedbackData) {
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
export async function getCategories() {
  try {
    const categories = await getAllFromCollection('categories');
    return categories;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách danh mục:', error);
    return [];
  }
}

// Lưu lượt xem gần đây
export async function saveRecentView(songId) {
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
export async function getRecentSongs() {
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