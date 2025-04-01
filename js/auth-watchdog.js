// Script theo dõi và khắc phục các vấn đề đăng nhập bị treo

(function() {
  // Kiểm tra và đặt lại trạng thái xác thực
  function checkAndResetAuthState() {
    const authProcessRunning = window.authProcessRunning;
    const googleLoginInProgress = window.googleLoginInProgress;
    const signInWithGoogleInProgress = window.signInWithGoogleInProgress;
    
    // Kiểm tra thời gian bắt đầu nếu có
    const authStartTime = window.authStartTime || 0;
    const currentTime = Date.now();
    
    // Nếu quá trình xác thực đang chạy quá 30 giây, hãy đặt lại
    if (authProcessRunning && (currentTime - authStartTime > 30000 || authStartTime === 0)) {
      console.log('Phát hiện quá trình xác thực bị treo, đặt lại');
      window.authProcessRunning = false;
    }
    
    // Kiểm tra các biến cờ khác
    if (googleLoginInProgress || signInWithGoogleInProgress) {
      console.log('Phát hiện biến cờ đăng nhập bị treo, đặt lại');
      window.googleLoginInProgress = false;
      window.signInWithGoogleInProgress = false;
    }
  }
  
  // Khởi tạo kiểm tra định kỳ
  function initAuthWatchdog() {
    // Kiểm tra mỗi 10 giây
    setInterval(checkAndResetAuthState, 10000);
    console.log('Đã khởi tạo watchdog kiểm tra trạng thái xác thực');
  }
  
  // Bắt đầu theo dõi sau khi trang đã tải
  window.addEventListener('load', initAuthWatchdog);
})(); 