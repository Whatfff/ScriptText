interface CompiledDialogue {
  type: 'dialogue' | 'question' | 'answer' | 'conversation' | 'title' | 'subtitle';
  uiType: string;
  dataTag: string;
  voiceType: string;
  speaker: string;
  content: string;
  metadata?: any;
  options?: CompiledOption[];
  responses?: CompiledResponse[];
}

interface CompiledOption {
  id: number;
  uiType: string;
  dataTag: string;
  voiceType: string;
  speaker: string;
  target: string;
  content: string;
}

interface CompiledResponse {
  qid: number;
  dialogues: CompiledDialogue[];
}

export class TimeScriptCompiler {
  private dialogues: CompiledDialogue[] = [];
  private currentQuestion: CompiledDialogue | null = null;
  private currentAnswer: CompiledResponse | null = null;

  compile(content: string): CompiledDialogue[] {
    this.dialogues = [];
    this.currentQuestion = null;
    this.currentAnswer = null;

    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.startsWith('//') || line.startsWith('/*')) {
        continue;
      }
      
      this.compileLine(line, i + 1);
    }
    
    return this.dialogues;
  }

  private compileLine(line: string, lineNumber: number): void {
    // 编译基本对话语句
    if (line.startsWith('#[') && !line.startsWith('#[(A1)')) {
      this.compileDialogueStatement(line, lineNumber);
    }
    
    // 编译询问语句
    else if (line.startsWith('#[(Q1)')) {
      this.compileQuestionStatement(line, lineNumber);
    }
    
    // 编译询问选项
    else if (line.startsWith('        -(')) {
      this.compileQuestionOption(line, lineNumber);
    }
    
    // 编译回复语句
    else if (line.startsWith('#[(A1)')) {
      this.compileAnswerStatement(line, lineNumber);
    }
    
    // 编译对话块
    else if (line.startsWith('+#[')) {
      this.compileConversationDialogue(line, lineNumber);
    }
    
    // 编译对话结束
    else if (line.includes('#<') && line.includes('end;')) {
      this.compileConversationEnd(line, lineNumber);
    }
  }

  private compileDialogueStatement(line: string, lineNumber: number): void {
    const pattern = /#\[([A-Z0-9]+)-([A-Z0-9|: ]+)\]-([A-Za-z0-9]+)<([A-Za-z0-9]+)>~:\s*(.+?)(?:\s*\{([^}]+)\})?$/;
    const match = line.match(pattern);
    
    if (!match) {
      console.warn(`Invalid dialogue statement at line ${lineNumber}: ${line}`);
      return;
    }
    
    const [, uiType, dataTag, voiceType, speaker, content, metadataStr] = match;
    
    const dialogue: CompiledDialogue = {
      type: this.getDialogueType(uiType),
      uiType,
      dataTag,
      voiceType,
      speaker,
      content: content.trim(),
      metadata: this.parseMetadata(metadataStr)
    };
    
    this.dialogues.push(dialogue);
  }

  private compileQuestionStatement(line: string, lineNumber: number): void {
    const pattern = /#\[([A-Z0-9]+)-([A-Z0-9|: ]+)\]-([A-Za-z0-9]+)<([A-Za-z0-9]+)>~:\s*(.+?)(?:\s*\{([^}]+)\})?$/;
    const match = line.match(pattern);
    
    if (!match) {
      console.warn(`Invalid question statement at line ${lineNumber}: ${line}`);
      return;
    }
    
    const [, uiType, dataTag, voiceType, speaker, content, metadataStr] = match;
    
    this.currentQuestion = {
      type: 'question',
      uiType,
      dataTag,
      voiceType,
      speaker,
      content: content.trim(),
      metadata: this.parseMetadata(metadataStr),
      options: []
    };
    
    this.dialogues.push(this.currentQuestion);
  }

  private compileQuestionOption(line: string, lineNumber: number): void {
    if (!this.currentQuestion) {
      console.warn(`Question option without question at line ${lineNumber}: ${line}`);
      return;
    }
    
    const pattern = /        -\(([0-9]+)\)::\[([A-Z0-9]+)-([A-Z0-9|: ]+)\]-([A-Za-z0-9]+)<([A-Za-z0-9]+)>::<([A-Za-z0-9]+)>~:\s*(.+?)(?:\s*\{([^}]+)\})?$/;
    const match = line.match(pattern);
    
    if (!match) {
      console.warn(`Invalid question option at line ${lineNumber}: ${line}`);
      return;
    }
    
    const [, optionId, uiType, dataTag, voiceType, speaker, target, content, metadataStr] = match;
    
    const option: CompiledOption = {
      id: parseInt(optionId),
      uiType,
      dataTag,
      voiceType,
      speaker,
      target,
      content: content.trim()
    };
    
    this.currentQuestion.options!.push(option);
  }

  private compileAnswerStatement(line: string, lineNumber: number): void {
    const pattern = /#\[([A-Z0-9]+)-([A-Z0-9|: ]+)\]-([A-Za-z0-9]+)<([A-Za-z0-9]+)>~\(([0-9]+)\):/;
    const match = line.match(pattern);
    
    if (!match) {
      console.warn(`Invalid answer statement at line ${lineNumber}: ${line}`);
      return;
    }
    
    const [, uiType, dataTag, voiceType, speaker, qid] = match;
    
    this.currentAnswer = {
      qid: parseInt(qid),
      dialogues: []
    };
  }

  private compileConversationDialogue(line: string, lineNumber: number): void {
    if (!this.currentAnswer) {
      console.warn(`Conversation dialogue without answer at line ${lineNumber}: ${line}`);
      return;
    }
    
    const pattern = /\+#\[([A-Z0-9]+)-([A-Z0-9|: ]+)\]-([A-Za-z0-9]+)<([A-Za-z0-9]+)>~:\s*(.+?)(?:\s*\{([^}]+)\})?$/;
    const match = line.match(pattern);
    
    if (!match) {
      console.warn(`Invalid conversation dialogue at line ${lineNumber}: ${line}`);
      return;
    }
    
    const [, uiType, dataTag, voiceType, speaker, content, metadataStr] = match;
    
    const dialogue: CompiledDialogue = {
      type: 'dialogue',
      uiType,
      dataTag,
      voiceType,
      speaker,
      content: content.trim(),
      metadata: this.parseMetadata(metadataStr)
    };
    
    this.currentAnswer.dialogues.push(dialogue);
  }

  private compileConversationEnd(line: string, lineNumber: number): void {
    if (this.currentAnswer) {
      // 将当前回复添加到对话列表中
      const answerDialogue: CompiledDialogue = {
        type: 'answer',
        uiType: 'A1',
        dataTag: 'A',
        voiceType: 'Default',
        speaker: 'CONVERSATION',
        content: '',
        metadata: { qid: this.currentAnswer.qid },
        responses: [this.currentAnswer]
      };
      
      this.dialogues.push(answerDialogue);
      this.currentAnswer = null;
    }
  }

  private getDialogueType(uiType: string): 'dialogue' | 'question' | 'answer' | 'conversation' | 'title' | 'subtitle' {
    switch (uiType) {
      case 'T1': return 'title';
      case 'ST1': return 'subtitle';
      case 'Q1': return 'question';
      case 'A1': return 'answer';
      default: return 'dialogue';
    }
  }

  private parseMetadata(metadataStr?: string): any {
    if (!metadataStr) return {};
    
    const metadata: any = {};
    const pairs = metadataStr.split(',').map(pair => pair.trim());
    
    for (const pair of pairs) {
      const [key, value] = pair.split(':').map(s => s.trim());
      if (key && value) {
        metadata[key] = value;
      }
    }
    
    return metadata;
  }

  // 导出为JSON格式
  exportToJSON(content: string): string {
    const compiled = this.compile(content);
    return JSON.stringify(compiled, null, 2);
  }

  // 导出为游戏引擎可用的格式
  exportForGameEngine(content: string): any {
    const compiled = this.compile(content);
    
    return {
      version: '1.0.0',
      language: 'timescript',
      dialogues: compiled,
      metadata: {
        totalDialogues: compiled.length,
        questions: compiled.filter(d => d.type === 'question').length,
        answers: compiled.filter(d => d.type === 'answer').length
      }
    };
  }
}

// 导出编译器实例
export const compiler = new TimeScriptCompiler(); 