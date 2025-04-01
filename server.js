/**
 * Simple HTTP server for Kalimba VN
 * Máy chủ HTTP đơn giản cho ứng dụng Kalimba VN
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// Cấu hình
const PORT = 8080;
const HOST = 'localhost';

// Các loại MIME phổ biến
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain'
};

// Tạo máy chủ HTTP
const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);
  
  // Xử lý URL
  let filePath = '.' + req.url;
  if (filePath === './') {
    filePath = './index.html';
  }
  
  // Lấy phần mở rộng của tệp
  const extname = path.extname(filePath);
  let contentType = MIME_TYPES[extname] || 'application/octet-stream';
  
  // Đọc tệp yêu cầu
  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        // Tệp không tồn tại
        fs.readFile('./404.html', (error, content) => {
          if (error) {
            // Không tìm thấy trang 404.html
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
          } else {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end(content, 'utf-8');
          }
        });
      } else {
        // Lỗi server
        res.writeHead(500);
        res.end(`Server Error: ${error.code}`);
      }
    } else {
      // Trả về nội dung tệp
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

// Lắng nghe kết nối
server.listen(PORT, HOST, () => {
  console.log(`Máy chủ đang chạy tại http://${HOST}:${PORT}/`);
  console.log(`Mở trình duyệt và truy cập địa chỉ trên để xem trang web.`);
  console.log(`Nhấn Ctrl+C để dừng máy chủ.`);
});
