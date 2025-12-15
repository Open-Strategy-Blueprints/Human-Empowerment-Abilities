/**
 * 人文赋能能力平台 - 仪表板核心模块
 * 版本: 1.0.0
 * 最后更新: 2024-01-15
 * 
 * 功能：
 * 1. 用户进度概览
 * 2. 练习记录管理
 * 3. 数据可视化
 * 4. 成就系统
 * 5. 个性化设置
 */

// 防止全局变量污染
(function() {
    'use strict';
    
    /**
     * 仪表板主类
     */
    class Dashboard {
        constructor() {
            // 配置
            this.config = {
                storageKeys: {
                    photoAnalyses: 'photoAnalyses_v1',
                    characterExplorations: 'characterExplorations_v1',
                    skillHeritages: 'skillHeritages_v1',
                    userProfile: 'userProfile_v1',
                    achievements: 'achievements_v1',
                    settings: 'dashboardSettings_v1'
                },
                achievements: this.getDefaultAchievements(),
                exerciseTypes: ['photo', 'character', 'skill'],
                chartColors: {
                    primary: '#4caf50',
                    secondary: '#2196f3',
                    accent: '#e91e63',
                    success: '#66bb6a',
                    warning: '#ff9800',
                    error: '#f44336'
                }
            };
            
            // 状态
            this.state = {
                currentSection: 'progress',
                isLoading: false,
                userStats: null,
                recentActivities: [],
                achievements: [],
                exercises: {
                    photo: [],
                    character: [],
                    skill: []
                }
            };
            
            // DOM 元素引用
            this.elements = {};
            
            // 存储实例
            this.storage = {
                photo: new PhotoAnalysisStorage(),
                character: new CharacterStorage(),
                skill: new SkillStorage(),
                user: new UserStorage()
            };
            
            // 图表实例
            this.charts = {};
            
            // 初始化
            this.init();
        }
        
        /**
         * 初始化仪表板
         */
        async init() {
            // 绑定 DOM 元素
            this.bindElements();
            
            // 初始化事件监听
            this.initEventListeners();
            
            // 加载数据
            this.state.isLoading = true;
            this.showLoading();
            
            try {
                await this.loadData();
                this.state.isLoading = false;
                this.hideLoading();
                
                // 渲染初始页面
                this.showSection('progress');
                
                // 更新统计数据
                this.updateStats();
                
                // 初始化图表
                this.initCharts();
                
                console.log('仪表板初始化完成');
            } catch (error) {
                console.error('初始化失败:', error);
                this.showAlert('数据加载失败，请刷新页面重试', 'error');
            }
        }
        
        /**
         * 绑定 DOM 元素
         */
        bindElements() {
            this.elements = {
                // 侧边栏
                sidebar: document.querySelector('.sidebar'),
                sidebarLinks: document.querySelectorAll('.sidebar-link'),
                
                // 主要内容区域
                contentArea: document.getElementById('contentArea'),
                
                // 导航菜单项
                navProgress: document.querySelector('[onclick="showSection(\'progress\')"]'),
                navAnalyses: document.querySelector('[onclick="showSection(\'analyses\')"]'),
                navCharacters: document.querySelector('[onclick="showSection(\'characters\')"]'),
                navSkills: document.querySelector('[onclick="showSection(\'skills\')"]'),
                navAchievements: document.querySelector('[onclick="showSection(\'achievements\')"]'),
                navSettings: document.querySelector('[onclick="showSection(\'settings\')"]'),
                
                // 统计卡片容器
                statsContainer: document.getElementById('statsContainer'),
                
                // 图表容器
                chartsContainer: document.getElementById('chartsContainer'),
                
                // 活动列表容器
                activitiesContainer: document.getElementById('activitiesContainer'),
                
                // 加载指示器
                loadingIndicator: document.getElementById('loadingIndicator'),
                
                // 用户信息
                userAvatar: document.getElementById('userAvatar'),
                userName: document.getElementById('userName'),
                userLevel: document.getElementById('userLevel')
            };
        }
        
        /**
         * 初始化事件监听
         */
        initEventListeners() {
            // 侧边栏导航
            this.elements.sidebarLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const section = link.getAttribute('data-section');
                    this.showSection(section);
                });
            });
            
            // 响应式导航切换
            const mobileMenuBtn = document.getElementById('mobileMenuBtn');
            if (mobileMenuBtn) {
                mobileMenuBtn.addEventListener('click', () => {
                    this.elements.sidebar.classList.toggle('active');
                });
            }
            
            // 刷新数据按钮
            const refreshBtn = document.getElementById('refreshBtn');
            if (refreshBtn) {
                refreshBtn.addEventListener('click', () => this.refreshData());
            }
            
            // 导出数据按钮
            const exportAllBtn = document.getElementById('exportAllBtn');
            if (exportAllBtn) {
                exportAllBtn.addEventListener('click', () => this.exportAllData());
            }
            
            // 清除数据按钮
            const clearDataBtn = document.getElementById('clearDataBtn');
            if (clearDataBtn) {
                clearDataBtn.addEventListener('click', () => this.clearAllData());
            }
        }
        
        /**
         * 加载所有数据
         */
        async loadData() {
            return new Promise((resolve, reject) => {
                try {
                    // 加载用户数据
                    const userData = this.storage.user.getUserProfile();
                    
                    // 加载练习数据
                    this.state.exercises.photo = this.storage.photo.getAllAnalyses();
                    this.state.exercises.character = this.storage.character.getAllExplorations();
                    this.state.exercises.skill = this.storage.skill.getAllHeritages();
                    
                    // 计算统计数据
                    this.calculateStats();
                    
                    // 加载成就
                    this.loadAchievements();
                    
                    // 加载最近活动
                    this.loadRecentActivities();
                    
                    // 更新用户界面
                    this.updateUserInfo(userData);
                    
                    resolve();
                } catch (error) {
                    reject(error);
                }
            });
        }
        
        /**
         * 计算统计数据
         */
        calculateStats() {
            const stats = {
                total: {
                    photo: this.state.exercises.photo.length,
                    character: this.state.exercises.character.length,
                    skill: this.state.exercises.skill.length
                },
                recent: {
                    photo: this.getRecentAnalyses(5),
                    character: this.getRecentExplorations(5),
                    skill: this.getRecentHeritages(5)
                },
                completion: {
                    photo: this.calculateCompletionRate('photo'),
                    character: this.calculateCompletionRate('character'),
                    skill: this.calculateCompletionRate('skill')
                },
                insights: {
                    totalCharacters: this.countTotalCharacters(),
                    totalSkills: this.countTotalSkills(),
                    totalInsights: this.countTotalInsights(),
                    avgAnswerLength: this.calculateAverageAnswerLength()
                }
            };
            
            // 计算总体统计数据
            stats.overall = {
                totalExercises: stats.total.photo + stats.total.character + stats.total.skill,
                completionRate: this.calculateOverallCompletionRate(),
                streakDays: this.calculateStreakDays(),
                totalTimeSpent: this.calculateTotalTimeSpent()
            };
            
            this.state.userStats = stats;
        }
        
        /**
         * 加载成就
         */
        loadAchievements() {
            const achievements = this.config.achievements;
            const userAchievements = [];
            
            // 检查照片分析成就
            const photoCount = this.state.exercises.photo.length;
            if (photoCount >= 1) userAchievements.push(achievements.firstPhoto);
            if (photoCount >= 5) userAchievements.push(achievements.photoMaster);
            if (photoCount >= 10) userAchievements.push(achievements.photoExpert);
            
            // 检查角色探索成就
            const characterCount = this.state.exercises.character.length;
            if (characterCount >= 1) userAchievements.push(achievements.firstCharacter);
            if (characterCount >= 3) userAchievements.push(achievements.familyExplorer);
            if (characterCount >= 10) userAchievements.push(achievements.genealogyMaster);
            
            // 检查技能传承成就
            const skillCount = this.state.exercises.skill.length;
            if (skillCount >= 1) userAchievements.push(achievements.firstSkill);
            if (skillCount >= 3) userAchievements.push(achievements.skillCollector);
            if (skillCount >= 10) userAchievements.push(achievements.heritageGuardian);
            
            // 检查深度思考成就
            if (this.state.userStats?.insights.totalInsights >= 20) {
                userAchievements.push(achievements.deepThinker);
            }
            
            // 检查连续使用成就
            if (this.state.userStats?.overall.streakDays >= 7) {
                userAchievements.push(achievements.weeklyStreak);
            }
            
            this.state.achievements = userAchievements;
        }
        
        /**
         * 加载最近活动
         */
        loadRecentActivities() {
            const activities = [];
            
            // 合并所有类型的活动
            ['photo', 'character', 'skill'].forEach(type => {
                const items = this.state.exercises[type].slice(-3); // 取最近3个
                items.forEach(item => {
                    activities.push({
                        type: type,
                        title: this.getActivityTitle(type, item),
                        description: this.getActivityDescription(item),
                        timestamp: item.createdAt || item.updatedAt,
                        icon: this.getActivityIcon(type)
                    });
                });
            });
            
            // 按时间排序（最新的在前面）
            activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            
            // 限制数量
            this.state.recentActivities = activities.slice(0, 10);
        }
        
        /**
         * 获取活动标题
         */
        getActivityTitle(type, item) {
            const titles = {
                photo: `照片分析：${item.photoData?.name || '未命名照片'}`,
                character: `角色探索：${item.characterName || '未命名角色'}`,
                skill: `技能传承：${item.skillName || '未命名技能'}`
            };
            return titles[type] || '未知活动';
        }
        
        /**
         * 获取活动描述
         */
        getActivityDescription(item) {
            if (item.answers && Object.keys(item.answers).length > 0) {
                return `记录了 ${Object.keys(item.answers).length} 条思考`;
            }
            return '开始新的探索';
        }
        
        /**
         * 获取活动图标
         */
        getActivityIcon(type) {
            const icons = {
                photo: '📸',
                character: '👤',
                skill: '🔧'
            };
            return icons[type] || '📝';
        }
        
        /**
         * 更新用户信息
         */
        updateUserInfo(userData) {
            if (this.elements.userName) {
                this.elements.userName.textContent = userData.name || '探索者';
            }
            
            if (this.elements.userLevel) {
                const totalAchievements = this.state.achievements.length;
                const level = Math.floor(totalAchievements / 3) + 1;
                this.elements.userLevel.textContent = `Lv. ${level}`;
            }
            
            if (this.elements.userAvatar) {
                // 可以在这里设置用户头像
                this.elements.userAvatar.textContent = userData.avatar || '👤';
            }
        }
        
        /**
         * 显示指定部分
         */
        showSection(sectionId) {
            // 更新当前部分
            this.state.currentSection = sectionId;
            
            // 更新侧边栏激活状态
            this.updateSidebarActive(sectionId);
            
            // 根据部分ID渲染内容
            switch(sectionId) {
                case 'progress':
                    this.renderProgressOverview();
                    break;
                case 'analyses':
                    this.renderPhotoAnalyses();
                    break;
                case 'characters':
                    this.renderCharacterExplorations();
                    break;
                case 'skills':
                    this.renderSkillHeritages();
                    break;
                case 'achievements':
                    this.renderAchievements();
                    break;
                case 'settings':
                    this.renderSettings();
                    break;
                default:
                    this.renderProgressOverview();
            }
            
            // 如果是移动端，关闭侧边栏
            if (window.innerWidth <= 768) {
                this.elements.sidebar.classList.remove('active');
            }
        }
        
        /**
         * 更新侧边栏激活状态
         */
        updateSidebarActive(sectionId) {
            this.elements.sidebarLinks.forEach(link => {
                const linkSection = link.getAttribute('data-section');
                if (linkSection === sectionId) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });
        }
        
        /**
         * 渲染进度总览
         */
        renderProgressOverview() {
            if (!this.state.userStats) return;
            
            const stats = this.state.userStats;
            
            const html = `
                <div class="dashboard-header animate-fade-in">
                    <h1 class="text-2xl font-bold text-gray-800">个人成长进度</h1>
                    <p class="text-gray-600">欢迎回来！以下是您的学习进展</p>
                </div>
                
                <div class="dashboard-stats animate-fade-in" style="animation-delay: 0.1s">
                    <div class="dashboard-stat">
                        <div class="dashboard-stat-icon">📊</div>
                        <div class="dashboard-stat-value">${stats.overall.totalExercises}</div>
                        <div class="dashboard-stat-label">总练习次数</div>
                    </div>
                    
                    <div class="dashboard-stat">
                        <div class="dashboard-stat-icon">✅</div>
                        <div class="dashboard-stat-value">${stats.overall.completionRate}%</div>
                        <div class="dashboard-stat-label">整体完成率</div>
                    </div>
                    
                    <div class="dashboard-stat">
                        <div class="dashboard-stat-icon">🔥</div>
                        <div class="dashboard-stat-value">${stats.overall.streakDays}</div>
                        <div class="dashboard-stat-label">连续学习天数</div>
                    </div>
                    
                    <div class="dashboard-stat">
                        <div class="dashboard-stat-icon">⭐</div>
                        <div class="dashboard-stat-value">${this.state.achievements.length}</div>
                        <div class="dashboard-stat-label">获得成就</div>
                    </div>
                </div>
                
                <div class="grid grid-1 md:grid-2 gap-6 mt-6">
                    <div class="card animate-slide-in-up" style="animation-delay: 0.2s">
                        <div class="card-header">
                            <h3 class="card-title">📈 练习分布</h3>
                        </div>
                        <div class="card-body">
                            <div id="exerciseDistributionChart" style="height: 300px;"></div>
                        </div>
                    </div>
                    
                    <div class="card animate-slide-in-up" style="animation-delay: 0.3s">
                        <div class="card-header">
                            <h3 class="card-title">🎯 完成度分析</h3>
                        </div>
                        <div class="card-body">
                            <div id="completionChart" style="height: 300px;"></div>
                        </div>
                    </div>
                </div>
                
                <div class="card mt-6 animate-slide-in-up" style="animation-delay: 0.4s">
                    <div class="card-header">
                        <h3 class="card-title">📝 最近活动</h3>
                    </div>
                    <div class="card-body">
                        ${this.renderRecentActivitiesList()}
                    </div>
                </div>
                
                <div class="grid grid-1 md:grid-3 gap-6 mt-6">
                    <div class="card animate-slide-in-up" style="animation-delay: 0.5s">
                        <div class="card-header">
                            <h3 class="card-title">📸 照片分析</h3>
                            <p class="card-subtitle">挖掘家族记忆</p>
                        </div>
                        <div class="card-body">
                            <div class="text-center py-4">
                                <div class="text-4xl mb-2">${stats.total.photo}</div>
                                <div class="text-gray-600">已完成的分析</div>
                            </div>
                            <div class="mt-4">
                                <a href="exercises/photo-analyzer.html" class="btn btn-primary w-full">
                                    继续分析照片
                                </a>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card animate-slide-in-up" style="animation-delay: 0.6s">
                        <div class="card-header">
                            <h3 class="card-title">👥 角色探索</h3>
                            <p class="card-subtitle">了解家族人物</p>
                        </div>
                        <div class="card-body">
                            <div class="text-center py-4">
                                <div class="text-4xl mb-2">${stats.total.character}</div>
                                <div class="text-gray-600">已探索的角色</div>
                            </div>
                            <div class="mt-4">
                                <a href="exercises/character-explorer.html" class="btn btn-secondary w-full">
                                    继续探索角色
                                </a>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card animate-slide-in-up" style="animation-delay: 0.7s">
                        <div class="card-header">
                            <h3 class="card-title">🔧 技能传承</h3>
                            <p class="card-subtitle">传承家族技艺</p>
                        </div>
                        <div class="card-body">
                            <div class="text-center py-4">
                                <div class="text-4xl mb-2">${stats.total.skill}</div>
                                <div class="text-gray-600">已记录的技能</div>
                            </div>
                            <div class="mt-4">
                                <a href="exercises/skill-heritage.html" class="btn btn-accent w-full">
                                    继续记录技能
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            this.elements.contentArea.innerHTML = html;
            
            // 初始化图表
            setTimeout(() => {
                this.renderExerciseDistributionChart();
                this.renderCompletionChart();
            }, 100);
        }
        
        /**
         * 渲染最近活动列表
         */
        renderRecentActivitiesList() {
            if (this.state.recentActivities.length === 0) {
                return `
                    <div class="empty-state">
                        <div class="empty-state-icon">📝</div>
                        <p class="empty-state-title">暂无活动记录</p>
                        <p class="empty-state-description">开始您的第一个练习，活动记录将在这里显示</p>
                    </div>
                `;
            }
            
            return `
                <div class="space-y-4">
                    ${this.state.recentActivities.map(activity => `
                        <div class="activity-item flex items-start p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <div class="activity-icon text-2xl mr-3">${activity.icon}</div>
                            <div class="flex-1">
                                <div class="flex justify-between items-start">
                                    <div>
                                        <h4 class="font-medium text-gray-800">${activity.title}</h4>
                                        <p class="text-sm text-gray-600">${activity.description}</p>
                                    </div>
                                    <span class="text-xs text-gray-500">
                                        ${this.formatDate(activity.timestamp)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        /**
         * 渲染照片分析列表
         */
        renderPhotoAnalyses() {
            const analyses = this.state.exercises.photo;
            
            const html = `
                <div class="dashboard-header">
                    <h1 class="text-2xl font-bold text-gray-800">照片分析记录</h1>
                    <p class="text-gray-600">查看和管理您的老照片分析</p>
                </div>
                
                <div class="flex justify-between items-center mb-6">
                    <div>
                        <span class="text-gray-600">共 ${analyses.length} 个分析记录</span>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="dashboard.refreshData()" class="btn btn-secondary">
                            🔄 刷新
                        </button>
                        <button onclick="dashboard.exportPhotoAnalyses()" class="btn btn-primary">
                            📤 导出所有
                        </button>
                    </div>
                </div>
                
                ${analyses.length === 0 ? `
                    <div class="empty-state">
                        <div class="empty-state-icon">📸</div>
                        <p class="empty-state-title">暂无照片分析记录</p>
                        <p class="empty-state-description">开始您的第一个老照片分析，记录将在这里显示</p>
                        <div class="mt-4">
                            <a href="exercises/photo-analyzer.html" class="btn btn-primary">
                                开始照片分析
                            </a>
                        </div>
                    </div>
                ` : `
                    <div class="grid grid-1 md:grid-2 lg:grid-3 gap-6">
                        ${analyses.map(analysis => `
                            <div class="card hover:shadow-lg transition-shadow">
                                <div class="card-header">
                                    <div class="flex justify-between items-start">
                                        <h4 class="card-title truncate">${analysis.photoData?.name || '未命名照片'}</h4>
                                        <span class="badge ${analysis.completed ? 'badge-success' : 'badge-warning'}">
                                            ${analysis.completed ? '已完成' : '进行中'}
                                        </span>
                                    </div>
                                    <p class="card-subtitle">${this.formatDate(analysis.createdAt)}</p>
                                </div>
                                <div class="card-body">
                                    ${analysis.photo ? `
                                        <img src="${analysis.photo}" 
                                             alt="照片预览" 
                                             class="w-full h-40 object-cover rounded-md mb-3">
                                    ` : ''}
                                    
                                    <div class="mb-3">
                                        <div class="flex justify-between text-sm text-gray-600 mb-1">
                                            <span>问题回答：</span>
                                            <span>${Object.keys(analysis.answers || {}).length} / 5</span>
                                        </div>
                                        <div class="progress">
                                            <div class="progress-bar" style="width: ${(Object.keys(analysis.answers || {}).length / 5) * 100}%"></div>
                                        </div>
                                    </div>
                                    
                                    ${analysis.answers && analysis.answers[1] ? `
                                        <p class="text-sm text-gray-700 mb-3 truncate-3-lines">
                                            ${analysis.answers[1].substring(0, 100)}...
                                        </p>
                                    ` : ''}
                                </div>
                                <div class="card-footer">
                                    <div class="flex justify-between">
                                        <button onclick="dashboard.viewAnalysis(${analysis.id})" 
                                                class="btn btn-sm btn-primary">
                                            查看详情
                                        </button>
                                        <button onclick="dashboard.deleteAnalysis(${analysis.id})" 
                                                class="btn btn-sm btn-outline text-gray-600">
                                            删除
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `}
            `;
            
            this.elements.contentArea.innerHTML = html;
        }
        
        /**
         * 渲染角色探索列表
         */
        renderCharacterExplorations() {
            const explorations = this.state.exercises.character;
            
            const html = `
                <div class="dashboard-header">
                    <h1 class="text-2xl font-bold text-gray-800">角色探索记录</h1>
                    <p class="text-gray-600">查看和管理您的家族角色探索</p>
                </div>
                
                ${explorations.length === 0 ? `
                    <div class="empty-state">
                        <div class="empty-state-icon">👤</div>
                        <p class="empty-state-title">暂无角色探索记录</p>
                        <p class="empty-state-description">开始探索家族人物，了解他们的故事和影响</p>
                        <div class="mt-4">
                            <a href="exercises/character-explorer.html" class="btn btn-secondary">
                                开始角色探索
                            </a>
                        </div>
                    </div>
                ` : `
                    <div class="grid grid-1 md:grid-2 gap-6">
                        ${explorations.map(exploration => `
                            <div class="card">
                                <div class="card-header">
                                    <h4 class="card-title">${exploration.characterName || '未命名角色'}</h4>
                                    <p class="card-subtitle">${exploration.relationship || '未知关系'}</p>
                                </div>
                                <div class="card-body">
                                    <div class="flex items-center mb-4">
                                        <div class="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-2xl mr-4">
                                            ${exploration.avatar || '👤'}
                                        </div>
                                        <div>
                                            <p class="font-medium">${exploration.generation || '未知辈分'}</p>
                                            <p class="text-sm text-gray-600">${exploration.birthYear ? `生于 ${exploration.birthYear}` : '年代不详'}</p>
                                        </div>
                                    </div>
                                    
                                    ${exploration.story ? `
                                        <p class="text-sm text-gray-700 mb-3 truncate-3-lines">
                                            ${exploration.story.substring(0, 150)}...
                                        </p>
                                    ` : ''}
                                    
                                    <div class="flex flex-wrap gap-1 mt-2">
                                        ${(exploration.traits || []).slice(0, 3).map(trait => `
                                            <span class="badge badge-primary">${trait}</span>
                                        `).join('')}
                                        ${(exploration.traits || []).length > 3 ? `<span class="badge">+${exploration.traits.length - 3}</span>` : ''}
                                    </div>
                                </div>
                                <div class="card-footer">
                                    <div class="flex justify-between">
                                        <button onclick="dashboard.viewCharacter(${exploration.id})" 
                                                class="btn btn-sm btn-secondary">
                                            查看详情
                                        </button>
                                        <button onclick="dashboard.deleteCharacter(${exploration.id})" 
                                                class="btn btn-sm btn-outline text-gray-600">
                                            删除
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `}
            `;
            
            this.elements.contentArea.innerHTML = html;
        }
        
        /**
         * 渲染技能传承列表
         */
        renderSkillHeritages() {
            const heritages = this.state.exercises.skill;
            
            const html = `
                <div class="dashboard-header">
                    <h1 class="text-2xl font-bold text-gray-800">技能传承记录</h1>
                    <p class="text-gray-600">查看和管理您的家族技能传承</p>
                </div>
                
                ${heritages.length === 0 ? `
                    <div class="empty-state">
                        <div class="empty-state-icon">🔧</div>
                        <p class="empty-state-title">暂无技能传承记录</p>
                        <p class="empty-state-description">开始记录家族技艺，传承宝贵的技能财富</p>
                        <div class="mt-4">
                            <a href="exercises/skill-heritage.html" class="btn btn-accent">
                                开始技能传承
                            </a>
                        </div>
                    </div>
                ` : `
                    <div class="grid grid-1 md:grid-2 lg:grid-3 gap-6">
                        ${heritages.map(heritage => `
                            <div class="card">
                                <div class="card-header">
                                    <h4 class="card-title">${heritage.skillName || '未命名技能'}</h4>
                                    <p class="card-subtitle">${heritage.category || '生活技能'}</p>
                                </div>
                                <div class="card-body">
                                    <div class="mb-3">
                                        <div class="text-sm text-gray-600 mb-1">传承来源：</div>
                                        <div class="font-medium">${heritage.source || '未知'}</div>
                                    </div>
                                    
                                    ${heritage.description ? `
                                        <div class="mb-3">
                                            <div class="text-sm text-gray-600 mb-1">技能描述：</div>
                                            <p class="text-sm text-gray-700 truncate-3-lines">
                                                ${heritage.description.substring(0, 100)}...
                                            </p>
                                        </div>
                                    ` : ''}
                                    
                                    <div class="flex justify-between text-sm">
                                        <div>
                                            <div class="text-gray-600">难度</div>
                                            <div class="font-medium">${heritage.difficulty || '中等'}</div>
                                        </div>
                                        <div>
                                            <div class="text-gray-600">重要性</div>
                                            <div class="font-medium">${heritage.importance || '一般'}</div>
                                        </div>
                                        <div>
                                            <div class="text-gray-600">掌握程度</div>
                                            <div class="font-medium">${heritage.proficiency || '学习中'}</div>
                                        </div>
                                    </div>
                                </div>
                                <div class="card-footer">
                                    <div class="flex justify-between">
                                        <button onclick="dashboard.viewSkill(${heritage.id})" 
                                                class="btn btn-sm btn-accent">
                                            查看详情
                                        </button>
                                        <button onclick="dashboard.deleteSkill(${heritage.id})" 
                                                class="btn btn-sm btn-outline text-gray-600">
                                            删除
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `}
            `;
            
            this.elements.contentArea.innerHTML = html;
        }
        
        /**
         * 渲染成就页面
         */
        renderAchievements() {
            const achievements = this.state.achievements;
            const allAchievements = Object.values(this.config.achievements);
            
            const html = `
                <div class="dashboard-header">
                    <h1 class="text-2xl font-bold text-gray-800">成就系统</h1>
                    <p class="text-gray-600">通过完成练习解锁成就，记录您的成长历程</p>
                </div>
                
                <div class="mb-8">
                    <div class="card">
                        <div class="card-body">
                            <div class="flex items-center justify-between">
                                <div>
                                    <h3 class="font-bold text-lg text-gray-800">成就进度</h3>
                                    <p class="text-gray-600">已解锁 ${achievements.length} / ${allAchievements.length} 个成就</p>
                                </div>
                                <div class="text-3xl">🏆</div>
                            </div>
                            <div class="mt-4">
                                <div class="progress">
                                    <div class="progress-bar" style="width: ${(achievements.length / allAchievements.length) * 100}%"></div>
                                </div>
                                <div class="flex justify-between text-sm text-gray-600 mt-1">
                                    <span>0%</span>
                                    <span>${Math.round((achievements.length / allAchievements.length) * 100)}%</span>
                                    <span>100%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="grid grid-1 md:grid-2 lg:grid-3 gap-6">
                    ${allAchievements.map(achievement => {
                        const isUnlocked = achievements.some(a => a.id === achievement.id);
                        
                        return `
                            <div class="card ${isUnlocked ? '' : 'opacity-60'}" 
                                 title="${isUnlocked ? '已解锁' : '未解锁'}">
                                <div class="card-body">
                                    <div class="flex items-start">
                                        <div class="text-3xl mr-4 ${isUnlocked ? '' : 'grayscale'}">
                                            ${achievement.icon}
                                        </div>
                                        <div class="flex-1">
                                            <h4 class="font-bold text-gray-800">${achievement.name}</h4>
                                            <p class="text-sm text-gray-600 mt-1">${achievement.description}</p>
                                            <div class="mt-3">
                                                <span class="badge ${isUnlocked ? 'badge-success' : 'badge-secondary'}">
                                                    ${isUnlocked ? '已解锁' : '未解锁'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
            
            this.elements.contentArea.innerHTML = html;
        }
        
        /**
         * 渲染设置页面
         */
        renderSettings() {
            const settings = this.storage.user.getSettings();
            
            const html = `
                <div class="dashboard-header">
                    <h1 class="text-2xl font-bold text-gray-800">个人设置</h1>
                    <p class="text-gray-600">自定义您的学习体验</p>
                </div>
                
                <div class="grid grid-1 md:grid-2 gap-6">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">👤 个人信息</h3>
                        </div>
                        <div class="card-body">
                            <form id="profileForm">
                                <div class="form-group">
                                    <label class="form-label">昵称</label>
                                    <input type="text" 
                                           class="form-control" 
                                           id="nicknameInput"
                                           value="${settings.nickname || ''}"
                                           placeholder="请输入您的昵称">
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">个人签名</label>
                                    <textarea class="form-control" 
                                              id="bioInput"
                                              rows="3"
                                              placeholder="介绍一下自己...">${settings.bio || ''}</textarea>
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">学习目标</label>
                                    <select class="form-control" id="goalSelect">
                                        <option value="casual" ${settings.goal === 'casual' ? 'selected' : ''}>
                                            轻松学习，享受过程
                                        </option>
                                        <option value="serious" ${settings.goal === 'serious' ? 'selected' : ''}>
                                            认真记录，建立家族档案
                                        </option>
                                        <option value="research" ${settings.goal === 'research' ? 'selected' : ''}>
                                            深入研究，探索家族历史
                                        </option>
                                    </select>
                                </div>
                                
                                <button type="button" 
                                        onclick="dashboard.saveProfile()"
                                        class="btn btn-primary w-full">
                                    保存个人信息
                                </button>
                            </form>
                        </div>
                    </div>
                    
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">⚙️ 系统设置</h3>
                        </div>
                        <div class="card-body">
                            <div class="space-y-4">
                                <div class="flex items-center justify-between">
                                    <div>
                                        <div class="font-medium">自动保存</div>
                                        <div class="text-sm text-gray-600">完成练习后自动保存数据</div>
                                    </div>
                                    <label class="switch">
                                        <input type="checkbox" 
                                               id="autoSaveToggle"
                                               ${settings.autoSave ? 'checked' : ''}>
                                        <span class="slider"></span>
                                    </label>
                                </div>
                                
                                <div class="flex items-center justify-between">
                                    <div>
                                        <div class="font-medium">数据备份提醒</div>
                                        <div class="text-sm text-gray-600">定期提醒备份重要数据</div>
                                    </div>
                                    <label class="switch">
                                        <input type="checkbox" 
                                               id="backupReminderToggle"
                                               ${settings.backupReminder ? 'checked' : ''}>
                                        <span class="slider"></span>
                                    </label>
                                </div>
                                
                                <div class="flex items-center justify-between">
                                    <div>
                                        <div class="font-medium">暗色模式</div>
                                        <div class="text-sm text-gray-600">使用深色主题界面</div>
                                    </div>
                                    <label class="switch">
                                        <input type="checkbox" 
                                               id="darkModeToggle"
                                               ${settings.darkMode ? 'checked' : ''}>
                                        <span class="slider"></span>
                                    </label>
                                </div>
                                
                                <div class="pt-4 border-t">
                                    <button type="button" 
                                            onclick="dashboard.saveSettings()"
                                            class="btn btn-secondary w-full mb-3">
                                        保存系统设置
                                    </button>
                                    
                                    <button type="button" 
                                            onclick="dashboard.exportAllData()"
                                            class="btn btn-outline w-full mb-3">
                                        📤 导出所有数据
                                    </button>
                                    
                                    <button type="button" 
                                            onclick="dashboard.clearAllData()"
                                            class="btn btn-outline text-red-600 w-full">
                                        🗑️ 清除所有数据
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="card mt-6">
                    <div class="card-header">
                        <h3 class="card-title">📊 数据统计</h3>
                    </div>
                    <div class="card-body">
                        <div class="grid grid-2 md:grid-4 gap-4">
                            <div class="text-center p-4 bg-gray-50 rounded-lg">
                                <div class="text-2xl font-bold text-primary-600">
                                    ${this.state.userStats?.overall.totalExercises || 0}
                                </div>
                                <div class="text-sm text-gray-600">总练习次数</div>
                            </div>
                            
                            <div class="text-center p-4 bg-gray-50 rounded-lg">
                                <div class="text-2xl font-bold text-secondary-600">
                                    ${this.state.userStats?.insights.totalCharacters || 0}
                                </div>
                                <div class="text-sm text-gray-600">记录人物</div>
                            </div>
                            
                            <div class="text-center p-4 bg-gray-50 rounded-lg">
                                <div class="text-2xl font-bold text-accent-600">
                                    ${this.state.userStats?.insights.totalSkills || 0}
                                </div>
                                <div class="text-sm text-gray-600">传承技能</div>
                            </div>
                            
                            <div class="text-center p-4 bg-gray-50 rounded-lg">
                                <div class="text-2xl font-bold text-warning-600">
                                    ${this.state.achievements.length || 0}
                                </div>
                                <div class="text-sm text-gray-600">获得成就</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            this.elements.contentArea.innerHTML = html;
        }
        
        /**
         * 初始化图表
         */
        initCharts() {
            // 延迟初始化，确保DOM已加载
            setTimeout(() => {
                this.renderExerciseDistributionChart();
                this.renderCompletionChart();
            }, 500);
        }
        
        /**
         * 渲染练习分布图表
         */
        renderExerciseDistributionChart() {
            const container = document.getElementById('exerciseDistributionChart');
            if (!container || !this.state.userStats) return;
            
            const stats = this.state.userStats;
            
            // 简单的SVG饼图
            const total = stats.total.photo + stats.total.character + stats.total.skill;
            if (total === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">📊</div>
                        <p class="empty-state-title">暂无数据</p>
                        <p class="empty-state-description">开始练习后，图表将在这里显示</p>
                    </div>
                `;
                return;
            }
            
            const radius = 80;
            const center = radius + 10;
            const circumference = 2 * Math.PI * radius;
            
            const data = [
                { label: '照片分析', value: stats.total.photo, color: this.config.chartColors.primary },
                { label: '角色探索', value: stats.total.character, color: this.config.chartColors.secondary },
                { label: '技能传承', value: stats.total.skill, color: this.config.chartColors.accent }
            ];
            
            let accumulatedAngle = 0;
            const segments = [];
            
            data.forEach(item => {
                if (item.value > 0) {
                    const percentage = item.value / total;
                    const angle = percentage * 360;
                    const dashArray = (percentage * circumference).toFixed(2);
                    const dashOffset = (accumulatedAngle / 360 * circumference).toFixed(2);
                    
                    segments.push({
                        ...item,
                        percentage: (percentage * 100).toFixed(1),
                        dashArray,
                        dashOffset,
                        angle
                    });
                    
                    accumulatedAngle += angle;
                }
            });
            
            container.innerHTML = `
                <div class="flex flex-col md:flex-row items-center justify-center">
                    <div class="relative mb-6 md:mb-0 md:mr-8">
                        <svg width="${center * 2}" height="${center * 2}">
                            ${segments.map(segment => `
                                <circle cx="${center}" cy="${center}" r="${radius}"
                                        fill="none"
                                        stroke="${segment.color}"
                                        stroke-width="20"
                                        stroke-dasharray="${segment.dashArray} ${circumference - segment.dashArray}"
                                        stroke-dashoffset="${segment.dashOffset}"
                                        transform="rotate(-90 ${center} ${center})" />
                            `).join('')}
                            <text x="${center}" y="${center}" 
                                  text-anchor="middle" 
                                  dominant-baseline="middle"
                                  class="text-2xl font-bold">
                                ${total}
                            </text>
                            <text x="${center}" y="${center + 20}" 
                                  text-anchor="middle" 
                                  class="text-sm text-gray-600">
                                总计
                            </text>
                        </svg>
                    </div>
                    
                    <div class="space-y-3">
                        ${segments.map(segment => `
                            <div class="flex items-center">
                                <div class="w-4 h-4 rounded mr-3" style="background-color: ${segment.color}"></div>
                                <div class="flex-1">
                                    <div class="flex justify-between">
                                        <span class="text-sm font-medium">${segment.label}</span>
                                        <span class="text-sm text-gray-600">${segment.value}次</span>
                                    </div>
                                    <div class="w-full bg-gray-200 rounded-full h-2 mt-1">
                                        <div class="h-2 rounded-full" 
                                             style="width: ${segment.percentage}%; background-color: ${segment.color}"></div>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        /**
         * 渲染完成度图表
         */
        renderCompletionChart() {
            const container = document.getElementById('completionChart');
            if (!container || !this.state.userStats) return;
            
            const stats = this.state.userStats;
            
            const data = [
                { label: '照片分析', value: stats.completion.photo, color: this.config.chartColors.primary },
                { label: '角色探索', value: stats.completion.character, color: this.config.chartColors.secondary },
                { label: '技能传承', value: stats.completion.skill, color: this.config.chartColors.accent }
            ];
            
            container.innerHTML = `
                <div class="space-y-6">
                    ${data.map(item => `
                        <div>
                            <div class="flex justify-between mb-1">
                                <span class="text-sm font-medium">${item.label}</span>
                                <span class="text-sm font-bold" style="color: ${item.color}">${item.value}%</span>
                            </div>
                            <div class="w-full bg-gray-200 rounded-full h-4">
                                <div class="h-4 rounded-full transition-all duration-1000 ease-out"
                                     style="width: ${item.value}%; background-color: ${item.color}">
                                </div>
                            </div>
                        </div>
                    `).join('')}
                    
                    <div class="pt-4 border-t">
                        <div class="flex justify-between mb-1">
                            <span class="text-sm font-medium">整体完成度</span>
                            <span class="text-sm font-bold text-primary-600">${stats.overall.completionRate}%</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-6">
                            <div class="h-6 rounded-full transition-all duration-1000 ease-out"
                                 style="width: ${stats.overall.completionRate}%; background: linear-gradient(90deg, ${this.config.chartColors.primary}, ${this.config.chartColors.accent})">
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
        
        /**
         * 刷新数据
         */
        async refreshData() {
            this.showLoading();
            this.state.isLoading = true;
            
            try {
                await this.loadData();
                this.showSection(this.state.currentSection);
                this.showAlert('数据已刷新', 'success');
            } catch (error) {
                console.error('刷新失败:', error);
                this.showAlert('刷新失败，请重试', 'error');
            } finally {
                this.hideLoading();
                this.state.isLoading = false;
            }
        }
        
        /**
         * 保存个人资料
         */
        saveProfile() {
            const nickname = document.getElementById('nicknameInput')?.value || '';
            const bio = document.getElementById('bioInput')?.value || '';
            const goal = document.getElementById('goalSelect')?.value || 'casual';
            
            this.storage.user.updateProfile({
                nickname,
                bio,
                goal
            });
            
            this.showAlert('个人信息已保存', 'success');
        }
        
        /**
         * 保存设置
         */
        saveSettings() {
            const autoSave = document.getElementById('autoSaveToggle')?.checked || false;
            const backupReminder = document.getElementById('backupReminderToggle')?.checked || false;
            const darkMode = document.getElementById('darkModeToggle')?.checked || false;
            
            this.storage.user.updateSettings({
                autoSave,
                backupReminder,
                darkMode
            });
            
            // 应用暗色模式
            if (darkMode) {
                document.body.classList.add('dark-mode');
            } else {
                document.body.classList.remove('dark-mode');
            }
            
            this.showAlert('系统设置已保存', 'success');
        }
        
        /**
         * 导出所有数据
         */
        exportAllData() {
            const confirmExport = confirm('是否导出所有数据（包括照片分析、角色探索、技能传承）？');
            if (!confirmExport) return;
            
            const exportData = {
                exportDate: new Date().toISOString(),
                version: '1.0.0',
                platform: '人文赋能能力平台',
                
                photoAnalyses: this.state.exercises.photo,
                characterExplorations: this.state.exercises.character,
                skillHeritages: this.state.exercises.skill,
                
                userProfile: this.storage.user.getUserProfile(),
                achievements: this.state.achievements,
                stats: this.state.userStats
            };
            
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
                type: 'application/json' 
            });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `人文赋能平台数据备份_${new Date().getTime()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showAlert('所有数据已导出为JSON文件', 'success');
        }
        
        /**
         * 导出照片分析数据
         */
        exportPhotoAnalyses() {
            const exportData = this.storage.photo.exportAllAnalyses();
            
            const blob = new Blob([exportData], { 
                type: 'application/json' 
            });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `照片分析数据备份_${new Date().getTime()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showAlert('照片分析数据已导出', 'success');
        }
        
        /**
         * 清除所有数据
         */
        clearAllData() {
            const confirmClear = confirm('⚠️  警告：这将删除所有练习记录、个人数据和设置！\n\n此操作不可撤销，确定要继续吗？');
            if (!confirmClear) return;
            
            const confirmAgain = confirm('再次确认：您确定要删除所有数据吗？');
            if (!confirmAgain) return;
            
            // 清除所有存储
            this.storage.photo.clearAll();
            this.storage.character.clearAll();
            this.storage.skill.clearAll();
            this.storage.user.clearAll();
            
            // 重置状态
            this.state.exercises = {
                photo: [],
                character: [],
                skill: []
            };
            
            this.calculateStats();
            this.loadAchievements();
            this.loadRecentActivities();
            
            // 刷新当前页面
            this.showSection(this.state.currentSection);
            
            this.showAlert('所有数据已清除', 'info');
        }
        
        /**
         * 查看分析详情
         */
        viewAnalysis(id) {
            // 在实际应用中，这里可以跳转到详情页面
            // 暂时用弹窗显示
            const analysis = this.storage.photo.getAnalysis(id);
            if (analysis) {
                alert(`查看分析：${analysis.photoData?.name || '未命名'}\n\n创建时间：${this.formatDate(analysis.createdAt)}`);
            }
        }
        
        /**
         * 删除分析
         */
        deleteAnalysis(id) {
            const confirmDelete = confirm('确定要删除这个分析记录吗？');
            if (!confirmDelete) return;
            
            this.storage.photo.deleteAnalysis(id);
            this.refreshData();
            this.showAlert('分析记录已删除', 'success');
        }
        
        /**
         * 查看角色详情
         */
        viewCharacter(id) {
            // 在实际应用中，这里可以跳转到详情页面
            const character = this.storage.character.getExploration(id);
            if (character) {
                alert(`查看角色：${character.characterName || '未命名'}\n\n关系：${character.relationship || '未知'}`);
            }
        }
        
        /**
         * 删除角色
         */
        deleteCharacter(id) {
            const confirmDelete = confirm('确定要删除这个角色探索记录吗？');
            if (!confirmDelete) return;
            
            this.storage.character.deleteExploration(id);
            this.refreshData();
            this.showAlert('角色记录已删除', 'success');
        }
        
        /**
         * 查看技能详情
         */
        viewSkill(id) {
            // 在实际应用中，这里可以跳转到详情页面
            const skill = this.storage.skill.getHeritage(id);
            if (skill) {
                alert(`查看技能：${skill.skillName || '未命名'}\n\n类别：${skill.category || '生活技能'}`);
            }
        }
        
        /**
         * 删除技能
         */
        deleteSkill(id) {
            const confirmDelete = confirm('确定要删除这个技能传承记录吗？');
            if (!confirmDelete) return;
            
            this.storage.skill.deleteHeritage(id);
            this.refreshData();
            this.showAlert('技能记录已删除', 'success');
        }
        
        /**
         * 更新统计数据
         */
        updateStats() {
            if (!this.elements.statsContainer) return;
            
            const stats = this.state.userStats;
            if (!stats) return;
            
            const statsHTML = `
                <div class="stats-grid">
                    <div class="stat-card animate-fade-in">
                        <h3>📸 照片分析</h3>
                        <div class="text-3xl font-bold text-primary-600 my-3">${stats.total.photo}</div>
                        <p class="text-sm text-gray-600">已完成的分析数量</p>
                        <div class="mt-2">
                            <span class="badge badge-primary">${stats.completion.photo}% 完成度</span>
                        </div>
                    </div>
                    
                    <div class="stat-card animate-fade-in" style="animation-delay: 0.1s">
                        <h3>👥 角色探索</h3>
                        <div class="text-3xl font-bold text-secondary-600 my-3">${stats.total.character}</div>
                        <p class="text-sm text-gray-600">已探索的角色数量</p>
                        <div class="mt-2">
                            <span class="badge badge-secondary">${stats.completion.character}% 完成度</span>
                        </div>
                    </div>
                    
                    <div class="stat-card animate-fade-in" style="animation-delay: 0.2s">
                        <h3>🔧 技能传承</h3>
                        <div class="text-3xl font-bold text-accent-600 my-3">${stats.total.skill}</div>
                        <p class="text-sm text-gray-600">已记录的技能数量</p>
                        <div class="mt-2">
                            <span class="badge badge-accent">${stats.completion.skill}% 完成度</span>
                        </div>
                    </div>
                    
                    <div class="stat-card animate-fade-in" style="animation-delay: 0.3s">
                        <h3>⭐ 总体统计</h3>
                        <div class="text-3xl font-bold text-success-600 my-3">${stats.overall.totalExercises}</div>
                        <p class="text-sm text-gray-600">总练习次数</p>
                        <div class="mt-2">
                            <span class="badge badge-success">${stats.overall.completionRate}% 完成率</span>
                        </div>
                    </div>
                </div>
            `;
            
            this.elements.statsContainer.innerHTML = statsHTML;
        }
        
        /**
         * 显示加载状态
         */
        showLoading() {
            if (this.elements.loadingIndicator) {
                this.elements.loadingIndicator.style.display = 'flex';
            } else {
                // 创建加载指示器
                const loader = document.createElement('div');
                loader.id = 'globalLoadingIndicator';
                loader.className = 'loading-overlay';
                loader.innerHTML = `
                    <div class="text-center">
                        <div class="loading-spinner mb-4"></div>
                        <p class="text-gray-700">加载中...</p>
                    </div>
                `;
                document.body.appendChild(loader);
            }
        }
        
        /**
         * 隐藏加载状态
         */
        hideLoading() {
            if (this.elements.loadingIndicator) {
                this.elements.loadingIndicator.style.display = 'none';
            }
            
            const loader = document.getElementById('globalLoadingIndicator');
            if (loader) {
                loader.remove();
            }
        }
        
        /**
         * 显示消息提示
         */
        showAlert(message, type = 'info') {
            // 移除现有的提示
            const existingAlert = document.querySelector('.alert-toast');
            if (existingAlert) {
                existingAlert.remove();
            }
            
            // 创建新提示
            const alert = document.createElement('div');
            alert.className = `alert-toast alert-${type} fixed top-4 right-4 z-50 max-w-md`;
            alert.innerHTML = `
                <div class="flex items-start p-4 rounded-lg shadow-lg animate-slide-in-right">
                    <div class="mr-3 text-lg">${this.getAlertIcon(type)}</div>
                    <div class="flex-1">
                        <p class="text-sm font-medium">${message}</p>
                    </div>
                    <button class="ml-4 text-gray-400 hover:text-gray-600" onclick="this.parentElement.remove()">
                        &times;
                    </button>
                </div>
            `;
            
            document.body.appendChild(alert);
            
            // 自动移除
            setTimeout(() => {
                if (alert.parentElement) {
                    alert.remove();
                }
            }, 3000);
        }
        
        /**
         * 获取提示图标
         */
        getAlertIcon(type) {
            const icons = {
                success: '✅',
                error: '❌',
                warning: '⚠️',
                info: 'ℹ️'
            };
            return icons[type] || 'ℹ️';
        }
        
        /**
         * 计算完成率
         */
        calculateCompletionRate(type) {
            const exercises = this.state.exercises[type];
            if (!exercises.length) return 0;
            
            let completedCount = 0;
            
            switch(type) {
                case 'photo':
                    completedCount = exercises.filter(a => 
                        a.answers && Object.keys(a.answers).length >= 5).length;
                    break;
                case 'character':
                    completedCount = exercises.filter(c => c.completed).length;
                    break;
                case 'skill':
                    completedCount = exercises.filter(s => s.completed).length;
                    break;
            }
            
            return Math.round((completedCount / exercises.length) * 100);
        }
        
        /**
         * 计算整体完成率
         */
        calculateOverallCompletionRate() {
            const rates = [
                this.calculateCompletionRate('photo'),
                this.calculateCompletionRate('character'),
                this.calculateCompletionRate('skill')
            ];
            
            const validRates = rates.filter(rate => rate > 0);
            if (validRates.length === 0) return 0;
            
            return Math.round(validRates.reduce((a, b) => a + b, 0) / validRates.length);
        }
        
        /**
         * 计算连续学习天数
         */
        calculateStreakDays() {
            // 简单的实现：检查最近7天是否有活动
            const allActivities = [];
            
            ['photo', 'character', 'skill'].forEach(type => {
                this.state.exercises[type].forEach(item => {
                    if (item.createdAt) {
                        allActivities.push(new Date(item.createdAt));
                    }
                });
            });
            
            if (allActivities.length === 0) return 0;
            
            // 按日期排序
            allActivities.sort((a, b) => b - a);
            
            let streak = 1;
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            for (let i = 1; i < allActivities.length; i++) {
                const date1 = new Date(allActivities[i - 1]);
                const date2 = new Date(allActivities[i]);
                
                date1.setHours(0, 0, 0, 0);
                date2.setHours(0, 0, 0, 0);
                
                const diffDays = Math.floor((date1 - date2) / (1000 * 60 * 60 * 24));
                
                if (diffDays === 1) {
                    streak++;
                } else if (diffDays > 1) {
                    break;
                }
            }
            
            return Math.min(streak, 7); // 最多显示7天
        }
        
        /**
         * 计算总学习时间
         */
        calculateTotalTimeSpent() {
            // 简单估算：每个分析按10分钟计算
            const totalExercises = this.state.userStats?.overall.totalExercises || 0;
            return totalExercises * 10; // 分钟
        }
        
        /**
         * 计算总角色数量
         */
        countTotalCharacters() {
            const characters = this.state.exercises.character;
            return characters.length;
        }
        
        /**
         * 计算总技能数量
         */
        countTotalSkills() {
            const skills = this.state.exercises.skill;
            return skills.length;
        }
        
        /**
         * 计算总洞察数量
         */
        countTotalInsights() {
            let total = 0;
            
            // 照片分析的答案数量
            this.state.exercises.photo.forEach(analysis => {
                total += Object.keys(analysis.answers || {}).length;
            });
            
            // 角色探索的特质数量
            this.state.exercises.character.forEach(character => {
                total += (character.traits || []).length;
            });
            
            // 技能传承的步骤数量
            this.state.exercises.skill.forEach(skill => {
                total += (skill.steps || []).length;
            });
            
            return total;
        }
        
        /**
         * 计算平均答案长度
         */
        calculateAverageAnswerLength() {
            let totalLength = 0;
            let totalAnswers = 0;
            
            this.state.exercises.photo.forEach(analysis => {
                Object.values(analysis.answers || {}).forEach(answer => {
                    totalLength += answer.length;
                    totalAnswers++;
                });
            });
            
            return totalAnswers > 0 ? Math.round(totalLength / totalAnswers) : 0;
        }
        
        /**
         * 获取最近的分析
         */
        getRecentAnalyses(limit = 5) {
            return this.state.exercises.photo
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, limit);
        }
        
        /**
         * 获取最近的探索
         */
        getRecentExplorations(limit = 5) {
            return this.state.exercises.character
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, limit);
        }
        
        /**
         * 获取最近的传承
         */
        getRecentHeritages(limit = 5) {
            return this.state.exercises.skill
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, limit);
        }
        
        /**
         * 格式化日期
         */
        formatDate(dateString) {
            if (!dateString) return '未知时间';
            
            const date = new Date(dateString);
            const now = new Date();
            const diffMs = now - date;
            const diffHours = diffMs / (1000 * 60 * 60);
            const diffDays = diffMs / (1000 * 60 * 60 * 24);
            
            if (diffHours < 1) {
                return '刚刚';
            } else if (diffHours < 24) {
                return `${Math.floor(diffHours)}小时前`;
            } else if (diffDays < 7) {
                return `${Math.floor(diffDays)}天前`;
            } else {
                return date.toLocaleDateString('zh-CN');
            }
        }
        
        /**
         * 获取默认成就
         */
        getDefaultAchievements() {
            return {
                firstPhoto: {
                    id: 'first_photo',
                    name: '第一张老照片',
                    description: '完成第一次照片分析',
                    icon: '📸',
                    condition: '完成1次照片分析'
                },
                photoMaster: {
                    id: 'photo_master',
                    name: '照片分析达人',
                    description: '完成5次照片分析',
                    icon: '🖼️',
                    condition: '完成5次照片分析'
                },
                photoExpert: {
                    id: 'photo_expert',
                    name: '照片分析专家',
                    description: '完成10次照片分析',
                    icon: '🏆',
                    condition: '完成10次照片分析'
                },
                firstCharacter: {
                    id: 'first_character',
                    name: '第一位家族人物',
                    description: '完成第一次角色探索',
                    icon: '👤',
                    condition: '完成1次角色探索'
                },
                familyExplorer: {
                    id: 'family_explorer',
                    name: '家族探索者',
                    description: '完成3次角色探索',
                    icon: '👨‍👩‍👧‍👦',
                    condition: '完成3次角色探索'
                },
                genealogyMaster: {
                    id: 'genealogy_master',
                    name: '家谱大师',
                    description: '完成10次角色探索',
                    icon: '📜',
                    condition: '完成10次角色探索'
                },
                firstSkill: {
                    id: 'first_skill',
                    name: '第一项家族技能',
                    description: '完成第一次技能传承',
                    icon: '🔧',
                    condition: '完成1次技能传承'
                },
                skillCollector: {
                    id: 'skill_collector',
                    name: '技能收藏家',
                    description: '完成3次技能传承',
                    icon: '🧰',
                    condition: '完成3次技能传承'
                },
                heritageGuardian: {
                    id: 'heritage_guardian',
                    name: '传承守护者',
                    description: '完成10次技能传承',
                    icon: '🛡️',
                    condition: '完成10次技能传承'
                },
                deepThinker: {
                    id: 'deep_thinker',
                    name: '深度思考者',
                    description: '记录20条以上的深度思考',
                    icon: '💭',
                    condition: '记录20条深度思考'
                },
                weeklyStreak: {
                    id: 'weekly_streak',
                    name: '持之以恒',
                    description: '连续学习7天',
                    icon: '🔥',
                    condition: '连续学习7天'
                }
            };
        }
        
        /**
         * 获取仪表板状态
         */
        getState() {
            return { ...this.state };
        }
        
        /**
         * 获取仪表板配置
         */
        getConfig() {
            return { ...this.config };
        }
    }
    
    /**
     * 用户数据存储类
     */
    class UserStorage {
        constructor() {
            this.STORAGE_KEYS = {
                profile: 'userProfile_v1',
                settings: 'dashboardSettings_v1',
                achievements: 'userAchievements_v1'
            };
            
            this.init();
        }
        
        init() {
            // 初始化用户资料
            if (!localStorage.getItem(this.STORAGE_KEYS.profile)) {
                this.saveUserProfile({
                    id: Date.now(),
                    name: '探索者',
                    avatar: '👤',
                    bio: '人文赋能能力平台的探索者',
                    goal: 'casual',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });
            }
            
            // 初始化设置
            if (!localStorage.getItem(this.STORAGE_KEYS.settings)) {
                this.saveSettings({
                    autoSave: true,
                    backupReminder: true,
                    darkMode: false,
                    notifications: true,
                    language: 'zh-CN'
                });
            }
        }
        
        /**
         * 获取用户资料
         */
        getUserProfile() {
            try {
                const data = localStorage.getItem(this.STORAGE_KEYS.profile);
                return JSON.parse(data) || {};
            } catch (error) {
                console.error('读取用户资料失败:', error);
                return {};
            }
        }
        
        /**
         * 保存用户资料
         */
        saveUserProfile(profile) {
            try {
                const existingProfile = this.getUserProfile();
                const updatedProfile = {
                    ...existingProfile,
                    ...profile,
                    updatedAt: new Date().toISOString()
                };
                
                localStorage.setItem(this.STORAGE_KEYS.profile, JSON.stringify(updatedProfile));
                return { success: true };
            } catch (error) {
                console.error('保存用户资料失败:', error);
                return { success: false, error: error.message };
            }
        }
        
        /**
         * 更新用户资料
         */
        updateProfile(updates) {
            return this.saveUserProfile(updates);
        }
        
        /**
         * 获取设置
         */
        getSettings() {
            try {
                const data = localStorage.getItem(this.STORAGE_KEYS.settings);
                return JSON.parse(data) || {};
            } catch (error) {
                console.error('读取设置失败:', error);
                return {};
            }
        }
        
        /**
         * 保存设置
         */
        saveSettings(settings) {
            try {
                localStorage.setItem(this.STORAGE_KEYS.settings, JSON.stringify(settings));
                return { success: true };
            } catch (error) {
                console.error('保存设置失败:', error);
                return { success: false, error: error.message };
            }
        }
        
        /**
         * 更新设置
         */
        updateSettings(updates) {
            const currentSettings = this.getSettings();
            return this.saveSettings({ ...currentSettings, ...updates });
        }
        
        /**
         * 获取用户成就
         */
        getUserAchievements() {
            try {
                const data = localStorage.getItem(this.STORAGE_KEYS.achievements);
                return JSON.parse(data) || [];
            } catch (error) {
                console.error('读取用户成就失败:', error);
                return [];
            }
        }
        
        /**
         * 保存用户成就
         */
        saveUserAchievements(achievements) {
            try {
                localStorage.setItem(this.STORAGE_KEYS.achievements, JSON.stringify(achievements));
                return { success: true };
            } catch (error) {
                console.error('保存用户成就失败:', error);
                return { success: false, error: error.message };
            }
        }
        
        /**
         * 清除所有用户数据
         */
        clearAll() {
            localStorage.removeItem(this.STORAGE_KEYS.profile);
            localStorage.removeItem(this.STORAGE_KEYS.settings);
            localStorage.removeItem(this.STORAGE_KEYS.achievements);
            this.init(); // 重新初始化默认数据
            return { success: true };
        }
    }
    
    /**
     * 角色探索存储类（模拟）
     */
    class CharacterStorage {
        constructor() {
            this.STORAGE_KEY = 'characterExplorations_v1';
            this.init();
        }
        
        init() {
            if (!localStorage.getItem(this.STORAGE_KEY)) {
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify([]));
            }
        }
        
        getAllExplorations() {
            try {
                const data = localStorage.getItem(this.STORAGE_KEY);
                return JSON.parse(data) || [];
            } catch (error) {
                console.error('读取角色探索失败:', error);
                return [];
            }
        }
        
        getExploration(id) {
            const explorations = this.getAllExplorations();
            return explorations.find(exp => exp.id == id) || null;
        }
        
        saveExploration(exploration) {
            try {
                const explorations = this.getAllExplorations();
                exploration.id = exploration.id || Date.now();
                exploration.createdAt = exploration.createdAt || new Date().toISOString();
                exploration.updatedAt = new Date().toISOString();
                
                const existingIndex = explorations.findIndex(e => e.id === exploration.id);
                
                if (existingIndex !== -1) {
                    explorations[existingIndex] = exploration;
                } else {
                    explorations.push(exploration);
                }
                
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(explorations));
                return { success: true, id: exploration.id };
            } catch (error) {
                console.error('保存角色探索失败:', error);
                return { success: false, error: error.message };
            }
        }
        
        deleteExploration(id) {
            try {
                const explorations = this.getAllExplorations();
                const filtered = explorations.filter(exp => exp.id != id);
                
                if (filtered.length === explorations.length) {
                    return { success: false, error: '未找到要删除的记录' };
                }
                
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
                return { success: true };
            } catch (error) {
                return { success: false, error: error.message };
            }
        }
        
        clearAll() {
            localStorage.removeItem(this.STORAGE_KEY);
            this.init();
            return { success: true };
        }
    }
    
    /**
     * 技能传承存储类（模拟）
     */
    class SkillStorage {
        constructor() {
            this.STORAGE_KEY = 'skillHeritages_v1';
            this.init();
        }
        
        init() {
            if (!localStorage.getItem(this.STORAGE_KEY)) {
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify([]));
            }
        }
        
        getAllHeritages() {
            try {
                const data = localStorage.getItem(this.STORAGE_KEY);
                return JSON.parse(data) || [];
            } catch (error) {
                console.error('读取技能传承失败:', error);
                return [];
            }
        }
        
        getHeritage(id) {
            const heritages = this.getAllHeritages();
            return heritages.find(heritage => heritage.id == id) || null;
        }
        
        saveHeritage(heritage) {
            try {
                const heritages = this.getAllHeritages();
                heritage.id = heritage.id || Date.now();
                heritage.createdAt = heritage.createdAt || new Date().toISOString();
                heritage.updatedAt = new Date().toISOString();
                
                const existingIndex = heritages.findIndex(h => h.id === heritage.id);
                
                if (existingIndex !== -1) {
                    heritages[existingIndex] = heritage;
                } else {
                    heritages.push(heritage);
                }
                
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(heritages));
                return { success: true, id: heritage.id };
            } catch (error) {
                console.error('保存技能传承失败:', error);
                return { success: false, error: error.message };
            }
        }
        
        deleteHeritage(id) {
            try {
                const heritages = this.getAllHeritages();
                const filtered = heritages.filter(h => h.id != id);
                
                if (filtered.length === heritages.length) {
                    return { success: false, error: '未找到要删除的记录' };
                }
                
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
                return { success: true };
            } catch (error) {
                return { success: false, error: error.message };
            }
        }
        
        clearAll() {
            localStorage.removeItem(this.STORAGE_KEY);
            this.init();
            return { success: true };
        }
    }
    
    // 导出到全局作用域
    window.Dashboard = Dashboard;
    window.UserStorage = UserStorage;
    window.CharacterStorage = CharacterStorage;
    window.SkillStorage = SkillStorage;
    
    // 自动初始化
    document.addEventListener('DOMContentLoaded', () => {
        // 确保页面有必要的元素
        if (document.getElementById('contentArea')) {
            window.dashboard = new Dashboard();
        }
    });
    
})();
