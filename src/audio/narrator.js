// Narrator — Howler wrapper with subtitle-segment sync

import { Howl } from 'howler';

/**
 * Create a narrator controller.
 * @returns {object}  { load, play, pause, resume, stop, getCurrentTime,
 *                      getDuration, onTimeUpdate, onEnd, getSegmentAt,
 *                      segments, totalDuration, destroy }
 */
export function createNarrator() {
  let howl = null;
  let segments = [];
  let totalDuration = 55;
  let timeUpdateCbs = [];
  let endCbs = [];
  let poll = null;

  const api = {
    segments,
    totalDuration,

    /**
     * Preload audio file and narration-segment JSON.
     * Resolves when both are ready.
     */
    async load(audioPath, dataPath) {
      // Fetch subtitle / segment data
      const res = await fetch(dataPath);
      const data = await res.json();
      segments = data.segments || [];
      totalDuration = data.totalDuration || 55;
      api.segments = segments;
      api.totalDuration = totalDuration;

      // Create & preload Howl
      await new Promise((resolve, reject) => {
        howl = new Howl({
          src: [audioPath],
          preload: true,
          html5: false,
          onload: resolve,
          onloaderror: (_id, err) => reject(new Error(`Audio load error: ${err}`)),
          onend: () => endCbs.forEach((cb) => cb()),
        });
      });
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
      howl.play(); // Howler resumes from paused position
      startPolling();
    },

    stop() {
      if (!howl) return;
      howl.stop();
      stopPolling();
    },

    getCurrentTime() {
      return howl ? howl.seek() : 0;
    },

    getDuration() {
      return totalDuration;
    },

    onTimeUpdate(cb) {
      timeUpdateCbs.push(cb);
    },

    onEnd(cb) {
      endCbs.push(cb);
    },

    /**
     * Return the narration segment active at `time`, or null.
     */
    getSegmentAt(time) {
      return (
        segments.find(
          (s) => s.type === 'narration' && time >= s.start && time < s.end
        ) || null
      );
    },

    destroy() {
      stopPolling();
      if (howl) {
        howl.unload();
        howl = null;
      }
      timeUpdateCbs = [];
      endCbs = [];
      segments = [];
    },
  };

  function startPolling() {
    stopPolling();
    poll = setInterval(() => {
      const t = api.getCurrentTime();
      timeUpdateCbs.forEach((cb) => cb(t));
    }, 50);
  }

  function stopPolling() {
    if (poll !== null) {
      clearInterval(poll);
      poll = null;
    }
  }

  return api;
}
