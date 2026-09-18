import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  Clipboard,
  Copy,
  Eye,
  EyeOff,
  Gauge,
  Github,
  KeyRound,
  LockKeyhole,
  Menu,
  Moon,
  RefreshCw,
  Shield,
  ShieldCheck,
  Sparkles,
  Sun,
  TriangleAlert,
  X,
  Zap,
} from "lucide-react";
import { analyzePassword } from "@/lib/password/analyze";
import { generatePassword, generatePassphrase } from "@/lib/password/generators";
import type { GeneratorOptions, PassphraseOptions, PasswordAnalysis } from "@/lib/password/types";

const strengthColors: Record<PasswordAnalysis["strength"], string> = {
  weak: "#fb7185",
  fair: "#fbbf24",
  good: "#60a5fa",
  strong: "#2dd4bf",
  "very-strong": "#a78bfa",
};

const anatomyColors = {
  lowercase: "#38bdf8",
  uppercase: "#818cf8",
  numbers: "#fbbf24",
  symbols: "#34d399",
  spaces: "#f472b6",
  other: "#c084fc",
};

function formatScore(score: number) {
  return score.toString().padStart(2, "0");
}

async function copyText(value: string): Promise<boolean> {
  if (!value || !navigator.clipboard?.writeText) return false;
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}

function StatusPill({ tone, children }: { tone: "good" | "warn" | "danger" | "neutral"; children: React.ReactNode }) {
  return <span className={`status-pill status-${tone}`}>{children}</span>;
}

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <div className="section-heading">
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  );
}

