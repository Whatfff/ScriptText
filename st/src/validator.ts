interface ValidationError {
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning';
}

interface TimeScriptToken {
  type: 'dialogue' | 'question' | 'answer' | 'conversation' | 'parameter' | 'comment';
  line: number;
  column: number;
  content: string;
  data?: any;
}

export class TimeScriptValidator {
  private errors: ValidationError[] = [];
  private tokens: TimeScriptToken[] = [];

  validate(content: string): ValidationError[] {
    this.errors = [];
    this.tokens = [];
    
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNumber = i + 1;
      
      this.validateLine(line, lineNumber);
    }
    
    this.validateGlobalStructure();
    
    return this.errors;
  }

  private validateLine(line: string, lineNumber: number): void {
    const trimmedLine = line.trim();
    
    // 跳过空行和注释
    if (!trimmedLine || trimmedLine.startsWith('//') || trimmedLine.startsWith('/*')) {
      return;
    }

    // 验证基本对话语句
    if (trimmedLine.startsWith('#[')) {
      this.validateDialogueStatement(trimmedLine, lineNumber);
    }
    
    // 验证询问选项
    else if (trimmedLine.startsWith('        -(')) {
      this.validateQuestionOption(trimmedLine, lineNumber);
    }
    
    // 验证回复语句
    else if (trimmedLine.startsWith('#[(A1)')) {
      this.validateAnswerStatement(trimmedLine, lineNumber);
    }
    
    // 验证对话块
    else if (trimmedLine.startsWith('+#[')) {
      this.validateConversationDialogue(trimmedLine, lineNumber);
    }
    
    // 验证对话结束
    else if (trimmedLine.includes('#<') && trimmedLine.includes('end;')) {
      this.validateConversationEnd(trimmedLine, lineNumber);
    }
    
    // 验证参数定义
    else if (trimmedLine.includes('：') && trimmedLine.includes('；')) {
      this.validateParameterDefinition(trimmedLine, lineNumber);
    }
  }

  private validateDialogueStatement(line: string, lineNumber: number): void {
    const pattern = /^#\[([A-Z0-9]+)-([A-Z0-9|: ]+)\]-([A-Za-z0-9]+)<([A-Za-z0-9]+)>~:/;
    const match = line.match(pattern);
    
    if (!match) {
      this.addError(lineNumber, 1, 'Invalid dialogue statement format', 'error');
      return;
    }
    
    const [, uiType, dataTag, voiceType, speaker] = match;
    
    // 验证UI类型
    const validUITypes = ['T1', 'ST1', 'D1', 'Q1', 'A', 'A1', 'AD1', 'M1'];
    if (!validUITypes.includes(uiType)) {
      this.addError(lineNumber, line.indexOf(uiType) + 1, `Invalid UI type: ${uiType}`, 'error');
    }
    
    // 验证声源类型
    const validVoiceTypes = ['Default', 'V1', 'P1', 'T1'];
    if (!validVoiceTypes.includes(voiceType)) {
      this.addError(lineNumber, line.indexOf(voiceType) + 1, `Invalid voice type: ${voiceType}`, 'error');
    }
    
    // 验证数据块
    if (line.includes('{') && !line.includes('}')) {
      this.addError(lineNumber, line.length, 'Missing closing brace in data block', 'error');
    }
  }

  private validateQuestionOption(line: string, lineNumber: number): void {
    const pattern = /^        -\(([0-9]+)\)::\[([A-Z0-9]+)-([A-Z0-9|: ]+)\]-([A-Za-z0-9]+)<([A-Za-z0-9]+)>::<([A-Za-z0-9]+)>~:/;
    const match = line.match(pattern);
    
    if (!match) {
      this.addError(lineNumber, 1, 'Invalid question option format', 'error');
      return;
    }
    
    const [, optionId, uiType, dataTag, voiceType, speaker, target] = match;
    
    // 验证选项ID
    const optionNum = parseInt(optionId);
    if (optionNum < 0 || optionNum > 99) {
      this.addError(lineNumber, line.indexOf(optionId) + 1, 'Option ID must be between 0 and 99', 'error');
    }
  }

  private validateAnswerStatement(line: string, lineNumber: number): void {
    const pattern = /^#\[([A-Z0-9]+)-([A-Z0-9|: ]+)\]-([A-Za-z0-9]+)<([A-Za-z0-9]+)>~\(([0-9]+)\):/;
    const match = line.match(pattern);
    
    if (!match) {
      this.addError(lineNumber, 1, 'Invalid answer statement format', 'error');
      return;
    }
    
    const [, uiType, dataTag, voiceType, speaker, qid] = match;
    
    // 验证QID
    const qidNum = parseInt(qid);
    if (qidNum < 0) {
      this.addError(lineNumber, line.indexOf(qid) + 1, 'QID must be non-negative', 'error');
    }
  }

  private validateConversationDialogue(line: string, lineNumber: number): void {
    const pattern = /^\+#\[([A-Z0-9]+)-([A-Z0-9|: ]+)\]-([A-Za-z0-9]+)<([A-Za-z0-9]+)>~:/;
    const match = line.match(pattern);
    
    if (!match) {
      this.addError(lineNumber, 1, 'Invalid conversation dialogue format', 'error');
    }
  }

  private validateConversationEnd(line: string, lineNumber: number): void {
    const pattern = /^#<([A-Za-z0-9]+)>\s+end;$/;
    const match = line.match(pattern);
    
    if (!match) {
      this.addError(lineNumber, 1, 'Invalid conversation end format', 'error');
    }
  }

  private validateParameterDefinition(line: string, lineNumber: number): void {
    // 简单的参数定义验证
    if (!line.includes('：') || !line.includes('；')) {
      this.addError(lineNumber, 1, 'Invalid parameter definition format', 'error');
    }
  }

  private validateGlobalStructure(): void {
    // 检查是否有未闭合的对话块
    let conversationBlocks = 0;
    let conversationEnds = 0;
    
    for (const token of this.tokens) {
      if (token.type === 'conversation') {
        conversationBlocks++;
      } else if (token.content.includes('end;')) {
        conversationEnds++;
      }
    }
    
    if (conversationBlocks !== conversationEnds) {
      this.addError(1, 1, 'Mismatched conversation blocks', 'error');
    }
  }

  private addError(line: number, column: number, message: string, severity: 'error' | 'warning'): void {
    this.errors.push({
      line,
      column,
      message,
      severity
    });
  }
}

// 导出验证器实例
export const validator = new TimeScriptValidator(); 