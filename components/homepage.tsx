"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { PointerEvent as ReactPointerEvent, ReactNode } from "react";
import {
  ArrowRight,
  BarChart3,
  ClipboardCheck,
  Grid3X3,
  History,
  LayoutDashboard,
  Microscope,
  Settings2,
  TriangleAlert,
  ArrowUpRight,
  Check,
  ChevronDown,
  Cpu,
  FileCheck2,
  Fingerprint,
  Menu,
  Radar,
  ShieldCheck,
  ScanSearch,
  X,
} from "lucide-react";
import { InteractiveBackground } from "@/components/interactive-background";

const navItems = [
  ["Nền tảng", "#platform"],
  ["Failure", "#failures"],
  ["Governance", "#governance"],
] as const;

const workflow = [
  { number: "01", icon: Fingerprint, title: "Khóa bằng chứng", body: "Đóng dấu model, dataset, seed và clean baseline trước khi cấp GPU.", meta: "CONFIG HASH" },
  { number: "02", icon: Radar, title: "Tấn công perception", body: "Quét corruption, gradient attack và patch theo severity với planner tiết kiệm budget.", meta: "ATTACK SPEC" },
  { number: "03", icon: ScanSearch, title: "Giải thích điểm gãy", body: "So sánh clean/attacked, retention curve và Top-K failure ở cấp sample.", meta: "FAILURE CASE" },
  { number: "04", icon: FileCheck2, title: "Ký quyết định", body: "Reviewer triage, mitigation và sign-off tạo report VALIDATED có audit trail.", meta: "ASSURANCE GATE" },
];

const failureModes = [
  { id: "snow", label: "Snow · S4", object: "Pedestrian biến mất", confidence: 18, map: 40.2, risk: "Critical", severity: 4 },
  { id: "pgd", label: "PGD · 8/255", object: "Car → Cyclist", confidence: 31, map: 44.8, risk: "High", severity: 3 },
  { id: "fog", label: "Fog · S5", object: "Cụm false negative", confidence: 24, map: 37.6, risk: "Critical", severity: 5 },
] as const;

const roles = [
  { role: "Test Engineer", prepare: true, run: true, triage: false, sign: false },
  { role: "Safety Reviewer", prepare: false, run: false, triage: true, sign: true },
  { role: "Admin", prepare: true, run: true, triage: true, sign: true },
];

/** Pointer-driven 3D tilt: writes --rx / --ry / --mx / --my on the hovered element. */
function useTilt(strength = 6) {
  const onPointerMove = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch") return;
    const element = event.currentTarget;
    const rect = element.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    element.style.setProperty("--rx", `${(0.5 - y) * strength}deg`);
    element.style.setProperty("--ry", `${(x - 0.5) * strength}deg`);
    element.style.setProperty("--mx", `${x * 100}%`);
    element.style.setProperty("--my", `${y * 100}%`);
  }, [strength]);
  const onPointerLeave = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    event.currentTarget.style.setProperty("--rx", "0deg");
    event.currentTarget.style.setProperty("--ry", "0deg");
  }, []);
  return { onPointerMove, onPointerLeave };
}

function Logo() {
  return (
    <a href="#top" className="flex items-center gap-2.5" aria-label="AdverTest — về đầu trang">
      <span className="logo-cube" aria-hidden="true"><ShieldCheck size={17} strokeWidth={2.4} /></span>
      <span className="text-[15px] font-extrabold tracking-[-0.03em] text-[#f2ecdf]">AdverTest</span>
    </a>
  );
}

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="eyebrow-chip">
      <span className="eyebrow-chip__dot" aria-hidden="true" />
      {children}
    </span>
  );
}

function SectionHead({ eyebrow, title, body, center = false }: { eyebrow: string; title: string; body: string; center?: boolean }) {
  return (
    <div className={center ? "mx-auto max-w-[760px] text-center" : "max-w-[720px]"}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="section-heading mt-5">{title}</h2>
      <p className="mt-5 text-[16px] leading-7 text-[#aaa298] md:text-[17px]">{body}</p>
    </div>
  );
}

