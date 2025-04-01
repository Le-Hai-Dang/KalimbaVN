# Trang Quản Trị Kalimba Chill

Trang quản trị cho phép người dùng có quyền admin thực hiện các thao tác quản lý bài hát, bao gồm thêm, sửa, xoá bài hát.

## Quyền Admin

Hiện tại, chỉ có 2 tài khoản email được cấp quyền admin:
- danghaile2003@gmail.com
- tranminhchau1904@gmail.com

## Tối ưu hiệu suất

Trang quản trị đã được tối ưu để tránh tình trạng chớp nháy và cải thiện trải nghiệm người dùng:

1. **Kiểm soát tải dữ liệu**: Sử dụng cơ chế throttling để tránh việc tải dữ liệu quá thường xuyên, chỉ tải lại sau ít nhất 5 giây kể từ lần tải trước.

2. **Kiểm soát thao tác DOM**: Giảm tần suất các tác vụ kiểm tra lỗi và xử lý giao diện để giảm thiểu việc thao tác DOM quá nhiều lần.

3. **Quản lý kết nối Firebase**: Cải thiện cách kiểm tra kết nối với Firebase, tránh việc thực hiện các truy vấn kiểm tra không cần thiết.

4. **Xử lý lỗi thông minh**: Hiển thị thông báo lỗi trong một khoảng thời gian hợp lý và tự động ẩn đi.

## Triển khai quy tắc bảo mật

Để triển khai quy tắc bảo mật lên Firebase, hãy thực hiện các bước sau:

1. Cài đặt Firebase CLI (nếu chưa có):
   ```
   npm install -g firebase-tools
   ```

2. Đăng nhập vào Firebase:
   ```
   firebase login
   ```

3. Khởi tạo dự án Firebase (nếu chưa có):
   ```
   firebase init
   ```

4. Triển khai quy tắc bảo mật:
   ```
   firebase deploy --only firestore:rules
   ```

## Cấu trúc dữ liệu bài hát

Mỗi bài hát có cấu trúc dữ liệu như sau:

```javascript
{
  id: "automatically_generated", // Tự động tạo bởi Firestore
  title: "Tên bài hát",
  artist: "Tên nghệ sĩ",
  thumbnail: "URL hình ảnh bài hát",
  category: "nhac-vang", // Thể loại bài hát (nhac-vang, nhac-tre, indie, de-choi, du-ca, canon, c-g-am-f)
  featured: true, // true nếu là bài hát nổi bật, false nếu không
  notes: [
    "6 6 1 4 2 1 4", // Dòng 1: các nốt nhạc
    "5 4 5 6 4 4 5 5 2 1", // Dòng 2: các nốt nhạc
    // ...
  ],
  lyrics: [
    "Em mặc áo mới đi chúc tết họ hàng", // Lời cho dòng 1
    "Em chúc ông bà sống lâu thật lâu", // Lời cho dòng 2
    // ...
  ],
  videoLink: "https://www.tiktok.com/@user/video/12345", // Link video demo (tuỳ chọn)
  createdAt: "2023-06-01T12:00:00.000Z", // Thời gian tạo
  updatedAt: "2023-06-01T12:00:00.000Z"  // Thời gian cập nhật
}
```

## Hướng dẫn sử dụng

### Đăng nhập

1. Truy cập trang chủ của Kalimba Chill
2. Đăng nhập bằng một trong các tài khoản admin đã được cấp quyền
3. Sau khi đăng nhập, menu người dùng sẽ hiển thị thêm mục "Quản trị viên"
4. Nhấp vào mục "Quản trị viên" để truy cập trang quản trị

### Quản lý bài hát

#### Xem danh sách bài hát
- Trang quản trị mặc định hiển thị danh sách tất cả bài hát
- Có thể tìm kiếm bài hát theo tên hoặc thể loại
- Có thể lọc để hiển thị bài hát theo nhiều tiêu chí: bài hát nổi bật, mới nhất, hoặc theo thể loại

#### Thêm bài hát mới
1. Nhấp vào nút "Thêm bài hát mới"
2. Điền đầy đủ thông tin vào form:
   - Tên bài hát (bắt buộc)
   - Phân loại/Thể loại (bắt buộc) - chọn từ danh sách có sẵn
   - Đánh dấu nổi bật nếu muốn
   - Nhập từng dòng lời và hợp âm tương ứng:
     - Mỗi dòng lời có thể để trống nếu không có
     - Hợp âm cho mỗi dòng bắt buộc nhập
     - Có thể thêm nhiều dòng bằng nút "Thêm dòng"
   - Link video demo (tuỳ chọn) - có thể nhập link video TikTok
3. Xem trước hiển thị các dòng lời và hợp âm xen kẽ nhau tại phần cuối form
4. Nhấp "Lưu bài hát" để hoàn tất

#### Chỉnh sửa bài hát
1. Tìm bài hát cần chỉnh sửa trong danh sách
2. Nhấp vào biểu tượng bút (chỉnh sửa)
3. Chỉnh sửa thông tin trong form
4. Nhấp "Lưu bài hát" để hoàn tất

#### Xoá bài hát
1. Tìm bài hát cần xoá trong danh sách
2. Nhấp vào biểu tượng thùng rác (xoá)
3. Xác nhận việc xoá trong hộp thoại hiện ra

## Xử lý sự cố

Nếu gặp tình trạng chớp nháy hoặc hiệu suất kém:

1. **Làm mới trang**: Đôi khi chỉ cần làm mới trang (F5) để đặt lại tất cả các biến và interval.

2. **Sử dụng nút "Khởi động lại Firebase"**: Nút này nằm ở góc dưới bên phải màn hình, giúp tải lại toàn bộ kết nối với Firebase.

3. **Sử dụng công cụ Debug Firebase**: Nhấp vào nút "Debug Firebase" để mở công cụ debug, kiểm tra kết nối và xóa cache nếu cần.

4. **Xóa cache trình duyệt**: Xóa cache trình duyệt có thể giúp giải quyết một số vấn đề liên quan đến hiệu suất.

## Lưu ý

- Mọi thay đổi đều được áp dụng ngay lập tức vào cơ sở dữ liệu
- Hành động xoá không thể hoàn tác, hãy cẩn thận khi xoá bài hát
- Cần đảm bảo nhập ít nhất một dòng hợp âm cho mỗi bài hát
- Tránh thực hiện quá nhiều thao tác trong thời gian ngắn để đảm bảo hệ thống hoạt động ổn định 