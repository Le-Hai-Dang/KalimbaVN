# Kalimba Chill - Website Hợp Âm và Tab Nhạc Đàn Kalimba

Kalimba Chill là website hiển thị các bài hát với hợp âm và tab nhạc dành cho đàn Kalimba, được thiết kế theo phong cách Apple với giao diện thân thiện trên thiết bị di động, máy tính bảng và máy tính để bàn.

## Tính năng

- Hiển thị danh sách các danh mục bài hát
- Hiển thị danh sách bài hát trong từng danh mục
- Hiển thị chi tiết bài hát với hợp âm chuẩn
- Hiển thị tab nhạc đàn Kalimba
- Chức năng chuyển tone (tăng/giảm/chỉ định tone)
- Yêu thích bài hát
- Tìm kiếm bài hát
- Tìm theo hợp âm
- Tra cứu hợp âm
- Giao diện responsive (mobile, tablet, desktop)
- Slider hình ảnh trên màn hình lớn
- Thanh tìm kiếm nổi bật giữa trang web (desktop/tablet)
- Menu đầy đủ trên máy tính bảng và máy tính để bàn

## Cấu trúc thư mục

```
Kalimba Chill/
├── index.html          # Trang chủ
├── songs.html          # Trang danh sách bài hát
├── song-detail.html    # Trang chi tiết bài hát
├── css/
│   └── style.css       # File CSS
├── js/
│   └── script.js       # JavaScript
└── images/             # Thư mục chứa hình ảnh
    ├── slider1.jpg     # Hình ảnh slider 1
    ├── slider2.jpg     # Hình ảnh slider 2
    ├── slider3.jpg     # Hình ảnh slider 3
    ├── slider4.jpg     # Hình ảnh slider 4
    ├── slider5.jpg     # Hình ảnh slider 5
    ├── song1.jpg       # Hình ảnh bài hát 1
    ├── song2.jpg       # Hình ảnh bài hát 2
    ├── song3.jpg       # Hình ảnh bài hát 3
    └── song4.jpg       # Hình ảnh bài hát 4
```

## Hướng dẫn sử dụng

1. Mở file `index.html` để truy cập trang chủ
2. Nhấp vào danh mục bài hát để xem danh sách các bài hát
3. Nhấp vào bài hát để xem chi tiết với hợp âm và tab
4. Sử dụng các nút chuyển tone để thay đổi tone bài hát
5. Nhấp vào tab "Tab Kalimba" để xem tab nhạc cho đàn Kalimba
6. Nhấp vào tab "Lời Bài Hát" để xem lời bài hát không có hợp âm

### Giao diện Mobile
- Menu được thu gọn vào nút burger
- Điều hướng tab ngang
- Bố cục được tối ưu cho kích thước màn hình nhỏ

### Giao diện Tablet và Desktop
- Menu được hiển thị đầy đủ ở đầu trang
- Thanh tìm kiếm lớn ở giữa trang
- Slider hình ảnh với 5 slide tự động chuyển
- Bố cục dạng lưới cho danh mục và bài hát nổi bật
- Footer đầy đủ với thông tin liên hệ và liên kết

## Công nghệ sử dụng

- HTML5
- CSS3 (Flexbox, Grid, CSS Variables)
- JavaScript (ES6+)
- Responsive Design
- Font Awesome Icons

## Hướng dẫn phát triển

### Thêm bài hát mới

Để thêm bài hát mới, hãy thêm một mục mới vào danh sách `<ul class="songs">` trong file `songs.html`:

```html
<li class="song-item">
    <div class="song-info">
        <div class="song-title">Tên bài hát</div>
        <div class="song-artist">Tên nghệ sĩ</div>
        <div class="song-chord">Preview hợp âm</div>
    </div>
    <button class="favorite-btn">
        <i class="far fa-star"></i>
    </button>
</li>
```

### Thêm danh mục mới

Để thêm danh mục mới, hãy thêm một mục mới vào danh sách `<div class="categories">` trong file `index.html`:

```html
<div class="category-item">
    <div class="category-image" style="background-color: #color-code;">
        <h2>Tên danh mục</h2>
    </div>
    <div class="category-title">Tên danh mục</div>
</div>
```

### Thêm slide mới

Để thêm slide mới vào slider, hãy thêm một mục mới vào danh sách `<div class="slider-wrapper">` trong file `index.html` và thêm một dot tương ứng:

```html
<!-- Thêm slide -->
<div class="slide">
    <img src="images/slider6.jpg" alt="Mô tả slide">
    <div class="slide-content">
        <h3>Tiêu đề slide</h3>
        <p>Mô tả ngắn cho slide</p>
    </div>
</div>

<!-- Thêm dot tương ứng -->
<span class="dot" data-index="5"></span>
```

## Tác giả

- [Tên tác giả]

## Giấy phép

Bản quyền © 2023 Kalimba Chill 