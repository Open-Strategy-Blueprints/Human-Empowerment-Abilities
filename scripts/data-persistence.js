// data-persistence.js
class PhotoAnalysisStorage {
    constructor() {
        this.STORAGE_KEY = 'photoAnalyses';
        this.init();
    }

    init() {
        if (!localStorage.getItem(this.STORAGE_KEY)) {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify([]));
        }
    }

    saveAnalysis(analysisData) {
        try {
            const analyses = this.getAllAnalyses();
            analysisData.id = Date.now();
            analysisData.createdAt = new Date().toISOString();
            analysisData.updatedAt = new Date().toISOString();
            
            analyses.push(analysisData);
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(analyses));
            
            return {
                success: true,
                id: analysisData.id,
                message: '分析已保存'
            };
        } catch (error) {
            console.error('保存失败:', error);
            return { success: false, error: error.message };
        }
    }

    getAllAnalyses() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return JSON.parse(data) || [];
        } catch (error) {
            console.error('读取失败:', error);
            return [];
        }
    }

    getAnalysis(id) {
        const analyses = this.getAllAnalyses();
        return analyses.find(analysis => analysis.id === id);
    }

    updateAnalysis(id, updates) {
        try {
            const analyses = this.getAllAnalyses();
            const index = analyses.findIndex(analysis => analysis.id === id);
            
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

    deleteAnalysis(id) {
        try {
            const analyses = this.getAllAnalyses();
            const filtered = analyses.filter(analysis => analysis.id !== id);
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    exportAllAnalyses() {
        const analyses = this.getAllAnalyses();
        const exportData = {
            exportDate: new Date().toISOString(),
            version: '1.0',
            totalAnalyses: analyses.length,
            data: analyses
        };
        
        return JSON.stringify(exportData, null, 2);
    }

    clearAll() {
        localStorage.removeItem(this.STORAGE_KEY);
        this.init();
        return { success: true };
    }

    getStatistics() {
        const analyses = this.getAllAnalyses();
        return {
            total: analyses.length,
            completed: analyses.filter(a => a.completed).length,
            recent: analyses.slice(-5),
            byMonth: this.groupByMonth(analyses)
        };
    }

    groupByMonth(analyses) {
        const groups = {};
        analyses.forEach(analysis => {
            const date = new Date(analysis.createdAt);
            const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
            
            if (!groups[monthKey]) {
                groups[monthKey] = 0;
            }
            groups[monthKey]++;
        });
        
        return groups;
    }
}
