(() => {
  const canvas = document.getElementById('starfield');
  const ctx = canvas.getContext('2d');

  const STAR_COUNT = 300;
  const SPEED = 2;
  let stars = [];
  let w, h;
  let mx, my;

  function isDark() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    if (mx === undefined) { mx = w / 2; my = h / 2; }
  }

  function createStar(randomZ) {
    return {
      x: (Math.random() - 0.5) * w * 2,
      y: (Math.random() - 0.5) * h * 2,
      z: randomZ ? Math.random() * w : w,
    };
  }

  function init() {
    resize();
    stars = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push(createStar(true));
    }
  }

  function draw() {
    const dark = isDark();
    ctx.fillStyle = dark ? '#0a0a0f' : '#f5f0e8';
    ctx.fillRect(0, 0, w, h);

    const cx = mx;
    const cy = my;
    const starColor = dark ? '255,255,255' : '30,30,30';

    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      s.z -= SPEED;

      if (s.z <= 0) {
        stars[i] = createStar(false);
        continue;
      }

      const sx = (s.x / s.z) * w * 0.3 + cx;
      const sy = (s.y / s.z) * h * 0.3 + cy;

      if (sx < 0 || sx > w || sy < 0 || sy > h) {
        stars[i] = createStar(false);
        continue;
      }

      const r = Math.max(0, 1.5 * (1 - s.z / w));
      const a = Math.max(0, 1 - s.z / w);

      ctx.beginPath();
      ctx.arc(sx, sy, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${starColor},${a})`;
      ctx.fill();
    }

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  // window.addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; });
  init();
  draw();
})();
