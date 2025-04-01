// Script hỗ trợ đảm bảo đăng nhập Google hoạt động trơn tru
(function() {
  // Khởi tạo các biến cần thiết
  window.googleLoginReadyState = true; // Luôn đặt là true để bỏ qua Google Platform API
  
  // Cài đặt xử lý cho sự kiện gapi loaded - không cần nữa
  window.onGoogleLoginReady = function() {
    console.log('Google Sign-In API không sử dụng, dùng Firebase Auth trực tiếp');
  };
  
  // Hàm khởi tạo Google Login API - không cần nữa
  window.initGoogleLogin = function() {
    console.log('Bỏ qua Google Platform API, sử dụng Firebase Auth trực tiếp');
  };
  
  // KHÔNG tải Google Platform API
  function loadGooglePlatformAPI() {
    console.log('Bỏ qua việc tải Google Platform API, sử dụng Firebase Auth trực tiếp');
  }
  
  // Không cần gọi loadGooglePlatformAPI
  window.addEventListener('load', function() {
    console.log('Sử dụng Firebase Auth trực tiếp để đăng nhập');
  });
})(); 