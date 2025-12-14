// Human Empowerment Abilities - Interactive Script
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    initApp();
});

// 全局数据存储
let globalAbilitiesData = {};
let globalExercisesData = [];
let globalUsersData = {};
let userProgress = {
    abilitiesProgress: {1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0},
    completedExercises: [],
    badges: ['sprout'],
    reflections: []
};

async function initApp() {
    // Check storage support first
    checkStorageSupport();
    
    // Load user progress from localStorage
    loadUserProgress();
    
    // Load all data
    await loadAllData();
    
    // Initialize progress chart
    initProgressChart();
    
    // Setup event listeners
    setupEventListeners();
    
    // Update stats periodically
    setInterval(updateLiveStats, 30000);
    
    // Initial UI update
    updateLiveStats();
}

// 检查存储支持
function checkStorageSupport() {
    try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        return true;
    } catch (e) {
        console.warn('LocalStorage 不可用（可能因隐私设置被阻止）。进度保存功能将受限。');
        return false;
    }
}

// 安全的本地存储操作
const storage = {
    set: function(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.warn('无法保存到LocalStorage，使用sessionStorage作为备选');
            sessionStorage.setItem(key, JSON.stringify(value));
        }
    },
    get: function(key) {
        try {
            const item = localStorage.getItem(key) || sessionStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (e) {
            return null;
        }
    }
};

// 加载用户进度
function loadUserProgress() {
    const savedProgress = storage.get('humanEmpowermentProgress');
    if (savedProgress) {
        userProgress = savedProgress;
        console.log('用户进度已加载');
    }
}

// 保存用户进度
function saveUserProgress() {
    storage.set('humanEmpowermentProgress', userProgress);
}

// 加载所有数据
async function loadAllData() {
    try {
        await Promise.all([
            loadAbilities(),
            loadExercises(),
            loadUsers()
        ]);
    } catch (error) {
        console.error('加载数据时出错:', error);
        showError('无法加载数据，请检查网络连接或刷新页面。');
    }
}

