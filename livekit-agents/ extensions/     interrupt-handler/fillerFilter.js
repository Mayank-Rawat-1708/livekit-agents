class FillerInterruptionHandler {
  constructor({ ignoredWords = ['uh','umm','hmm','haan'], confidenceThreshold = 0.6, logger = console } = {}) {
    this.ignoredSet = new Set(ignoredWords.map(w => w.toLowerCase()));
    this.confidenceThreshold = confidenceThreshold;
    this.logger = logger;
  }

  _normalize(text) {
    return text
      .replace(/[.,!?;:()\[\]"]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }

  _isFillerOnly(text) {
    const tokens = this._normalize(text).split(' ').filter(Boolean);
    if (tokens.length === 0) return false;
    return tokens.every(t => this.ignoredSet.has(t));
  }

  handleTranscript({ text, confidence = 1.0 }, { isSpeaking }) {
    if (!text) return { action: 'pass' };

    const norm = this._normalize(text);
    const tokens = norm.split(' ').filter(Boolean);

    // hardcoded commands
    const commands = ['stop','wait','pause','no'];
    if (tokens.some(t => commands.includes(t))) {
      return { action: 'interrupt', reason: 'keyword' };
    }

    if (isSpeaking) {
      if (confidence < this.confidenceThreshold) {
        return { action: 'ignore', reason: 'low_conf' };
      }
      if (this._isFillerOnly(text)) {
        return { action: 'ignore', reason: 'filler_only' };
      }
      return { action: 'interrupt', reason: 'meaningful' };
    }

    return { action: 'pass', reason: 'agent_quiet' };
  }
}

module.exports = { FillerInterruptionHandler };
