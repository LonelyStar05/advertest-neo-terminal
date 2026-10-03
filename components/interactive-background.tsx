"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";

/**
 * 3D signal globe — a dotted planet with live attack arcs, orbit rings and an
 * atmospheric rim, rendered on a single 2D canvas with perspective projection.
 * Inspired by the Cloudflare network globe and giga.ai's volumetric glow.
 */

type Variant = "hero" | "console";

type Vec3 = [number, number, number];

type Arc = {
  from: Vec3;
  to: Vec3;
  angle: number;
  head: number;
  speed: number;
  color: string;
};

type Star = { x: number; y: number; z: number; size: number };

const COLORS = {
  orange: "243, 106, 45",
  amber: "255, 177, 92",
  blue: "107, 169, 255",
  bone: "242, 236, 223",
};

const ARC_COLORS = [COLORS.orange, COLORS.amber, COLORS.blue, COLORS.orange];

function landMask(lat: number, lon: number) {
  const value =
    Math.sin(lon * 2.1 + 0.4) * Math.cos(lat * 3.2) +
    0.55 * Math.sin(lon * 4.3 - lat * 2.7 + 1.3) +
    0.35 * Math.cos(lon * 7.1 + lat * 5.3);
  return value > 0.02 && Math.abs(lat) < 1.38;
}

function buildSphere(count: number) {
  const land: Vec3[] = [];
  const ocean: Vec3[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let index = 0; index < count; index += 1) {
    const y = 1 - (2 * (index + 0.5)) / count;
    const radius = Math.sqrt(1 - y * y);
    const theta = index * golden;
    const point: Vec3 = [Math.cos(theta) * radius, y, Math.sin(theta) * radius];
    if (landMask(Math.asin(y), Math.atan2(point[2], point[0]))) land.push(point);
    else ocean.push(point);
  }
  return { land, ocean };
}

function slerp(a: Vec3, b: Vec3, angle: number, t: number, lift: number): Vec3 {
  const sin = Math.sin(angle) || 1;
  const wa = Math.sin((1 - t) * angle) / sin;
  const wb = Math.sin(t * angle) / sin;
  const height = 1 + lift * Math.sin(Math.PI * t);
  return [(a[0] * wa + b[0] * wb) * height, (a[1] * wa + b[1] * wb) * height, (a[2] * wa + b[2] * wb) * height];
}

