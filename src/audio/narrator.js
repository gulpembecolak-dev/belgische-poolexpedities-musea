/**
 * narrator.js — Howler wrapper synced to a segment JSON.
 */
import { Howl } from 'howler';

export function createNarrator() {
  let howl = null;
  let segments = [];
  let totalDuration = 0;
  let endHandler = null;
  let timeHandler = null;
  let pollId = 0;

  const startPolling = () => {
    stopPolling();
    pollId = window.setInterval(() => {
      if (!howl) return;
      const t = howl.seek();
      if (typeof t === 'number') timeHandler?.(t);
    }, 50);
  };

  const stopPolling = () => {
    if (pollId) {
      clearInterval(pollId);
      pollId = 0;
    }
  };

  return {
    async load(audioPath, dataPath) {
      const dataRes = await fetch(dataPath);
      const data = await dataRes.json();
      segments = data.segments || [];
      totalDuration = data.totalDuration || 0;

      await new Promise((resolve, reject) => {
        howl = new Howl({
          src: [audioPath],
          html5: false,
          preload: true,
          onload: resolve,
          onloaderror: (_id, err) => reject(new Error(`Audio load failed: ${err}`)),
          onend: () => endHandler?.(),
        });
      });

      if (!totalDuration) totalDuration = howl.duration();
      return { totalDuration, audioDuration: howl.duration() };
    },

    play() {
      if (!howl) return;
      howl.play();
      startPolling();
    },

    pause() {
      if (!howl) return;
      howl.pause();
      stopPolling();
    },

    resume() {
      if (!howl) return;
      howl.play();
      startPolling();
    },

    stop() {
      if (!howl) return;
      howl.stop();
      stopPolling();
    },

    getCurrentTime() {
      if (!howl) return 0;
      const t = howl.seek();
      return typeof t === 'number' ? t : 0;
    },

    getDuration() {
      return totalDuration;
    },

    onTimeUpdate(fn) { timeHandler = fn; },
    onEnd(fn)        { endHandler = fn; },

    getSegmentAt(t) {
      for (const s of segments) {
        if (t >= s.start && t < s.end) return s;
      }
      return null;
    },

    destroy() {
      stopPolling();
      if (howl) {
        howl.unload();
        howl = null;
      }
      segments = [];
      endHandler = null;
      timeHandler = null;
    },
  };
}
