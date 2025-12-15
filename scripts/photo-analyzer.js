/**
 * 老照片价值挖掘分析器 - 核心逻辑模块
 * 版本: 1.0.0
 * 最后更新: 2024-01-15
 * 
 * 功能：
 * 1. 照片上传与预览
 * 2. 问答流程管理
 * 3. 数据分析与洞察生成
 * 4. 数据持久化存储
 * 5. 导出功能
 */

// 防止全局变量污染
(function() {
    'use strict';
    
    /**
     * 照片分析器主类
     */
    class PhotoAnalyzer {
        constructor() {
            // 配置
            this.config = {
                storageKey: 'photoAnalyses_v1',
                maxFileSize: 5 * 1024 * 1024, // 5MB
                supportedFormats: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
                questions: this.getDefaultQuestions(),
                insights: this.getDefaultInsights(),
                themes: this.getDefaultThemes()
            };
            
            // 状态
            this.state = {
                currentQuestionIndex: 0,
                answers: {},
                uploadedPhoto: null,
                photoData: null,
                analysisId: null,
                isAnalyzing: false,
                currentStep: 'upload', // upload, questions, summary
                hasUnsavedChanges: false
            };
            
            // DOM 元素引用
            this.elements = {};
            
            // 初始化
            this.init();
        }
        
        /**
         * 初始化分析器
         */
        init() {
            // 绑定 DOM 元素
            this.bindElements();
            
            // 初始化事件监听
            this.initEventListeners();
            
            // 初始化存储
            this.storage = new PhotoAnalysisStorage();
            
            // 检查是否有保存的进度
            this.checkSavedProgress();
            
            // 更新界面状态
            this.updateUI();
            
            console.log('照片分析器初始化完成');
        }
        
        /**
         * 绑定 DOM 元素
         */
        bindElements() {
            this.elements = {
                // 上传区域
                uploadArea: document.getElementById('uploadArea'),
                photoInput: document.getElementById('photoInput'),
                photoPreview: document.getElementById('photoPreview'),
                
                // 问题区域
                questionSection: document.getElementById('questionSection'),
                questionTitle: document.getElementById('questionTitle'),
                questionDescription: document.getElementById('questionDescription'),
                answerInput: document.getElementById('answerInput'),
                
                // 导航按钮
                prevBtn: document.getElementById('prevBtn'),
                nextBtn: document.getElementById('nextBtn'),
                insightBtn: document.getElementById('insightBtn'),
                
                // 进度显示
                progressBar: document.getElementById('progress'),
                stepIndicator: document.getElementById('step-indicator'),
                
                // 总结区域
                analysisSummary: document.getElementById('analysisSummary'),
                characterCards: document.getElementById('characterCards'),
                insightsContainer: document.getElementById('insightsContainer'),
                
                // 操作按钮
                saveBtn: document.querySelector('[onclick="saveAnalysis()"]'),
                exportBtn: document.querySelector('[onclick="exportAnalysis()"]'),
                newBtn: document.querySelector('[onclick="startNewAnalysis()"]')
            };
        }
        
        /**
         * 初始化事件监听
         */
        initEventListeners() {
            // 照片上传事件
            this.elements.photoInput.addEventListener('change', (e) => this.handlePhotoUpload(e));
            this.elements.uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
            this.elements.uploadArea.addEventListener('drop', (e) => this.handleDrop(e));
            this.elements.uploadArea.addEventListener('click', () => this.elements.photoInput.click());
            
            // 问题导航事件
            this.elements.nextBtn.addEventListener('click', () => this.nextQuestion());
            this.elements.prevBtn.addEventListener('click', () => this.prevQuestion());
            this.elements.insightBtn.addEventListener('click', () => this.showInsights());
            
            // 答案输入事件
            this.elements.answerInput.addEventListener('input', () => {
                this.state.hasUnsavedChanges = true;
                this.saveCurrentAnswer();
            });
            
            // 保存按钮事件
            if (this.elements.saveBtn) {
                this.elements.saveBtn.addEventListener('click', () => this.saveAnalysis());
            }
            
            // 导出按钮事件
            if (this.elements.exportBtn) {
                this.elements.exportBtn.addEventListener('click', () => this.exportAnalysis());
            }
            
            // 新分析按钮事件
            if (this.elements.newBtn) {
                this.elements.newBtn.addEventListener('click', () => this.startNewAnalysis());
            }
            
            // 离开页面警告
            window.addEventListener('beforeunload', (e) => {
                if (this.state.hasUnsavedChanges) {
                    e.preventDefault();
                    e.returnValue = '您有未保存的更改。确定要离开吗？';
                }
            });
            
            // 键盘快捷键
            document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
        }
        
        /**
         * 处理照片上传
         * @param {Event} e - 上传事件
         */
        handlePhotoUpload(e) {
            const file = e.target.files[0];
            if (!file) return;
            
            this.processImageFile(file);
        }
        
        /**
         * 处理拖拽悬停
         * @param {Event} e - 拖拽事件
         */
        handleDragOver(e) {
            e.preventDefault();
            e.stopPropagation();
            this.elements.uploadArea.classList.add('dragover');
            this.elements.uploadArea.style.borderColor = 'var(--accent-500)';
            this.elements.uploadArea.style.background = 'var(--primary-50)';
        }
        
        /**
         * 处理拖拽放置
         * @param {Event} e - 拖拽事件
         */
        handleDrop(e) {
            e.preventDefault();
            e.stopPropagation();
            
            this.elements.uploadArea.classList.remove('dragover');
            this.elements.uploadArea.style.borderColor = '';
            this.elements.uploadArea.style.background = '';
            
            const file = e.dataTransfer.files[0];
            if (file) {
                this.processImageFile(file);
            }
        }
        
        /**
         * 处理图片文件
         * @param {File} file - 图片文件
         */
        processImageFile(file) {
            // 验证文件类型
            if (!this.config.supportedFormats.includes(file.type)) {
                this.showAlert('请上传图片文件（支持 JPG、PNG、GIF 格式）', 'error');
                return;
            }
            
            // 验证文件大小
            if (file.size > this.config.maxFileSize) {
                this.showAlert('图片大小不能超过 5MB', 'error');
                return;
            }
            
            // 显示加载状态
            this.showLoading();
            
            const reader = new FileReader();
            
            reader.onload = (e) => {
                this.state.uploadedPhoto = e.target.result;
                
                // 创建图片对象获取元数据
                const img = new Image();
                img.onload = () => {
                    this.state.photoData = {
                        name: file.name,
                        size: file.size,
                        type: file.type,
                        width: img.width,
                        height: img.height,
                        uploadTime: new Date().toISOString()
                    };
                    
                    // 显示预览
                    this.elements.photoPreview.src = this.state.uploadedPhoto;
                    this.elements.photoPreview.classList.add('visible');
                    
                    // 开始问答流程
                    setTimeout(() => {
                        this.startQuestions();
                        this.hideLoading();
                    }, 300);
                };
                
                img.src = this.state.uploadedPhoto;
            };
            
            reader.onerror = () => {
                this.showAlert('图片读取失败，请重试', 'error');
                this.hideLoading();
            };
            
            reader.readAsDataURL(file);
        }
        
        /**
         * 开始问答流程
         */
        startQuestions() {
            this.state.currentStep = 'questions';
            this.elements.uploadArea.style.display = 'none';
            this.elements.questionSection.style.display = 'block';
            
            // 生成分析ID
            this.state.analysisId = Date.now();
            
            this.updateProgress(33);
            this.updateQuestion();
        }
        
        /**
         * 更新当前问题显示
         */
        updateQuestion() {
            const question = this.config.questions[this.state.currentQuestionIndex];
            
            // 更新问题文本
            this.elements.questionTitle.textContent = `问题 ${this.state.currentQuestionIndex + 1}：${question.question}`;
            this.elements.questionDescription.textContent = question.description;
            
            // 恢复保存的答案
            this.elements.answerInput.value = this.state.answers[question.id] || '';
            
            // 更新导航按钮状态
            this.elements.prevBtn.style.display = this.state.currentQuestionIndex > 0 ? 'block' : 'none';
            
            const nextBtn = this.elements.nextBtn;
            if (this.state.currentQuestionIndex === this.config.questions.length - 1) {
                nextBtn.textContent = '完成分析';
                nextBtn.classList.add('btn-accent');
            } else {
                nextBtn.textContent = '下一题';
                nextBtn.classList.remove('btn-accent');
            }
            
            // 更新步骤指示器
            this.elements.stepIndicator.textContent = 
                `步骤 2/3：回答问题 (${this.state.currentQuestionIndex + 1}/${this.config.questions.length})`;
            
            // 自动聚焦到输入框
            setTimeout(() => {
                this.elements.answerInput.focus();
            }, 100);
        }
        
        /**
         * 保存当前答案
         */
        saveCurrentAnswer() {
            const question = this.config.questions[this.state.currentQuestionIndex];
            if (question && this.elements.answerInput.value.trim()) {
                this.state.answers[question.id] = this.elements.answerInput.value.trim();
            }
        }
        
        /**
         * 下一题
         */
        nextQuestion() {
            this.saveCurrentAnswer();
            
            if (this.state.currentQuestionIndex < this.config.questions.length - 1) {
                this.state.currentQuestionIndex++;
                this.updateQuestion();
            } else {
                this.completeAnalysis();
            }
        }
        
        /**
         * 上一题
         */
        prevQuestion() {
            this.saveCurrentAnswer();
            
            if (this.state.currentQuestionIndex > 0) {
                this.state.currentQuestionIndex--;
                this.updateQuestion();
            }
        }
        
        /**
         * 显示洞察提示
         */
        showInsights() {
            const question = this.config.questions[this.state.currentQuestionIndex];
            const insights = question.insights;
            
            const insightText = insights.map(insight => `• ${insight}`).join('\n');
            const currentText = this.elements.answerInput.value;
            
            // 如果已经添加过洞察，不再重复添加
            if (currentText.includes('💡 洞察提示')) {
                return;
            }
            
            const newText = currentText + (currentText ? '\n\n' : '') + `💡 洞察提示：\n${insightText}`;
            this.elements.answerInput.value = newText;
            
            // 触发输入事件以保存答案
            this.elements.answerInput.dispatchEvent(new Event('input'));
            
            // 滚动到输入框底部
            this.elements.answerInput.scrollTop = this.elements.answerInput.scrollHeight;
        }
        
        /**
         * 完成分析
         */
        completeAnalysis() {
            this.saveCurrentAnswer();
            
            this.state.currentStep = 'summary';
            this.elements.questionSection.style.display = 'none';
            this.elements.analysisSummary.style.display = 'block';
            
            this.updateProgress(100);
            this.elements.stepIndicator.textContent = '步骤 3/3：分析完成';
            
            // 生成分析结果
            this.generateCharacterCards();
            this.generateInsights();
            this.generateTimeline();
            
            // 自动保存
            setTimeout(() => {
                this.autoSaveAnalysis();
            }, 500);
        }
        
        /**
         * 生成角色卡片
         */
        generateCharacterCards() {
            const container = this.elements.characterCards;
            container.innerHTML = '';
            
            // 提取人物信息（从第一个问题的答案）
            const peopleAnswer = this.state.answers[1]; // 假设问题1是人物识别
            if (peopleAnswer && peopleAnswer.trim()) {
                // 尝试从答案中提取人物姓名
                const peopleText = peopleAnswer.trim();
                const characterCard = document.createElement('div');
                characterCard.className = 'character-card animate-fade-in';
                
                characterCard.innerHTML = `
                    <h4>👥 识别到的人物</h4>
                    <p class="character-description">${this.truncateText(peopleText, 200)}</p>
                    <div class="mt-2">
                        <span class="badge badge-primary">家族成员</span>
                        <span class="badge badge-secondary">情感连接</span>
                        <span class="badge badge-accent">记忆承载者</span>
                    </div>
                `;
                
                container.appendChild(characterCard);
            } else {
                // 没有人物信息的提示
                const emptyCard = document.createElement('div');
                emptyCard.className = 'character-card text-center';
                emptyCard.innerHTML = `
                    <div class="empty-state-icon">👤</div>
                    <p class="text-gray-600">未识别到具体人物信息</p>
                    <p class="text-sm text-gray-500">您可以在第一题中描述照片中的人物</p>
                `;
                container.appendChild(emptyCard);
            }
        }
        
        /**
         * 生成洞察
         */
        generateInsights() {
            const container = this.elements.insightsContainer;
            container.innerHTML = '<h3 class="text-white mb-3">📊 分析洞察</h3>';
            
            // 计算统计数据
            const stats = this.calculateStats();
            
            // 生成洞察徽章
            const insights = this.generateInsightsFromAnswers(stats);
            
            insights.forEach(insight => {
                const badge = document.createElement('div');
                badge.className = `insight-badge ${insight.type} animate-slide-in-up`;
                badge.textContent = insight.text;
                badge.style.animationDelay = `${Math.random() * 0.3}s`;
                
                // 添加悬停效果
                badge.addEventListener('mouseenter', () => {
                    badge.style.transform = 'translateY(-2px) scale(1.05)';
                });
                
                badge.addEventListener('mouseleave', () => {
                    badge.style.transform = '';
                });
                
                container.appendChild(badge);
            });
            
            // 添加分析总结
            const summaryDiv = document.createElement('div');
            summaryDiv.className = 'mt-4 p-3 bg-white bg-opacity-20 rounded-lg';
            summaryDiv.innerHTML = `
                <p class="text-sm text-white text-opacity-90">
                    <strong>分析完成度：</strong>${stats.completionRate}%<br>
                    <strong>深度思考数量：</strong>${stats.meaningfulAnswers}个<br>
                    <strong>情感强度：</strong>${stats.emotionLevel}<br>
                    <strong>价值密度：</strong>${stats.valueDensity}
                </p>
            `;
            container.appendChild(summaryDiv);
        }
        
        /**
         * 生成时间线
         */
        generateTimeline() {
            // 创建时间线容器（如果不存在）
            let timelineContainer = document.getElementById('timelineContainer');
            if (!timelineContainer) {
                timelineContainer = document.createElement('div');
                timelineContainer.id = 'timelineContainer';
                timelineContainer.className = 'mt-4';
                this.elements.analysisSummary.appendChild(timelineContainer);
            }
            
            timelineContainer.innerHTML = `
                <h4 class="text-white mb-3">📅 记忆时间线</h4>
                <div class="timeline">
                    ${this.generateTimelineItems()}
                </div>
            `;
        }
        
        /**
         * 生成时间线项目
         * @returns {string} - 时间线HTML
         */
        generateTimelineItems() {
            const items = [];
            const now = new Date();
            
            // 照片上传时间
            if (this.state.photoData) {
                const uploadDate = new Date(this.state.photoData.uploadTime);
                items.push({
                    date: '今天',
                    title: '开始分析',
                    content: `上传了照片 "${this.state.photoData.name}"`,
                    active: true
                });
            }
            
            // 预计的未来行动
            items.push({
                date: '下周',
                title: '家族故事分享',
                content: '计划与家人分享这张照片的故事',
                active: false
            });
            
            items.push({
                date: '下个月',
                title: '数字化保存',
                content: '将照片扫描并备份到云端',
                active: false
            });
            
            // 生成HTML
            return items.map((item, index) => `
                <div class="timeline-item ${item.active ? 'active' : ''}">
                    <div class="timeline-date">${item.date}</div>
                    <div class="timeline-content">
                        <h5 class="mb-1">${item.title}</h5>
                        <p class="text-sm text-gray-700">${item.content}</p>
                    </div>
                </div>
            `).join('');
        }
        
        /**
         * 计算统计数据
         * @returns {Object} - 统计信息
         */
        calculateStats() {
            const totalQuestions = this.config.questions.length;
            const answeredQuestions = Object.keys(this.state.answers).length;
            const completionRate = Math.round((answeredQuestions / totalQuestions) * 100);
            
            // 计算有意义的答案数量（超过10个字符）
            let meaningfulAnswers = 0;
            Object.values(this.state.answers).forEach(answer => {
                if (answer && answer.trim().length > 10) {
                    meaningfulAnswers++;
                }
            });
            
            // 分析情感词汇
            const emotionalWords = ['爱', '喜欢', '想念', '感动', '温暖', '幸福', '快乐', '悲伤', '怀念', '珍贵'];
            let emotionScore = 0;
            Object.values(this.state.answers).forEach(answer => {
                emotionalWords.forEach(word => {
                    if (answer && answer.includes(word)) {
                        emotionScore++;
                    }
                });
            });
            
            const emotionLevel = emotionScore > 5 ? '强烈' : emotionScore > 2 ? '中等' : '一般';
            const valueDensity = Math.round((meaningfulAnswers / totalQuestions) * 100);
            
            return {
                totalQuestions,
                answeredQuestions,
                completionRate,
                meaningfulAnswers,
                emotionScore,
                emotionLevel,
                valueDensity
            };
        }
        
        /**
         * 从答案生成洞察
         * @param {Object} stats - 统计数据
         * @returns {Array} - 洞察数组
         */
        generateInsightsFromAnswers(stats) {
            const insights = [];
            
            // 基于统计的洞察
            insights.push({
                text: `完成了 ${stats.answeredQuestions}/${stats.totalQuestions} 个问题`,
                type: 'completion'
            });
            
            insights.push({
                text: `${stats.meaningfulAnswers} 个深度思考`,
                type: 'depth'
            });
            
            // 基于内容的洞察
            if (stats.emotionScore > 3) {
                insights.push({
                    text: '情感连接强烈',
                    type: 'emotion'
                });
            }
            
            if (this.state.answers[3]) { // 假设问题3是情感相关
                insights.push({
                    text: '发现了珍贵的情感记忆',
                    type: 'emotion'
                });
            }
            
            if (this.state.answers[5]) { // 假设问题5是行动启示
                insights.push({
                    text: '制定了具体行动计划',
                    type: 'action'
                });
            }
            
            // 随机添加通用洞察
            const genericInsights = [
                { text: '家族记忆的宝贵载体', type: 'family' },
                { text: '个人成长的重要见证', type: 'personal' },
                { text: '历史传承的生动记录', type: 'history' },
                { text: '跨代沟通的桥梁', type: 'communication' }
            ];
            
            const randomInsight = genericInsights[Math.floor(Math.random() * genericInsights.length)];
            insights.push(randomInsight);
            
            return insights;
        }
        
        /**
         * 更新进度条
         * @param {number} percentage - 进度百分比
         */
        updateProgress(percentage) {
            if (this.elements.progressBar) {
                this.elements.progressBar.style.width = `${percentage}%`;
            }
        }
        
        /**
         * 保存分析
         */
        saveAnalysis() {
            if (!this.state.uploadedPhoto || Object.keys(this.state.answers).length === 0) {
                this.showAlert('请先上传照片并回答问题', 'warning');
                return;
            }
            
            const analysisData = {
                id: this.state.analysisId || Date.now(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                photo: this.state.uploadedPhoto,
                photoData: this.state.photoData,
                answers: this.state.answers,
                questions: this.config.questions.map(q => ({
                    id: q.id,
                    title: q.title,
                    question: q.question
                })),
                stats: this.calculateStats(),
                insights: this.generateInsightsFromAnswers(this.calculateStats())
            };
            
            const result = this.storage.saveAnalysis(analysisData);
            
            if (result.success) {
                this.state.hasUnsavedChanges = false;
                this.showAlert('✅ 分析已保存到本地存储！', 'success');
                
                // 更新分析ID（如果是第一次保存）
                if (!this.state.analysisId) {
                    this.state.analysisId = result.id;
                }
            } else {
                this.showAlert('保存失败：' + result.error, 'error');
            }
        }
        
        /**
         * 自动保存分析
         */
        autoSaveAnalysis() {
            if (Object.keys(this.state.answers).length > 0) {
                this.saveAnalysis();
            }
        }
        
        /**
         * 导出分析
         */
        exportAnalysis() {
            if (Object.keys(this.state.answers).length === 0) {
                this.showAlert('没有可导出的分析数据', 'warning');
                return;
            }
            
            const analysisData = {
                title: '老照片价值分析报告',
                exportDate: new Date().toLocaleString('zh-CN'),
                photoDescription: this.state.answers[1] || '未描述',
                analysisId: this.state.analysisId,
                
                answers: this.config.questions.map(q => ({
                    question: q.question,
                    answer: this.state.answers[q.id] || '未回答'
                })),
                
                summary: this.calculateStats(),
                insights: this.generateInsightsFromAnswers(this.calculateStats()),
                
                metadata: {
                    version: '1.0.0',
                    platform: '人文赋能能力平台',
                    generatedBy: '老照片价值挖掘工具'
                }
            };
            
            // 创建导出选项
            const exportType = confirm('是否导出为JSON格式？\n\n点击"确定"导出JSON，点击"取消"导出文本格式');
            
            if (exportType) {
                // 导出JSON格式
                const blob = new Blob([JSON.stringify(analysisData, null, 2)], { 
                    type: 'application/json' 
                });
                
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `老照片分析报告_${this.state.analysisId}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            } else {
                // 导出文本格式
                let textContent = `老照片价值分析报告\n`;
                textContent += `生成时间：${analysisData.exportDate}\n`;
                textContent += `分析ID：${analysisData.analysisId}\n`;
                textContent += `=====================\n\n`;
                
                analysisData.answers.forEach((item, index) => {
                    textContent += `${index + 1}. ${item.question}\n`;
                    textContent += `答：${item.answer}\n\n`;
                });
                
                textContent += `=====================\n`;
                textContent += `总结：\n`;
                textContent += `完成率：${analysisData.summary.completionRate}%\n`;
                textContent += `深度思考：${analysisData.summary.meaningfulAnswers}个\n`;
                textContent += `情感强度：${analysisData.summary.emotionLevel}\n\n`;
                
                textContent += `主要洞察：\n`;
                analysisData.insights.forEach(insight => {
                    textContent += `• ${insight.text}\n`;
                });
                
                const blob = new Blob([textContent], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `老照片分析报告_${this.state.analysisId}.txt`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }
            
            this.showAlert('📤 报告已导出！', 'success');
        }
        
        /**
         * 开始新的分析
         */
        startNewAnalysis() {
            if (this.state.hasUnsavedChanges) {
                const confirmReset = confirm('您有未保存的更改。是否确定开始新的分析？');
                if (!confirmReset) return;
            }
            
            // 重置状态
            this.state = {
                currentQuestionIndex: 0,
                answers: {},
                uploadedPhoto: null,
                photoData: null,
                analysisId: null,
                isAnalyzing: false,
                currentStep: 'upload',
                hasUnsavedChanges: false
            };
            
            // 重置UI
            this.elements.photoPreview.src = '';
            this.elements.photoPreview.classList.remove('visible');
            this.elements.uploadArea.style.display = 'block';
            this.elements.questionSection.style.display = 'none';
            this.elements.analysisSummary.style.display = 'none';
            
            // 重置表单
            this.elements.photoInput.value = '';
            this.elements.answerInput.value = '';
            
            // 重置进度
            this.updateProgress(0);
            this.elements.stepIndicator.textContent = '步骤 1/3：上传照片';
            
            // 滚动到顶部
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            this.showAlert('🔄 已开始新的分析', 'info');
        }
        
        /**
         * 检查保存的进度
         */
        checkSavedProgress() {
            const savedAnalyses = this.storage.getAllAnalyses();
            if (savedAnalyses.length > 0) {
                console.log(`找到 ${savedAnalyses.length} 个已保存的分析`);
                
                // 可以在这里添加恢复最近分析的逻辑
                // this.restoreLatestAnalysis(savedAnalyses[savedAnalyses.length - 1]);
            }
        }
        
        /**
         * 恢复分析
         * @param {Object} analysisData - 分析数据
         */
        restoreLatestAnalysis(analysisData) {
            // 询问是否恢复
            const shouldRestore = confirm(`发现上次未完成的分析（${new Date(analysisData.createdAt).toLocaleDateString()}）。是否恢复？`);
            
            if (shouldRestore) {
                this.state.analysisId = analysisData.id;
                this.state.uploadedPhoto = analysisData.photo;
                this.state.photoData = analysisData.photoData;
                this.state.answers = analysisData.answers;
                this.state.hasUnsavedChanges = true;
                
                // 恢复照片预览
                this.elements.photoPreview.src = this.state.uploadedPhoto;
                this.elements.photoPreview.classList.add('visible');
                
                // 直接跳转到总结或继续回答
                if (Object.keys(this.state.answers).length >= this.config.questions.length) {
                    this.completeAnalysis();
                } else {
                    this.startQuestions();
                }
                
                this.showAlert('已恢复上次的分析进度', 'info');
            }
        }
        
        /**
         * 处理键盘快捷键
         * @param {KeyboardEvent} e - 键盘事件
         */
        handleKeyboardShortcuts(e) {
            // 忽略输入框中的快捷键
            if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') {
                return;
            }
            
            switch(e.key) {
                case 'ArrowRight':
                    if (this.state.currentStep === 'questions') {
                        e.preventDefault();
                        this.nextQuestion();
                    }
                    break;
                    
                case 'ArrowLeft':
                    if (this.state.currentStep === 'questions') {
                        e.preventDefault();
                        this.prevQuestion();
                    }
                    break;
                    
                case 'i':
                case 'I':
                    if (this.state.currentStep === 'questions' && e.ctrlKey) {
                        e.preventDefault();
                        this.showInsights();
                    }
                    break;
                    
                case 's':
                case 'S':
                    if (e.ctrlKey) {
                        e.preventDefault();
                        this.saveAnalysis();
                    }
                    break;
                    
                case 'e':
                case 'E':
                    if (e.ctrlKey) {
                        e.preventDefault();
                        this.exportAnalysis();
                    }
                    break;
            }
        }
        
        /**
         * 显示消息提示
         * @param {string} message - 消息内容
         * @param {string} type - 消息类型（success, error, warning, info）
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
                <div class="flex items-start p-4 rounded-lg shadow-lg">
                    <div class="alert-icon mr-3">${this.getAlertIcon(type)}</div>
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
            }, 5000);
        }
        
        /**
         * 获取提示图标
         * @param {string} type - 提示类型
         * @returns {string} - 图标HTML
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
         * 显示加载状态
         */
        showLoading() {
            // 移除现有的加载状态
            const existingLoader = document.querySelector('.loading-overlay');
            if (existingLoader) {
                existingLoader.remove();
            }
            
            // 创建加载状态
            const loader = document.createElement('div');
            loader.className = 'loading-overlay';
            loader.innerHTML = `
                <div class="text-center">
                    <div class="loading-spinner mb-4"></div>
                    <p class="text-gray-700">正在处理照片...</p>
                </div>
            `;
            
            document.body.appendChild(loader);
        }
        
        /**
         * 隐藏加载状态
         */
        hideLoading() {
            const loader = document.querySelector('.loading-overlay');
            if (loader) {
                loader.remove();
            }
        }
        
        /**
         * 更新界面状态
         */
        updateUI() {
            // 可以根据需要添加UI更新逻辑
        }
        
        /**
         * 截断文本
         * @param {string} text - 原始文本
         * @param {number} maxLength - 最大长度
         * @returns {string} - 截断后的文本
         */
        truncateText(text, maxLength) {
            if (text.length <= maxLength) return text;
            return text.substring(0, maxLength) + '...';
        }
        
        /**
         * 获取默认问题
         * @returns {Array} - 问题数组
         */
        getDefaultQuestions() {
            return [
                {
                    id: 1,
                    title: "人物识别",
                    question: "这张照片中的人物是谁？",
                    description: "请描述照片中的人物及其与您的关系",
                    insights: [
                        "考虑家族谱系关系",
                        "回忆人物的生平故事",
                        "思考他们在您成长中的影响"
                    ],
                    category: "基础信息"
                },
                {
                    id: 2,
                    title: "时空定位",
                    question: "照片拍摄的时间和地点是？",
                    description: "尽可能准确地描述拍摄背景",
                    insights: [
                        "结合历史背景分析",
                        "回忆当时的家庭状况",
                        "思考地点的象征意义"
                    ],
                    category: "背景信息"
                },
                {
                    id: 3,
                    title: "情感连接",
                    question: "这张照片唤起您什么情感？",
                    description: "描述您看到这张照片时的感受",
                    insights: [
                        "分析情感背后的价值观",
                        "连接当下的生活状态",
                        "思考情感传承的意义"
                    ],
                    category: "情感分析"
                },
                {
                    id: 4,
                    title: "价值发现",
                    question: "这张照片对您最重要的价值是什么？",
                    description: "从个人、家族、社会等多个层面思考",
                    insights: [
                        "识别家族精神传承",
                        "发现个人成长线索",
                        "思考历史教育意义"
                    ],
                    category: "价值挖掘"
                },
                {
                    id: 5,
                    title: "行动启示",
                    question: "基于这张照片，您想采取什么行动？",
                    description: "可以是家庭活动、个人计划或传承行动",
                    insights: [
                        "制定家庭故事记录计划",
                        "计划家族聚会分享",
                        "考虑数字化保存方案"
                    ],
                    category: "行动规划"
                }
            ];
        }
        
        /**
         * 获取默认洞察
         * @returns {Object} - 洞察配置
         */
        getDefaultInsights() {
            return {
                character: {
                    title: "人物关系洞察",
                    description: "基于您描述的人物关系分析"
                },
                emotion: {
                    title: "情感深度洞察",
                    description: "挖掘照片背后的情感价值"
                },
                value: {
                    title: "价值维度洞察",
                    description: "多角度评估照片的传承意义"
                }
            };
        }
        
        /**
         * 获取默认主题
         * @returns {Object} - 主题配置
         */
        getDefaultThemes() {
            return {
                light: {
                    primary: '#4caf50',
                    secondary: '#2196f3',
                    accent: '#e91e63',
                    background: '#fafafa'
                },
                dark: {
                    primary: '#81c784',
                    secondary: '#64b5f6',
                    accent: '#f06292',
                    background: '#121212'
                }
            };
        }
        
        /**
         * 获取分析器状态
         * @returns {Object} - 当前状态
         */
        getState() {
            return { ...this.state };
        }
        
        /**
         * 获取分析器配置
         * @returns {Object} - 当前配置
         */
        getConfig() {
            return { ...this.config };
        }
    }
    
    /**
     * 照片分析数据存储类
     */
    class PhotoAnalysisStorage {
        constructor() {
            this.STORAGE_KEY = 'photoAnalyses_v1';
            this.MAX_STORAGE_ITEMS = 50; // 最多保存50个分析
            this.init();
        }
        
        /**
         * 初始化存储
         */
        init() {
            if (!localStorage.getItem(this.STORAGE_KEY)) {
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify([]));
            }
        }
        
        /**
         * 保存分析数据
         * @param {Object} analysisData - 分析数据
         * @returns {Object} - 保存结果
         */
        saveAnalysis(analysisData) {
            try {
                const analyses = this.getAllAnalyses();
                
                // 检查是否已存在（更新）
                const existingIndex = analyses.findIndex(a => a.id === analysisData.id);
                
                if (existingIndex !== -1) {
                    // 更新现有记录
                    analyses[existingIndex] = {
                        ...analyses[existingIndex],
                        ...analysisData,
                        updatedAt: new Date().toISOString()
                    };
                } else {
                    // 添加新记录
                    analysisData.id = analysisData.id || Date.now();
                    analysisData.createdAt = analysisData.createdAt || new Date().toISOString();
                    analysisData.updatedAt = new Date().toISOString();
                    
                    analyses.push(analysisData);
                    
                    // 限制存储数量
                    if (analyses.length > this.MAX_STORAGE_ITEMS) {
                        analyses.shift(); // 移除最旧的项目
                    }
                }
                
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(analyses));
                
                return {
                    success: true,
                    id: analysisData.id,
                    message: '分析已保存'
                };
            } catch (error) {
                console.error('保存失败:', error);
                return { 
                    success: false, 
                    error: error.message,
                    message: '保存失败，请检查存储空间'
                };
            }
        }
        
        /**
         * 获取所有分析
         * @returns {Array} - 分析数据数组
         */
        getAllAnalyses() {
            try {
                const data = localStorage.getItem(this.STORAGE_KEY);
                return JSON.parse(data) || [];
            } catch (error) {
                console.error('读取失败:', error);
                return [];
            }
        }
        
        /**
         * 获取单个分析
         * @param {number|string} id - 分析ID
         * @returns {Object|null} - 分析数据
         */
        getAnalysis(id) {
            const analyses = this.getAllAnalyses();
            return analyses.find(analysis => analysis.id == id) || null;
        }
        
        /**
         * 更新分析数据
         * @param {number|string} id - 分析ID
         * @param {Object} updates - 更新数据
         * @returns {Object} - 更新结果
         */
        updateAnalysis(id, updates) {
            try {
                const analyses = this.getAllAnalyses();
                const index = analyses.findIndex(analysis => analysis.id == id);
                
                if (index !== -1) {
                    analyses[index] = {
                        ...analyses[index],
                        ...updates,
                        updatedAt: new Date().toISOString()
                    };
                    
                    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(analyses));
                    return { success: true };
                }
                
                return { success: false, error: '未找到分析记录' };
            } catch (error) {
                return { success: false, error: error.message };
            }
        }
        
        /**
         * 删除分析
         * @param {number|string} id - 分析ID
         * @returns {Object} - 删除结果
         */
        deleteAnalysis(id) {
            try {
                const analyses = this.getAllAnalyses();
                const filtered = analyses.filter(analysis => analysis.id != id);
                
                if (filtered.length === analyses.length) {
                    return { success: false, error: '未找到要删除的记录' };
                }
                
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
                return { success: true, message: '分析已删除' };
            } catch (error) {
                return { success: false, error: error.message };
            }
        }
        
        /**
         * 清空所有分析
         * @returns {Object} - 清空结果
         */
        clearAll() {
            try {
                localStorage.removeItem(this.STORAGE_KEY);
                this.init();
                return { success: true, message: '所有分析已清空' };
            } catch (error) {
                return { success: false, error: error.message };
            }
        }
        
        /**
         * 导出所有分析数据
         * @returns {string} - JSON格式的导出数据
         */
        exportAllAnalyses() {
            const analyses = this.getAllAnalyses();
            const exportData = {
                exportDate: new Date().toISOString(),
                version: '1.0.0',
                platform: '人文赋能能力平台',
                totalAnalyses: analyses.length,
                data: analyses
            };
            
            return JSON.stringify(exportData, null, 2);
        }
        
        /**
         * 获取统计信息
         * @returns {Object} - 统计信息
         */
        getStatistics() {
            const analyses = this.getAllAnalyses();
            
            // 按月份分组
            const byMonth = {};
            analyses.forEach(analysis => {
                const date = new Date(analysis.createdAt);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                
                if (!byMonth[monthKey]) {
                    byMonth[monthKey] = 0;
                }
                byMonth[monthKey]++;
            });
            
            // 计算平均答案数量
            const totalAnswers = analyses.reduce((sum, analysis) => 
                sum + (analysis.answers ? Object.keys(analysis.answers).length : 0), 0);
            
            const avgAnswers = analyses.length > 0 ? 
                Math.round(totalAnswers / analyses.length) : 0;
            
            return {
                total: analyses.length,
                completed: analyses.filter(a => 
                    a.answers && Object.keys(a.answers).length >= 5).length,
                recent: analyses.slice(-5),
                byMonth: byMonth,
                totalAnswers: totalAnswers,
                avgAnswers: avgAnswers
            };
        }
    }
    
    // 导出到全局作用域
    window.PhotoAnalyzer = PhotoAnalyzer;
    window.PhotoAnalysisStorage = PhotoAnalysisStorage;
    
    // 自动初始化
    document.addEventListener('DOMContentLoaded', () => {
        // 确保页面有必要的元素
        if (document.getElementById('uploadArea')) {
            window.photoAnalyzer = new PhotoAnalyzer();
        }
    });
    
})();
