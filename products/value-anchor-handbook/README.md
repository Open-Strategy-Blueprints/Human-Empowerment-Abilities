# 📘 《价值锚点识别手册》项目

## 🎯 项目概述

《价值锚点识别手册》是一套基于"Human Empowerment Abilities"框架的系统思维工具包，专门用于识别、评估和利用历史材料、文化符号和技艺传承中的价值锚点。

本手册将复杂的系统性思维转化为可操作的四步方法论，帮助个人、研究者和文化工作者在信息碎片中发现持久的文明价值。

## 🏗️ 项目定位

- **思维工具**：将抽象的"文明免疫"概念转化为具体可用的工具
- **实践指南**：提供可重复、可验证的操作流程
- **开源知识产品**：采用知识共享许可，鼓励协作改进
- **跨学科应用**：适用于历史学、文化研究、产品设计、知识管理等多个领域

## 📂 完整目录结构

```
products/value-anchor-handbook/
├── 📄 README.md                           # 当前文件：项目总说明
├── 📘 handbook.md                         # 主手册文档（完整内容）
├── 📑 TOC.md                              # 详细目录和结构说明
├── 🔄 CHANGELOG.md                        # 版本更新历史
├── 🚫 .gitignore                          # Git忽略规则
├── ⚙️ commit-changes.sh                   # 自动化提交脚本
├── 📊 tables/                             # 所有表格模板
│   ├── stability-assessment.md           # 稳定性评估表格
│   ├── connectivity-mapping.md           # 连接性映射表格
│   ├── expansion-verification.md         # 可扩展性验证表格
│   └── exercise-forms.md                 # 练习表格模板
├── 🛠️ tools/                              # 工具和脚本
│   ├── anchor-calculator.py              # 锚点稳定性计算器
│   └── methodology-checklist.md          # 方法论检查清单
├── 📝 exercises/                          # 实践练习
│   ├── practice-1-photos.md              # 老照片分析练习
│   ├── practice-2-characters.md          # 汉字分析练习
│   └── practice-3-skills.md              # 技艺传承分析练习
├── 🖼️ images/                             # 图表和图片资源
│   └── .gitkeep                          # 保持目录存在
└── 💾 backup/                             # 自动备份目录（不提交到Git）
    └── .gitignore                        # 忽略备份文件
```

## 🚀 快速开始

### 1. 首次使用指南

#### 如果你是读者/学习者：
1. **阅读主手册**：从 `handbook.md` 开始，了解核心概念
2. **查看目录**：使用 `TOC.md` 了解完整结构
3. **下载表格**：使用 `tables/` 目录中的表格模板
4. **尝试练习**：从 `exercises/practice-1-photos.md` 开始实践

#### 如果你是研究者/贡献者：
1. **理解框架**：先阅读 `handbook.md` 的第三部分（方法论）
2. **使用工具**：运行 `tools/anchor-calculator.py`
3. **贡献改进**：查看"贡献指南"部分
4. **提交案例**：添加你的实践案例

### 2. 环境准备

#### 基础环境：
```bash
# 克隆仓库
git clone https://github.com/Open-Strategy-Blueprints/Human-Empowerment-Abilities.git
cd Human-Empowerment-Abilities/products/value-anchor-handbook

# 运行稳定性计算器（需要Python 3.8+）
python tools/anchor-calculator.py --interactive
```

#### 无Python环境的替代方案：
- 使用 `tables/` 目录中的Markdown表格手动计算
- 或使用在线Python环境（如repl.it）

### 3. 五分钟体验

1. **快速阅读**：浏览 `handbook.md` 的第三部分（3.1 四步识别法）
2. **快速练习**：打开 `exercises/practice-1-photos.md` 完成第一个小练习
3. **快速计算**：运行 `python tools/anchor-calculator.py --help` 查看功能

## 📖 详细使用指南

### 第一部分：核心方法论学习

#### 建议学习路径（4周计划）：

| 周次 | 学习内容 | 练习任务 | 预计时间 |
|------|----------|----------|----------|
| 第1周 | 第1-3部分：概念+方法论 | 完成练习1：老照片分析 | 5-7小时 |
| 第2周 | 第4-6部分：工具+案例 | 完成练习2：汉字分析 | 4-6小时 |
| 第3周 | 第7-8部分：高级技巧+实践 | 完成练习3：技艺分析 | 6-8小时 |
| 第4周 | 第9-10部分：评估+拓展 | 完成综合实践项目 | 5-7小时 |

