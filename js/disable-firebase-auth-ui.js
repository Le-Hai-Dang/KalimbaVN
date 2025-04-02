/**
 * Script tắt Firebase Authentication UI
 * File này giúp tắt giao diện đăng nhập tự động của Firebase Auth
 * mà vẫn giữ nguyên các chức năng khác của Firebase (Firestore, Analytics, etc.)
 */

(function() {
  // Chờ DOM tải xong
  document.addEventListener('DOMContentLoaded', function() {
    // Vô hiệu hóa các container của FirebaseUI
    function disableFirebaseUI() {
      // Ẩn các container FirebaseUI
      const firebaseUIContainers = document.querySelectorAll(
        '.firebaseui-container, ' +
        '.firebaseui-auth-container, ' + 
        '.firebaseui-id-page-sign-in, ' +
        '.firebaseui-card-content'
      );
      
      firebaseUIContainers.forEach(container => {
        if (container) {
          container.style.display = 'none';
          // Thêm class để nhận biết đã bị vô hiệu hóa
          container.classList.add('kalimba-firebase-ui-disabled');
        }
      });
      
      // Xóa iframe của FirebaseUI nếu có
      const firebaseIframes = document.querySelectorAll('iframe[src*="firebaseapp"]');
      firebaseIframes.forEach(iframe => {
        if (iframe && iframe.parentNode) {
          iframe.parentNode.removeChild(iframe);
        }
      });
    }
    
    // Ghi đè hàm của Firebase Auth UI
    if (window.firebase) {
      // Kiểm tra nếu firebase có được tải
      if (window.firebase.auth) {
        // Ghi đè phương thức signInWithPopup để không mở popup của Firebase
        const originalSignInWithPopup = window.firebase.auth.prototype.signInWithPopup;
        window.firebase.auth.prototype.signInWithPopup = function() {
          console.log('Đã vô hiệu hóa Firebase Auth Popup');
          return Promise.resolve({
            user: null,
            credential: null,
            operationType: 'disabled',
            additionalUserInfo: null
          });
        };
        
        // Ghi đè phương thức signInWithRedirect để không chuyển hướng
        const originalSignInWithRedirect = window.firebase.auth.prototype.signInWithRedirect;
        window.firebase.auth.prototype.signInWithRedirect = function() {
          console.log('Đã vô hiệu hóa Firebase Auth Redirect');
          return Promise.resolve();
        };
        
        // Vô hiệu hóa các phương thức khác nếu cần
        console.log('Đã vô hiệu hóa Firebase Auth UI');
      }
    }
    
    // Chạy ngay khi tải xong
    disableFirebaseUI();
    
    // Chạy lại sau mỗi 100ms để đảm bảo UI không hiện lại
    const interval = setInterval(disableFirebaseUI, 100);
    
    // Sau 5 giây, giảm tần suất kiểm tra xuống 1 giây
    setTimeout(() => {
      clearInterval(interval);
      setInterval(disableFirebaseUI, 1000);
    }, 5000);
  });
})(); 