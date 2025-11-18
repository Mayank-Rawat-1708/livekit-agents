# Interrupt Handler Extension

## Overview
This module adds a filler-word aware interruption layer on top of the LiveKit
agent event loop *without changing LiveKit’s VAD*.

### What it does
- Ignores filler-only speech ("uh", "umm", "hmm", "haan") *while agent is speaking*
- Treats filler normally when the agent is silent
- Detects real interruptions immediately ("stop", "wait", "no")
- Avoids false stops caused by VAD
- Configurable ignored words list

### Files
- fillerFilter.js – core logic
- integration.js – hooks into the agent
- (this) README.md

---

## Usage

### 1. Import in your agent startup file
Inside your main Node agent file (where ASR + agent are created):

js
const { attachInterruptHandler } = require('./extensions/interrupt-handler/integration');

attachInterruptHandler(agent, asrEmitter, console);

2. Ensure your agent emits:

ttsStart

ttsStop

3. Ensure ASR emits:
asrEmitter.emit('transcript', { text: "...", confidence: 0.9 })

4. Ensure agent has:

agent.stopTTS()

agent.processUserTranscript(t)

Config
IGNORED_WORDS="uh,umm,hmm,haan"
ASR_CONF_THRESHOLD=0.6

Testing

Speak:

“uh” while agent speaks → agent continues

“umm okay stop” → agent immediately interrupts

“umm” while agent is silent → counted as speech