#### 详细学习步骤：

1. **第一周：建立基础**
   - 阅读 `handbook.md` 第1-3部分
   - 打印 `tables/exercise-forms.md` 中的基础表格
   - 完成 `exercises/practice-1-photos.md`

2. **第二周：掌握工具**
   - 学习使用 `tools/anchor-calculator.py`
   - 阅读 `tables/` 中所有评估表格
   - 完成 `exercises/practice-2-characters.md`

3. **第三周：深入实践**
   - 尝试高级技巧（锚点组合、未来预测）
   - 完成 `exercises/practice-3-skills.md`
   - 开始个人项目规划

4. **第四周：应用拓展**
   - 完成自我评估
   - 设计个人应用方案
   - 考虑认证或分享

### 第二部分：工具使用说明

#### 1. 锚点稳定性计算器

```bash
# 进入工具目录
cd tools

# 交互模式（推荐初学者）
python anchor-calculator.py --interactive

# 命令行模式（批量处理）
python anchor-calculator.py --duration 8.5 --consistency 7.2 --survival 9.0 --spread 7.5 --understanding 6.8 --clarity 8.2 --emotion 7.0 --memory 7.5

# 生成详细报告
python anchor-calculator.py --duration 8.5 --consistency 7.2 --survival 9.0 --spread 7.5 --understanding 6.8 --clarity 8.2 --emotion 7.0 --memory 7.5 --format markdown > report.md
```

#### 2. 自动化提交脚本

```bash
# 使脚本可执行
chmod +x commit-changes.sh

# 交互式模式
./commit-changes.sh

# 自动模式（检查并自动提交）
./commit-changes.sh --auto
```

#### 3. 表格模板使用

- `tables/stability-assessment.md`：评估时间、空间、认知稳定性
- `tables/connectivity-mapping.md`：绘制锚点连接网络
- `tables/expansion-verification.md`：验证可扩展性
- `tables/exercise-forms.md`：所有练习的填写模板

### 第三部分：实践项目管理

#### 个人项目启动步骤：

1. **选择主题**：历史照片、家族物品、地方文化等
2. **收集材料**：至少3个相关样本
3. **应用四步法**：依次进行来源扫描、稳定性评估、连接性映射、可扩展性验证
4. **记录过程**：使用提供的表格模板
5. **输出成果**：分析报告、改进建议、应用方案

#### 团队协作项目：

1. **分工**：
   - 材料收集组
   - 分析评估组
   - 应用开发组
   - 文档编写组

2. **流程**：
   - 每周例会，使用方法论检查清单
   - 共享分析表格（建议使用Git版本控制）
   - 定期生成聚合报告

## 🔧 技术指南

### 1. 文件格式说明

| 文件类型 | 格式 | 用途 | 编辑工具建议 |
|----------|------|------|--------------|
| 主文档 | Markdown (.md) | 所有文本内容 | VS Code, Typora, Obsidian |
| 表格 | Markdown表格 | 结构化数据 | 同上，或Notion导出 |
| 代码 | Python (.py) | 自动化计算 | VS Code, PyCharm |
| 脚本 | Shell (.sh) | 自动化任务 | 终端，VS Code |

### 2. 版本控制工作流

```bash
# 推荐的工作流程
git checkout -b feature/your-feature     # 创建新分支
# 进行修改...
./commit-changes.sh --auto               # 自动提交
git push origin feature/your-feature     # 推送分支
# 创建Pull Request
```

### 3. 备份策略

1. **自动备份**：脚本会自动在 `backup/` 目录创建备份
2. **Git备份**：所有更改通过Git版本控制
3. **云备份**：建议同步到云存储（OneDrive/Google Drive）

## 👥 贡献指南

### 如何贡献

我们欢迎以下类型的贡献：

#### 1. 内容改进
- 修正错误或不准确的内容
- 改进说明的清晰度
- 添加更多案例研究
- 翻译为其他语言

#### 2. 工具增强
- 改进现有工具的功能
- 添加新的计算或可视化工具
- 优化代码性能和用户体验

#### 3. 案例贡献
- 分享你的实践案例
- 提供新的练习模板
- 贡献跨文化比较研究

