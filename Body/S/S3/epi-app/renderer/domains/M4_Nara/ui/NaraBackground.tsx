import { useRef, useEffect, useMemo } from 'react';
import { useLayoutStore } from '../../../stores/layoutStore';
import { useEditorStore } from '../../../stores/editorStore';
import { useThemeStore } from '../../../stores/themeStore';
import type { ThemeMode } from '../../../stores/themeStore';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  life: number;
  reset: () => void;
  update: (speed: number) => void;
  draw: (ctx: CanvasRenderingContext2D, color: string, opacity: number) => void;
}

// Trail fade rate only (no background color drawn on canvas)
// Canvas is transparent - CSS bg-[var(--chat-canvas-bg)] on container shows through
const THEME_CONFIGS: Record<ThemeMode, {
  particleColor: string;
  baseOpacity: number;
  speed: number;
}> = {
  'nara-dark': {
    particleColor: '#7bc790',
    baseOpacity: 0.22,
    speed: 0.6
  },
  'nara-forest': {
    particleColor: '#7bc790',
    baseOpacity: 0.22,
    speed: 0.6
  },
  'nara-light': {
    particleColor: '#5ea97a',
    baseOpacity: 0.14,
    speed: 0.6
  },
  'nara-mist': {
    particleColor: '#5ea97a',
    baseOpacity: 0.14,
    speed: 0.6
  },
  'nara-glass': {
    particleColor: '#9bdab1',
    baseOpacity: 0.18,
    speed: 0.6
  },
  'nara-grove': {
    particleColor: '#9bdab1',
    baseOpacity: 0.18,
    speed: 0.6
  },
  'dark': {
    particleColor: '#8491a8',
    baseOpacity: 0.14,
    speed: 0.4
  },
  'light': {
    particleColor: '#8f9db6',
    baseOpacity: 0.12,
    speed: 0.4
  },
  'glass': {
    particleColor: '#a3b3ca',
    baseOpacity: 0.14,
    speed: 0.4
  }
};

export function NaraBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { panels } = useLayoutStore();
  const { isTyping } = useEditorStore();
  const { mode } = useThemeStore();

  const themeConfig = THEME_CONFIGS[mode] || THEME_CONFIGS['dark'];

  const backgroundOpacity = useMemo(() => {
    const baseOpacity = themeConfig.baseOpacity;
    const panelsOpen = (panels.left ? 1 : 0) + (panels.right ? 1 : 0);
    return baseOpacity * (isTyping ? 0.6 : 1) * (1 - panelsOpen * 0.15);
  }, [themeConfig.baseOpacity, panels.left, panels.right, isTyping]);

  const particleColor = themeConfig.particleColor;
  const particleSpeed = themeConfig.speed;

  useEffect(() => {
    if (/jsdom/i.test(navigator.userAgent)) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = container.clientWidth;
    let height = container.clientHeight;
    let particles: Particle[] = [];
    let animationFrameId = 0;

    class ParticleImpl implements Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      age: number;
      life: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = 0;
        this.vy = 0;
        this.age = 0;
        this.life = Math.random() * 200 + 100;
      }

      update(speed: number) {
        const angle = (Math.cos(this.x * 0.005) + Math.sin(this.y * 0.005)) * Math.PI;
        this.vx += Math.cos(angle) * 0.1 * speed;
        this.vy += Math.sin(angle) * 0.1 * speed;
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.95;
        this.vy *= 0.95;
        this.age += 1;

        if (this.age > this.life) this.reset();
        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;
      }

      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = 0;
        this.vy = 0;
        this.age = 0;
        this.life = Math.random() * 200 + 100;
      }

      draw(context: CanvasRenderingContext2D, color: string, opacity: number) {
        context.fillStyle = color;
        const alpha = 1 - Math.abs((this.age / this.life) - 0.5) * 2;
        context.globalAlpha = alpha * opacity;
        context.fillRect(this.x, this.y, 1, 1);
      }
    }

    const init = (isResize = false) => {
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      const dpr = window.devicePixelRatio || 1;

      // Update canvas dimensions
      canvas.width = newWidth * dpr;
      canvas.height = newHeight * dpr;
      canvas.style.width = `${newWidth}px`;
      canvas.style.height = `${newHeight}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      // On resize, keep existing particles but update bounds
      if (isResize && particles.length > 0) {
        width = newWidth;
        height = newHeight;
        // Wrap particles that are now out of bounds
        for (const p of particles) {
          if (p.x > width) p.x = p.x % width;
          if (p.y > height) p.y = p.y % height;
        }
      } else {
        // Initial mount - create new particles
        width = newWidth;
        height = newHeight;
        particles = Array.from({ length: 120 }, () => new ParticleImpl());
      }

      // Clear canvas completely - make it transparent so CSS themed bg shows through
      ctx.clearRect(0, 0, width, height);
    };

    let frameCount = 0;

    const animate = () => {
      frameCount++;

      // More aggressive fade - particles fade out faster
      // Using destination-out to make particles increasingly transparent
      ctx.globalCompositeOperation = 'destination-out';
      ctx.globalAlpha = 0.12; // Higher = faster fade (was 0.08)
      ctx.fillRect(0, 0, width, height);

      // Periodically do a full clear to prevent accumulation
      if (frameCount % 120 === 0) { // Every ~2 seconds at 60fps
        ctx.clearRect(0, 0, width, height);
      }

      // Draw particles with additive blending for glow effect
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'lighter';
      for (const particle of particles) {
        particle.update(particleSpeed);
        particle.draw(ctx, particleColor, backgroundOpacity);
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    init(false);
    animate();

    const resizeObserver =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => {
            init(true);
          })
        : null;
    resizeObserver?.observe(container);

    return () => {
      resizeObserver?.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, [backgroundOpacity, particleColor, particleSpeed, mode]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none bg-[var(--chat-canvas-bg)]"
      style={{ zIndex: 0, minHeight: '100%' }}
      data-testid="nara-stream-background"
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="block h-full w-full min-h-full" style={{ background: 'transparent' }} />
    </div>
  );
}
