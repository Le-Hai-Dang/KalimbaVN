/**
 * Firebase Debug Tool
 * Tool để kiểm tra và debug các vấn đề với Firebase
 */

// Kiểm tra nếu script đã được tải để tránh chạy nhiều lần
if (window.FirebaseDebug) {
    console.log('Firebase Debug đã được tải trước đó, bỏ qua');
} else {
    // Biến lưu thông tin debug
    let firebaseDebugInfo = {
        status: 'unknown',
        errors: [],
        logs: []
    };

    // Tránh kiểm tra quá thường xuyên
    const CHECK_THROTTLE_MS = 5000; // 5 giây

    /**
     * Ghi log thông tin debug
     * @param {String} message Thông điệp log
     * @param {Object} data Dữ liệu kèm theo (nếu có)
     */
    function logDebug(message, data = null) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            message,
            data
        };
        
        firebaseDebugInfo.logs.push(logEntry);
        console.log(`[Firebase Debug] ${message}`, data);
        
        // Cập nhật UI nếu đang hiển thị
        updateDebugUI();
    }

    /**
     * Ghi lỗi vào debug info
     * @param {Error} error Đối tượng lỗi
     */
    function logError(error) {
        const timestamp = new Date().toISOString();
        const errorEntry = {
            timestamp,
            message: error.message,
            stack: error.stack,
            code: error.code
        };
        
        firebaseDebugInfo.errors.push(errorEntry);
        console.error(`[Firebase Debug] Error: ${error.message}`, error);
        
        // Cập nhật UI nếu đang hiển thị
        updateDebugUI();
    }

    /**
     * Kiểm tra kết nối Firebase
     */
    async function checkFirebaseConnection() {
        logDebug('Bắt đầu kiểm tra kết nối Firebase...');
        
        try {
            // Kiểm tra đã khởi tạo Firebase chưa
            if (typeof firebase === 'undefined') {
                throw new Error('Firebase SDK chưa được tải');
            }
            
            logDebug('Firebase SDK đã được tải.');
            
            // Kiểm tra đã khởi tạo KalimbaFirebase chưa
            if (typeof window.KalimbaFirebase === 'undefined') {
                throw new Error('KalimbaFirebase chưa được khởi tạo');
            }
            
            logDebug('KalimbaFirebase đã được khởi tạo.');
            
            // Kiểm tra kết nối đến Firestore
            const connectionResult = await window.KalimbaFirebase.quickConnectionCheck();
            
            if (connectionResult.success) {
                firebaseDebugInfo.status = 'connected';
                logDebug('Kết nối đến Firebase thành công', connectionResult);
            } else {
                firebaseDebugInfo.status = 'error';
                logDebug('Kết nối đến Firebase thất bại', connectionResult);
            }
            
            return connectionResult;
        } catch (error) {
            firebaseDebugInfo.status = 'error';
            logError(error);
            return {
                success: false,
                message: error.message,
                error: error
            };
        }
    }

    /**
     * Kiểm tra quyền admin
     */
    function checkAdminPermission() {
        logDebug('Kiểm tra quyền admin...');
        
        try {
            if (typeof window.AdminAuth === 'undefined') {
                throw new Error('AdminAuth chưa được khởi tạo');
            }
            
            const isAdmin = window.AdminAuth.checkAdminStatus();
            
            if (isAdmin) {
                logDebug('Người dùng hiện tại có quyền admin');
      } else {
                logDebug('Người dùng hiện tại KHÔNG có quyền admin');
            }
            
            return isAdmin;
        } catch (error) {
            logError(error);
            return false;
        }
    }

    /**
     * Test thêm bài hát mới
     */
    async function testAddSong() {
        logDebug('Bắt đầu test thêm bài hát mới...');
        
        try {
            // Kiểm tra kết nối Firebase trước
            const connectionResult = await checkFirebaseConnection();
            if (!connectionResult.success) {
                throw new Error(`Không thể kết nối đến Firebase: ${connectionResult.message}`);
            }
            
            // Kiểm tra quyền admin
            const isAdmin = checkAdminPermission();
            if (!isAdmin) {
                throw new Error('Không có quyền admin để thêm bài hát');
            }
            
            // Tạo dữ liệu test
            const testSongData = {
                title: `Test Song ${new Date().toLocaleTimeString()}`,
                artist: 'Test Artist',
                category: 'nhac-tre',
                featured: false,
                notes: ['1', '2', '3'],
                lyrics: ['Dòng 1', 'Dòng 2', 'Dòng 3'],
                thumbnail: 'https://kalimbachill.com/images/default-song.jpg',
                videoLink: ''
            };
            
            logDebug('Đang thêm bài hát test...', testSongData);
            
            // Gọi hàm addSong
            const songId = await window.KalimbaFirebase.addSong(testSongData);
            
            logDebug('Đã thêm bài hát thành công!', { songId });
            
            return {
                success: true,
                message: 'Đã thêm bài hát test thành công',
                songId
            };
        } catch (error) {
            logError(error);
            
            return {
                success: false,
                message: `Lỗi khi thêm bài hát: ${error.message}`,
                error
            };
        }
    }

    /**
     * Test cập nhật bài hát
     * @param {String} songId ID của bài hát cần cập nhật
     */
    async function testUpdateSong(songId) {
        logDebug(`Bắt đầu test cập nhật bài hát ID: ${songId}...`);
        
        try {
            // Kiểm tra kết nối Firebase trước
            const connectionResult = await checkFirebaseConnection();
            if (!connectionResult.success) {
                throw new Error(`Không thể kết nối đến Firebase: ${connectionResult.message}`);
            }
            
            // Kiểm tra quyền admin
            const isAdmin = checkAdminPermission();
            if (!isAdmin) {
                throw new Error('Không có quyền admin để cập nhật bài hát');
            }
            
            // Tạo dữ liệu cập nhật
            const updateData = {
                title: `Updated Test Song ${new Date().toLocaleTimeString()}`,
                notes: ['1', '2', '3', '4'],
                lyrics: ['Dòng 1', 'Dòng 2', 'Dòng 3', 'Dòng 4']
            };
            
            logDebug('Đang cập nhật bài hát...', updateData);
            
            // Gọi hàm updateSong
            await window.KalimbaFirebase.updateSong(songId, updateData);
            
            logDebug('Đã cập nhật bài hát thành công!');
            
            return {
                success: true,
                message: 'Đã cập nhật bài hát test thành công'
            };
        } catch (error) {
            logError(error);
            
            return {
                success: false,
                message: `Lỗi khi cập nhật bài hát: ${error.message}`,
                error
            };
        }
    }

    /**
     * Tạo UI để hiển thị debug info
     */
    function createDebugUI() {
        // Kiểm tra xem đã có UI chưa
        if (document.getElementById('firebase-debug-panel')) {
            return;
        }
        
        // Tạo panel
        const panel = document.createElement('div');
        panel.id = 'firebase-debug-panel';
        panel.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 350px;
            max-height: 500px;
            background-color: #f8f9fa;
            border: 1px solid #ddd;
            border-radius: 5px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            z-index: 10000;
            overflow: hidden;
        `;
        
        // Tạo header
        const header = document.createElement('div');
        header.style.cssText = `
            padding: 10px;
            background-color: #343a40;
            color: white;
            font-weight: bold;
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;
        header.innerHTML = `
            <span>Firebase Debug <span id="firebase-status" class="status-unknown">●</span></span>
            <div>
                <button id="firebase-debug-close" style="background: none; border: none; color: white; cursor: pointer;">×</button>
            </div>
        `;
        
        // Tạo content
        const content = document.createElement('div');
        content.id = 'firebase-debug-content';
        content.style.cssText = `
            padding: 10px;
            overflow-y: auto;
            max-height: 350px;
        `;
        
        // Tạo actions
        const actions = document.createElement('div');
        actions.style.cssText = `
            padding: 10px;
            border-top: 1px solid #ddd;
            display: flex;
            gap: 5px;
        `;
        actions.innerHTML = `
            <button id="check-connection-btn" class="debug-btn">Kiểm tra kết nối</button>
            <button id="test-add-song-btn" class="debug-btn">Test thêm bài hát</button>
        `;
        
        // Thêm vào panel
        panel.appendChild(header);
        panel.appendChild(content);
        panel.appendChild(actions);
        
        // Thêm CSS cho panel
        const style = document.createElement('style');
        style.textContent = `
            .debug-btn {
                padding: 5px 10px;
                background-color: #007bff;
                color: white;
                border: none;
                border-radius: 3px;
                cursor: pointer;
            }
            .debug-btn:hover {
                background-color: #0069d9;
            }
            .debug-log {
                margin-bottom: 5px;
                padding: 5px;
                border-bottom: 1px solid #eee;
            }
            .debug-error {
                color: #dc3545;
                font-weight: bold;
            }
            .status-connected {
                color: #28a745;
            }
            .status-error {
                color: #dc3545;
            }
            .status-unknown {
                color: #ffc107;
            }
        `;
        
        // Thêm vào document
        document.head.appendChild(style);
        document.body.appendChild(panel);
        
        // Thêm sự kiện
        document.getElementById('firebase-debug-close').addEventListener('click', () => {
            panel.style.display = 'none';
        });
        
        document.getElementById('check-connection-btn').addEventListener('click', async () => {
            await checkFirebaseConnection();
        });
        
        document.getElementById('test-add-song-btn').addEventListener('click', async () => {
            const result = await testAddSong();
            
            if (result.success && result.songId) {
                // Thêm nút test cập nhật
                const updateBtn = document.createElement('button');
                updateBtn.className = 'debug-btn';
                updateBtn.textContent = 'Test cập nhật bài hát';
                updateBtn.addEventListener('click', async () => {
                    await testUpdateSong(result.songId);
                });
                
                // Thêm vào actions
                actions.appendChild(updateBtn);
            }
        });
        
        // Cập nhật UI lần đầu
        updateDebugUI();
    }

    /**
     * Cập nhật UI debug
     */
    function updateDebugUI() {
        const content = document.getElementById('firebase-debug-content');
        const statusIndicator = document.getElementById('firebase-status');
        
        if (!content || !statusIndicator) return;
        
        // Cập nhật trạng thái
        statusIndicator.className = `status-${firebaseDebugInfo.status}`;
        
        // Tạo nội dung
        let html = '';
        
        // Thêm lỗi
        if (firebaseDebugInfo.errors.length > 0) {
            html += '<h4>Lỗi:</h4>';
            
            firebaseDebugInfo.errors.forEach(error => {
                html += `
                    <div class="debug-log debug-error">
                        <div>${error.timestamp}</div>
                        <div>${error.message}</div>
                        ${error.code ? `<div>Code: ${error.code}</div>` : ''}
                    </div>
                `;
            });
        }
        
        // Thêm logs
        if (firebaseDebugInfo.logs.length > 0) {
            html += '<h4>Logs:</h4>';
            
            // Chỉ hiển thị 20 log gần nhất
            const recentLogs = firebaseDebugInfo.logs.slice(-20);
            
            recentLogs.forEach(log => {
                html += `
                    <div class="debug-log">
                        <div>${log.timestamp}</div>
                        <div>${log.message}</div>
                    </div>
                `;
            });
        }
        
        content.innerHTML = html;
        
        // Scroll xuống dưới
        content.scrollTop = content.scrollHeight;
    }

    // Khởi tạo khi trang đã tải xong
    document.addEventListener('DOMContentLoaded', () => {
        // Tạo debug UI
        // createDebugUI();
    });

    // Export các hàm ra window object
    window.FirebaseDebug = {
        checkConnection: checkFirebaseConnection,
        checkAdmin: checkAdminPermission,
        testAddSong,
        testUpdateSong,
        showUI: createDebugUI,
        getInfo: () => firebaseDebugInfo,
        logDebug,
        logError
    };
} 