### 贡献流程

1. **Fork仓库**：点击GitHub页面的Fork按钮
2. **创建分支**：
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **进行修改**：遵循现有的代码和文档风格
4. **提交更改**：
   ```bash
   ./commit-changes.sh
   ```
5. **推送分支**：
   ```bash
   git push origin feature/amazing-feature
   ```
6. **创建Pull Request**：在GitHub上提交PR

### 质量要求

1. **文档更新**：任何代码更改必须同步更新文档
2. **测试验证**：新工具必须包含基本测试
3. **兼容性**：确保向后兼容性
4. **格式规范**：遵循现有项目的格式约定

## 📊 项目状态

### 当前版本：v1.0

#### 已完成功能：
- ✅ 完整的四步识别方法论
- ✅ 三个专项识别技术
- ✅ 12个表格模板
- ✅ Python稳定性计算器
- ✅ 三个分级练习
- ✅ 自动化管理脚本

#### 计划中的功能：
- 🔄 可视化工具（图表生成）
- 🔄 多语言支持
- 🔄 在线交互版本
- 🔄 移动端应用

#### 开发路线图：

| 版本 | 计划内容 | 预计时间 |
|------|----------|----------|
| v1.0 | 基础框架和工具 | 已完成 |
| v1.1 | 更多案例和练习 | 2024年Q2 |
| v2.0 | 可视化界面 | 2024年Q3 |
| v3.0 | 协作平台 | 2024年Q4 |

## 📄 许可证

本项目采用 [知识共享署名-非商业性使用-相同方式共享 4.0 国际许可协议](https://creativecommons.org/licenses/by-nc-sa/4.0/) 进行许可。

### 主要条款：
1. **署名**：必须给出适当的署名，提供指向本许可协议的链接，同时标明是否（对原始作品）作了修改
2. **非商业性使用**：不得将本作品用于商业目的
3. **相同方式共享**：如果你对本作品进行了修改，必须以相同的许可协议分发你的贡献

### 例外条款：
- 工具代码（Python脚本）采用MIT许可证
- 贡献者保留其贡献的版权，但同意在相同条款下授权

## 🙏 致谢

### 项目来源
本手册基于"Human Empowerment Abilities"框架开发，特别感谢所有为文明免疫工程做出贡献的思想者和实践者。

### 主要贡献者
- **框架设计**：[黄青玄]
- **方法论开发**：基于Open-Strategy-Blueprints的集体智慧
- **工具实现**：社区协作完成

### 特别感谢
- 所有测试用户提供的宝贵反馈
- GitHub社区的技术支持
- 开源工具的开发者和维护者

## 🤝 社区与支持

### 获取帮助
1. **查看文档**：先阅读本README和主手册
2. **提交Issue**：在GitHub仓库提交问题
3. **社区讨论**：参与相关论坛和社群

### 联系维护者
- GitHub Issues：报告问题或建议功能
- 项目页面：关注更新和公告

### 支持项目
如果你觉得这个项目有用，可以通过以下方式支持：
1. **Star仓库**：在GitHub上给项目点赞
2. **分享案例**：贡献你的使用经验
3. **改进文档**：帮助完善说明和指南
4. **推荐他人**：分享给可能受益的人

## 🔄 更新与维护

### 更新频率
- **内容更新**：每月至少一次
- **工具更新**：按需发布
- **安全更新**：及时响应

### 维护承诺
- 保持向后兼容性
- 及时修复严重错误
- 响应社区反馈
- 定期发布改进版本

### 弃用政策
任何即将弃用的功能将：
1. 在CHANGELOG中提前公告
2. 提供迁移指南
3. 至少保留一个版本的兼容性

---

## 🎯 开始使用

现在你已经了解了项目的全貌，建议按照以下顺序开始：

1. **第一步**：阅读 `handbook.md` 的第一部分，理解基本概念
2. **第二步**：尝试 `tools/anchor-calculator.py` 的交互模式
3. **第三步**：完成 `exercises/practice-1-photos.md` 中的简单练习
4. **第四步**：应用到你自己的项目中

**记住**：价值锚点识别是一个实践技能，最好的学习方式是通过实际应用。

祝你探索愉快！🌟

---
*最后更新：$(date +"%Y年%m月%d日") | 版本：v1.0 | 字数：约3,500字*
