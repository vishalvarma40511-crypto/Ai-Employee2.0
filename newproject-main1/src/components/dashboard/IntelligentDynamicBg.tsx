import { useEffect, useRef } from 'react'

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  baseAlpha: number;
  targetX?: number;
  targetY?: number;
}

interface ColorRGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

interface TabConfig {
  primary: ColorRGBA;
  secondary: ColorRGBA;
  accent: ColorRGBA;
  particle: ColorRGBA;
  grid: ColorRGBA;
  flowDirection: 'up' | 'down' | 'center' | 'float';
}

const TAB_CONFIGS: Record<string, TabConfig> = {
  overview: {
    primary: { r: 6, g: 182, b: 212, a: 0.12 }, // Cyan
    secondary: { r: 99, g: 102, b: 241, a: 0.15 }, // Indigo
    accent: { r: 236, g: 72, b: 153, a: 0.08 }, // Pink
    particle: { r: 6, g: 182, b: 212, a: 0.15 },
    grid: { r: 6, g: 182, b: 212, a: 0.02 },
    flowDirection: 'up',
  },
  finance: {
    primary: { r: 34, g: 197, b: 94, a: 0.12 }, // Green
    secondary: { r: 234, g: 179, b: 8, a: 0.15 }, // Yellow
    accent: { r: 20, g: 184, b: 166, a: 0.08 }, // Teal
    particle: { r: 34, g: 197, b: 94, a: 0.15 },
    grid: { r: 34, g: 197, b: 94, a: 0.02 },
    flowDirection: 'up',
  },
  inventory: {
    primary: { r: 16, g: 185, b: 129, a: 0.12 }, // Emerald
    secondary: { r: 56, g: 189, b: 248, a: 0.15 }, // Sky
    accent: { r: 99, g: 102, b: 241, a: 0.08 }, // Indigo
    particle: { r: 16, g: 185, b: 129, a: 0.15 },
    grid: { r: 16, g: 185, b: 129, a: 0.02 },
    flowDirection: 'float',
  },
  sales: {
    primary: { r: 168, g: 85, b: 247, a: 0.12 }, // Purple
    secondary: { r: 236, g: 72, b: 153, a: 0.15 }, // Pink
    accent: { r: 99, g: 102, b: 241, a: 0.08 }, // Indigo
    particle: { r: 168, g: 85, b: 247, a: 0.15 },
    grid: { r: 168, g: 85, b: 247, a: 0.02 },
    flowDirection: 'up',
  },
  billing: {
    primary: { r: 59, g: 130, b: 246, a: 0.12 }, // Blue
    secondary: { r: 99, g: 102, b: 241, a: 0.15 }, // Indigo
    accent: { r: 168, g: 85, b: 247, a: 0.08 }, // Purple
    particle: { r: 59, g: 130, b: 246, a: 0.15 },
    grid: { r: 59, g: 130, b: 246, a: 0.02 },
    flowDirection: 'down',
  },
  orders: {
    primary: { r: 249, g: 115, b: 22, a: 0.12 }, // Orange
    secondary: { r: 239, g: 68, b: 68, a: 0.15 }, // Red
    accent: { r: 234, g: 179, b: 8, a: 0.08 }, // Yellow
    particle: { r: 249, g: 115, b: 22, a: 0.15 },
    grid: { r: 249, g: 115, b: 22, a: 0.02 },
    flowDirection: 'float',
  },
  marketing: {
    primary: { r: 244, g: 63, b: 94, a: 0.12 }, // Rose
    secondary: { r: 236, g: 72, b: 153, a: 0.15 }, // Pink
    accent: { r: 168, g: 85, b: 247, a: 0.08 }, // Purple
    particle: { r: 244, g: 63, b: 94, a: 0.15 },
    grid: { r: 244, g: 63, b: 94, a: 0.02 },
    flowDirection: 'center',
  },
  employees: {
    primary: { r: 14, g: 165, b: 233, a: 0.12 }, // Sky
    secondary: { r: 59, g: 130, b: 246, a: 0.15 }, // Blue
    accent: { r: 20, g: 184, b: 166, a: 0.08 }, // Teal
    particle: { r: 14, g: 165, b: 233, a: 0.15 },
    grid: { r: 14, g: 165, b: 233, a: 0.02 },
    flowDirection: 'float',
  },
  customers: {
    primary: { r: 236, g: 72, b: 153, a: 0.12 }, // Pink
    secondary: { r: 244, g: 63, b: 94, a: 0.15 }, // Rose
    accent: { r: 249, g: 115, b: 22, a: 0.08 }, // Orange
    particle: { r: 236, g: 72, b: 153, a: 0.15 },
    grid: { r: 236, g: 72, b: 153, a: 0.02 },
    flowDirection: 'up',
  },
  requests: {
    primary: { r: 234, g: 179, b: 8, a: 0.12 }, // Amber
    secondary: { r: 249, g: 115, b: 22, a: 0.15 }, // Orange
    accent: { r: 34, g: 197, b: 94, a: 0.08 }, // Green
    particle: { r: 234, g: 179, b: 8, a: 0.15 },
    grid: { r: 234, g: 179, b: 8, a: 0.02 },
    flowDirection: 'center',
  },
  invoice: {
    primary: { r: 139, g: 92, b: 246, a: 0.12 }, // Violet
    secondary: { r: 168, g: 85, b: 247, a: 0.15 }, // Purple
    accent: { r: 236, g: 72, b: 153, a: 0.08 }, // Pink
    particle: { r: 139, g: 92, b: 246, a: 0.15 },
    grid: { r: 139, g: 92, b: 246, a: 0.02 },
    flowDirection: 'down',
  },
  profile: {
    primary: { r: 6, g: 182, b: 212, a: 0.12 }, // Cyan
    secondary: { r: 20, g: 184, b: 166, a: 0.15 }, // Teal
    accent: { r: 59, g: 130, b: 246, a: 0.08 }, // Blue
    particle: { r: 6, g: 182, b: 212, a: 0.15 },
    grid: { r: 6, g: 182, b: 212, a: 0.02 },
    flowDirection: 'float',
  },
};

