# Script Text - VS Code Extension

为Script Text语言提供语法高亮、智能提示和主题支持的VS Code扩展。

## 功能特性

### 🎨 语法高亮
- 支持所有Script Text语法元素的高亮显示
- 区分UI类型、声源类型、发言者等不同组件
- 支持注释、数据块、参数定义等特殊语法

### 🎯 智能编辑
- 自动括号匹配和补全
- 代码折叠支持
- 语法错误提示

### 🌈 主题支持
- 内置Script Text Dark主题
- 优化的颜色方案，提升可读性

## 支持的语法元素

### 基本对话语句
```scripttext
#[(D1)-(D)]-[Default]<Ann>~: Hello, welcome! {Action: Speak}
```

### 询问语句
```scripttext
#[(Q1)-(Q)]-[Default]<Bob>~: What would you like to do? {Action: Ask{QID: 0}}
        -(0)::[(A)-(A)]-[Default]<Player>::<Bob>~: I want to explore the past.
        -(1)::[(A)-(A)]-[Default]<Player>::<Bob>~: I want to explore the future.
```

### 回复语句
```scripttext
#[(A1)-(A|QID: 0)]-[Default]<CONVERSATION>~(0):
        +#[(D1)-(D)]-[Default]<Bob>~: Great choice!
        +#[(D1)-(D)]-[Default]<Ann>~: I'll prepare the time machine.
      #<CONVERSATION> end;
```

### 参数定义
```scripttext
UI类型： T1-标题1 ； D1-对话1 ； Q1-问题1 ； A-询问 ； A1- 回答1
声源/类型： Default(默认)-配音音频 ；V1-配音音频 ； P1-打字机 ； T1-电报 ；
```

## 安装和使用

### 开发模式安装
1. 克隆此仓库到本地
2. 在VS Code中打开项目文件夹
3. 按 `F5` 启动调试模式
4. 在新窗口中打开 `.st` 文件

### 打包安装
1. 安装 `vsce`: `npm install -g vsce`
2. 在项目根目录运行: `vsce package`
3. 安装生成的 `.vsix` 文件

## 文件扩展名
- `.st` - Script Text文件

## 颜色主题
扩展包含专门的"Script Text Dark"主题，提供：
- 深色背景，减少眼疲劳
- 高对比度的语法元素颜色
- 优化的可读性

## 语法规则

### UI类型
- `T1` - 标题1
- `ST1` - 副标题1  
- `D1` - 对话1
- `Q1` - 问题1
- `A` - 询问
- `A1` - 回答1
- `AD1` - 成就1
- `M1` - 任务1

### 声源/类型
- `Default` - 默认配音音频
- `V1` - 配音音频
- `P1` - 打字机
- `T1` - 电报

## 开发计划

- [ ] 语法校验和错误提示
- [ ] 智能自动补全
- [ ] 代码片段支持
- [ ] 调试工具集成
- [ ] 多语言支持

## 贡献

欢迎提交Issue和Pull Request来改进这个扩展！

## 许可证

MIT License

Copyright (c) 2025 Eric Smith

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
