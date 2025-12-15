/**
 * 人文赋能能力平台 - 数据持久化核心模块
 * 版本: 1.0.0
 * 最后更新: 2024-01-15
 * 
 * 功能：
 * 1. 统一数据存储接口
 * 2. 多类型数据管理（照片分析、角色探索、技能传承）
 * 3. 数据导入导出
 * 4. 数据备份与恢复
 * 5. 数据迁移与版本管理
 */

// 防止全局变量污染
(function() {
    'use strict';
    
    /**
     * 数据持久化管理器 - 主类
     */
    class DataPersistenceManager {
        constructor() {
            // 存储键名配置
            this.STORAGE_KEYS = {
                PHOTO_ANALYSES: 'photoAnalyses_v1',
                CHARACTER_EXPLORATIONS: 'characterExplorations_v1',
                SKILL_HERITAGES: 'skillHeritages_v1',
                USER_PROFILE: 'userProfile_v1',
                ACHIEVEMENTS: 'achievements_v1',
                SETTINGS: 'dashboardSettings_v1',
                BACKUP_HISTORY: 'backupHistory_v1',
                VERSION_INFO: 'versionInfo_v1'
            };
            
            // 默认配置
            this.DEFAULT_CONFIG = {
                maxItems: {
                    photoAnalyses: 100,
                    characterExplorations: 200,
                    skillHeritages: 150
                },
                backup: {
                    autoBackup: true,
                    maxBackups: 10,
                    backupInterval: 7 * 24 * 60 * 60 * 1000 // 7天
                },
                export: {
                    defaultFormat: 'json',
                    includePhotos: true,
                    compress: true
                }
            };
            
            // 版本信息
            this.VERSION_INFO = {
                current: '1.0.0',
                migrations: {
                    '1.0.0': this.migrateToV1_0_0.bind(this)
                }
            };
            
            // 初始化存储系统
            this.initStorage();
            
            // 检查并执行数据迁移
            this.checkAndMigrate();
        }
        
        /**
         * 初始化存储系统
         */
        initStorage() {
            // 初始化所有存储键
            Object.values(this.STORAGE_KEYS).forEach(key => {
                if (!localStorage.getItem(key)) {
                    localStorage.setItem(key, JSON.stringify(this.getDefaultData(key)));
                }
            });
            
            // 初始化备份历史
            this.initBackupHistory();
            
            console.log('数据持久化系统初始化完成');
        }
        
        /**
         * 获取默认数据
         */
        getDefaultData(storageKey) {
            const defaults = {
                [this.STORAGE_KEYS.PHOTO_ANALYSES]: [],
                [this.STORAGE_KEYS.CHARACTER_EXPLORATIONS]: [],
                [this.STORAGE_KEYS.SKILL_HERITAGES]: [],
                [this.STORAGE_KEYS.USER_PROFILE]: this.getDefaultUserProfile(),
                [this.STORAGE_KEYS.ACHIEVEMENTS]: [],
                [this.STORAGE_KEYS.SETTINGS]: this.getDefaultSettings(),
                [this.STORAGE_KEYS.BACKUP_HISTORY]: [],
                [this.STORAGE_KEYS.VERSION_INFO]: {
                    version: this.VERSION_INFO.current,
                    lastMigration: new Date().toISOString()
                }
            };
            
            return defaults[storageKey] || [];
        }
        
        /**
         * 获取默认用户资料
         */
        getDefaultUserProfile() {
            return {
                id: this.generateUniqueId(),
                name: '探索者',
                avatar: '👤',
                bio: '人文赋能能力平台的探索者',
                goal: 'casual',
                level: 1,
                experience: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                preferences: {
                    theme: 'light',
                    language: 'zh-CN',
                    notifications: true
                }
            };
        }
        
        /**
         * 获取默认设置
         */
        getDefaultSettings() {
            return {
                autoSave: true,
                autoBackup: true,
                backupReminder: true,
                darkMode: false,
                exportFormat: 'json',
                compressData: true,
                syncAcrossDevices: false,
                dataRetentionDays: 365,
                lastBackup: null,
                nextBackup: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            };
        }
        
        /**
         * 初始化备份历史
         */
        initBackupHistory() {
            const history = this.getBackupHistory();
            if (history.length === 0) {
                this.addBackupRecord({
                    id: this.generateUniqueId(),
                    type: 'initial',
                    timestamp: new Date().toISOString(),
                    itemCount: {
                        photoAnalyses: 0,
                        characterExplorations: 0,
                        skillHeritages: 0
                    },
                    size: 0,
                    note: '初始备份'
                });
            }
        }
        
        /**
         * 检查并执行数据迁移
         */
        checkAndMigrate() {
            const versionInfo = this.getVersionInfo();
            
            if (versionInfo.version !== this.VERSION_INFO.current) {
                console.log(`检测到数据版本变化: ${versionInfo.version} -> ${this.VERSION_INFO.current}`);
                this.performMigration(versionInfo.version, this.VERSION_INFO.current);
            }
        }
        
        /**
         * 执行数据迁移
         */
        performMigration(fromVersion, toVersion) {
            console.log(`开始数据迁移: ${fromVersion} -> ${toVersion}`);
            
            try {
                // 执行版本间迁移函数
                const migrations = this.VERSION_INFO.migrations;
                if (migrations[toVersion]) {
                    migrations[toVersion]();
                }
                
                // 更新版本信息
                this.setVersionInfo({
                    version: toVersion,
                    lastMigration: new Date().toISOString(),
                    previousVersion: fromVersion
                });
                
                console.log('数据迁移完成');
            } catch (error) {
                console.error('数据迁移失败:', error);
                throw new Error(`数据迁移失败: ${error.message}`);
            }
        }
        
        /**
         * 迁移到版本 1.0.0
         */
        migrateToV1_0_0() {
            console.log('执行迁移到版本 1.0.0');
            
            // 检查并迁移旧版本数据
            const oldKeys = [
                'photoAnalyses',
                'characterExplorations',
                'skillHeritages',
                'userProfile',
                'settings'
            ];
            
            oldKeys.forEach(oldKey => {
                const oldData = localStorage.getItem(oldKey);
                if (oldData) {
                    try {
                        const parsedData = JSON.parse(oldData);
                        const newKey = this.STORAGE_KEYS[oldKey.toUpperCase()] || oldKey;
                        localStorage.setItem(newKey, JSON.stringify(parsedData));
                        localStorage.removeItem(oldKey);
                        console.log(`已迁移数据: ${oldKey} -> ${newKey}`);
                    } catch (error) {
                        console.error(`迁移 ${oldKey} 失败:`, error);
                    }
                }
            });
            
            // 迁移完成
            return true;
        }
        
        /**
         * ========================
         * 通用数据操作方法
         * ========================
         */
        
        /**
         * 保存数据
         */
        saveData(type, data) {
            const storageKey = this.getStorageKey(type);
            if (!storageKey) {
                throw new Error(`不支持的数据类型: ${type}`);
            }
            
            try {
                // 获取现有数据
                const existingData = this.getData(type);
                
                // 设置数据ID和时间戳
                data.id = data.id || this.generateUniqueId();
                data.createdAt = data.createdAt || new Date().toISOString();
                data.updatedAt = new Date().toISOString();
                
                // 检查是否已存在（更新操作）
                const existingIndex = existingData.findIndex(item => item.id === data.id);
                
                if (existingIndex !== -1) {
                    // 更新现有数据
                    existingData[existingIndex] = {
                        ...existingData[existingIndex],
                        ...data,
                        updatedAt: new Date().toISOString()
                    };
                } else {
                    // 添加新数据
                    existingData.push(data);
                    
                    // 检查数量限制
                    const maxItems = this.DEFAULT_CONFIG.maxItems[type] || 1000;
                    if (existingData.length > maxItems) {
                        existingData.shift(); // 移除最旧的数据
                    }
                }
                
                // 保存到本地存储
                localStorage.setItem(storageKey, JSON.stringify(existingData));
                
                // 自动备份检查
                if (this.DEFAULT_CONFIG.backup.autoBackup) {
                    this.checkAutoBackup();
                }
                
                return {
                    success: true,
                    id: data.id,
                    message: '数据保存成功'
                };
            } catch (error) {
                console.error('保存数据失败:', error);
                return {
                    success: false,
                    error: error.message,
                    message: '数据保存失败'
                };
            }
        }
        
        /**
         * 批量保存数据
         */
        saveBatchData(type, items) {
            const results = [];
            
            items.forEach(item => {
                const result = this.saveData(type, item);
                results.push(result);
            });
            
            return results;
        }
        
        /**
         * 获取数据
         */
        getData(type, id = null) {
            const storageKey = this.getStorageKey(type);
            if (!storageKey) {
                throw new Error(`不支持的数据类型: ${type}`);
            }
            
            try {
                const data = localStorage.getItem(storageKey);
                const parsedData = JSON.parse(data) || [];
                
                if (id) {
                    // 返回指定ID的数据
                    return parsedData.find(item => item.id === id) || null;
                } else {
                    // 返回所有数据
                    return parsedData;
                }
            } catch (error) {
                console.error('获取数据失败:', error);
                return id ? null : [];
            }
        }
        
        /**
         * 更新数据
         */
        updateData(type, id, updates) {
            try {
                const allData = this.getData(type);
                const index = allData.findIndex(item => item.id === id);
                
                if (index === -1) {
                    return {
                        success: false,
                        error: '未找到指定数据'
                    };
                }
                
                // 更新数据
                allData[index] = {
                    ...allData[index],
                    ...updates,
                    updatedAt: new Date().toISOString()
                };
                
                // 保存更新后的数据
                const storageKey = this.getStorageKey(type);
                localStorage.setItem(storageKey, JSON.stringify(allData));
                
                return {
                    success: true,
                    message: '数据更新成功'
                };
            } catch (error) {
                console.error('更新数据失败:', error);
                return {
                    success: false,
                    error: error.message
                };
            }
        }
        
        /**
         * 删除数据
         */
        deleteData(type, id) {
            try {
                const allData = this.getData(type);
                const initialLength = allData.length;
                
                // 过滤掉要删除的数据
                const filteredData = allData.filter(item => item.id !== id);
                
                if (filteredData.length === initialLength) {
                    return {
                        success: false,
                        error: '未找到要删除的数据'
                    };
                }
                
                // 保存过滤后的数据
                const storageKey = this.getStorageKey(type);
                localStorage.setItem(storageKey, JSON.stringify(filteredData));
                
                return {
                    success: true,
                    message: '数据删除成功',
                    deletedCount: initialLength - filteredData.length
                };
            } catch (error) {
                console.error('删除数据失败:', error);
                return {
                    success: false,
                    error: error.message
                };
            }
        }
        
        /**
         * 批量删除数据
         */
        deleteBatchData(type, ids) {
            const results = [];
            
            ids.forEach(id => {
                const result = this.deleteData(type, id);
                results.push({ id, ...result });
            });
            
            return results;
        }
        
        /**
         * 搜索数据
         */
        searchData(type, query, fields = []) {
            const allData = this.getData(type);
            
            if (!query) {
                return allData;
            }
            
            const searchTerm = query.toLowerCase();
            
            return allData.filter(item => {
                // 如果没有指定字段，搜索所有字符串字段
                if (fields.length === 0) {
                    return Object.values(item).some(value => {
                        if (typeof value === 'string') {
                            return value.toLowerCase().includes(searchTerm);
                        }
                        return false;
                    });
                }
                
                // 搜索指定字段
                return fields.some(field => {
                    const value = this.getNestedValue(item, field);
                    if (typeof value === 'string') {
                        return value.toLowerCase().includes(searchTerm);
                    }
                    return false;
                });
            });
        }
        
        /**
         * 过滤数据
         */
        filterData(type, filterFn) {
            const allData = this.getData(type);
            return allData.filter(filterFn);
        }
        
        /**
         * 排序数据
         */
        sortData(type, sortFn) {
            const allData = this.getData(type);
            return [...allData].sort(sortFn);
        }
        
        /**
         * 统计数据
         */
        getStatistics(type) {
            const allData = this.getData(type);
            
            const statistics = {
                total: allData.length,
                byMonth: {},
                byStatus: {},
                recent: allData.slice(-5)
            };
            
            // 按月份统计
            allData.forEach(item => {
                const date = new Date(item.createdAt || item.updatedAt);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                
                if (!statistics.byMonth[monthKey]) {
                    statistics.byMonth[monthKey] = 0;
                }
                statistics.byMonth[monthKey]++;
            });
            
            // 按状态统计（如果数据有status字段）
            allData.forEach(item => {
                if (item.status) {
                    if (!statistics.byStatus[item.status]) {
                        statistics.byStatus[item.status] = 0;
                    }
                    statistics.byStatus[item.status]++;
                }
            });
            
            // 计算其他统计信息
            if (allData.length > 0) {
                const dates = allData
                    .map(item => new Date(item.createdAt || item.updatedAt))
                    .sort((a, b) => a - b);
                
                statistics.firstRecord = dates[0];
                statistics.lastRecord = dates[dates.length - 1];
                statistics.timeSpanDays = Math.ceil((statistics.lastRecord - statistics.firstRecord) / (1000 * 60 * 60 * 24));
            }
            
            return statistics;
        }
        
        /**
         * ========================
         * 类型特定的数据操作方法
         * ========================
         */
        
        /**
         * 照片分析方法
         */
        
        savePhotoAnalysis(analysisData) {
            return this.saveData('photoAnalyses', analysisData);
        }
        
        getPhotoAnalysis(id = null) {
            return this.getData('photoAnalyses', id);
        }
        
        updatePhotoAnalysis(id, updates) {
            return this.updateData('photoAnalyses', id, updates);
        }
        
        deletePhotoAnalysis(id) {
            return this.deleteData('photoAnalyses', id);
        }
        
        searchPhotoAnalyses(query) {
            return this.searchData('photoAnalyses', query, ['photoData.name', 'answers.1']);
        }
        
        getPhotoAnalysisStatistics() {
            return this.getStatistics('photoAnalyses');
        }
        
        /**
         * 角色探索方法
         */
        
        saveCharacterExploration(explorationData) {
            return this.saveData('characterExplorations', explorationData);
        }
        
        getCharacterExploration(id = null) {
            return this.getData('characterExplorations', id);
        }
        
        updateCharacterExploration(id, updates) {
            return this.updateData('characterExplorations', id, updates);
        }
        
        deleteCharacterExploration(id) {
            return this.deleteData('characterExplorations', id);
        }
        
        searchCharacterExplorations(query) {
            return this.searchData('characterExplorations', query, ['characterName', 'relationship', 'story']);
        }
        
        getCharacterExplorationStatistics() {
            return this.getStatistics('characterExplorations');
        }
        
        /**
         * 技能传承方法
         */
        
        saveSkillHeritage(heritageData) {
            return this.saveData('skillHeritages', heritageData);
        }
        
        getSkillHeritage(id = null) {
            return this.getData('skillHeritages', id);
        }
        
        updateSkillHeritage(id, updates) {
            return this.updateData('skillHeritages', id, updates);
        }
        
        deleteSkillHeritage(id) {
            return this.deleteData('skillHeritages', id);
        }
        
        searchSkillHeritages(query) {
            return this.searchData('skillHeritages', query, ['skillName', 'category', 'description']);
        }
        
        getSkillHeritageStatistics() {
            return this.getStatistics('skillHeritages');
        }
        
        /**
         * 用户资料方法
         */
        
        saveUserProfile(profileData) {
            return this.saveData('userProfile', profileData);
        }
        
        getUserProfile() {
            return this.getData('userProfile');
        }
        
        updateUserProfile(updates) {
            // 用户资料是单条数据，使用第一个ID
            const profile = this.getUserProfile();
            if (profile && profile.id) {
                return this.updateData('userProfile', profile.id, updates);
            } else {
                return this.saveData('userProfile', updates);
            }
        }
        
        /**
         * 成就方法
         */
        
        saveAchievement(achievementData) {
            return this.saveData('achievements', achievementData);
        }
        
        getAchievements() {
            return this.getData('achievements');
        }
        
        unlockAchievement(achievementId) {
            const achievements = this.getAchievements();
            const existing = achievements.find(a => a.id === achievementId);
            
            if (!existing) {
                const newAchievement = {
                    id: achievementId,
                    unlockedAt: new Date().toISOString(),
                    unlocked: true
                };
                return this.saveData('achievements', newAchievement);
            } else if (!existing.unlocked) {
                return this.updateData('achievements', achievementId, {
                    unlocked: true,
                    unlockedAt: new Date().toISOString()
                });
            }
            
            return { success: true, message: '成就已解锁' };
        }
        
        /**
         * 设置方法
         */
        
        saveSettings(settingsData) {
            return this.saveData('settings', settingsData);
        }
        
        getSettings() {
            return this.getData('settings');
        }
        
        updateSettings(updates) {
            const settings = this.getSettings();
            if (settings && settings.id) {
                return this.updateData('settings', settings.id, updates);
            } else {
                return this.saveData('settings', updates);
            }
        }
        
        /**
         * ========================
         * 数据导入导出方法
         * ========================
         */
        
        /**
         * 导出数据
         */
        exportData(options = {}) {
            const {
                types = ['all'],
                format = 'json',
                includePhotos = true,
                compress = true
            } = options;
            
            try {
                const exportData = {
                    metadata: {
                        exportDate: new Date().toISOString(),
                        version: this.VERSION_INFO.current,
                        platform: '人文赋能能力平台',
                        exportFormat: format
                    },
                    data: {}
                };
                
                // 确定要导出的数据类型
                const dataTypes = types.includes('all') 
                    ? ['photoAnalyses', 'characterExplorations', 'skillHeritages', 'userProfile', 'achievements', 'settings']
                    : types;
                
                // 收集数据
                dataTypes.forEach(type => {
                    const storageKey = this.getStorageKey(type);
                    if (storageKey) {
                        const data = localStorage.getItem(storageKey);
                        exportData.data[type] = JSON.parse(data);
                    }
                });
                
                // 处理照片数据（如果不包含照片）
                if (!includePhotos && exportData.data.photoAnalyses) {
                    exportData.data.photoAnalyses = exportData.data.photoAnalyses.map(analysis => {
                        const { photo, ...rest } = analysis;
                        return {
                            ...rest,
                            photo: 'EXCLUDED_FROM_EXPORT'
                        };
                    });
                }
                
                // 生成导出内容
                let exportContent;
                switch (format) {
                    case 'json':
                        exportContent = JSON.stringify(exportData, null, compress ? 0 : 2);
                        break;
                    case 'text':
                        exportContent = this.formatAsText(exportData);
                        break;
                    default:
                        throw new Error(`不支持的导出格式: ${format}`);
                }
                
                // 压缩（如果需要）
                if (compress && format === 'json') {
                    // 简单压缩：移除不必要的空格
                    exportContent = exportContent.replace(/\s+/g, ' ');
                }
                
                return {
                    success: true,
                    content: exportContent,
                    format: format,
                    size: new Blob([exportContent]).size,
                    dataTypes: dataTypes
                };
            } catch (error) {
                console.error('导出数据失败:', error);
                return {
                    success: false,
                    error: error.message
                };
            }
        }
        
        /**
         * 导入数据
         */
        importData(importData, options = {}) {
            const {
                merge = false,
                overwrite = false,
                backupBeforeImport = true
            } = options;
            
            try {
                // 验证导入数据
                if (!importData.metadata || !importData.data) {
                    throw new Error('无效的导入数据格式');
                }
                
                // 备份当前数据
                if (backupBeforeImport) {
                    this.createBackup('pre_import_backup');
                }
                
                const results = {};
                
                // 处理每种数据类型
                Object.keys(importData.data).forEach(type => {
                    const importedItems = importData.data[type];
                    
                    if (!Array.isArray(importedItems) && type !== 'userProfile' && type !== 'settings') {
                        console.warn(`数据类型 ${type} 不是数组，跳过导入`);
                        return;
                    }
                    
                    if (overwrite) {
                        // 覆盖模式：完全替换现有数据
                        const storageKey = this.getStorageKey(type);
                        if (storageKey) {
                            localStorage.setItem(storageKey, JSON.stringify(importedItems));
                            results[type] = {
                                action: 'overwrite',
                                count: Array.isArray(importedItems) ? importedItems.length : 1
                            };
                        }
                    } else if (merge) {
                        // 合并模式：合并数据
                        const existingData = this.getData(type);
                        let mergedData;
                        
                        if (Array.isArray(existingData) && Array.isArray(importedItems)) {
                            // 数组合并，基于ID去重
                            const existingIds = new Set(existingData.map(item => item.id));
                            const newItems = importedItems.filter(item => !existingIds.has(item.id));
                            mergedData = [...existingData, ...newItems];
                            results[type] = {
                                action: 'merge',
                                existingCount: existingData.length,
                                importedCount: importedItems.length,
                                newCount: newItems.length,
                                finalCount: mergedData.length
                            };
                        } else {
                            // 非数组合并（如用户资料）
                            mergedData = { ...existingData, ...importedItems };
                            results[type] = {
                                action: 'merge',
                                type: 'object'
                            };
                        }
                        
                        const storageKey = this.getStorageKey(type);
                        localStorage.setItem(storageKey, JSON.stringify(mergedData));
                    } else {
                        // 跳过已有数据
                        results[type] = {
                            action: 'skip',
                            reason: '未指定合并或覆盖模式'
                        };
                    }
                });
                
                // 添加导入记录
                this.addBackupRecord({
                    id: this.generateUniqueId(),
                    type: 'import',
                    timestamp: new Date().toISOString(),
                    sourceVersion: importData.metadata.version,
                    itemCount: Object.keys(importData.data).reduce((acc, type) => {
                        const items = importData.data[type];
                        acc[type] = Array.isArray(items) ? items.length : 1;
                        return acc;
                    }, {}),
                    size: new Blob([JSON.stringify(importData)]).size,
                    note: `数据导入 - ${importData.metadata.exportDate}`
                });
                
                return {
                    success: true,
                    results: results,
                    message: '数据导入成功'
                };
            } catch (error) {
                console.error('导入数据失败:', error);
                return {
                    success: false,
                    error: error.message
                };
            }
        }
        
        /**
         * 导出为文本格式
         */
        formatAsText(data) {
            let text = '人文赋能能力平台 - 数据导出\n';
            text += '='.repeat(50) + '\n\n';
            text += `导出时间: ${new Date(data.metadata.exportDate).toLocaleString('zh-CN')}\n`;
            text += `平台版本: ${data.metadata.version}\n\n`;
            
            // 照片分析数据
            if (data.data.photoAnalyses && data.data.photoAnalyses.length > 0) {
                text += '照片分析记录:\n';
                text += '-'.repeat(30) + '\n';
                data.data.photoAnalyses.forEach((analysis, index) => {
                    text += `${index + 1}. ${analysis.photoData?.name || '未命名照片'}\n`;
                    text += `   创建时间: ${new Date(analysis.createdAt).toLocaleDateString('zh-CN')}\n`;
                    text += `   回答数量: ${Object.keys(analysis.answers || {}).length}\n\n`;
                });
            }
            
            // 角色探索数据
            if (data.data.characterExplorations && data.data.characterExplorations.length > 0) {
                text += '角色探索记录:\n';
                text += '-'.repeat(30) + '\n';
                data.data.characterExplorations.forEach((character, index) => {
                    text += `${index + 1}. ${character.characterName || '未命名角色'}\n`;
                    text += `   关系: ${character.relationship || '未知'}\n`;
                    text += `   特质: ${(character.traits || []).join(', ')}\n\n`;
                });
            }
            
            // 技能传承数据
            if (data.data.skillHeritages && data.data.skillHeritages.length > 0) {
                text += '技能传承记录:\n';
                text += '-'.repeat(30) + '\n';
                data.data.skillHeritages.forEach((skill, index) => {
                    text += `${index + 1}. ${skill.skillName || '未命名技能'}\n`;
                    text += `   类别: ${skill.category || '未分类'}\n`;
                    text += `   难度: ${skill.difficulty || '未知'}\n\n`;
                });
            }
            
            return text;
        }
        
        /**
         * ========================
         * 备份与恢复方法
         * ========================
         */
        
        /**
         * 创建备份
         */
        createBackup(note = '手动备份') {
            try {
                // 导出当前数据
                const exportResult = this.exportData({
                    types: ['all'],
                    includePhotos: true,
                    compress: true
                });
                
                if (!exportResult.success) {
                    throw new Error('备份创建失败: ' + exportResult.error);
                }
                
                // 创建备份记录
                const backupRecord = {
                    id: this.generateUniqueId(),
                    type: 'manual',
                    timestamp: new Date().toISOString(),
                    data: exportResult.content,
                    size: exportResult.size,
                    format: exportResult.format,
                    note: note,
                    itemCount: {
                        photoAnalyses: this.getData('photoAnalyses').length,
                        characterExplorations: this.getData('characterExplorations').length,
                        skillHeritages: this.getData('skillHeritages').length
                    }
                };
                
                // 添加到备份历史
                this.addBackupRecord(backupRecord);
                
                // 清理旧备份
                this.cleanupOldBackups();
                
                // 更新设置中的最后备份时间
                this.updateSettings({
                    lastBackup: new Date().toISOString(),
                    nextBackup: new Date(Date.now() + this.DEFAULT_CONFIG.backup.backupInterval).toISOString()
                });
                
                return {
                    success: true,
                    backupId: backupRecord.id,
                    size: backupRecord.size,
                    message: '备份创建成功'
                };
            } catch (error) {
                console.error('创建备份失败:', error);
                return {
                    success: false,
                    error: error.message
                };
            }
        }
        
        /**
         * 恢复备份
         */
        restoreBackup(backupId) {
            try {
                const backupHistory = this.getBackupHistory();
                const backup = backupHistory.find(b => b.id === backupId);
                
                if (!backup) {
                    throw new Error('未找到指定的备份');
                }
                
                // 解析备份数据
                let backupData;
                try {
                    backupData = JSON.parse(backup.data);
                } catch (error) {
                    throw new Error('备份数据解析失败');
                }
                
                // 导入备份数据（覆盖模式）
                const importResult = this.importData(backupData, {
                    overwrite: true,
                    backupBeforeImport: true
                });
                
                if (!importResult.success) {
                    throw new Error('恢复失败: ' + importResult.error);
                }
                
                // 添加恢复记录
                this.addBackupRecord({
                    id: this.generateUniqueId(),
                    type: 'restore',
                    timestamp: new Date().toISOString(),
                    restoredBackupId: backupId,
                    note: `从备份 ${backupId} 恢复数据`
                });
                
                return {
                    success: true,
                    message: '数据恢复成功'
                };
            } catch (error) {
                console.error('恢复备份失败:', error);
                return {
                    success: false,
                    error: error.message
                };
            }
        }
        
        /**
         * 获取备份历史
         */
        getBackupHistory() {
            try {
                const data = localStorage.getItem(this.STORAGE_KEYS.BACKUP_HISTORY);
                return JSON.parse(data) || [];
            } catch (error) {
                console.error('获取备份历史失败:', error);
                return [];
            }
        }
        
        /**
         * 添加备份记录
         */
        addBackupRecord(record) {
            try {
                const history = this.getBackupHistory();
                history.push(record);
                
                // 按时间戳排序（最新的在前）
                history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                
                localStorage.setItem(this.STORAGE_KEYS.BACKUP_HISTORY, JSON.stringify(history));
                
                return { success: true };
            } catch (error) {
                console.error('添加备份记录失败:', error);
                return { success: false, error: error.message };
            }
        }
        
        /**
         * 清理旧备份
         */
        cleanupOldBackups() {
            const history = this.getBackupHistory();
            const maxBackups = this.DEFAULT_CONFIG.backup.maxBackups;
            
            if (history.length > maxBackups) {
                // 保留最新的maxBackups个备份
                const recentBackups = history.slice(0, maxBackups);
                localStorage.setItem(this.STORAGE_KEYS.BACKUP_HISTORY, JSON.stringify(recentBackups));
                
                return {
                    success: true,
                    removedCount: history.length - maxBackups
                };
            }
            
            return { success: true, removedCount: 0 };
        }
        
        /**
         * 检查自动备份
         */
        checkAutoBackup() {
            const settings = this.getSettings();
            
            if (!settings.autoBackup) {
                return false;
            }
            
            const now = new Date();
            const nextBackup = settings.nextBackup ? new Date(settings.nextBackup) : null;
            
            if (!nextBackup || now >= nextBackup) {
                // 执行自动备份
                this.createBackup('自动备份');
                return true;
            }
            
            return false;
        }
        
        /**
         * ========================
         * 工具方法
         * ========================
         */
        
        /**
         * 获取存储键名
         */
        getStorageKey(dataType) {
            const keyMap = {
                'photoAnalyses': this.STORAGE_KEYS.PHOTO_ANALYSES,
                'characterExplorations': this.STORAGE_KEYS.CHARACTER_EXPLORATIONS,
                'skillHeritages': this.STORAGE_KEYS.SKILL_HERITAGES,
                'userProfile': this.STORAGE_KEYS.USER_PROFILE,
                'achievements': this.STORAGE_KEYS.ACHIEVEMENTS,
                'settings': this.STORAGE_KEYS.SETTINGS
            };
            
            return keyMap[dataType];
        }
        
        /**
         * 生成唯一ID
         */
        generateUniqueId() {
            return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
        }
        
        /**
         * 获取嵌套对象的值
         */
        getNestedValue(obj, path) {
            return path.split('.').reduce((current, key) => {
                return current ? current[key] : undefined;
            }, obj);
        }
        
        /**
         * 获取版本信息
         */
        getVersionInfo() {
            try {
                const data = localStorage.getItem(this.STORAGE_KEYS.VERSION_INFO);
                return JSON.parse(data) || { version: '0.0.0' };
            } catch (error) {
                return { version: '0.0.0' };
            }
        }
        
        /**
         * 设置版本信息
         */
        setVersionInfo(info) {
            try {
                localStorage.setItem(this.STORAGE_KEYS.VERSION_INFO, JSON.stringify(info));
                return { success: true };
            } catch (error) {
                return { success: false, error: error.message };
            }
        }
        
        /**
         * 获取所有数据统计
         */
        getAllStatistics() {
            return {
                photoAnalyses: this.getPhotoAnalysisStatistics(),
                characterExplorations: this.getCharacterExplorationStatistics(),
                skillHeritages: this.getSkillHeritageStatistics(),
                backupHistory: {
                    total: this.getBackupHistory().length,
                    lastBackup: this.getBackupHistory()[0] || null
                }
            };
        }
        
        /**
         * 获取存储使用情况
         */
        getStorageUsage() {
            const usage = {};
            let totalSize = 0;
            
            Object.values(this.STORAGE_KEYS).forEach(key => {
                const data = localStorage.getItem(key);
                if (data) {
                    const size = new Blob([data]).size;
                    usage[key] = {
                        size: size,
                        sizeFormatted: this.formatFileSize(size)
                    };
                    totalSize += size;
                }
            });
            
            return {
                ...usage,
                total: {
                    size: totalSize,
                    sizeFormatted: this.formatFileSize(totalSize)
                }
            };
        }
        
        /**
         * 格式化文件大小
         */
        formatFileSize(bytes) {
            if (bytes === 0) return '0 Bytes';
            
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }
        
        /**
         * 清除所有数据
         */
        clearAllData() {
            try {
                Object.values(this.STORAGE_KEYS).forEach(key => {
                    localStorage.removeItem(key);
                });
                
                // 重新初始化
                this.initStorage();
                
                return {
                    success: true,
                    message: '所有数据已清除'
                };
            } catch (error) {
                return {
                    success: false,
                    error: error.message
                };
            }
        }
        
        /**
         * 导出为文件
         */
        exportToFile(options = {}) {
            const exportResult = this.exportData(options);
            
            if (!exportResult.success) {
                return exportResult;
            }
            
            const blob = new Blob([exportResult.content], { 
                type: this.getMimeType(exportResult.format)
            });
            
            const url = URL.createObjectURL(blob);
            const filename = `人文赋能平台数据_${new Date().toISOString().split('T')[0]}.${exportResult.format}`;
            
            return {
                success: true,
                url: url,
                filename: filename,
                size: exportResult.size
            };
        }
        
        /**
         * 获取MIME类型
         */
        getMimeType(format) {
            const mimeTypes = {
                'json': 'application/json',
                'text': 'text/plain'
            };
            
            return mimeTypes[format] || 'application/octet-stream';
        }
        
        /**
         * 测试存储可用性
         */
        testStorage() {
            const testKey = 'storage_test_' + Date.now();
            const testValue = 'test_value';
            
            try {
                // 写入测试
                localStorage.setItem(testKey, testValue);
                
                // 读取测试
                const readValue = localStorage.getItem(testKey);
                
                // 清理测试
                localStorage.removeItem(testKey);
                
                return {
                    success: readValue === testValue,
                    available: true,
                    message: '本地存储可用'
                };
            } catch (error) {
                return {
                    success: false,
                    available: false,
                    error: error.message,
                    message: '本地存储不可用'
                };
            }
        }
    }
    
    /**
     * 数据持久化管理器工厂
     */
    class DataPersistenceFactory {
        static createManager() {
            return new DataPersistenceManager();
        }
        
        static createPhotoAnalysisStorage() {
            return {
                saveAnalysis: (data) => DataPersistenceManager.prototype.savePhotoAnalysis.call(window.dataManager, data),
                getAnalysis: (id) => DataPersistenceManager.prototype.getPhotoAnalysis.call(window.dataManager, id),
                getAllAnalyses: () => DataPersistenceManager.prototype.getData.call(window.dataManager, 'photoAnalyses'),
                updateAnalysis: (id, updates) => DataPersistenceManager.prototype.updatePhotoAnalysis.call(window.dataManager, id, updates),
                deleteAnalysis: (id) => DataPersistenceManager.prototype.deletePhotoAnalysis.call(window.dataManager, id),
                exportAllAnalyses: () => DataPersistenceManager.prototype.exportData.call(window.dataManager, { types: ['photoAnalyses'] }),
                getStatistics: () => DataPersistenceManager.prototype.getPhotoAnalysisStatistics.call(window.dataManager),
                clearAll: () => {
                    localStorage.removeItem(window.dataManager.STORAGE_KEYS.PHOTO_ANALYSES);
                    window.dataManager.initStorage();
                    return { success: true };
                }
            };
        }
        
        static createCharacterStorage() {
            return {
                saveExploration: (data) => DataPersistenceManager.prototype.saveCharacterExploration.call(window.dataManager, data),
                getExploration: (id) => DataPersistenceManager.prototype.getCharacterExploration.call(window.dataManager, id),
                getAllExplorations: () => DataPersistenceManager.prototype.getData.call(window.dataManager, 'characterExplorations'),
                updateExploration: (id, updates) => DataPersistenceManager.prototype.updateCharacterExploration.call(window.dataManager, id, updates),
                deleteExploration: (id) => DataPersistenceManager.prototype.deleteCharacterExploration.call(window.dataManager, id),
                exportAllExplorations: () => DataPersistenceManager.prototype.exportData.call(window.dataManager, { types: ['characterExplorations'] }),
                getStatistics: () => DataPersistenceManager.prototype.getCharacterExplorationStatistics.call(window.dataManager),
                clearAll: () => {
                    localStorage.removeItem(window.dataManager.STORAGE_KEYS.CHARACTER_EXPLORATIONS);
                    window.dataManager.initStorage();
                    return { success: true };
                }
            };
        }
        
        static createSkillStorage() {
            return {
                saveHeritage: (data) => DataPersistenceManager.prototype.saveSkillHeritage.call(window.dataManager, data),
                getHeritage: (id) => DataPersistenceManager.prototype.getSkillHeritage.call(window.dataManager, id),
                getAllHeritages: () => DataPersistenceManager.prototype.getData.call(window.dataManager, 'skillHeritages'),
                updateHeritage: (id, updates) => DataPersistenceManager.prototype.updateSkillHeritage.call(window.dataManager, id, updates),
                deleteHeritage: (id) => DataPersistenceManager.prototype.deleteSkillHeritage.call(window.dataManager, id),
                exportAllHeritages: () => DataPersistenceManager.prototype.exportData.call(window.dataManager, { types: ['skillHeritages'] }),
                getStatistics: () => DataPersistenceManager.prototype.getSkillHeritageStatistics.call(window.dataManager),
                clearAll: () => {
                    localStorage.removeItem(window.dataManager.STORAGE_KEYS.SKILL_HERITAGES);
                    window.dataManager.initStorage();
                    return { success: true };
                }
            };
        }
        
        static createUserStorage() {
            return {
                saveProfile: (data) => DataPersistenceManager.prototype.saveUserProfile.call(window.dataManager, data),
                getProfile: () => {
                    const profile = DataPersistenceManager.prototype.getUserProfile.call(window.dataManager);
                    return Array.isArray(profile) && profile.length > 0 ? profile[0] : profile;
                },
                updateProfile: (updates) => DataPersistenceManager.prototype.updateUserProfile.call(window.dataManager, updates),
                saveSettings: (data) => DataPersistenceManager.prototype.saveSettings.call(window.dataManager, data),
                getSettings: () => {
                    const settings = DataPersistenceManager.prototype.getSettings.call(window.dataManager);
                    return Array.isArray(settings) && settings.length > 0 ? settings[0] : settings;
                },
                updateSettings: (updates) => DataPersistenceManager.prototype.updateSettings.call(window.dataManager, updates),
                clearAll: () => {
                    localStorage.removeItem(window.dataManager.STORAGE_KEYS.USER_PROFILE);
                    localStorage.removeItem(window.dataManager.STORAGE_KEYS.SETTINGS);
                    window.dataManager.initStorage();
                    return { success: true };
                }
            };
        }
    }
    
    // 导出到全局作用域
    window.DataPersistenceManager = DataPersistenceManager;
    window.DataPersistenceFactory = DataPersistenceFactory;
    
    // 自动初始化
    document.addEventListener('DOMContentLoaded', () => {
        try {
            // 创建全局数据管理器实例
            window.dataManager = new DataPersistenceManager();
            
            // 创建各个存储模块的简化接口
            window.PhotoAnalysisStorage = DataPersistenceFactory.createPhotoAnalysisStorage();
            window.CharacterStorage = DataPersistenceFactory.createCharacterStorage();
            window.SkillStorage = DataPersistenceFactory.createSkillStorage();
            window.UserStorage = DataPersistenceFactory.createUserStorage();
            
            console.log('数据持久化模块初始化完成');
            
            // 测试存储可用性
            const storageTest = window.dataManager.testStorage();
            if (!storageTest.available) {
                console.warn('本地存储可能不可用，某些功能可能受限');
            }
        } catch (error) {
            console.error('数据持久化模块初始化失败:', error);
        }
    });
    
})();
