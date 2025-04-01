/**
 * Firebase Debug Helper
 * Công cụ hỗ trợ debug và khắc phục lỗi Firebase Authentication
 */

(function() {
  // Thêm debug UI nếu cần
  function addDebugUI() {
    if (document.getElementById('firebase-debug-panel')) {
      return; // Đã tồn tại
    }
    
    // Tạo khung debug
    const debugPanel = document.createElement('div');
    debugPanel.id = 'firebase-debug-panel';
    debugPanel.style.cssText = `
      position: fixed;
      bottom: 10px;
      right: 10px;
      background-color: white;
      border: 1px solid #ccc;
      padding: 10px;
      border-radius: 5px;
      font-family: monospace;
      font-size: 12px;
      z-index: 9999;
      box-shadow: 0 0 10px rgba(0,0,0,0.2);
      max-width: 500px;
      max-height: 400px;
      overflow: auto;
    `;
    
    // Tiêu đề
    const title = document.createElement('h3');
    title.textContent = 'Firebase Debug Panel';
    title.style.margin = '0 0 10px 0';
    debugPanel.appendChild(title);
    
    // Nút đóng
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'X';
    closeBtn.style.cssText = `
      position: absolute;
      top: 5px;
      right: 5px;
      border: none;
      background: none;
      cursor: pointer;
      font-weight: bold;
    `;
    closeBtn.onclick = () => debugPanel.remove();
    debugPanel.appendChild(closeBtn);
    
    // Thêm thông tin cơ bản
    const info = document.createElement('div');
    const config = window.getFirebaseConfig ? window.getFirebaseConfig() : null;
    
    if (config) {
      info.innerHTML = `
        <strong>API Key:</strong> ${config.apiKey ? config.apiKey.substring(0, 8) + '...' : 'Không có'}<br>
        <strong>Auth Domain:</strong> ${config.authDomain || 'Không có'}<br>
        <strong>Project ID:</strong> ${config.projectId || 'Không có'}<br>
        <strong>Apps:</strong> ${typeof firebase !== 'undefined' ? firebase.apps.length : 'Firebase chưa được tải'}
      `;
    } else {
      info.innerHTML = '<strong>Error:</strong> Không thể lấy cấu hình Firebase';
    }
    
    debugPanel.appendChild(info);
    
    // Thêm khung cập nhật API key
    const apiKeySection = document.createElement('div');
    apiKeySection.style.cssText = `
      margin-top: 15px;
      padding: 8px;
      border: 1px dashed #ccc;
      border-radius: 4px;
    `;
    
    const apiKeyHeading = document.createElement('h4');
    apiKeyHeading.textContent = 'Cập nhật API Key';
    apiKeyHeading.style.margin = '0 0 8px 0';
    apiKeySection.appendChild(apiKeyHeading);
    
    const apiKeyInput = document.createElement('input');
    apiKeyInput.type = 'text';
    apiKeyInput.placeholder = 'Nhập API key mới (bắt đầu với AIza...)';
    apiKeyInput.style.cssText = `
      width: 100%;
      padding: 5px;
      margin-bottom: 8px;
      box-sizing: border-box;
    `;
    apiKeySection.appendChild(apiKeyInput);
    
    const updateApiKeyBtn = document.createElement('button');
    updateApiKeyBtn.textContent = 'Cập nhật API Key';
    updateApiKeyBtn.style.marginRight = '8px';
    updateApiKeyBtn.onclick = () => {
      const newApiKey = apiKeyInput.value.trim();
      if (!newApiKey) {
        alert('Vui lòng nhập API key mới');
        return;
      }
      
      if (window.firebaseConfigManager && typeof window.firebaseConfigManager.updateApiKey === 'function') {
        const result = window.firebaseConfigManager.updateApiKey(newApiKey);
        if (result) {
          alert('API key đã được cập nhật. Trang sẽ được làm mới để áp dụng thay đổi.');
          setTimeout(() => window.location.reload(), 1000);
        } else {
          alert('Không thể cập nhật API key. Vui lòng kiểm tra console để biết chi tiết.');
        }
      } else {
        alert('Chức năng cập nhật API key không khả dụng');
      }
    };
    apiKeySection.appendChild(updateApiKeyBtn);
    
    const resetApiKeyBtn = document.createElement('button');
    resetApiKeyBtn.textContent = 'Khôi phục mặc định';
    resetApiKeyBtn.onclick = () => {
      if (window.firebaseConfigManager && typeof window.firebaseConfigManager.resetConfig === 'function') {
        const result = window.firebaseConfigManager.resetConfig();
        if (result) {
          alert('Đã khôi phục cấu hình mặc định. Trang sẽ được làm mới để áp dụng thay đổi.');
          setTimeout(() => window.location.reload(), 1000);
        } else {
          alert('Không thể khôi phục cấu hình mặc định. Vui lòng kiểm tra console để biết chi tiết.');
        }
      } else {
        alert('Chức năng khôi phục cấu hình không khả dụng');
      }
    };
    apiKeySection.appendChild(resetApiKeyBtn);
    
    debugPanel.appendChild(apiKeySection);
    
    // Thêm nút debug
    const buttonContainer = document.createElement('div');
    buttonContainer.style.marginTop = '10px';
    
    const testButton = document.createElement('button');
    testButton.textContent = 'Kiểm tra cấu hình';
    testButton.onclick = () => {
      const result = window.firebaseDebug.checkConfig();
      alert('Kết quả kiểm tra: ' + (result ? 'Thành công' : 'Thất bại') + 
            '\nXem chi tiết trong Console (F12)');
    };
    buttonContainer.appendChild(testButton);
    
    const reinitButton = document.createElement('button');
    reinitButton.textContent = 'Khởi động lại Firebase';
    reinitButton.style.marginLeft = '10px';
    reinitButton.onclick = () => {
      const result = window.firebaseDebug.reinitializeFirebase();
      alert('Khởi động lại: ' + (result ? 'Thành công' : 'Thất bại') + 
            '\nXem chi tiết trong Console (F12)');
    };
    buttonContainer.appendChild(reinitButton);
    
    const domainButton = document.createElement('button');
    domainButton.textContent = 'Kiểm tra domain';
    domainButton.style.marginLeft = '10px';
    domainButton.onclick = () => {
      const result = window.firebaseDebug.checkAllowedDomains();
      alert('Domain hiện tại: ' + (result ? result.currentDomain : 'Không xác định') + 
            '\nXem chi tiết trong Console (F12)');
    };
    buttonContainer.appendChild(domainButton);
    
    const testConnectionButton = document.createElement('button');
    testConnectionButton.textContent = 'Kiểm tra API key';
    testConnectionButton.style.marginLeft = '10px';
    testConnectionButton.onclick = async () => {
      if (window.firebaseAuth && typeof window.firebaseAuth.testFirebaseConnection === 'function') {
        const isConnected = await window.firebaseAuth.testFirebaseConnection();
        alert('Kết nối với Firebase: ' + (isConnected ? 'Thành công' : 'Thất bại') + 
            '\nXem chi tiết trong Console (F12)');
      } else {
        alert('Chức năng kiểm tra kết nối không khả dụng');
      }
    };
    buttonContainer.appendChild(testConnectionButton);
    
    debugPanel.appendChild(buttonContainer);
    
    // Thêm vào body
    document.body.appendChild(debugPanel);
  }
  
  // Khởi động công cụ debug
  function initDebugTools() {
    // Tạo shortcut để mở debug panel
    window.addEventListener('keydown', function(e) {
      // Ctrl+Shift+F để mở debug panel (hoặc Cmd+Shift+F trên Mac)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'F') {
        e.preventDefault();
        addDebugUI();
      }
    });
    
    // Tự động kiểm tra cấu hình
    setTimeout(() => {
      if (window.firebaseDebug) {
        window.firebaseDebug.testApiKey();
      }
    }, 3000);
    
    console.log('Firebase Debug Helper đã được khởi tạo. Nhấn Ctrl+Shift+F (hoặc Cmd+Shift+F) để mở bảng điều khiển debug.');
  }
  
  // Khởi tạo khi trang đã tải
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDebugTools);
  } else {
    initDebugTools();
  }
})();