export default function Home() {
  const [password, setPassword] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [generatorTab, setGeneratorTab] = useState<"password" | "passphrase">("password");
  const [generatorOptions, setGeneratorOptions] = useState<GeneratorOptions>({
    length: 20,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    excludeAmbiguous: true,
  });
  const [phraseOptions, setPhraseOptions] = useState<PassphraseOptions>({
    words: 4,
    separator: "-",
    capitalize: false,
    includeNumber: true,
    includeSymbol: false,
  });
  const [generated, setGenerated] = useState("");
  const [generatedCopy, setGeneratedCopy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const analysis = useMemo(() => analyzePassword(password), [password]);
  const generatedAnalysis = useMemo(() => analyzePassword(generated), [generated]);

  useEffect(() => {
    document.title = "Password Strength Checker — Local Security Lab";
  }, []);

  useEffect(() => {
    if (!privacyOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPrivacyOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [privacyOpen]);

  const handleCopy = async () => {
    const success = await copyText(password);
    setCopyState(success ? "copied" : "failed");
    window.setTimeout(() => setCopyState("idle"), 1800);
  };

  const handleGenerate = () => {
    try {
      setGenerated(generatorTab === "password" ? generatePassword(generatorOptions) : generatePassphrase(phraseOptions));
      setGeneratedCopy(false);
    } catch {
      setGenerated("");
    }
  };

  const handleGeneratedCopy = async () => {
    const success = await copyText(generated);
    if (success) {
      setGeneratedCopy(true);
      window.setTimeout(() => setGeneratedCopy(false), 1800);
    }
  };

  return (
    <div className={`app-shell theme-${theme}`}>
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <header className="topbar">
        <a className="brand" href="#checker" aria-label="Password Strength Checker home">
          <span className="brand-mark"><Shield size={18} strokeWidth={2.5} /></span>
          <span><strong>pass<span>lab</span></strong><small>LOCAL SECURITY LAB</small></span>
        </a>
        <nav className={`main-nav ${mobileOpen ? "nav-open" : ""}`} aria-label="Primary navigation">
          <a className="active" href="#checker" onClick={() => setMobileOpen(false)}>Checker</a>
          <a href="#generator" onClick={() => setMobileOpen(false)}>Generator</a>
          <a href="#learn" onClick={() => setMobileOpen(false)}>Learn</a>
        </nav>
        <div className="top-actions">
          <button className="privacy-badge" type="button" onClick={() => setPrivacyOpen(true)}>
            <LockKeyhole size={14} /> <span>100% local</span>
          </button>
          <button className="icon-button theme-button" type="button" aria-label="Toggle theme" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          <a className="icon-button github-button" href="https://github.com" target="_blank" rel="noreferrer" aria-label="Open GitHub">
            <Github size={17} />
          </a>
          <button className="mobile-menu icon-button" type="button" aria-label="Toggle navigation" onClick={() => setMobileOpen((value) => !value)}>
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      <main>
        <section className="hero section-wrap" id="checker">
          <div className="hero-copy">
            <div className="kicker"><span className="pulse-dot" /> PASSWORD SECURITY LAB <span className="kicker-line" /></div>
            <h1>How strong is<br /><em>your password?</em></h1>
            <p className="hero-subtitle">Understand your password’s real-world resistance to guessing — instantly, privately, and entirely in your browser.</p>
            <div className="trust-row" aria-label="Privacy promises">
              <span><CheckCircle2 size={15} /> Zero uploads</span>
              <span><CheckCircle2 size={15} /> No password storage</span>
              <span><CheckCircle2 size={15} /> Live analysis</span>
            </div>
          </div>

          <div className="checker-card glass-card">
            <div className="card-topline"><span>ANALYSIS CONSOLE</span><span className="live-indicator"><span /> LIVE</span></div>
            <label className="input-label" htmlFor="password-input">Enter a password to inspect</label>
            <div className={`password-input-shell ${password ? "has-value" : ""}`}>
              <KeyRound size={20} className="input-leading" aria-hidden="true" />
              <input
                ref={inputRef}
                id="password-input"
                type={revealed ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                onKeyUp={(event) => setCapsLock(event.getModifierState("CapsLock"))}
                onKeyDown={(event) => setCapsLock(event.getModifierState("CapsLock"))}
                placeholder="Type or paste a password…"
                autoComplete="off"
                spellCheck={false}
              />
              <div className="input-actions">
                {capsLock && <span className="caps-alert" title="Caps Lock is on"><TriangleAlert size={14} /> CAPS</span>}
                {password && <button type="button" className="field-action" onClick={() => { setPassword(""); inputRef.current?.focus(); }} aria-label="Clear password"><X size={17} /></button>}
                <button type="button" className="field-action" onClick={() => setRevealed((value) => !value)} aria-label={revealed ? "Hide password" : "Show password"}>{revealed ? <EyeOff size={18} /> : <Eye size={18} />}</button>
              </div>
            </div>
            <div className="input-meta"><span><span className="privacy-mini"><LockKeyhole size={12} /> local only</span></span><span>{analysis.length} character{analysis.length === 1 ? "" : "s"}</span></div>

            <div className="meter-head">
              <div><span className="meter-label">STRENGTH</span><strong style={{ color: password ? strengthColors[analysis.strength] : undefined }}>{password ? analysis.label : "Awaiting input"}</strong></div>
              <div className="score-display"><span>{formatScore(analysis.score)}</span><small>/100</small></div>
            </div>
            <div className="meter-track" aria-label={`Password score ${analysis.score} out of 100`} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={analysis.score}>
              <div className="meter-fill" style={{ width: `${analysis.score}%`, background: password ? strengthColors[analysis.strength] : undefined }} />
              <div className="meter-ticks" aria-hidden="true">{[0, 20, 40, 60, 80].map((tick) => <span key={tick} className={analysis.score >= tick + 20 ? "filled" : ""} />)}</div>
            </div>
            <div className="meter-scale"><span>WEAK</span><span>FAIR</span><span>GOOD</span><span>STRONG</span><span>VERY STRONG</span></div>
            <div className="checker-footer-actions">
              <span className="score-note"><Gauge size={15} /> {password ? "Pattern-aware score" : "Enter a value to begin"}</span>
              {password && <button className="subtle-button" type="button" onClick={handleCopy}>{copyState === "copied" ? <Check size={15} /> : <Copy size={15} />}{copyState === "copied" ? "Copied" : copyState === "failed" ? "Copy unavailable" : "Copy"}</button>}
            </div>
          </div>
        </section>

        {!password ? (
          <section className="empty-state section-wrap">
            <div className="empty-orb"><ShieldCheck size={30} /></div>
            <div><h2>Enter a password to begin analysis</h2><p>Your input stays in component memory and disappears when you refresh or close this page.</p></div>
            <div className="sample-row"><span>Try a fake sample</span><button type="button" onClick={() => setPassword("Tr0pic!Raven#42")}>Tr0pic!Raven#42 <ArrowRight size={14} /></button></div>
          </section>
        ) : (
          <>
            <section className="section-wrap analysis-overview">
              <div className="section-label-row"><div><span className="eyebrow">01 / COMPOSITION</span><h2>Password requirements</h2></div><span className="completion-label"><span>{analysis.requirements.filter((item) => item.met).length}</span> / {analysis.requirements.length} checks passed</span></div>
              <div className="requirements-grid">
                {analysis.requirements.map((item) => <div className={`requirement-item ${item.met ? "met" : "unmet"}`} key={item.id}><span className="requirement-icon">{item.met ? <Check size={14} /> : <span />}</span><span>{item.label}</span></div>)}
              </div>
            </section>

            <section className="section-wrap" id="analysis">
              <SectionHeading eyebrow="02 / SIGNALS" title="Security analysis" description="A multi-signal readout that looks beyond checklist complexity." />
              <div className="metrics-grid">
                {analysis.metrics.map((item) => <article className="metric-card glass-card" key={item.id}><div className="metric-top"><span className={`metric-icon icon-${item.tone}`}>{item.id === "length" ? <KeyRound size={17} /> : item.id === "variety" ? <Sparkles size={17} /> : item.id === "entropy" ? <Zap size={17} /> : item.id === "patterns" ? <Gauge size={17} /> : item.id === "common" ? <Shield size={17} /> : <RefreshCw size={17} />}</span><StatusPill tone={item.tone}>{item.status}</StatusPill></div><p>{item.label}</p><strong>{item.value}</strong><small>{item.explanation}</small></article>)}
              </div>
            </section>

            <section className="section-wrap two-column-section">
              <article className="insight-card danger-card"><div className="insight-heading"><span className="insight-icon danger"><AlertTriangle size={17} /></span><div><span className="eyebrow">03 / FINDINGS</span><h2>Detected weaknesses</h2></div></div>{analysis.weaknesses.length ? <ul className="finding-list">{analysis.weaknesses.map((item) => <li key={item}><span />{item}</li>)}</ul> : <div className="clean-state"><CheckCircle2 size={20} /><span>No obvious weaknesses detected</span></div>}</article>
              <article className="insight-card suggestion-card"><div className="insight-heading"><span className="insight-icon good"><Sparkles size={17} /></span><div><span className="eyebrow">04 / NEXT MOVES</span><h2>How to improve</h2></div></div><ul className="finding-list suggestion-list">{(analysis.suggestions.length ? analysis.suggestions : ["Keep it unique and never reuse it across accounts.", "A password manager can help you create and remember better credentials."]).map((item) => <li key={item}><ArrowRight size={14} />{item}</li>)}</ul></article>
            </section>

            <section className="section-wrap resistance-section">
              <div className="resistance-copy"><span className="eyebrow">05 / EDUCATION</span><h2>Estimated guessing resistance</h2><p>Approximate categories only. Actual cracking speed depends on the hashing algorithm, hardware, server configuration, leaks, and attacker knowledge.</p><span className="approx-badge"><span>≈</span> Approximate estimates</span></div>
              <div className="resistance-grid">{[["Strict rate limiting", analysis.guessing.strict, "Online attack"], ["Open online attack", analysis.guessing.open, "No strong throttling"], ["Fast offline guessing", analysis.guessing.offline, "Leaked hash database"]].map(([label, value, note]) => <div className="resistance-card" key={label}><span>{label}</span><strong>{value}</strong><small>{note}</small></div>)}</div>
            </section>

            <section className="section-wrap anatomy-section"><div className="anatomy-header"><div><span className="eyebrow">06 / COMPOSITION MAP</span><h2>Password anatomy</h2><p>Abstracted categories only — your actual characters are never repeated in the analysis.</p></div><span className="unique-stat"><strong>{new Set([...password]).size}</strong> unique characters</span></div><div className="anatomy-visual">{analysis.anatomy.map((type, index) => <span key={`${type}-${index}`} className="anatomy-block" style={{ background: anatomyColors[type] }} title={type} />)}</div><div className="legend">{Object.entries(anatomyColors).map(([type, color]) => analysis.counts[type as keyof typeof analysis.counts] > 0 && <span key={type}><i style={{ background: color }} />{type}</span>)}</div></section>
          </>
        )}

        <section className="section-wrap generator-section" id="generator">
          <div className="generator-intro"><span className="eyebrow">TOOLS / LOCAL GENERATION</span><h2>Make a stronger credential.</h2><p>Generate high-entropy passwords or memorable passphrases with cryptographically secure randomness. Nothing is saved.</p><div className="generator-safety"><LockKeyhole size={15} /><span>Web Crypto API</span><span className="divider" /><span>Generated locally</span></div></div>
          <div className="generator-card glass-card">
            <div className="generator-tabs" role="tablist"><button className={generatorTab === "password" ? "active" : ""} type="button" role="tab" aria-selected={generatorTab === "password"} onClick={() => setGeneratorTab("password")}>Password</button><button className={generatorTab === "passphrase" ? "active" : ""} type="button" role="tab" aria-selected={generatorTab === "passphrase"} onClick={() => setGeneratorTab("passphrase")}>Passphrase</button></div>
            <div className="generated-output"><span>{generated || "Generate something only you will know"}</span>{generated && <button type="button" onClick={handleGeneratedCopy} aria-label="Copy generated value">{generatedCopy ? <Check size={17} /> : <Clipboard size={17} />}</button>}</div>
            {generatorTab === "password" ? <div className="generator-controls"><label className="range-label"><span>Length <strong>{generatorOptions.length}</strong></span><input type="range" min="12" max="64" value={generatorOptions.length} onChange={(event) => setGeneratorOptions({ ...generatorOptions, length: Number(event.target.value) })} /></label><div className="toggle-grid">{([['uppercase', 'Uppercase'], ['lowercase', 'Lowercase'], ['numbers', 'Numbers'], ['symbols', 'Symbols'], ['excludeAmbiguous', 'Exclude ambiguous']] as const).map(([key, label]) => <label className="toggle-option" key={key}><input type="checkbox" checked={generatorOptions[key]} onChange={(event) => setGeneratorOptions({ ...generatorOptions, [key]: event.target.checked })} /><span className="custom-check"><Check size={12} /></span>{label}</label>)}</div></div> : <div className="generator-controls phrase-controls"><div className="mini-control"><label htmlFor="word-count">Words</label><select id="word-count" value={phraseOptions.words} onChange={(event) => setPhraseOptions({ ...phraseOptions, words: Number(event.target.value) })}>{[3, 4, 5, 6, 7, 8].map((number) => <option key={number} value={number}>{number}</option>)}</select></div><div className="mini-control"><label htmlFor="separator">Separator</label><select id="separator" value={phraseOptions.separator} onChange={(event) => setPhraseOptions({ ...phraseOptions, separator: event.target.value })}><option value="-">Hyphen —</option><option value=" ">Space</option><option value=".">Dot</option><option value="_">Underscore</option></select></div><div className="phrase-toggles">{([['capitalize', 'Capitalize'], ['includeNumber', 'Add number'], ['includeSymbol', 'Add symbol']] as const).map(([key, label]) => <label className="toggle-option" key={key}><input type="checkbox" checked={phraseOptions[key]} onChange={(event) => setPhraseOptions({ ...phraseOptions, [key]: event.target.checked })} /><span className="custom-check"><Check size={12} /></span>{label}</label>)}</div></div>}
            <div className="generator-actions"><button className="primary-button" type="button" onClick={handleGenerate}><Sparkles size={16} /> {generated ? "Regenerate" : "Generate"}</button>{generated && <span className="generated-strength"><span className="mini-dot" style={{ background: strengthColors[generatedAnalysis.strength] }} />{generatedAnalysis.label} · {generatedAnalysis.score}/100</span>}</div>
          </div>
        </section>

        <section className="section-wrap learn-section" id="learn"><SectionHeading eyebrow="LEARN / THE PRINCIPLES" title="What makes a password strong?" description="Good password security is less about tricks and more about making guessing expensive." /><div className="learn-grid"><article><span className="learn-number">01</span><KeyRound size={20} /><h3>Length wins</h3><p>Long, unique passwords generally create more resistance than short passwords packed with predictable symbols.</p></article><article><span className="learn-number">02</span><ShieldCheck size={20} /><h3>Uniqueness matters</h3><p>Never reuse a password. One breach should not become a key to every account you own.</p></article><article><span className="learn-number">03</span><Sparkles size={20} /><h3>Patterns cost you</h3><p>Years, names, keyboard walks, substitutions, and repeated fragments are easy for attackers to model.</p></article><article><span className="learn-number">04</span><LockKeyhole size={20} /><h3>Use your tools</h3><p>Password managers create and remember unique credentials. MFA adds another layer when a password is exposed.</p></article></div></section>
      </main>

      <footer className="footer section-wrap"><div className="footer-brand"><span className="brand-mark"><Shield size={16} /></span><span><strong>pass<span>lab</span></strong><small>LOCAL SECURITY LAB</small></span></div><p>Security education, without the upload.</p><button type="button" className="footer-privacy" onClick={() => setPrivacyOpen(true)}><LockKeyhole size={14} /> Your password never leaves this device.</button></footer>

      {privacyOpen && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setPrivacyOpen(false); }}><section className="privacy-modal" role="dialog" aria-modal="true" aria-labelledby="privacy-title"><button className="modal-close icon-button" type="button" onClick={() => setPrivacyOpen(false)} aria-label="Close privacy information"><X size={18} /></button><div className="modal-icon"><LockKeyhole size={23} /></div><span className="eyebrow">TRUST ARCHITECTURE</span><h2 id="privacy-title">Your password stays here.</h2><p>Password analysis runs entirely inside this browser tab. We deliberately do not connect the checker to an API, analytics provider, database, or cloud storage.</p><div className="privacy-list"><div><CheckCircle2 size={17} /><span>No password is sent to any server.</span></div><div><CheckCircle2 size={17} /><span>No password history is stored.</span></div><div><CheckCircle2 size={17} /><span>No account is required.</span></div><div><CheckCircle2 size={17} /><span>Refreshing or closing the page clears the analysis.</span></div></div><button className="primary-button modal-done" type="button" onClick={() => setPrivacyOpen(false)}>Back to the lab <ArrowRight size={16} /></button></section></div>}
    </div>
  );
}