export function InteractiveBackground({ variant = "hero" }: { variant?: Variant }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const isConsole = variant === "console";
    let width = 0;
    let height = 0;
    let frameId = 0;
    let hidden = document.hidden;
    let sphere = buildSphere(1600);
    let stars: Star[] = [];
    const arcs: Arc[] = [];
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    const pulses: Array<{ x: number; y: number; life: number }> = [];
    let rotation = 0.6;
    let lastTime = performance.now();

    const spawnArc = () => {
      const pool = sphere.land;
      if (pool.length < 2) return;
      const from = pool[Math.floor(Math.random() * pool.length)];
      let to = pool[Math.floor(Math.random() * pool.length)];
      let angle = Math.acos(Math.min(1, Math.max(-1, from[0] * to[0] + from[1] * to[1] + from[2] * to[2])));
      for (let tries = 0; tries < 6 && (angle < 0.4 || angle > 1.5); tries += 1) {
        to = pool[Math.floor(Math.random() * pool.length)];
        angle = Math.acos(Math.min(1, Math.max(-1, from[0] * to[0] + from[1] * to[1] + from[2] * to[2])));
      }
      arcs.push({
        from,
        to,
        angle,
        head: 0,
        speed: 0.25 + Math.random() * 0.25,
        color: ARC_COLORS[Math.floor(Math.random() * ARC_COLORS.length)],
      });
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const ratio = Math.min(window.devicePixelRatio || 1, 1.75);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      sphere = buildSphere(width < 700 ? 2400 : isConsole ? 2600 : 4200);
      stars = Array.from({ length: isConsole ? 40 : width < 700 ? 70 : 140 }, () => ({
        x: (Math.random() - 0.5) * 2,
        y: (Math.random() - 0.5) * 2,
        z: 0.2 + Math.random() * 0.8,
        size: 0.4 + Math.random() * 1.2,
      }));
      arcs.length = 0;
      for (let index = 0; index < (isConsole ? 4 : 8); index += 1) {
        spawnArc();
        arcs[arcs.length - 1].head = Math.random() * 1.3;
      }
    };

    const layout = () => {
      const scroll = isConsole ? 0 : Math.min(1, window.scrollY / Math.max(1, height));
      if (isConsole) {
        const radius = Math.min(width, height) * 0.42;
        return { cx: width - radius * 0.55, cy: height - radius * 0.35, radius, alpha: 0.42 };
      }
      if (width < 900) {
        const radius = Math.min(width * 0.62, height * 0.34);
        return { cx: width * 0.5, cy: height * 0.8 - scroll * height * 0.12, radius, alpha: 1 - scroll * 0.5 };
      }
      const radius = Math.min(width * 0.25, height * 0.4);
      return {
        cx: width * 0.75 - scroll * width * 0.05,
        cy: height * 0.52 - scroll * height * 0.08,
        radius: radius * (1 + scroll * 0.12),
        alpha: 1 - scroll * 0.58,
      };
    };

    const draw = (delta: number, animate: boolean) => {
      context.clearRect(0, 0, width, height);
      const { cx, cy, radius, alpha } = layout();

      if (animate) {
        pointer.x += (pointer.tx - pointer.x) * 0.05;
        pointer.y += (pointer.ty - pointer.y) * 0.05;
        rotation += delta * (0.09 + pointer.x * 0.06);
      }
      const tilt = -0.32 + pointer.y * 0.22;
      const cosR = Math.cos(rotation);
      const sinR = Math.sin(rotation);
      const cosT = Math.cos(tilt);
      const sinT = Math.sin(tilt);
      const camera = 3.2;

      const project = (point: Vec3) => {
        const x1 = point[0] * cosR + point[2] * sinR;
        const z1 = -point[0] * sinR + point[2] * cosR;
        const y2 = point[1] * cosT - z1 * sinT;
        const z2 = point[1] * sinT + z1 * cosT;
        const scale = camera / (camera - z2);
        return { x: cx + x1 * radius * scale, y: cy - y2 * radius * scale, z: z2, scale };
      };

      // Star field with parallax depth.
      for (const star of stars) {
        const sx = width * 0.5 + star.x * width * 0.6 - pointer.x * 24 * star.z;
        const sy = height * 0.5 + star.y * height * 0.6 - pointer.y * 18 * star.z;
        context.fillStyle = `rgba(${COLORS.bone}, ${0.12 + star.z * 0.35})`;
        context.fillRect(sx, sy, star.size, star.size);
      }

      // Volumetric atmosphere behind the planet.
      const halo = context.createRadialGradient(cx, cy, radius * 0.55, cx, cy, radius * 1.75);
      halo.addColorStop(0, `rgba(${COLORS.orange}, ${0.2 * alpha})`);
      halo.addColorStop(0.45, `rgba(${COLORS.orange}, ${0.09 * alpha})`);
      halo.addColorStop(0.7, `rgba(${COLORS.blue}, ${0.035 * alpha})`);
      halo.addColorStop(1, "rgba(17, 16, 15, 0)");
      context.fillStyle = halo;
      context.fillRect(cx - radius * 2, cy - radius * 2, radius * 4, radius * 4);

      // Solid body to occlude the far side softly.
      const body = context.createRadialGradient(cx - radius * 0.35, cy - radius * 0.4, radius * 0.1, cx, cy, radius * 1.02);
      body.addColorStop(0, `rgba(48, 34, 26, ${0.92 * alpha})`);
      body.addColorStop(0.75, `rgba(24, 19, 16, ${0.94 * alpha})`);
      body.addColorStop(1, `rgba(17, 16, 15, ${0.6 * alpha})`);
      context.beginPath();
      context.arc(cx, cy, radius * 1.005, 0, Math.PI * 2);
      context.fillStyle = body;
      context.fill();

      // Back orbit half, then dots, then front orbit half.
      const orbit = (front: boolean) => {
        const steps = 120;
        const ringTilt = 1.12;
        const ringSpin = rotation * 0.35;
        for (let index = 0; index < steps; index += 2) {
          const angle = (index / steps) * Math.PI * 2 + ringSpin;
          const base: Vec3 = [Math.cos(angle) * 1.42, 0, Math.sin(angle) * 1.42];
          const ring: Vec3 = [base[0], base[2] * Math.sin(ringTilt), base[2] * Math.cos(ringTilt)];
          const point = project(ring);
          if (front !== point.z > 0) continue;
          context.fillStyle = `rgba(${COLORS.amber}, ${(front ? 0.55 : 0.14) * alpha})`;
          context.fillRect(point.x - 0.9, point.y - 0.9, 1.8, 1.8);
        }
        const satAngle = rotation * 1.6;
        const sat: Vec3 = [Math.cos(satAngle) * 1.42, Math.sin(satAngle) * 1.42 * Math.sin(ringTilt), Math.sin(satAngle) * 1.42 * Math.cos(ringTilt)];
        const satPoint = project(sat);
        if (front === satPoint.z > 0) {
          context.beginPath();
          context.arc(satPoint.x, satPoint.y, 3.2 * satPoint.scale, 0, Math.PI * 2);
          context.fillStyle = `rgba(${COLORS.bone}, ${(front ? 0.95 : 0.25) * alpha})`;
          context.shadowColor = `rgba(${COLORS.amber}, 0.9)`;
          context.shadowBlur = front ? 16 : 0;
          context.fill();
          context.shadowBlur = 0;
        }
      };
      orbit(false);

      for (const point of sphere.ocean) {
        const p = project(point);
        if (p.z < -0.15) continue;
        const depth = (p.z + 0.15) / 1.15;
        context.fillStyle = `rgba(${COLORS.bone}, ${0.13 * depth * alpha})`;
        context.fillRect(p.x, p.y, 1.1, 1.1);
      }
      for (const point of sphere.land) {
        const p = project(point);
        if (p.z < -0.2) continue;
        const depth = (p.z + 0.2) / 1.2;
        const size = 0.9 + depth * 1.3;
        context.fillStyle = depth > 0.7
          ? `rgba(${COLORS.amber}, ${(0.35 + depth * 0.6) * alpha})`
          : `rgba(${COLORS.orange}, ${(0.12 + depth * 0.65) * alpha})`;
        context.fillRect(p.x - size / 2, p.y - size / 2, size, size);
      }

      // Rim light — the crisp 3D edge.
      const rim = context.createRadialGradient(cx, cy, radius * 0.86, cx, cy, radius * 1.08);
      rim.addColorStop(0, "rgba(243, 106, 45, 0)");
      rim.addColorStop(0.62, `rgba(${COLORS.orange}, ${0.22 * alpha})`);
      rim.addColorStop(0.78, `rgba(${COLORS.amber}, ${0.12 * alpha})`);
      rim.addColorStop(1, "rgba(243, 106, 45, 0)");
      context.fillStyle = rim;
      context.beginPath();
      context.arc(cx, cy, radius * 1.1, 0, Math.PI * 2);
      context.fill();

      // Attack arcs travelling between nodes.
      context.lineCap = "round";
      for (let index = arcs.length - 1; index >= 0; index -= 1) {
        const arc = arcs[index];
        if (animate) arc.head += delta * arc.speed;
        if (arc.head > 1.5) {
          arcs.splice(index, 1);
          spawnArc();
          continue;
        }
        const lift = 0.06 + (arc.angle / Math.PI) * 0.22;
        const tail = Math.max(0, arc.head - 0.5);
        const head = Math.min(1, arc.head);
        const segments = 28;
        let previous: ReturnType<typeof project> | null = null;
        for (let step = 0; step <= segments; step += 1) {
          const t = tail + ((head - tail) * step) / segments;
          const p = project(slerp(arc.from, arc.to, arc.angle, t, lift));
          if (previous && (p.z > -0.25 || previous.z > -0.25)) {
            const fade = step / segments;
            const depth = Math.min(1, Math.max(0.15, (p.z + 0.6) / 1.4));
            context.strokeStyle = `rgba(${arc.color}, ${fade * 0.9 * depth * alpha})`;
            context.lineWidth = 0.6 + fade * 1.6 * p.scale;
            context.beginPath();
            context.moveTo(previous.x, previous.y);
            context.lineTo(p.x, p.y);
            context.stroke();
          }
          previous = p;
        }
        if (arc.head < 1 && previous && previous.z > -0.2) {
          context.beginPath();
          context.arc(previous.x, previous.y, 2.4 * previous.scale, 0, Math.PI * 2);
          context.fillStyle = `rgba(${COLORS.bone}, ${alpha})`;
          context.shadowColor = `rgba(${arc.color}, 1)`;
          context.shadowBlur = 14;
          context.fill();
          context.shadowBlur = 0;
        }
        for (const [node, visible] of [[arc.from, true], [arc.to, arc.head >= 1]] as const) {
          if (!visible) continue;
          const p = project(node);
          if (p.z < 0) continue;
          const wave = (arc.head * 2) % 1;
          context.beginPath();
          context.arc(p.x, p.y, 2 + wave * 9, 0, Math.PI * 2);
          context.strokeStyle = `rgba(${arc.color}, ${(1 - wave) * 0.7 * alpha})`;
          context.lineWidth = 1;
          context.stroke();
        }
      }

      orbit(true);

      for (let index = pulses.length - 1; index >= 0; index -= 1) {
        const pulse = pulses[index];
        context.beginPath();
        context.arc(pulse.x, pulse.y, 12 + (1 - pulse.life) * 140, 0, Math.PI * 2);
        context.strokeStyle = `rgba(${COLORS.orange}, ${pulse.life * 0.5})`;
        context.lineWidth = 1.5;
        context.stroke();
        if (animate) pulse.life -= delta * 1.4;
        if (pulse.life <= 0) pulses.splice(index, 1);
      }
    };

    const running = () => !paused && !reducedMotion.matches && !hidden;

    const tick = (time: number) => {
      const delta = Math.min(0.05, (time - lastTime) / 1000);
      lastTime = time;
      draw(delta, true);
      if (running()) frameId = window.requestAnimationFrame(tick);
    };

    const restart = () => {
      window.cancelAnimationFrame(frameId);
      lastTime = performance.now();
      draw(0, false);
      if (running()) frameId = window.requestAnimationFrame(tick);
    };

    const handlePointerMove = (event: PointerEvent) => {
      pointer.tx = event.clientX / Math.max(1, width) - 0.5;
      pointer.ty = event.clientY / Math.max(1, height) - 0.5;
    };
    const handlePointerDown = (event: PointerEvent) => {
      if (isConsole || reducedMotion.matches) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("a,button,input,select,textarea,label")) return;
      pulses.push({ x: event.clientX, y: event.clientY, life: 1 });
    };
    const handleScroll = () => {
      if (!running()) draw(0, false);
    };
    const handleVisibility = () => {
      hidden = document.hidden;
      restart();
    };
    const handleResize = () => {
      resize();
      restart();
    };

    resize();
    restart();
    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerdown", handlePointerDown, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("visibilitychange", handleVisibility);
    reducedMotion.addEventListener("change", restart);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("visibilitychange", handleVisibility);
      reducedMotion.removeEventListener("change", restart);
    };
  }, [paused, variant]);

  return (
    <>
      <div className={`globe-bg globe-bg--${variant}`} aria-hidden="true">
        <span className="globe-bg__aurora globe-bg__aurora--one" />
        <span className="globe-bg__aurora globe-bg__aurora--two" />
        <span className="globe-bg__floor" />
        <canvas ref={canvasRef} />
        <span className="globe-bg__vignette" />
      </div>
      {variant === "hero" ? (
        <button
          type="button"
          className="motion-toggle"
          onClick={() => setPaused((value) => !value)}
          aria-pressed={paused}
          aria-label={paused ? "Bật chuyển động nền" : "Tạm dừng chuyển động nền"}
          title={paused ? "Bật chuyển động nền" : "Tạm dừng chuyển động nền"}
        >
          {paused ? <Play size={15} aria-hidden="true" /> : <Pause size={15} aria-hidden="true" />}
        </button>
      ) : null}
    </>
  );
}
