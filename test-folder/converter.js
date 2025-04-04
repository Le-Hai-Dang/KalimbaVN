// Chức năng chuyển đổi từ phân loại cũ sang mới
const oldToNewCategories = {
  'nhac-vang': 'nhac-bolero',
  'nhac-tre': 'nhac-viet',
  'indie': 'nhac-viet',
  'de-choi': 'de-choi', // giữ nguyên
  'du-ca': 'nhac-viet',
  'canon': 'de-choi',
  'c-g-am-f': 'de-choi'
};

// Tạo hàm chuyển đổi
function convertOldCategoriesToNew(song) {
  if (song && song.category && oldToNewCategories[song.category]) {
    console.log(`Chuyển đổi category từ ${song.category} sang ${oldToNewCategories[song.category]}`);
    song.category = oldToNewCategories[song.category];
  }
  return song;
}

console.log('Mã chuyển đổi phân loại đã sẵn sàng');
