# Hướng dẫn khắc phục lỗi Firebase Authentication

Tài liệu này cung cấp hướng dẫn chi tiết để khắc phục lỗi "Khóa API không hợp lệ" khi sử dụng Firebase Authentication.

## 1. Chuẩn bị

### 1.1 Cấu hình Firebase Console

1. Truy cập [Firebase Console](https://console.firebase.google.com/)
2. Chọn dự án của bạn (hoặc tạo dự án mới nếu chưa có)
3. Đi đến **Project settings** (Cài đặt dự án)
4. Kiểm tra **Web configuration** (Cấu hình web)

### 1.2 Kiểm tra API key hiện tại

Mở file `js/firebase-constants.js` và kiểm tra giá trị `apiKey` trong đối tượng `FIREBASE_CONFIG`.

## 2. Khắc phục lỗi API Key

### 2.1 Cách 1: Cập nhật API Key

1. Từ Firebase Console, chọn **Project settings**
2. Chọn tab **General** (Chung)
3. Tìm mục **Web API Key** 
4. Sao chép giá trị API Key
5. Cập nhật giá trị này vào file `js/firebase-constants.js`

### 2.2 Cách 2: Sử dụng Server JS

Nếu bạn gặp lỗi về domain, sử dụng máy chủ Node.js đơn giản đã được cung cấp:

```bash
node server.js
```

Sau đó mở trình duyệt và truy cập: http://localhost:8080

### 2.3 Cách 3: Cấu hình Domain được phép

1. Trong Firebase Console, đi đến **Authentication**
2. Chọn tab **Sign-in method**
3. Cuộn xuống phần **Authorized domains**
4. Thêm tên miền của bạn (ví dụ: `localhost`, `127.0.0.1`, v.v.)

## 3. Sử dụng công cụ Debug

Ứng dụng này bao gồm công cụ Debug để giúp khắc phục sự cố:

1. Mở Console trình duyệt (F12)
2. Nhấn tổ hợp phím **Ctrl+Shift+F** (hoặc **Cmd+Shift+F** trên Mac) để mở bảng Debug
3. Sử dụng các nút chức năng để kiểm tra cấu hình và khởi động lại Firebase

## 4. Kiểm tra bằng Console

```javascript
// Kiểm tra cấu hình Firebase
window.firebaseDebug.checkConfig()

// Kiểm tra API key
window.firebaseDebug.testApiKey()

// Kiểm tra domain được phép
window.firebaseDebug.checkAllowedDomains()

// Khởi động lại Firebase
window.firebaseDebug.reinitializeFirebase()
```

## 5. Vấn đề thường gặp

### 5.1 "auth/api-key-not-valid"

**Nguyên nhân:** API key không đúng hoặc đã hết hạn.

**Giải pháp:** Cập nhật API key mới từ Firebase Console.

### 5.2 "auth/auth-domain-config-required"

**Nguyên nhân:** Domain không được thêm vào danh sách được phép.

**Giải pháp:** Thêm domain vào danh sách Authorized domains.

### 5.3 Lỗi Cross-Origin

**Nguyên nhân:** Chạy ứng dụng từ file:// URL hoặc domain không hợp lệ.

**Giải pháp:** Sử dụng máy chủ web (như server.js đã cung cấp).

## 6. Liên hệ hỗ trợ

Nếu bạn vẫn gặp vấn đề, vui lòng liên hệ:

- Email: support@kalimbachill.com
- GitHub: Tạo Issue tại [github.com/le-hai-dang/KalimbaVN](https://github.com/le-hai-dang/KalimbaVN)
