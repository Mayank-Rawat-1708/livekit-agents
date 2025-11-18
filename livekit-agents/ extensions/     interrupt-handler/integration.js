const { FillerInterruptionHandler } = require('./fillerFilter');

function attachInterruptHandler(agent, asrEmitter, logger = console) {
  const IGNORED = (process.env.IGNORED_WORDS || 'uh,umm,hmm,haan')
    .split(',')
    .map(w => w.trim());

  const handler = new FillerInterruptionHandler({
    ignoredWords: IGNORED,
    confidenceThreshold: parseFloat(process.env.ASR_CONF_THRESHOLD || '0.6'),
    logger
  });

  const agentState = { isSpeaking: false };

  // Mark TTS start + stop — IMPORTANT
  agent.on('ttsStart', () => { agentState.isSpeaking = true; });
  agent.on('ttsStop', () => { agentState.isSpeaking = false; });

  // Hook ASR transcripts
  asrEmitter.on('transcript', (t) => {
    const decision = handler.handleTranscript(t, agentState);

    if (decision.action === 'ignore') return;

    if (decision.action === 'interrupt') {
      if (agentState.isSpeaking && typeof agent.stopTTS === 'function') {
        agent.stopTTS();
        agentState.isSpeaking = false;
      }
      if (typeof agent.processUserTranscript === 'function') {
        agent.processUserTranscript(t);
      }
      return;
    }

    if (decision.action === 'pass') {
      if (typeof agent.processUserTranscript === 'function') {
        agent.processUserTranscript(t);
      }
    }
  });
}

module.exports = { attachInterruptHandler };
