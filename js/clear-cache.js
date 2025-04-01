window.addEventListener("load", function() { 
    console.clear(); 
    
    // Xóa các biến cờ liên quan đến đăng nhập
    window.googleLoginInProgress = false;
    window.signInWithGoogleInProgress = false;
    window.authProcessRunning = false;
    window.authButtonsInitialized = false;
    
    console.log("Đã xóa bộ nhớ cache và đặt lại các biến cờ đăng nhập");
});