const DEFAULT_CONFIG: TabConfig = TAB_CONFIGS.overview;

const lerp = (start: number, end: number, amt: number) => (1 - amt) * start + amt * end;
const lerpColor = (c1: ColorRGBA, c2: ColorRGBA, amt: number): ColorRGBA => ({
  r: lerp(c1.r, c2.r, amt),
  g: lerp(c1.g, c2.g, amt),
  b: lerp(c1.b, c2.b, amt),
  a: lerp(c1.a, c2.a, amt),
});
const colorToCSS = (c: ColorRGBA, alphaOverride?: number) => {
  const alpha = alphaOverride !== undefined ? alphaOverride : c.a;
  return `rgba(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)}, ${alpha})`;
};

export default function IntelligentDynamicBg({ tab, isLight }: { tab: string; isLight: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const isReducedMotion = useRef(false);

  // Setup refs for smooth transition interpolations
  const currentPrimary = useRef<ColorRGBA>({ ...DEFAULT_CONFIG.primary });
  const currentSecondary = useRef<ColorRGBA>({ ...DEFAULT_CONFIG.secondary });
  const currentAccent = useRef<ColorRGBA>({ ...DEFAULT_CONFIG.accent });
  const currentParticleColor = useRef<ColorRGBA>({ ...DEFAULT_CONFIG.particle });
  const currentGridColor = useRef<ColorRGBA>({ ...DEFAULT_CONFIG.grid });
  const flowDirection = useRef<string>('up');

  // Page illustration opacities
  const opacities = useRef<Record<string, number>>({
    overview: 0, finance: 0, inventory: 0, sales: 0, billing: 0,
    orders: 0, marketing: 0, employees: 0, customers: 0, requests: 0,
    invoice: 0, profile: 0
  });

  // Persistent visual elements that drift across frames
  const floatingCurrencies = useRef<Array<{ x: number; y: number; char: string; speed: number; scale: number; alpha: number }>>([]);
  const logisticsRoutes = useRef<Array<{ sx: number; sy: number; tx: number; ty: number; progress: number; speed: number }>>([]);
  const digitalReceipts = useRef<Array<{ x: number; chars: string[]; y: number; speed: number }>>([]);
  const heartFloaters = useRef<Array<{ x: number; y: number; size: number; speed: number; angle: number; waveSpeed: number; alpha: number }>>([]);
  const ticketStack = useRef<Array<{ yOffset: number; width: number; height: number; title: string; priority: string; alpha: number }>>([]);
  const fallingInvoices = useRef<Array<{ x: number; y: number; rot: number; rotSpeed: number; speed: number; scale: number }>>([]);
  
  useEffect(() => {
    isReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Initialize persistent floaters
    if (floatingCurrencies.current.length === 0) {
      const symbols = ['₹', '$', '€', '¥', '£', '₿'];
      for (let i = 0; i < 15; i++) {
        floatingCurrencies.current.push({
          x: Math.random(),
          y: Math.random(),
          char: symbols[Math.floor(Math.random() * symbols.length)],
          speed: 0.2 + Math.random() * 0.4,
          scale: 0.7 + Math.random() * 0.8,
          alpha: 0.15 + Math.random() * 0.3,
        });
      }
    }

    if (digitalReceipts.current.length === 0) {
      for (let i = 0; i < 8; i++) {
        const charLen = 10 + Math.floor(Math.random() * 15);
        const chars: string[] = [];
        for (let c = 0; c < charLen; c++) {
          chars.push(Math.random() > 0.5 ? '1' : '0');
        }
        digitalReceipts.current.push({
          x: Math.random(),
          chars,
          y: Math.random(),
          speed: 0.5 + Math.random() * 0.8,
        });
      }
    }

    if (heartFloaters.current.length === 0) {
      for (let i = 0; i < 12; i++) {
        heartFloaters.current.push({
          x: Math.random(),
          y: Math.random(),
          size: 6 + Math.random() * 8,
          speed: 0.3 + Math.random() * 0.5,
          angle: Math.random() * Math.PI * 2,
          waveSpeed: 0.01 + Math.random() * 0.02,
          alpha: 0.15 + Math.random() * 0.35,
        });
      }
    }

    if (ticketStack.current.length === 0) {
      const priorities = ['HIGH', 'URGENT', 'MEDIUM', 'LOW'];
      for (let i = 0; i < 5; i++) {
        ticketStack.current.push({
          yOffset: i * 70,
          width: 220,
          height: 50,
          title: `TICKET-40${i + 1}`,
          priority: priorities[i % priorities.length],
          alpha: 0.2 + Math.random() * 0.4
        });
      }
    }

    if (fallingInvoices.current.length === 0) {
      for (let i = 0; i < 6; i++) {
        fallingInvoices.current.push({
          x: Math.random(),
          y: Math.random(),
          rot: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.005,
          speed: 0.3 + Math.random() * 0.6,
          scale: 0.6 + Math.random() * 0.5
        });
      }
    }

    if (logisticsRoutes.current.length === 0) {
      // 5 core regional hub hubs
      const hubs = [
        { x: 0.2, y: 0.3 },
        { x: 0.4, y: 0.6 },
        { x: 0.7, y: 0.25 },
        { x: 0.8, y: 0.7 },
        { x: 0.5, y: 0.4 }
      ];
      for (let i = 0; i < 6; i++) {
        const sh = hubs[Math.floor(Math.random() * hubs.length)];
        let th = hubs[Math.floor(Math.random() * hubs.length)];
        while (th === sh) {
          th = hubs[Math.floor(Math.random() * hubs.length)];
        }
        logisticsRoutes.current.push({
          sx: sh.x,
          sy: sh.y,
          tx: th.x,
          ty: th.y,
          progress: Math.random(),
          speed: 0.002 + Math.random() * 0.003
        });
      }
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    // Initial configurations
    const targetConfig = TAB_CONFIGS[tab] || DEFAULT_CONFIG;
    flowDirection.current = targetConfig.flowDirection;

    // Build particle matrix
    const particles: Particle[] = [];
    const particleCount = isReducedMotion.current ? 12 : 55;
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7,
        size: 1 + Math.random() * 2.5,
        alpha: 0.1 + Math.random() * 0.4,
        baseAlpha: 0.15 + Math.random() * 0.35,
      });
    }

    let time = 0;
    let lastTime = 0;

    // Draw helpers
    const drawGrid = (ctx: CanvasRenderingContext2D, color: ColorRGBA) => {
      ctx.strokeStyle = colorToCSS(color);
      ctx.lineWidth = 0.5;
      const step = isLight ? 60 : 50;
      
      // Draw grid lines
      ctx.beginPath();
      for (let x = 0; x < width; x += step) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y < height; y += step) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Draw subtle intersections
      ctx.fillStyle = colorToCSS(color, color.a * 2.5);
      for (let x = step; x < width; x += step) {
        for (let y = step; y < height; y += step) {
          ctx.fillRect(x - 1, y - 1, 2, 2);
        }
      }
    };

    const drawParticles = (ctx: CanvasRenderingContext2D, color: ColorRGBA) => {
      const dir = flowDirection.current;
      particles.forEach((p) => {
        // Apply directional flow speed adjustments
        if (dir === 'up') {
          p.y -= Math.abs(p.vy) * 0.9 + 0.15;
          if (p.y < -10) { p.y = height + 10; p.x = Math.random() * width; }
        } else if (dir === 'down') {
          p.y += Math.abs(p.vy) * 0.9 + 0.15;
          if (p.y > height + 10) { p.y = -10; p.x = Math.random() * width; }
        } else if (dir === 'center') {
          const cx = width / 2;
          const cy = height / 2;
          const dx = p.x - cx;
          const dy = p.y - cy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 350) {
            p.x = cx + (Math.random() - 0.5) * 80;
            p.y = cy + (Math.random() - 0.5) * 80;
          } else {
            p.x += (dx / dist) * 0.45;
            p.y += (dy / dist) * 0.45;
          }
        } else {
          // float free
          p.x += p.vx * 0.8;
          p.y += p.vy * 0.8;
          if (p.x < -10) p.x = width + 10;
          if (p.x > width + 10) p.x = -10;
          if (p.y < -10) p.y = height + 10;
          if (p.y > height + 10) p.y = -10;
        }

        // Draw particle
        ctx.fillStyle = colorToCSS(color, p.alpha);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Drawing neural connection links
      if (!isReducedMotion.current) {
        ctx.lineWidth = 0.5;
        const maxDist = 130;
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < maxDist) {
              const alpha = (1 - dist / maxDist) * 0.08 * color.a;
              ctx.strokeStyle = colorToCSS(color, alpha);
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.stroke();
            }
          }
        }
      }
    };

    const drawMouseGlow = (ctx: CanvasRenderingContext2D, color: ColorRGBA) => {
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      if (mx > 0 && my > 0) {
        // Draw interactive mouse connection ray
        const cx = width / 2;
        const cy = height / 2;
        ctx.strokeStyle = colorToCSS(color, 0.04);
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(mx, my);
        ctx.lineTo(cx, cy);
        ctx.stroke();

        // Mouse light halo
        const radialGlow = ctx.createRadialGradient(mx, my, 0, mx, my, 180);
        radialGlow.addColorStop(0, colorToCSS(color, 0.07));
        radialGlow.addColorStop(0.5, colorToCSS(color, 0.02));
        radialGlow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = radialGlow;
        ctx.beginPath();
        ctx.arc(mx, my, 180, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    // Render loop
    const render = (timestamp: number) => {
      if (!lastTime) lastTime = timestamp;
      const elapsed = timestamp - lastTime;
      lastTime = timestamp;
      time += elapsed;

      // 1. Lerp theme properties
      const target = TAB_CONFIGS[tab] || DEFAULT_CONFIG;
      const lerpSpeed = 0.06; // Smooth transition over ~300ms

      currentPrimary.current = lerpColor(currentPrimary.current, target.primary, lerpSpeed);
      currentSecondary.current = lerpColor(currentSecondary.current, target.secondary, lerpSpeed);
      currentAccent.current = lerpColor(currentAccent.current, target.accent, lerpSpeed);
      currentParticleColor.current = lerpColor(currentParticleColor.current, target.particle, lerpSpeed);
      currentGridColor.current = lerpColor(currentGridColor.current, target.grid, lerpSpeed);

      // Interpolate tab illustration opacities
      Object.keys(opacities.current).forEach((key) => {
        const isTarget = key === tab;
        const currentOp = opacities.current[key];
        opacities.current[key] = lerp(currentOp, isTarget ? 1.0 : 0.0, 0.08);
      });

      // Clear
      ctx.clearRect(0, 0, width, height);

      // Render base mesh grid
      drawGrid(ctx, currentGridColor.current);

      // Draw floating particles & lines
      drawParticles(ctx, currentParticleColor.current);

      // Draw interactive mouse glows
      drawMouseGlow(ctx, currentPrimary.current);

      // Centered coordinate references
      const cx = width * 0.65; // Shift to the right to clear space for the left sidebar and text fields
      const cy = height / 2;

      // Draw active illustrations according to their dynamic opacities
      Object.keys(opacities.current).forEach((key) => {
        const opacity = opacities.current[key];
        if (opacity < 0.005) return;

        ctx.save();
        ctx.shadowBlur = 15;
        
        switch (key) {
          case 'overview': {
            ctx.shadowColor = colorToCSS(currentPrimary.current, 0.4);
            const drawColor = colorToCSS(currentPrimary.current, opacity * 0.4);
            const lineCol = colorToCSS(currentSecondary.current, opacity * 0.2);

            // AI Brain core pulse
            const pulse = 1.0 + Math.sin(time * 0.002) * 0.06;
            ctx.strokeStyle = drawColor;
            ctx.lineWidth = 1.5;

            // Rotating globe rings
            for (let i = 0; i < 3; i++) {
              ctx.beginPath();
              const angle = (time * 0.0004 + (i * Math.PI) / 3);
              ctx.ellipse(cx, cy, 140 * pulse, 60 * pulse, angle, 0, Math.PI * 2);
              ctx.stroke();
            }

            // Brain node core
            ctx.fillStyle = colorToCSS(currentAccent.current, opacity * 0.35);
            ctx.beginPath();
            ctx.arc(cx, cy, 32 * pulse, 0, Math.PI * 2);
            ctx.fill();

            // Connections to core
            const orbitalCount = 7;
            ctx.strokeStyle = lineCol;
            ctx.lineWidth = 1;
            for (let i = 0; i < orbitalCount; i++) {
              const ang = (i * Math.PI * 2) / orbitalCount + time * 0.0003;
              const ox = cx + Math.cos(ang) * 90 * pulse;
              const oy = cy + Math.sin(ang) * 90 * pulse;
              
              ctx.beginPath();
              ctx.setLineDash([4, 4]);
              ctx.moveTo(cx, cy);
              ctx.lineTo(ox, oy);
              ctx.stroke();
              ctx.setLineDash([]);

              ctx.fillStyle = colorToCSS(currentSecondary.current, opacity * 0.6);
              ctx.beginPath();
              ctx.arc(ox, oy, 4.5, 0, Math.PI * 2);
              ctx.fill();
            }

            // Ascending Business Growth Arrow (Top Right)
            ctx.strokeStyle = colorToCSS(currentPrimary.current, opacity * 0.35);
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(cx - 160, cy + 120);
            ctx.lineTo(cx - 70, cy + 70);
            ctx.lineTo(cx + 10, cy + 95);
            ctx.lineTo(cx + 130, cy - 30);
            ctx.stroke();

            // Draw arrow head
            ctx.fillStyle = colorToCSS(currentPrimary.current, opacity * 0.5);
            ctx.beginPath();
            ctx.arc(cx + 130, cy - 30, 6, 0, Math.PI * 2);
            ctx.fill();
            break;
          }

          case 'finance': {
            ctx.shadowColor = colorToCSS(currentPrimary.current, 0.4);
            const primaryStroke = colorToCSS(currentPrimary.current, opacity * 0.3);
            const secondaryStroke = colorToCSS(currentSecondary.current, opacity * 0.25);
            const fillCol = colorToCSS(currentAccent.current, opacity * 0.15);

            // Floating 3D Credit Card
            ctx.strokeStyle = primaryStroke;
            ctx.fillStyle = fillCol;
            ctx.lineWidth = 2;

            ctx.save();
            ctx.translate(cx - 60, cy - 30);
            ctx.rotate(-0.15 + Math.sin(time * 0.0008) * 0.04);
            ctx.beginPath();
            ctx.roundRect(-80, -50, 160, 100, 10);
            ctx.fill();
            ctx.stroke();

            // Card details (chip)
            ctx.strokeStyle = secondaryStroke;
            ctx.strokeRect(-60, -30, 20, 16);
            ctx.beginPath();
            ctx.moveTo(-20, 15);
            ctx.lineTo(40, 15);
            ctx.stroke();
            ctx.restore();

            // Floating Currency Symbols
            ctx.fillStyle = colorToCSS(currentSecondary.current, opacity * 0.65);
            ctx.font = 'bold 22px Space Grotesk, sans-serif';
            floatingCurrencies.current.forEach((cur) => {
              if (!isReducedMotion.current) {
                cur.y -= cur.speed * 0.008;
                if (cur.y < -0.1) {
                  cur.y = 1.1;
                  cur.x = Math.random();
                }
              }
              const px = cx - 180 + cur.x * 360;
              const py = cy - 140 + cur.y * 280;
              ctx.fillText(cur.char, px, py);
            });

            // Profit Chart Path
            ctx.strokeStyle = colorToCSS(currentPrimary.current, opacity * 0.4);
            ctx.lineWidth = 3;
            ctx.beginPath();
            for (let i = 0; i <= 10; i++) {
              const xPos = cx - 150 + i * 30;
              const yPos = cy + 100 - Math.sin(i * 0.8 + time * 0.0015) * 35;
              if (i === 0) ctx.moveTo(xPos, yPos);
              else ctx.lineTo(xPos, yPos);
            }
            ctx.stroke();
            break;
          }

          case 'inventory': {
            ctx.shadowColor = colorToCSS(currentPrimary.current, 0.4);
            const gridCol = colorToCSS(currentPrimary.current, opacity * 0.25);
            const boxCol = colorToCSS(currentSecondary.current, opacity * 0.35);

            // Warehouse shelf structure (isometric grid shelves)
            ctx.strokeStyle = gridCol;
            ctx.lineWidth = 1.5;
            for (let i = 0; i < 4; i++) {
              const shelfY = cy - 80 + i * 50;
              ctx.beginPath();
              ctx.moveTo(cx - 150, shelfY);
              ctx.lineTo(cx + 150, shelfY);
              ctx.stroke();

              // Draw items on the shelves
              ctx.fillStyle = boxCol;
              for (let j = 0; j < 3; j++) {
                const boxX = cx - 100 + j * 90 + Math.sin(time * 0.0005 + i + j) * 8;
                ctx.beginPath();
                ctx.roundRect(boxX, shelfY - 24, 30, 22, 3);
                ctx.fill();
                ctx.stroke();
              }
            }

            // Sweeping laser scan (Red scanner effect)
            const laserY = cy - 110 + ((Math.sin(time * 0.0015) + 1) / 2) * 220;
            const laserGrad = ctx.createLinearGradient(cx - 200, laserY, cx + 200, laserY);
            laserGrad.addColorStop(0, 'rgba(239, 68, 68, 0)');
            laserGrad.addColorStop(0.5, `rgba(239, 68, 68, ${opacity * 0.8})`);
            laserGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
            ctx.strokeStyle = laserGrad;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(cx - 180, laserY);
            ctx.lineTo(cx + 180, laserY);
            ctx.stroke();
            break;
          }

          case 'sales': {
            ctx.shadowColor = colorToCSS(currentPrimary.current, 0.4);
            const chartCol = colorToCSS(currentPrimary.current, opacity * 0.4);
            const areaCol = colorToCSS(currentSecondary.current, opacity * 0.06);
            const accentCol = colorToCSS(currentAccent.current, opacity * 0.5);

            // Double Sales Wave Charts
            ctx.lineWidth = 3;
            for (let wave = 0; wave < 2; wave++) {
              ctx.strokeStyle = wave === 0 ? chartCol : colorToCSS(currentSecondary.current, opacity * 0.35);
              ctx.fillStyle = areaCol;
              ctx.beginPath();
              ctx.moveTo(cx - 180, cy + 120);

              for (let i = 0; i <= 20; i++) {
                const x = cx - 180 + i * 18;
                const sinVal = Math.sin(i * 0.25 - time * 0.002 + wave * Math.PI) * 45;
                const y = cy + 40 + sinVal + (wave * 20);
                ctx.lineTo(x, y);
              }
              ctx.lineTo(cx + 180, cy + 120);
              ctx.closePath();
              ctx.fill();
              ctx.stroke();
            }

            // Floating upward performance indicator badges
            ctx.fillStyle = accentCol;
            ctx.font = 'bold 15px Space Grotesk, sans-serif';
            for (let i = 0; i < 3; i++) {
              const floatY = cy - 90 + Math.sin(time * 0.001 + i) * 12;
              const floatX = cx - 120 + i * 100;
              ctx.beginPath();
              ctx.roundRect(floatX - 35, floatY - 12, 70, 24, 6);
              ctx.fillStyle = colorToCSS(currentPrimary.current, opacity * 0.15);
              ctx.fill();
              ctx.strokeStyle = colorToCSS(currentAccent.current, opacity * 0.4);
              ctx.stroke();
              ctx.fillStyle = colorToCSS(currentAccent.current, opacity * 0.85);
              ctx.fillText('▲ +18%', floatX - 25, floatY + 5);
            }
            break;
          }

          case 'billing': {
            ctx.shadowColor = colorToCSS(currentPrimary.current, 0.4);
            const scanColor = colorToCSS(currentPrimary.current, opacity * 0.35);
            const receiptColor = colorToCSS(currentSecondary.current, opacity * 0.2);

            // Vertical Virtual Receipt Matrix
            ctx.fillStyle = colorToCSS(currentPrimary.current, opacity * 0.45);
            ctx.font = '10px monospace';
            digitalReceipts.current.forEach((stream) => {
              if (!isReducedMotion.current) {
                stream.y += stream.speed * 0.015;
                if (stream.y > 1.1) {
                  stream.y = -0.1;
                  stream.x = Math.random();
                }
              }
              const sx = cx - 160 + stream.x * 320;
              stream.chars.forEach((char, idx) => {
                const sy = cy - 120 + (stream.y * 240 + idx * 12) % 240;
                ctx.fillText(char, sx, sy);
              });
            });

            // Centered concentric transaction ripples
            const rippleRadius = (time * 0.08) % 130;
            const rippleAlpha = Math.max(0, 1 - rippleRadius / 130) * opacity * 0.35;
            ctx.strokeStyle = colorToCSS(currentSecondary.current, rippleAlpha);
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.arc(cx, cy, rippleRadius, 0, Math.PI * 2);
            ctx.stroke();

            // Floating receipt paper outline
            ctx.strokeStyle = scanColor;
            ctx.lineWidth = 2;
            ctx.fillStyle = colorToCSS(currentAccent.current, opacity * 0.12);
            ctx.beginPath();
            ctx.roundRect(cx - 40, cy - 70, 80, 130, 4);
            ctx.fill();
            ctx.stroke();

            // Receipt horizontal lines
            ctx.strokeStyle = receiptColor;
            for (let i = 0; i < 6; i++) {
              ctx.beginPath();
              ctx.moveTo(cx - 28, cy - 40 + i * 18);
              ctx.lineTo(cx + 28, cy - 40 + i * 18);
              ctx.stroke();
            }
            break;
          }

          case 'orders': {
            ctx.shadowColor = colorToCSS(currentPrimary.current, 0.4);
            const lineCol = colorToCSS(currentSecondary.current, opacity * 0.2);
            const hubCol = colorToCSS(currentPrimary.current, opacity * 0.6);

            // Render Logistics Routes
            ctx.lineWidth = 1.5;
            logisticsRoutes.current.forEach((route) => {
              const startX = cx - 180 + route.sx * 360;
              const startY = cy - 120 + route.sy * 240;
              const targetX = cx - 180 + route.tx * 360;
              const targetY = cy - 120 + route.ty * 240;

              // Arc line
              const midX = (startX + targetX) / 2;
              const midY = (startY + targetY) / 2 - 40; // Arc curvature

              ctx.strokeStyle = lineCol;
              ctx.beginPath();
              ctx.moveTo(startX, startY);
              ctx.quadraticCurveTo(midX, midY, targetX, targetY);
              ctx.stroke();

              // Running Packet Dot
              if (!isReducedMotion.current) {
                route.progress += route.speed;
                if (route.progress > 1.0) route.progress = 0;
              }

              // Quadratic Bezier coordinate at progress t
              const t = route.progress;
              const ptX = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * midX + t * t * targetX;
              const ptY = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * midY + t * t * targetY;

              ctx.fillStyle = colorToCSS(currentAccent.current, opacity * 0.9);
              ctx.beginPath();
              ctx.arc(ptX, ptY, 5.5, 0, Math.PI * 2);
              ctx.fill();
            });

            // Hub coordinates
            const hubs = [
              { x: 0.2, y: 0.3 },
              { x: 0.4, y: 0.6 },
              { x: 0.7, y: 0.25 },
              { x: 0.8, y: 0.7 },
              { x: 0.5, y: 0.4 }
            ];
            hubs.forEach((h) => {
              const hx = cx - 180 + h.x * 360;
              const hy = cy - 120 + h.y * 240;
              
              ctx.fillStyle = hubCol;
              ctx.beginPath();
              ctx.arc(hx, hy, 7, 0, Math.PI * 2);
              ctx.fill();
              
              ctx.strokeStyle = colorToCSS(currentSecondary.current, opacity * 0.4);
              ctx.beginPath();
              ctx.arc(hx, hy, 14, 0, Math.PI * 2);
              ctx.stroke();
            });
            break;
          }

          case 'marketing': {
            ctx.shadowColor = colorToCSS(currentPrimary.current, 0.4);
            const mainCol = colorToCSS(currentPrimary.current, opacity * 0.35);
            const secondaryCol = colorToCSS(currentSecondary.current, opacity * 0.2);

            // Rotating Funnel Loops
            ctx.strokeStyle = mainCol;
            ctx.lineWidth = 2;
            for (let i = 0; i < 4; i++) {
              const scale = 1.0 - i * 0.2;
              const fY = cy - 50 + i * 35;
              const radX = 80 * scale;
              const radY = 22 * scale;
              
              ctx.beginPath();
              ctx.ellipse(cx, fY, radX, radY, 0, 0, Math.PI * 2);
              ctx.stroke();

              // Funnel boundary connection lines
              if (i < 3) {
                const nextScale = 1.0 - (i + 1) * 0.2;
                const nextFY = cy - 50 + (i + 1) * 35;
                ctx.strokeStyle = secondaryCol;
                ctx.beginPath();
                ctx.moveTo(cx - radX, fY);
                ctx.lineTo(cx - 80 * nextScale, nextFY);
                ctx.moveTo(cx + radX, fY);
                ctx.lineTo(cx + 80 * nextScale, nextFY);
                ctx.stroke();
                ctx.strokeStyle = mainCol;
              }
            }

            // Expanding sound waves from marketing megaphone
            ctx.strokeStyle = colorToCSS(currentAccent.current, opacity * 0.45);
            for (let i = 0; i < 3; i++) {
              const waveRadius = 90 + ((time * 0.05 + i * 40) % 90);
              const waveAlpha = Math.max(0, 1 - (waveRadius - 90) / 90) * opacity * 0.4;
              ctx.strokeStyle = colorToCSS(currentAccent.current, waveAlpha);
              ctx.lineWidth = 3;
              ctx.beginPath();
              ctx.arc(cx - 120, cy - 30, waveRadius, -Math.PI / 4, Math.PI / 4);
              ctx.stroke();
            }
            break;
          }

          case 'employees': {
            ctx.shadowColor = colorToCSS(currentPrimary.current, 0.4);
            const treeCol = colorToCSS(currentPrimary.current, opacity * 0.25);
            const nodeCol = colorToCSS(currentSecondary.current, opacity * 0.5);

            // Organizational connection tree coordinates
            const tree = {
              x: cx, y: cy - 70,
              children: [
                {
                  x: cx - 100, y: cy + 10,
                  children: [
                    { x: cx - 140, y: cy + 90 },
                    { x: cx - 60, y: cy + 90 }
                  ]
                },
                {
                  x: cx + 100, y: cy + 10,
                  children: [
                    { x: cx + 60, y: cy + 90 },
                    { x: cx + 140, y: cy + 90 }
                  ]
                }
              ]
            };

            ctx.strokeStyle = treeCol;
            ctx.lineWidth = 2;

            // Recursive tree drawer
            const drawNodeLink = (parent: any, child: any) => {
              ctx.beginPath();
              ctx.moveTo(parent.x, parent.y);
              ctx.lineTo(child.x, child.y);
              ctx.stroke();
              if (child.children) {
                child.children.forEach((c: any) => drawNodeLink(child, c));
              }
            };
            tree.children.forEach((c) => drawNodeLink(tree, c));

            // Recursive node circles drawer
            const drawNodeCircle = (node: any) => {
              ctx.fillStyle = nodeCol;
              ctx.beginPath();
              ctx.arc(node.x, node.y, 11, 0, Math.PI * 2);
              ctx.fill();
              
              ctx.strokeStyle = colorToCSS(currentAccent.current, opacity * 0.55);
              ctx.lineWidth = 1.5;
              ctx.beginPath();
              ctx.arc(node.x, node.y, 16, 0, Math.PI * 2);
              ctx.stroke();

              // Draw abstract head symbol
              ctx.fillStyle = colorToCSS(currentPrimary.current, opacity * 0.7);
              ctx.beginPath();
              ctx.arc(node.x, node.y - 2, 4, 0, Math.PI * 2);
              ctx.fill();
              ctx.beginPath();
              ctx.arc(node.x, node.y + 10, 7, Math.PI, 0);
              ctx.fill();

              if (node.children) {
                node.children.forEach((c: any) => drawNodeCircle(c));
              }
            };
            drawNodeCircle(tree);
            break;
          }

          case 'customers': {
            ctx.shadowColor = colorToCSS(currentPrimary.current, 0.4);
            const netCol = colorToCSS(currentPrimary.current, opacity * 0.15);
            const userCol = colorToCSS(currentSecondary.current, opacity * 0.55);

            // CRM network cluster positions
            const customerNodes = [
              { x: cx - 110, y: cy - 70, size: 10 },
              { x: cx + 110, y: cy - 70, size: 10 },
              { x: cx - 40, y: cy + 40, size: 13 },
              { x: cx + 40, y: cy + 40, size: 13 },
              { x: cx - 130, y: cy + 60, size: 9 },
              { x: cx + 130, y: cy + 60, size: 9 },
              { x: cx, y: cy - 90, size: 12 }
            ];

            // Render net paths
            ctx.strokeStyle = netCol;
            ctx.lineWidth = 1;
            for (let i = 0; i < customerNodes.length; i++) {
              for (let j = i + 1; j < customerNodes.length; j++) {
                ctx.beginPath();
                ctx.moveTo(customerNodes[i].x, customerNodes[i].y);
                ctx.lineTo(customerNodes[j].x, customerNodes[j].y);
                ctx.stroke();
              }
            }

            // Render customer nodes
            customerNodes.forEach((node) => {
              ctx.fillStyle = userCol;
              ctx.beginPath();
              ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
              ctx.fill();

              ctx.strokeStyle = colorToCSS(currentAccent.current, opacity * 0.5);
              ctx.beginPath();
              ctx.arc(node.x, node.y, node.size + 6, 0, Math.PI * 2);
              ctx.stroke();
            });

            // Drifting heartbeat/satisfaction indicators
            ctx.fillStyle = colorToCSS(currentAccent.current, opacity * 0.6);
            heartFloaters.current.forEach((heart) => {
              if (!isReducedMotion.current) {
                heart.y -= heart.speed * 0.008;
                heart.angle += heart.waveSpeed;
                if (heart.y < -0.1) {
                  heart.y = 1.1;
                  heart.x = Math.random();
                }
              }
              const hx = cx - 170 + heart.x * 340 + Math.sin(heart.angle) * 15;
              const hy = cy - 130 + heart.y * 260;

              // Simple vector heart path
              ctx.beginPath();
              ctx.arc(hx - heart.size / 2, hy, heart.size / 2, Math.PI, 0);
              ctx.arc(hx + heart.size / 2, hy, heart.size / 2, Math.PI, 0);
              ctx.lineTo(hx, hy + heart.size * 0.95);
              ctx.closePath();
              ctx.fill();
            });
            break;
          }

          case 'requests': {
            ctx.shadowColor = colorToCSS(currentPrimary.current, 0.4);
            const cardStroke = colorToCSS(currentPrimary.current, opacity * 0.35);

            // Floating support ticket cards stack
            ticketStack.current.forEach((ticket) => {
              const driftY = (time * 0.02) % 300;
              const finalY = cy - 130 + ((ticket.yOffset + driftY) % 300);
              const isUrgent = ticket.priority === 'URGENT';

              ctx.fillStyle = colorToCSS(currentSecondary.current, opacity * 0.08);
              ctx.strokeStyle = cardStroke;
              ctx.lineWidth = 1.5;
              
              ctx.beginPath();
              ctx.roundRect(cx - 110, finalY, ticket.width, ticket.height, 6);
              ctx.fill();
              ctx.stroke();

              // Print ticket code title
              ctx.fillStyle = colorToCSS(currentSecondary.current, opacity * 0.8);
              ctx.font = 'bold 12px Space Grotesk, sans-serif';
              ctx.fillText(ticket.title, cx - 95, finalY + 28);

              // Priority alert indicator
              ctx.fillStyle = isUrgent ? 'rgba(239, 68, 68, 0.7)' : 'rgba(59, 130, 246, 0.7)';
              ctx.beginPath();
              ctx.arc(cx - 10, finalY + 24, 5, 0, Math.PI * 2);
              ctx.fill();
            });

            // AI chatbot core ring orbits
            ctx.strokeStyle = colorToCSS(currentAccent.current, opacity * 0.45);
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(cx + 120, cy - 40, 35, 0, Math.PI * 2);
            ctx.stroke();

            ctx.fillStyle = colorToCSS(currentAccent.current, opacity * 0.75);
            const orbitAng = time * 0.0015;
            ctx.beginPath();
            ctx.arc(cx + 120 + Math.cos(orbitAng) * 35, cy - 40 + Math.sin(orbitAng) * 35, 6, 0, Math.PI * 2);
            ctx.fill();
            break;
          }

          case 'invoice': {
            ctx.shadowColor = colorToCSS(currentPrimary.current, 0.4);
            const docStroke = colorToCSS(currentPrimary.current, opacity * 0.35);
            const textStroke = colorToCSS(currentSecondary.current, opacity * 0.2);

            // Drifting PDF documents
            fallingInvoices.current.forEach((doc) => {
              if (!isReducedMotion.current) {
                doc.y += doc.speed * 0.003;
                doc.rot += doc.rotSpeed;
                if (doc.y > 1.1) {
                  doc.y = -0.1;
                  doc.x = Math.random();
                }
              }
              const dx = cx - 180 + doc.x * 360;
              const dy = cy - 140 + doc.y * 280;

              ctx.save();
              ctx.translate(dx, dy);
              ctx.rotate(doc.rot);
              
              ctx.fillStyle = colorToCSS(currentAccent.current, opacity * 0.08);
              ctx.strokeStyle = docStroke;
              ctx.lineWidth = 1.5;
              
              ctx.beginPath();
              ctx.roundRect(-25 * doc.scale, -35 * doc.scale, 50 * doc.scale, 70 * doc.scale, 4);
              ctx.fill();
              ctx.stroke();

              // Sheet lines
              ctx.strokeStyle = textStroke;
              for (let i = 0; i < 4; i++) {
                ctx.beginPath();
                ctx.moveTo(-15 * doc.scale, (-20 + i * 12) * doc.scale);
                ctx.lineTo((15 - (i === 3 ? 10 : 0)) * doc.scale, (-20 + i * 12) * doc.scale);
                ctx.stroke();
              }
              ctx.restore();
            });
            break;
          }

          case 'profile': {
            ctx.shadowColor = colorToCSS(currentPrimary.current, 0.4);
            const hudCol = colorToCSS(currentPrimary.current, opacity * 0.35);
            const ringCol = colorToCSS(currentSecondary.current, opacity * 0.25);

            // Concentric HUD identity circles
            ctx.lineWidth = 2;
            
            // Rotating outer ring
            ctx.strokeStyle = hudCol;
            ctx.beginPath();
            ctx.arc(cx, cy, 110, 0, Math.PI * 2);
            ctx.stroke();

            // Outer dashed ring
            ctx.strokeStyle = ringCol;
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(-time * 0.0004);
            ctx.setLineDash([8, 12]);
            ctx.beginPath();
            ctx.arc(0, 0, 95, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();

            // Inner target brackets
            ctx.strokeStyle = colorToCSS(currentAccent.current, opacity * 0.45);
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(time * 0.0002);
            for (let i = 0; i < 4; i++) {
              ctx.beginPath();
              ctx.arc(0, 0, 75, i * Math.PI / 2 + 0.15, (i + 1) * Math.PI / 2 - 0.15);
              ctx.stroke();
            }
            ctx.restore();

            // Core Profile Emblem Shield
            ctx.strokeStyle = hudCol;
            ctx.fillStyle = colorToCSS(currentPrimary.current, opacity * 0.08);
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(cx, cy - 35);
            ctx.lineTo(cx + 25, cy - 20);
            ctx.lineTo(cx + 25, cy + 10);
            ctx.quadraticCurveTo(cx + 25, cy + 30, cx, cy + 45);
            ctx.quadraticCurveTo(cx - 25, cy + 30, cx - 25, cy + 10);
            ctx.lineTo(cx - 25, cy - 20);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            break;
          }
        }

        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [tab, isLight]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-500"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}