// 显示错误
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
        <div style="background: #f8d7da; color: #721c24; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <strong>错误:</strong> ${message}
        </div>
    `;
    document.querySelector('.container').prepend(errorDiv);
}

// 加载能力数据
// 在 loadAbilities 函数中，修改为以下内容：
async function loadAbilities() {
    const container = document.getElementById('abilities-container');
    const activeTab = document.querySelector('.tab-btn.active')?.dataset.dimension || 'emotional';
    
    container.innerHTML = '';
    
    // 从 abilitiesData 中获取数据（已包含完整9项能力）
    const abilities = abilitiesData[activeTab];
    
    if (!abilities || abilities.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-brain"></i><p>正在加载能力数据...</p></div>';
        return;
    }
    
    abilities.forEach(ability => {
        const progress = Math.floor(Math.random() * 30) + 40; // 模拟进度，实际应从用户数据获取
        const completed = Math.floor(Math.random() * (ability.exercises - 1)) + 1;
        
        const card = document.createElement('div');
        card.className = 'ability-card';
        card.innerHTML = `
            <div class="ability-header">
                <div class="ability-number">${ability.number}</div>
                <span class="ability-category">${ability.category}</span>
            </div>
            <h3 class="ability-title">${ability.title}</h3>
            <p class="ability-description">${ability.description}</p>
            <div class="ability-details">
                <div class="ai-limitation">
                    <strong>AI局限：</strong> ${ability.aiLimitation}
                </div>
                ${ability.example ? `<div class="ability-example"><strong>示例：</strong> ${ability.example}</div>` : ''}
            </div>
            <div class="ability-footer">
                <div class="ability-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${(completed / ability.exercises) * 100}%"></div>
                    </div>
                    <span>已完成 ${completed}/${ability.exercises} 项练习</span>
                </div>
                <div class="ability-actions">
                    <button class="btn-secondary" onclick="startAbilityExercise(${ability.id})">
                        <i class="${ability.icon}"></i> 开始练习
                    </button>
                    <button class="btn-text" onclick="learnMore(${ability.id})">了解更多</button>
                </div>
            </div>
        `;
        
        // 设置边框颜色
        card.style.borderTopColor = ability.color;
        container.appendChild(card);
    });
}

// 加载练习数据
async function loadExercises() {
    try {
        const response = await fetch('data/exercises.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        globalExercisesData = data.exercises || [];
        displayRandomExercise();
    } catch (error) {
        console.error('加载练习数据失败:', error);
        globalExercisesData = getFallbackExercisesData();
        displayRandomExercise();
    }
}

// 加载用户数据
async function loadUsers() {
    try {
        const response = await fetch('data/users.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        globalUsersData = await response.json();
        updateCommunityStats();
        displaySignatures();
    } catch (error) {
        console.error('加载用户数据失败:', error);
        globalUsersData = getFallbackUsersData();
        updateCommunityStats();
        displaySignatures();
    }
}

// 显示能力卡片
function displayAbilities() {
    const container = document.getElementById('abilities-container');
    const activeTab = document.querySelector('.tab-btn.active')?.dataset.dimension || 'emotional';
    
    if (!container || !globalAbilitiesData[activeTab]) {
        console.error('无法找到容器或能力数据');
        return;
    }
    
    container.innerHTML = '';
    
    globalAbilitiesData[activeTab].forEach(ability => {
        const completed = userProgress.abilitiesProgress[ability.id] || 0;
        const totalExercises = ability.exercises || 3;
        const progressPercent = (completed / totalExercises) * 100;
        
        const card = document.createElement('div');
        card.className = 'ability-card';
        card.innerHTML = `
            <div class="ability-header">
                <div class="ability-number">${ability.number}</div>
                <span class="ability-category">${ability.category}</span>
            </div>
            <h3 class="ability-title">${ability.title}</h3>
            <p class="ability-description">${ability.description}</p>
            <div class="ability-meta">
                <p><strong>AI Limitation:</strong> ${ability.aiLimitation}</p>
            </div>
            <div class="ability-footer">
                <div class="ability-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progressPercent}%"></div>
                    </div>
                    <span>${completed}/${totalExercises} 练习完成</span>
                </div>
                <div class="ability-actions">
                    <button class="btn-secondary practice-btn" data-ability-id="${ability.id}">
                        <i class="${ability.icon}"></i> 练习
                    </button>
                    <button class="btn-text learn-btn" data-ability-id="${ability.id}">了解更多</button>
                </div>
            </div>
        `;
        
        // Set border color based on ability
        card.style.borderTopColor = ability.color;
        container.appendChild(card);
    });
    
    // Add event listeners to the new buttons
    document.querySelectorAll('.practice-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const abilityId = parseInt(this.dataset.abilityId);
            startAbilityExercise(abilityId);
        });
    });
    
    document.querySelectorAll('.learn-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const abilityId = parseInt(this.dataset.abilityId);
            learnMore(abilityId);
        });
    });
}

// 显示随机练习
function displayRandomExercise() {
    if (!globalExercisesData.length) {
        console.error('没有可用的练习数据');
        return;
    }
    
    // Randomly select today's exercise
    const randomIndex = Math.floor(Math.random() * globalExercisesData.length);
    const exercise = globalExercisesData[randomIndex];
    
    // Update UI
    const categoryEl = document.getElementById('exercise-category');
    const titleEl = document.getElementById('exercise-title');
    const descEl = document.getElementById('exercise-description');
    const durationEl = document.getElementById('exercise-duration');
    
    if (categoryEl) categoryEl.textContent = exercise.category;
    if (titleEl) titleEl.textContent = exercise.title;
    if (descEl) descEl.textContent = exercise.description;
    if (durationEl) durationEl.textContent = exercise.duration;
    
    // Store current exercise for completion tracking
    if (window.currentExercise) {
        window.currentExercise = exercise;
    } else {
        window.currentExercise = exercise;
    }
}

// 显示社区签名
function displaySignatures() {
    const container = document.getElementById('signatures-container');
    if (!container || !globalUsersData.users) return;
    
    container.innerHTML = '';
    
    // Display sample signatures from users data
    globalUsersData.users.slice(0, 5).forEach(user => {
        if (user.reflections && user.reflections.length > 0) {
            const reflection = user.reflections[0];
            const item = document.createElement('div');
            item.className = 'signature-item';
            item.innerHTML = `
                <div class="signature-name">${user.username}</div>
                <div class="signature-location">${user.location}</div>
                <div class="signature-commitment">"${reflection.text.substring(0, 100)}${reflection.text.length > 100 ? '...' : ''}"</div>
            `;
            container.appendChild(item);
        }
    });
}

// 更新社区统计
function updateCommunityStats() {
    const cultivatorsEl = document.getElementById('total-cultivators');
    const exercisesEl = document.getElementById('total-exercises');
    const signaturesEl = document.getElementById('total-signatures');
    
    if (cultivatorsEl && globalUsersData.activeUsers) {
        cultivatorsEl.textContent = globalUsersData.activeUsers.toLocaleString();
    }
    
    if (exercisesEl && globalUsersData.totalExercisesCompleted) {
        exercisesEl.textContent = globalUsersData.totalExercisesCompleted.toLocaleString();
    }
    
    if (signaturesEl && globalUsersData.totalSignatures) {
        signaturesEl.textContent = globalUsersData.totalSignatures.toLocaleString();
    }
}

// 初始化进度图表
function initProgressChart() {
    const ctx = document.getElementById('progress-chart');
    if (!ctx) return;
    
    const ctx2d = ctx.getContext('2d');
    
    // Prepare data from user progress
    const labels = [];
    const dataValues = [];
    const backgroundColors = [
        'rgba(76, 201, 240, 0.7)',
        'rgba(67, 97, 238, 0.7)',
        'rgba(58, 12, 163, 0.7)',
        'rgba(247, 37, 133, 0.7)',
        'rgba(181, 23, 158, 0.7)',
        'rgba(114, 9, 183, 0.7)',
        'rgba(86, 11, 173, 0.7)',
        'rgba(72, 12, 168, 0.7)',
        'rgba(58, 12, 163, 0.7)'
    ];
    
    // Get ability names and progress values
    for (let i = 1; i <= 9; i++) {
        let abilityName = '';
        let progressValue = userProgress.abilitiesProgress[i] || 0;
        
        // Find ability name
        for (const dimension in globalAbilitiesData) {
            const ability = globalAbilitiesData[dimension].find(a => a.id === i);
            if (ability) {
                // Extract first word or short name
                abilityName = ability.title.split(' ')[0];
                break;
            }
        }
        
        labels.push(abilityName || `能力 ${i}`);
        dataValues.push(progressValue);
    }
    
    const progressData = {
        labels: labels,
        datasets: [{
            label: '你的发展',
            data: dataValues,
            backgroundColor: backgroundColors.slice(0, labels.length),
            borderColor: '#ffffff',
            borderWidth: 2
        }]
    };
    
    // Destroy existing chart if it exists
    if (window.progressChart) {
        window.progressChart.destroy();
    }
    
    window.progressChart = new Chart(ctx2d, {
        type: 'radar',
        data: progressData,
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                r: {
                    angleLines: {
                        display: true
                    },
                    suggestedMin: 0,
                    suggestedMax: 100,
                    ticks: {
                        stepSize: 20
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
    
    // Initialize badges
    const badgeContainer = document.getElementById('badge-container');
    if (badgeContainer) {
        const badges = [
            { id: 'sprout', name: '新芽', icon: 'fas fa-seedling', earned: userProgress.badges.includes('sprout') },
            { id: 'cultivator', name: '培育者', icon: 'fas fa-leaf', earned: userProgress.badges.includes('cultivator') },
            { id: 'guardian', name: '守护者', icon: 'fas fa-shield-alt', earned: userProgress.badges.includes('guardian') },
            { id: 'beacon', name: '灯塔', icon: 'fas fa-star', earned: userProgress.badges.includes('beacon') }
        ];
        
        badgeContainer.innerHTML = '';
        badges.forEach(badge => {
            const badgeEl = document.createElement('div');
            badgeEl.className = `badge ${badge.earned ? 'earned' : ''}`;
            badgeEl.innerHTML = `
                <i class="${badge.icon}"></i>
                <span>${badge.name}</span>
            `;
            badgeContainer.appendChild(badgeEl);
        });
    }
}

// 设置事件监听器
function setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            displayAbilities();
        });
    });
    
    // Exercise timer
    const startBtn = document.getElementById('start-exercise');
    const timerDisplay = document.getElementById('exercise-timer');
    const skipBtn = document.getElementById('skip-exercise');
    const completeBtn = document.getElementById('complete-exercise');
    
    let timerInterval;
    let timeLeft = 300; // 5 minutes in seconds
    
    if (startBtn) {
        startBtn.addEventListener('click', function() {
            this.style.display = 'none';
            if (skipBtn) skipBtn.style.display = 'none';
            if (timerDisplay) timerDisplay.style.display = 'block';
            
            timerInterval = setInterval(() => {
                timeLeft--;
                const minutes = Math.floor(timeLeft / 60);
                const seconds = timeLeft % 60;
                const timerDisplayEl = document.getElementById('timer-display');
                if (timerDisplayEl) {
                    timerDisplayEl.textContent = 
                        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                }
                
                if (timeLeft <= 0) {
                    clearInterval(timerInterval);
                    if (timerDisplayEl) timerDisplayEl.textContent = "时间到!";
                }
            }, 1000);
        });
    }
    
    if (completeBtn) {
        completeBtn.addEventListener('click', function() {
            clearInterval(timerInterval);
            
            // Mark exercise as completed
            if (window.currentExercise) {
                const exerciseId = window.currentExercise.id;
                const abilityId = window.currentExercise.abilityId;
                
                if (!userProgress.completedExercises.includes(exerciseId)) {
                    userProgress.completedExercises.push(exerciseId);
                    
                    // Update ability progress
                    const currentProgress = userProgress.abilitiesProgress[abilityId] || 0;
                    userProgress.abilitiesProgress[abilityId] = Math.min(currentProgress + 20, 100);
                    
                    // Check for new badges
                    checkForNewBadges();
                    
                    // Save progress
                    saveUserProgress();
                    
                    // Update UI
                    displayAbilities();
                    initProgressChart();
                }
            }
            
            alert("练习完成！你的反思已保存到进度日记中。");
            if (timerDisplay) timerDisplay.style.display = 'none';
            if (startBtn) startBtn.style.display = 'inline-block';
            if (skipBtn) skipBtn.style.display = 'inline-block';
            timeLeft = 300;
            const timerDisplayEl = document.getElementById('timer-display');
            if (timerDisplayEl) timerDisplayEl.textContent = "05:00";
            
            // Update stats
            updateStats(1, 0, 0);
            
            // Load new random exercise
            displayRandomExercise();
        });
    }
    
    if (skipBtn) {
        skipBtn.addEventListener('click', function() {
            clearInterval(timerInterval);
            if (timerDisplay) timerDisplay.style.display = 'none';
            if (startBtn) startBtn.style.display = 'inline-block';
            timeLeft = 300;
            const timerDisplayEl = document.getElementById('timer-display');
            if (timerDisplayEl) timerDisplayEl.textContent = "05:00";
            
            displayRandomExercise();
        });
    }
    
    // Signature submission
    const submitBtn = document.getElementById('submit-signature');
    if (submitBtn) {
        submitBtn.addEventListener('click', function() {
            const name = document.getElementById('user-name')?.value.trim();
            const location = document.getElementById('user-location')?.value.trim();
            const commitment = document.getElementById('user-commitment')?.value.trim();
            
            if (!name) {
                alert("请输入您的姓名或昵称。");
                return;
            }
            
            // Create signature element
            const container = document.getElementById('signatures-container');
            if (container) {
                const item = document.createElement('div');
                item.className = 'signature-item';
                item.innerHTML = `
                    <div class="signature-name">${name}</div>
                    <div class="signature-location">${location || '匿名地点'}</div>
                    <div class="signature-commitment">"${commitment || '致力于人类赋能'}"</div>
                `;
                
                // Add to beginning
                container.insertBefore(item, container.firstChild);
                
                // Clear form
                const nameInput = document.getElementById('user-name');
                const locationInput = document.getElementById('user-location');
                const commitmentInput = document.getElementById('user-commitment');
                
                if (nameInput) nameInput.value = '';
                if (locationInput) locationInput.value = '';
                if (commitmentInput) commitmentInput.value = '';
                
                // Update stats
                updateStats(0, 0, 1);
                
                alert("感谢您加入我们的培育者社区！");
            }
        });
    }
    
    // Save reflection
    const saveReflectionBtn = document.getElementById('save-reflection');
    if (saveReflectionBtn) {
        saveReflectionBtn.addEventListener('click', function() {
            const reflectionInput = document.getElementById('reflection-input');
            if (!reflectionInput) return;
            
            const reflection = reflectionInput.value.trim();
            
            if (!reflection) {
                alert("请在保存前写下您的反思。");
                return;
            }
            
            // Add to user progress
            userProgress.reflections.push({
                date: new Date().toISOString().split('T')[0],
                text: reflection
            });
            
            // Save progress
            saveUserProgress();
            
            alert("反思已保存到您的个人日记中！");
            reflectionInput.value = '';
            
            // Update stats
            updateStats(0, 1, 0);
        });
    }
}

// 检查新徽章
function checkForNewBadges() {
    const completedCount = userProgress.completedExercises.length;
    
    // Cultivator badge: 完成3个以上练习
    if (completedCount >= 3 && !userProgress.badges.includes('cultivator')) {
        userProgress.badges.push('cultivator');
        showBadgeNotification('cultivator', '培育者');
    }
    
    // Guardian badge: 完成10个以上练习
    if (completedCount >= 10 && !userProgress.badges.includes('guardian')) {
        userProgress.badges.push('guardian');
        showBadgeNotification('guardian', '守护者');
    }
    
    // Beacon badge: 所有能力进度超过80%
    const allProgress = Object.values(userProgress.abilitiesProgress);
    const averageProgress = allProgress.reduce((a, b) => a + b, 0) / allProgress.length;
    if (averageProgress >= 80 && !userProgress.badges.includes('beacon')) {
        userProgress.badges.push('beacon');
        showBadgeNotification('beacon', '灯塔');
    }
}

// 显示徽章通知
function showBadgeNotification(badgeId, badgeName) {
    const notification = document.createElement('div');
    notification.className = 'badge-notification';
    notification.innerHTML = `
        <div style="position: fixed; top: 20px; right: 20px; background: #4361ee; color: white; padding: 15px; border-radius: 10px; z-index: 10000; box-shadow: 0 5px 15px rgba(0,0,0,0.3);">
            <h4 style="margin: 0 0 10px 0;">🎉 获得新徽章!</h4>
            <p style="margin: 0;">您已获得 <strong>${badgeName}</strong> 徽章!</p>
        </div>
    `;
    document.body.appendChild(notification);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// 全局函数
function startAbilityExercise(abilityId) {
    // Find exercises for this ability
    const exercisesForAbility = globalExercisesData.filter(ex => ex.abilityId === abilityId);
    
    if (exercisesForAbility.length > 0) {
        // Select a random exercise for this ability
        const randomIndex = Math.floor(Math.random() * exercisesForAbility.length);
        const exercise = exercisesForAbility[randomIndex];
        
        // Update UI with this exercise
        const categoryEl = document.getElementById('exercise-category');
        const titleEl = document.getElementById('exercise-title');
        const descEl = document.getElementById('exercise-description');
        const durationEl = document.getElementById('exercise-duration');
        
        if (categoryEl) categoryEl.textContent = exercise.category;
        if (titleEl) titleEl.textContent = exercise.title;
        if (descEl) descEl.textContent = exercise.description;
        if (durationEl) durationEl.textContent = exercise.duration;
        
        // Store current exercise
        window.currentExercise = exercise;
        
        // Scroll to exercise section
        document.getElementById('daily-exercise')?.scrollIntoView({ behavior: 'smooth' });
    } else {
        alert("暂时没有此能力的练习。我们将为您选择一个随机练习。");
        displayRandomExercise();
        document.getElementById('daily-exercise')?.scrollIntoView({ behavior: 'smooth' });
    }
}

function learnMore(abilityId) {
    // Find the ability
    let ability;
    for (const dimension in globalAbilitiesData) {
        const found = globalAbilitiesData[dimension].find(a => a.id === abilityId);
        if (found) {
            ability = found;
            break;
        }
    }
    
    if (ability) {
        const modalContent = `
            <div style="max-width: 600px; background: white; padding: 30px; border-radius: 10px;">
                <h2 style="color: #4361ee; margin-top: 0;">${ability.title}</h2>
                <p><strong>类别:</strong> ${ability.category}</p>
                <p><strong>描述:</strong> ${ability.description}</p>
                <p><strong>AI局限性:</strong> ${ability.aiLimitation}</p>
                <p><strong>哲学基础:</strong> ${ability.philosophicalBasis || '基于人类有限性、具身性和关系性的存在论根基。'}</p>
                <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
                    <button onclick="closeModal()" style="background: #4361ee; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">关闭</button>
                </div>
            </div>
        `;
        
        showModal(modalContent);
    }
}

function showModal(content) {
    // Remove existing modal
    const existingModal = document.querySelector('.modal-overlay');
    if (existingModal) existingModal.remove();
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    
    modal.innerHTML = content;
    document.body.appendChild(modal);
    
    // Close on overlay click
    modal.addEventListener('click', function(e) {
        if (e.target === this) {
            this.remove();
        }
    });
}

function closeModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) modal.remove();
}

function updateStats(exercises = 0, reflections = 0, signatures = 0) {
    // Update the displayed stats
    const exercisesEl = document.getElementById('total-exercises');
    const signaturesEl = document.getElementById('total-signatures');
    
    if (exercisesEl) {
        let currentExercises = parseInt(exercisesEl.textContent.replace(/,/g, '')) || 0;
        exercisesEl.textContent = (currentExercises + exercises).toLocaleString();
    }
    
    if (signaturesEl) {
        let currentSignatures = parseInt(signaturesEl.textContent.replace(/,/g, '')) || 0;
        signaturesEl.textContent = (currentSignatures + signatures).toLocaleString();
    }
    
    // Also update globalUsersData for consistency
    if (globalUsersData.totalExercisesCompleted !== undefined) {
        globalUsersData.totalExercisesCompleted += exercises;
    }
    if (globalUsersData.totalSignatures !== undefined) {
        globalUsersData.totalSignatures += signatures;
    }
}

function updateLiveStats() {
    // Simulate live updates
    const exercisesEl = document.getElementById('total-exercises');
    const signaturesEl = document.getElementById('total-signatures');
    
    if (!exercisesEl || !signaturesEl) return;
    
    let currentExercises = parseInt(exercisesEl.textContent.replace(/,/g, '')) || 0;
    let currentSignatures = parseInt(signaturesEl.textContent.replace(/,/g, '')) || 0;
    
    // Random small increases to simulate community activity
    const exerciseIncrease = Math.floor(Math.random() * 3);
    const signatureIncrease = Math.floor(Math.random() * 2);
    
    exercisesEl.textContent = (currentExercises + exerciseIncrease).toLocaleString();
    signaturesEl.textContent = (currentSignatures + signatureIncrease).toLocaleString();
}

// 备用数据（当JSON文件无法加载时使用）
function getFallbackAbilitiesData() {
    // 这是之前硬编码的数据
    return {
        "emotional": [
            {
                id: 1,
                number: "01",
                category: "Emotional & Meaning",
                title: "Embodied Empathy",
                description: "The capacity for compassion rooted in biological neurochemistry, sensory experience, and life journey.",
                aiLimitation: "Can simulate response patterns but lacks the weight of understanding from embodied pain and ecstasy.",
                icon: "fas fa-heart",
                color: "#4cc9f0",
                exercises: 5,
                philosophicalBasis: "Rooted in our biological existence, this ability emerges from the interplay of mirror neurons, hormonal responses, and lived experience that cannot be algorithmically reproduced."
            },
            // ... 其他能力数据
        ],
        // ... 其他维度数据
    };
}

function getFallbackExercisesData() {
    return [
        {
            id: 1,
            abilityId: 1,
            category: "Embodied Empathy",
            title: "The Mirror of Another's Pain",
            description: "Recall a moment of witnessing someone's genuine pain. Instead of analyzing it, try to feel where in your own body you sense their suffering. Sit with that sensation for 5 minutes without judgment.",
            duration: "10 min"
        },
        // ... 其他练习数据
    ];
}

function getFallbackUsersData() {
    return {
        users: [
            {
                username: "Alex Chen",
                location: "Taipei, Taiwan",
                reflections: [{ text: "Committed to daily embodied empathy practice." }]
            },
            // ... 其他用户数据
        ],
        activeUsers: 1247,
        totalExercisesCompleted: 5935,
        totalSignatures: 907
    };
}