function PerceptionScene({ severity }: { severity: number }) {
  const confidence = Math.max(12, 96 - severity * 15);
  const missed = severity >= 3;
  return (
    <div className="perception-scene relative min-h-[300px] overflow-hidden rounded-[18px] bg-[#c8d0ce]">
      <div className="absolute inset-x-0 top-0 h-[52%] bg-[linear-gradient(180deg,#697b7f,#bac3c0)]" />
      <div className="scene-mountain absolute bottom-[39%] left-[-8%] h-[46%] w-[62%] bg-[#596461]" />
      <div className="scene-mountain absolute bottom-[39%] right-[-10%] h-[38%] w-[58%] bg-[#707a76]" />
      <div className="scene-road absolute inset-x-0 bottom-0 h-[56%] bg-[#242523]" />
      <span className="scene-lane absolute bottom-0 left-[44%] h-[53%] w-[3px] origin-bottom rotate-[7deg]" />
      <span className="scene-lane absolute bottom-0 right-[44%] h-[53%] w-[3px] origin-bottom rotate-[-7deg]" />
      <span className="scene-car absolute bottom-[18%] left-[24%] h-8 w-16 bg-[#181918]" />
      <span className="scene-car absolute bottom-[31%] right-[19%] h-6 w-12 bg-[#2f3331]" />
      <span className="scene-person absolute bottom-[35%] left-[61%] h-11 w-3 rounded-full bg-[#181918]" />
      <div className={`hbox absolute bottom-[31%] left-[58%] h-[74px] w-[42px] border-2 ${missed ? "border-[#ff6f72] text-[#ff6f72]" : "border-[#6ba9ff] text-[#6ba9ff]"}`}><span>{missed ? "MISS" : "person"}</span></div>
      <div className="hbox absolute bottom-[14%] left-[21%] h-[55px] w-[82px] border-2 border-[#76d49b] text-[#76d49b]"><span>car 0.94</span></div>
      <div className="absolute left-3 top-3 rounded-full bg-[#11100f]/80 px-3 py-1.5 text-[10px] font-extrabold tracking-[0.12em] text-white/75 backdrop-blur-lg">SNOW · S{severity}</div>
      <div className="absolute bottom-3 right-3 rounded-xl bg-[#11100f]/85 px-3.5 py-2.5 text-right backdrop-blur-xl">
        <div className="text-[9px] font-bold tracking-[0.12em] text-white/45">PEDESTRIAN</div>
        <div className={`text-2xl font-extrabold tracking-[-0.05em] ${missed ? "text-[#ff6f72]" : "text-[#f2ecdf]"}`}>{confidence}%</div>
      </div>
      <div className="weather-layer absolute inset-0" style={{ opacity: severity * 0.13 }} aria-hidden="true" />
    </div>
  );
}

function FailureLab() {
  const [severity, setSeverity] = useState(4);
  const metrics = useMemo(() => ({
    map: Math.max(22, 74 - severity * 8.4).toFixed(1),
    retention: Math.max(31, 100 - severity * 12),
    cost: (4.2 + severity * 3.55).toFixed(2),
  }), [severity]);

  return (
    <div className="grid gap-4 md:grid-cols-[1.35fr_1fr]">
      <PerceptionScene severity={severity} />
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-3 gap-2 md:grid-cols-1">
          {[["mAP50", metrics.map, "#f2ecdf"], ["Retention", `${metrics.retention}%`, "#6ba9ff"], ["GPU cost", `$${metrics.cost}`, "#f36a2d"]].map(([label, value, color]) => (
            <div key={label} className="stat-tile">
              <span>{label}</span>
              <strong style={{ color }}>{value}</strong>
            </div>
          ))}
        </div>
        <label className="severity-control mt-auto">
          <span className="flex items-center justify-between">
            <span className="text-[12px] font-bold text-white/65">Mức độ tấn công</span>
            <b className="severity-badge">S{severity}</b>
          </span>
          <input type="range" min={1} max={5} step={1} value={severity} onChange={(event) => setSeverity(Number(event.target.value))} aria-label="Mức độ tấn công" style={{ "--fill": `${((severity - 1) / 4) * 100}%` } as React.CSSProperties} />
          <span className="flex justify-between text-[10px] font-bold tracking-[0.1em] text-white/35"><span>NHẸ</span><span>ĐIỂM GÃY</span></span>
        </label>
      </div>
    </div>
  );
}

