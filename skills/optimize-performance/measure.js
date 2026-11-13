(async () => {
  const get = (type) => new Promise((r) => {
    new PerformanceObserver((l) => r(l.getEntries())).observe({ type, buffered: true });
    setTimeout(() => r([]), 1000);
  });
  const [lcp, cls] = await Promise.all([get('largest-contentful-paint'), get('layout-shift')]);
  const nav = performance.getEntriesByType('navigation')[0];
  const res = performance.getEntriesByType('resource');
  const fcp = performance.getEntriesByName('first-contentful-paint')[0];
  const kb = (list) => Math.round(list.reduce((s, r) => s + r.transferSize, 0) / 1024);
  return {
    ttfb: Math.round(nav.responseStart),
    fcp: Math.round(fcp?.startTime ?? 0),
    lcp: Math.round(lcp.at(-1)?.startTime ?? 0),
    cls: +cls.filter((e) => !e.hadRecentInput).reduce((s, e) => s + e.value, 0).toFixed(3),
    load: Math.round(nav.loadEventEnd),
    requests: res.length + 1,
    transferKB: kb([nav, ...res]),
    jsKB: kb(res.filter((r) => r.name.split('?')[0].endsWith('.js'))),
  };
})()
