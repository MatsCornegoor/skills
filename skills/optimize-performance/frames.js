(async () => {
  // Options: set window.__frames = { ms, scroll } before this script runs.
  const opts = { ms: 5000, scroll: false, ...(window.__frames || {}) };
  const type = PerformanceObserver.supportedEntryTypes.includes('long-animation-frame')
    ? 'long-animation-frame'
    : 'longtask';
  const long = [];
  const obs = new PerformanceObserver((l) => long.push(...l.getEntries()));
  obs.observe({ type });

  const maxScroll = document.documentElement.scrollHeight - innerHeight;
  const deltas = [];
  await new Promise((done) => {
    let start, last;
    const tick = (t) => {
      if (start === undefined) start = last = t;
      else { deltas.push(t - last); last = t; }
      if (opts.scroll) scrollTo(0, Math.min(1, (t - start) / opts.ms) * maxScroll);
      t - start < opts.ms ? requestAnimationFrame(tick) : done();
    };
    requestAnimationFrame(tick);
  });
  obs.disconnect();
  if (opts.scroll) scrollTo(0, 0);

  const sorted = [...deltas].sort((a, b) => a - b);
  const pct = (p) => +sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))].toFixed(1);
  const refresh = pct(0.5); // median frame time ≈ display refresh interval
  const dropped = deltas.reduce((s, d) => s + Math.max(0, Math.round(d / refresh) - 1), 0);
  const scripts = type === 'long-animation-frame'
    ? long.flatMap((e) => e.scripts)
        .sort((a, b) => b.duration - a.duration)
        .slice(0, 5)
        .map((s) => ({ ms: Math.round(s.duration), source: s.sourceURL, fn: s.sourceFunctionName || s.invoker }))
    : undefined;

  return {
    mode: opts.scroll ? 'scroll' : 'idle',
    fps: Math.round(deltas.length / (opts.ms / 1000)),
    frameP50: refresh,
    frameP95: pct(0.95),
    frameP99: pct(0.99),
    frameMax: +sorted.at(-1).toFixed(1),
    droppedFrames: dropped,
    droppedPct: +((dropped / (deltas.length + dropped)) * 100).toFixed(1),
    longFrames: long.length,
    blockingMs: Math.round(long.reduce((s, e) => s + Math.max(0, e.duration - 50), 0)),
    heapMB: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : undefined,
    worstScripts: scripts,
  };
})()