const metricGroups = [
  { label: "Độ chính xác", verdict: "Tốt", rows: [["Clean mAP", "72.8", "#6ba9ff"], ["mPC", "49.6", "#76d49b"]] },
  { label: "Độ bền", verdict: "Trung bình", rows: [["rPC", "68.1%", "#ffb15c"], ["Breaking point", "S4", "#f36a2d"]] },
  { label: "Rủi ro", verdict: "Cao", rows: [["Case critical", "12", "#ff6f72"], ["Budget", "+8%", "#ffb15c"]] },
] as const;

function MetricsBoard() {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {metricGroups.map((group) => (
        <div key={group.label} className="metric-board">
          <span className="metric-board__label">{group.label}</span>
          <strong className="metric-board__verdict">{group.verdict}</strong>
          <div className="mt-8">
            {group.rows.map(([name, value, color]) => (
              <div key={name} className="metric-board__row">
                <i style={{ background: color }} aria-hidden="true" />
                <span>{name}</span>
                <b>{value}</b>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

const auditEvents = [
  ["20:41", "Linh Nguyễn ký RPT-2026-091", "VALIDATED", "#76d49b"],
  ["20:36", "Triage hoàn tất 38/38 case", "REVIEW", "#6ba9ff"],
  ["20:32", "Report được sinh từ run ADV-091", "DRAFT", "#ffb15c"],
  ["20:28", "Config khóa SHA-256 8f2a91", "LOCKED", "#f36a2d"],
] as const;

function AuditTrail() {
  return (
    <ol className="audit-list">
      {auditEvents.map(([time, text, tag, color]) => (
        <li key={time}>
          <time>{time}</time>
          <i style={{ background: color, boxShadow: `0 0 12px ${color}` }} aria-hidden="true" />
          <span>{text}</span>
          <em style={{ color }}>{tag}</em>
        </li>
      ))}
    </ol>
  );
}

const showcaseTabs = [
  { id: "metrics", icon: BarChart3, label: "Robustness rõ ràng", nav: "Tổng quan", title: "Robustness", body: <MetricsBoard /> },
  { id: "lab", icon: ScanSearch, label: "Failure lab trực quan", nav: "Failure cases", title: "Failure lab", body: <FailureLab /> },
  { id: "audit", icon: History, label: "Audit trail bất biến", nav: "Báo cáo", title: "Audit trail", body: <AuditTrail /> },
] as const;

const previewNav = [
  [LayoutDashboard, "Tổng quan"], [Microscope, "Thí nghiệm"], [Grid3X3, "Ma trận"],
  [TriangleAlert, "Failure cases"], [ClipboardCheck, "Triage"], [FileCheck2, "Báo cáo"], [Settings2, "Cài đặt"],
] as const;

const TAB_DURATION = 7000;

function ControlShowcase() {
  const [active, setActive] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [hovering, setHovering] = useState(false);
  const tilt = useTilt(3);
  const tab = showcaseTabs[active];

  useEffect(() => {
    if (hovering || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setTimeout(() => setActive((value) => (value + 1) % showcaseTabs.length), TAB_DURATION);
    return () => window.clearTimeout(timer);
  }, [active, cycle, hovering]);

  const select = (index: number) => { setActive(index); setCycle((value) => value + 1); };

  return (
    <div>
      <div className="mx-auto max-w-[760px] text-center">
        <div className="orb-tile" aria-hidden="true"><span className="orb-tile__sphere" /><span className="orb-tile__ring" /></div>
        <h2 className="section-heading mt-10">Mọi thứ trong tầm kiểm soát</h2>
        <p className="mx-auto mt-5 max-w-[600px] text-[16px] leading-7 text-[#aaa298] md:text-[18px]">Theo dõi độ bền model, soi từng failure case và khóa audit trail — trong cùng một workspace, không ma sát.</p>
      </div>

      <div className="showcase-tabs" role="tablist" aria-label="Tính năng">
        {showcaseTabs.map((item, index) => {
          const Icon = item.icon;
          const selected = active === index;
          return (
            <button key={`${item.id}-${selected ? cycle : "idle"}`} type="button" role="tab" aria-selected={selected} aria-controls="showcase-panel" onClick={() => select(index)} className="showcase-tab">
              <span className="showcase-tab__icon"><Icon size={18} /></span>
              <span>{item.label}</span>
              {selected ? <span className={`showcase-tab__progress ${hovering ? "is-paused" : ""}`} style={{ animationDuration: `${TAB_DURATION}ms` }} aria-hidden="true" /> : null}
            </button>
          );
        })}
      </div>

      <div className="tilt-stage mt-6" onPointerEnter={() => setHovering(true)} onPointerLeave={() => setHovering(false)}>
        <div onPointerMove={tilt.onPointerMove} onPointerLeave={tilt.onPointerLeave} className="tilt-card preview-window">
          <aside className="preview-window__side">
            <div className="preview-window__brand"><span className="logo-cube !h-6 !w-6 !rounded-[7px]"><ShieldCheck size={13} strokeWidth={2.6} /></span>AdverTest <em>Pro</em></div>
            <nav aria-label="Xem trước điều hướng console">
              {previewNav.map(([Icon, label]) => (
                <span key={label} className={label === tab.nav ? "is-active" : ""}><Icon size={15} />{label}</span>
              ))}
            </nav>
          </aside>
          <div className="preview-window__main" id="showcase-panel" role="tabpanel" aria-live="polite">
            <div className="preview-window__top">
              <span>Docs</span><span>Hỗ trợ</span>
              <a href="/console" className="preview-window__open">Mở console <ArrowUpRight size={13} /></a>
            </div>
            <h3 className="mb-6 text-[22px] font-[700] tracking-[-0.03em] text-[#f2ecdf]">{tab.title}</h3>
            <div key={tab.id} className="preview-window__body">{tab.body}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FailureExplorer() {
  const [active, setActive] = useState(0);
  const item = failureModes[active];
  return (
    <div className="glass-panel p-3 md:p-4">
      <div className="segmented" role="tablist" aria-label="Failure case">
        {failureModes.map((failure, index) => (
          <button key={failure.id} type="button" role="tab" aria-selected={active === index} onClick={() => setActive(index)}>
            <span>{failure.label}</span>
            <em className={failure.risk === "Critical" ? "text-[#ff8d8f]" : "text-[#ffb15c]"}>{failure.risk}</em>
          </button>
        ))}
      </div>
      <div role="tabpanel" aria-live="polite" className="mt-3 grid gap-3 md:grid-cols-[1.25fr_1fr]">
        <PerceptionScene severity={item.severity} />
        <div className="flex flex-col rounded-[18px] bg-[#151311]/80 p-5 md:p-6">
          <span className="text-[11px] font-extrabold tracking-[0.14em] text-[#6ba9ff]">FC-03{8 - active}</span>
          <h3 className="mt-3 text-[28px] font-[680] leading-[1.05] tracking-[-0.045em] text-[#f2ecdf]">{item.object}</h3>
          <p className="mt-3 text-[14px] leading-6 text-[#aaa298]">Clean prediction ổn định, nhưng mất object an toàn khi perturbation vượt ngưỡng.</p>
          <div className="mt-6 grid grid-cols-2 gap-2">
            <div className="stat-tile"><span>Confidence</span><strong className="text-[#ff6f72]">{item.confidence}%</strong></div>
            <div className="stat-tile"><span>mAP50</span><strong>{item.map}</strong></div>
          </div>
          <a href="/console" className="text-link mt-6 md:mt-auto md:pt-6">Mở triage <ArrowRight size={15} /></a>
        </div>
      </div>
    </div>
  );
}

function WorkflowCard({ item }: { item: (typeof workflow)[number] }) {
  const tilt = useTilt(9);
  const Icon = item.icon;
  return (
    <div className="tilt-stage">
      <div onPointerMove={tilt.onPointerMove} onPointerLeave={tilt.onPointerLeave} className="tilt-card workflow-card">
        <div className="flex items-center justify-between">
          <span className="workflow-card__icon"><Icon size={20} /></span>
          <span className="text-[12px] font-extrabold tracking-[0.14em] text-white/25">{item.number}</span>
        </div>
        <h3 className="mt-10 text-[22px] font-[700] leading-[1.1] tracking-[-0.035em] text-[#f2ecdf]">{item.title}</h3>
        <p className="mt-3 text-[14px] leading-6 text-[#aaa298]">{item.body}</p>
        <span className="mt-auto pt-8 text-[10px] font-extrabold tracking-[0.16em] text-[#f36a2d]/80">{item.meta}</span>
      </div>
    </div>
  );
}

function Mark({ enabled }: { enabled: boolean }) {
  return enabled ? <Check size={17} className="mx-auto text-[#76d49b]" aria-label="Có" /> : <span className="text-white/20" aria-label="Không">—</span>;
}

export function Homepage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <div id="top" className="homepage-v3">
      <InteractiveBackground />
      <a href="#main-content" className="skip-link">Bỏ qua điều hướng</a>

      <header className={`site-nav ${scrolled ? "is-scrolled" : ""}`}>
        <div className="site-nav__inner">
          <Logo />
          <nav aria-label="Điều hướng chính" className="site-nav__links">
            {navItems.map(([label, href]) => <a key={href} href={href}>{label}</a>)}
          </nav>
          <a href="/console" className="btn btn--primary btn--sm site-nav__cta">Mở console <ArrowRight size={15} /></a>
          <button type="button" className="site-nav__menu" onClick={() => setMenuOpen(true)} aria-label="Mở menu" aria-expanded={menuOpen}><Menu size={20} /></button>
        </div>
      </header>

      {menuOpen ? (
        <div className="mobile-sheet" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="flex items-center justify-between">
            <Logo />
            <button type="button" className="site-nav__menu !flex" onClick={() => setMenuOpen(false)} aria-label="Đóng menu"><X size={20} /></button>
          </div>
          <nav className="mt-10 grid gap-1" aria-label="Điều hướng di động">
            {navItems.map(([label, href]) => <a key={href} href={href} onClick={() => setMenuOpen(false)} className="mobile-sheet__link">{label}<ArrowRight size={18} /></a>)}
          </nav>
          <a href="/console" className="btn btn--primary mt-auto w-full">Mở console <ArrowRight size={16} /></a>
        </div>
      ) : null}

      <main id="main-content">
        {/* Hero */}
        <section className="hero">
          <div className="hero__copy">
            <Eyebrow>Perception assurance control plane</Eyebrow>
            <h1 className="hero__title">Biết model sẽ <span className="text-gradient">gãy ở đâu</span> — trước khi ra đường.</h1>
            <p className="hero__lead">AdverTest gom adversarial testing, corruption benchmark, GPU budget và reviewer sign-off vào một luồng có thể tái lập.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a href="/console" className="btn btn--primary btn--lg">Khởi chạy workspace <ArrowRight size={17} /></a>
              <a href="#demo" className="btn btn--ghost btn--lg">Xem demo trực tiếp</a>
            </div>
            <dl className="hero__stats">
              {[["20+", "attack & corruption"], ["31%", "tiết kiệm nhờ cache"], ["38/38", "case đã review"]].map(([value, label]) => (
                <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
              ))}
            </dl>
          </div>

          <div className="hero__floaters" aria-hidden="true">
            <div className="floater floater--one"><span className="floater__dot bg-[#ff6f72]" /><div><b>Snow · S4</b><small>Pedestrian miss · 18%</small></div></div>
            <div className="floater floater--two"><span className="floater__dot bg-[#f36a2d]" /><div><b>PGD · 8/255</b><small>−19.4 mAP</small></div></div>
            <div className="floater floater--three"><span className="floater__dot bg-[#76d49b]" /><div><b>RPT-2026-091</b><small>VALIDATED</small></div></div>
          </div>

          <a href="#demo" className="scroll-cue" aria-label="Cuộn xuống demo"><ChevronDown size={18} /></a>
        </section>

        {/* Capability strip */}
        <div className="capability-strip" aria-label="Năng lực chính">
          <div className="capability-strip__track">
            {[0, 1].map((copy) => (
              <div key={copy} className="capability-strip__group" aria-hidden={copy === 1}>
                {["Deterministic runs", "Object detection", "Budget-aware sweeps", "Human-in-the-loop", "Audit-ready export", "15 corruptions × 5 severity"].map((item) => (
                  <span key={item}><i />{item}</span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Demo */}
        <section id="demo" className="section">
          <ControlShowcase />
        </section>

        {/* Platform */}
        <section id="platform" className="section">
          <SectionHead eyebrow="Một chuỗi bằng chứng" title="Từ perturbation đến quyết định release." body="Không ghép nhiều tool rời rạc. Attack, metric, failure case và chữ ký reviewer nằm trong cùng một luồng." />
          <div className="mt-14 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {workflow.map((item) => <WorkflowCard key={item.number} item={item} />)}
          </div>
        </section>

        {/* Failures */}
        <section id="failures" className="section">
          <SectionHead eyebrow="Failure intelligence" title="Một con số không đủ để sửa model." body="Triage bắt đầu từ sample cụ thể: object nào biến mất, ở severity nào, reviewer kết luận gì." />
          <div className="mt-14"><FailureExplorer /></div>
        </section>

        {/* Governance */}
        <section id="governance" className="section">
          <div className="grid gap-12 lg:grid-cols-[.85fr_1.15fr] lg:items-center">
            <div>
              <SectionHead eyebrow="Governance by design" title="Người chạy test không tự ký kết quả." body="Phân quyền được phản ánh trực tiếp trong UI, API và audit trail — không phải một dòng policy nằm ngoài sản phẩm." />
              <ul className="mt-8 grid gap-3 text-[14px] text-[#d9d2c5]">
                {[[ShieldCheck, "Giao diện theo vai trò"], [FileCheck2, "Sign-off bất biến"], [Cpu, "Hard cap chi phí GPU"]].map(([Icon, label]) => {
                  const IconComponent = Icon as typeof ShieldCheck;
                  return <li key={label as string} className="flex items-center gap-3"><span className="feature-icon"><IconComponent size={16} /></span>{label as string}</li>;
                })}
              </ul>
            </div>
            <div className="glass-panel p-3 sm:p-5">
              <div className="role-row role-row--head"><span className="text-left">Vai trò</span><span>Chuẩn bị</span><span>Chạy</span><span>Triage</span><span>Ký</span></div>
              {roles.map((row) => (
                <div key={row.role} className="role-row">
                  <span className="text-left text-[13px] font-extrabold text-[#f2ecdf]">{row.role}</span>
                  <Mark enabled={row.prepare} /><Mark enabled={row.run} /><Mark enabled={row.triage} /><Mark enabled={row.sign} />
                </div>
              ))}
              <div className="mt-3 flex items-center gap-3 rounded-[16px] bg-[#11100f]/80 p-4">
                <span className="feature-icon !text-[#76d49b]"><ShieldCheck size={16} /></span>
                <div className="min-w-0">
                  <div className="text-[13px] font-extrabold text-[#f2ecdf]">Report RPT-2026-091</div>
                  <div className="mt-0.5 truncate text-[12px] text-white/45">VALIDATED · audit event #418</div>
                </div>
                <span className="ml-auto rounded-full bg-[#76d49b] px-3 py-1 text-[11px] font-extrabold text-[#11100f]">SIGNED</span>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="section !pt-0">
          <div className="cta-card">
            <div className="relative z-10 max-w-[640px]">
              <h2 className="section-heading">Sẵn sàng tìm điểm gãy đầu tiên?</h2>
              <p className="mt-5 text-[16px] leading-7 text-[#d9d2c5]">Mở console với dữ liệu mẫu KITTI — không cần GPU, không cần cài đặt.</p>
              <a href="/console" className="btn btn--light btn--lg mt-8">Trải nghiệm console <ArrowRight size={17} /></a>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-5 px-5 py-10 md:flex-row md:items-center md:justify-between md:px-8">
          <Logo />
          <p className="text-[13px] text-white/40">Adversarial & corruption testing cho hệ thống perception an toàn.</p>
          <nav className="flex gap-5 text-[13px] text-white/55" aria-label="Liên kết chân trang">
            {navItems.map(([label, href]) => <a key={href} href={href} className="hover:text-white">{label}</a>)}
          </nav>
        </div>
      </footer>
    </div>
  );
}
