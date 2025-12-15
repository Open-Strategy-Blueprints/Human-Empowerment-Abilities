#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
价值锚点稳定性计算器

本脚本用于计算和评估价值锚点的稳定性得分。
基于四个核心维度（时间、空间、情感、逻辑）进行加权计算，
并输出可视化结果和建议。

使用方式：
    python anchor-calculator.py
    或直接运行 ./anchor-calculator.py（需添加执行权限）
"""

import sys
import json
from typing import Dict, List, Tuple
import argparse
import os

# ====================
# 配置参数
# ====================
DIMENSIONS = {
    "time": {
        "name": "时间维度",
        "weight": 0.25,
        "indicators": ["持久性", "一致性", "可追溯性"]
    },
    "space": {
        "name": "空间维度",
        "weight": 0.25,
        "indicators": ["物理存在", "网络分布", "文化嵌入"]
    },
    "emotional": {
        "name": "情感维度",
        "weight": 0.25,
        "indicators": ["认同感", "归属感", "激励性"]
    },
    "logical": {
        "name": "逻辑维度",
        "weight": 0.25,
        "indicators": ["自洽性", "可扩展性", "兼容性"]
    }
}

SCORE_RANGES = {
    "high": (7, 10, "🔵 高稳定性"),
    "medium": (4, 7, "🟡 中等稳定性"),
    "low": (0, 4, "🔴 低稳定性")
}

# ====================
# 核心计算类
# ====================
class AnchorCalculator:
    def __init__(self):
        self.scores = {}
        self.results = {}
        
    def input_scores(self) -> None:
        """交互式输入各维度得分"""
        print("=" * 50)
        print("价值锚点稳定性评估系统")
        print("=" * 50)
        print("\n请为每个指标打分（0-10分，整数）：")
        
        for dim_key, dim_info in DIMENSIONS.items():
            print(f"\n【{dim_info['name']}】")
            dim_scores = []
            
            for indicator in dim_info['indicators']:
                while True:
                    try:
                        score = int(input(f"  {indicator}: "))
                        if 0 <= score <= 10:
                            dim_scores.append(score)
                            break
                        else:
                            print("    请输入0-10之间的整数")
                    except ValueError:
                        print("    请输入有效的数字")
            
            self.scores[dim_key] = {
                "raw_scores": dim_scores,
                "average": sum(dim_scores) / len(dim_scores)
            }
    
    def calculate_stability(self) -> Dict:
        """计算总体稳定性"""
        weighted_sum = 0
        
        for dim_key, dim_info in DIMENSIONS.items():
            dim_score = self.scores[dim_key]["average"]
            weighted_sum += dim_score * dim_info["weight"]
        
        total_score = weighted_sum
        
        # 判断稳定性等级
        stability_level = ""
        for level, (low, high, desc) in SCORE_RANGES.items():
            if low <= total_score < high:
                stability_level = desc
                break
        
        self.results = {
            "total_score": round(total_score, 2),
            "stability_level": stability_level,
            "dimension_scores": {
                dim_key: round(self.scores[dim_key]["average"], 2)
                for dim_key in DIMENSIONS
            },
            "raw_data": self.scores
        }
        
        return self.results
    
    def generate_report(self) -> str:
        """生成文本报告"""
        if not self.results:
            return "请先运行 calculate_stability() 方法"
        
        report = []
        report.append("=" * 50)
        report.append("价值锚点稳定性评估报告")
        report.append("=" * 50)
        report.append(f"\n📊 总体得分：{self.results['total_score']}/10")
        report.append(f"📈 稳定性等级：{self.results['stability_level']}")
        
        report.append("\n📋 各维度得分：")
        for dim_key, score in self.results['dimension_scores'].items():
            dim_name = DIMENSIONS[dim_key]['name']
            bar = "█" * int(score) + "░" * (10 - int(score))
            report.append(f"  {dim_name:8} {score:4.1f}/10 {bar}")
        
        report.append("\n💡 建议：")
        suggestions = self._generate_suggestions()
        for i, suggestion in enumerate(suggestions, 1):
            report.append(f"  {i}. {suggestion}")
        
        report.append("\n" + "=" * 50)
        
        return "\n".join(report)
    
    def _generate_suggestions(self) -> List[str]:
        """基于得分生成建议"""
        suggestions = []
        total = self.results['total_score']
        
        if total < 4:
            suggestions.append("锚点稳定性较低，建议重新识别基础价值元素")
            suggestions.append("加强时间维度的持续性建设")
            suggestions.append("增加情感维度的认同感培养")
        elif total < 7:
            suggestions.append("锚点稳定性中等，可在薄弱维度进行优化")
            suggestions.append("分析各维度得分，针对性提升")
            suggestions.append("建立定期评估机制")
        else:
            suggestions.append("锚点稳定性良好，保持现状并监控变化")
            suggestions.append("考虑扩展应用场景")
            suggestions.append("记录最佳实践供其他锚点参考")
        
        # 针对最低分维度的建议
        min_dim = min(self.results['dimension_scores'].items(), 
                     key=lambda x: x[1])
        dim_name = DIMENSIONS[min_dim[0]]['name']
        suggestions.append(f"重点关注：{dim_name}（得分最低）")
        
        return suggestions
    
    def export_to_json(self, filename: str = "stability_result.json") -> None:
        """导出结果为JSON文件"""
        if not self.results:
            print("没有可导出的数据")
            return
        
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(self.results, f, ensure_ascii=False, indent=2)
            print(f"✅ 结果已导出到 {filename}")
        except Exception as e:
            print(f"❌ 导出失败：{e}")
    
    def load_from_json(self, filename: str) -> bool:
        """从JSON文件加载数据"""
        try:
            with open(filename, 'r', encoding='utf-8') as f:
                data = json.load(f)
            self.results = data
            self.scores = data.get('raw_data', {})
            print(f"✅ 已从 {filename} 加载数据")
            return True
        except Exception as e:
            print(f"❌ 加载失败：{e}")
            return False

# ====================
# 可视化函数
# ====================
def plot_radar_chart(scores: Dict):
    """绘制雷达图（需要matplotlib）"""
    try:
        import matplotlib.pyplot as plt
        import numpy as np
        
        dim_names = [DIMENSIONS[key]['name'] for key in DIMENSIONS]
        dim_scores = [scores[key] for key in DIMENSIONS.keys()]
        
        # 闭合图形
        dim_names.append(dim_names[0])
        dim_scores.append(dim_scores[0])
        
        angles = np.linspace(0, 2 * np.pi, len(dim_names), endpoint=True)
        
        fig, ax = plt.subplots(figsize=(8, 8), subplot_kw=dict(projection='polar'))
        ax.plot(angles, dim_scores, 'o-', linewidth=2)
        ax.fill(angles, dim_scores, alpha=0.25)
        ax.set_xticks(angles[:-1])
        ax.set_xticklabels(dim_names[:-1])
        ax.set_ylim(0, 10)
        ax.set_title('价值锚点稳定性雷达图', size=16, y=1.05)
        
        plt.tight_layout()
        plt.savefig('stability_radar.png', dpi=300, bbox_inches='tight')
        print("📈 雷达图已保存为 stability_radar.png")
        
    except ImportError:
        print("⚠️  未安装matplotlib，跳过图表生成")
        print("   安装命令：pip install matplotlib")
    except Exception as e:
        print(f"❌ 图表生成失败：{e}")

# ====================
# 命令行接口
# ====================
def main():
    parser = argparse.ArgumentParser(description='价值锚点稳定性计算器')
    parser.add_argument('--input', '-i', help='输入JSON文件路径')
    parser.add_argument('--export', '-e', help='导出JSON文件路径')
    parser.add_argument('--plot', '-p', action='store_true', help='生成雷达图')
    parser.add_argument('--quiet', '-q', action='store_true', help='静默模式')
    
    args = parser.parse_args()
    
    calculator = AnchorCalculator()
    
    if args.input:
        if calculator.load_from_json(args.input):
            calculator.calculate_stability()
    else:
        calculator.input_scores()
        calculator.calculate_stability()
    
    # 显示报告
    if not args.quiet:
        print("\n" + calculator.generate_report())
    
    # 导出结果
    if args.export:
        calculator.export_to_json(args.export)
    elif not args.input:  # 如果没有从文件加载，则默认导出
        calculator.export_to_json()
    
    # 生成图表
    if args.plot:
        plot_radar_chart(calculator.results['dimension_scores'])
    
    # 返回退出代码（基于稳定性等级）
    total = calculator.results['total_score']
    if total < 4:
        return 1  # 低稳定性
    elif total < 7:
        return 0  # 中等稳定性
    else:
        return 0  # 高稳定性

# ====================
# 主程序入口
# ====================
if __name__ == "__main__":
    try:
        exit_code = main()
        sys.exit(exit_code)
    except KeyboardInterrupt:
        print("\n\n👋 用户中断操作")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ 程序执行出错：{e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
