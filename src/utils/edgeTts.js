/** Microsoft Edge TTS — tr-TR-EmelNeural (tarayıcı, saf WebSocket) */
const VOICE = 'tr-TR-EmelNeural';
const TOKEN = '6A5AA1D4EAFF4E9FB37E23D68491D6F4';
const WSS = 'wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1';
const FORMAT = 'audio-24khz-48kbitrate-mono-mp3';
const JSON_DELIM = '\r\n\r\n';
const AUDIO_DELIM = 'Path:audio\r\n';

let currentAudio = null;
let audioUnlocked = false;

function escapeSsml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function secMsGec() {
  const ticks = Math.floor(Date.now() / 1000) + 11644473600;
  const rounded = ticks - (ticks % 300);
  const data = new TextEncoder().encode(`${rounded * 10000000}${TOKEN}`);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}

function randomHex(n) {
  const a = new Uint8Array(n);
  crypto.getRandomValues(a);
  return Array.from(a, (b) => b.toString(16).padStart(2, '0')).join('');
}

function buildSsml(text) {
  return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="tr-TR"><voice name="${VOICE}">${escapeSsml(text)}</voice></speak>`;
}

function findAudioStart(buf) {
  const delim = new TextEncoder().encode(AUDIO_DELIM);
  for (let i = 0; i <= buf.length - delim.length; i++) {
    let ok = true;
    for (let j = 0; j < delim.length; j++) {
      if (buf[i + j] !== delim[j]) { ok = false; break; }
    }
    if (ok) return i + delim.length;
  }
  return -1;
}

async function fetchEmelAudio(text) {
  const sec = await secMsGec();
  const connId = crypto.randomUUID?.() || randomHex(16);
  const url = `${WSS}?TrustedClientToken=${TOKEN}&Sec-MS-GEC=${sec}&Sec-MS-GEC-Version=1-143.0.3650.96&ConnectionId=${connId}`;

  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url);
    ws.binaryType = 'arraybuffer';
    const chunks = [];
    let done = false;
    const timer = setTimeout(() => { if (!done) { done = true; ws.close(); reject(new Error('timeout')); } }, 25000);

    const finish = (ok) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      try { ws.close(); } catch { /* ignore */ }
      if (ok && chunks.length) resolve(chunks);
      else reject(new Error('no audio'));
    };

    ws.onopen = () => {
      ws.send(`Content-Type:application/json; charset=utf-8\r\nPath:speech.config${JSON_DELIM}{"context":{"synthesis":{"audio":{"metadataoptions":{"sentenceBoundaryEnabled":"false","wordBoundaryEnabled":"false"},"outputFormat":"${FORMAT}"}}}}`);
      const rid = randomHex(16);
      ws.send(`X-RequestId:${rid}\r\nContent-Type:application/ssml+xml\r\nPath:ssml${JSON_DELIM}${buildSsml(text)}`);
    };

    ws.onmessage = (ev) => {
      const buf = new Uint8Array(ev.data);
      const head = new TextDecoder().decode(buf.slice(0, Math.min(buf.length, 300)));
      if (head.includes('Path:turn.end')) { finish(true); return; }
      if (head.includes('Path:audio')) {
        const start = findAudioStart(buf);
        if (start > 0) chunks.push(buf.slice(start));
      }
    };

    ws.onerror = () => finish(false);
    ws.onclose = () => { if (!done && chunks.length) finish(true); else if (!done) finish(false); };
  });
}

function stopCurrent() {
  if (currentAudio) {
    currentAudio.pause();
    if (currentAudio.src?.startsWith('blob:')) URL.revokeObjectURL(currentAudio.src);
    currentAudio = null;
  }
}

/** Ölçüm butonuna basıldığında çağırın — gecikmeli ses için tarayıcı kilidini açar */
export function unlockEmelAudio() {
  if (audioUnlocked) return;
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (Ctx) {
      const ctx = new Ctx();
      ctx.resume();
      const src = ctx.createBufferSource();
      src.buffer = ctx.createBuffer(1, 1, 22050);
      src.connect(ctx.destination);
      src.start(0);
    }
    const silent = new Audio('data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//uQZAAAAAD0/wAA');
    silent.volume = 0.001;
    silent.play().catch(() => {});
    audioUnlocked = true;
  } catch { /* ignore */ }
}

export function stopEmelSpeech() {
  stopCurrent();
  window.speechSynthesis?.cancel();
}

function speakFallback(text) {
  const synth = window.speechSynthesis;
  if (!synth) return;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'tr-TR';
  const voices = synth.getVoices();
  const tr = voices.find((v) => v.name.includes('Emel') || v.name.includes('EmelNeural'))
    || voices.find((v) => v.lang.startsWith('tr'));
  if (tr) u.voice = tr;
  synth.speak(u);
}

export async function speakWithEmel(text) {
  if (!text?.trim()) return;
  stopCurrent();

  try {
    const chunks = await fetchEmelAudio(text);
    const blob = new Blob(chunks, { type: 'audio/mpeg' });
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.volume = 1;
    currentAudio = audio;

    await new Promise((resolve, reject) => {
      audio.onended = () => { URL.revokeObjectURL(url); if (currentAudio === audio) currentAudio = null; resolve(); };
      audio.onerror = () => { URL.revokeObjectURL(url); reject(new Error('play failed')); };
      audio.play().catch(reject);
    });
  } catch (err) {
    console.warn('[Edge TTS Emel]', err);
    speakFallback(text);
  }
}
