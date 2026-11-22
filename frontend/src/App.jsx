import { useEffect, useMemo, useState } from "react";
import {
  ShieldCheck, ShieldAlert, Mail, Activity, History, LogOut, ArrowRight,
  LockKeyhole, Sparkles, Trash2, Search, CheckCircle2, AlertTriangle, XCircle
} from "lucide-react";
import { api } from "./api";

const emptyStats = { total: 0, spam: 0, suspicious: 0, safe: 0 };

function getSavedSession() {
  try { return JSON.parse(localStorage.getItem("mailshield-session") || "null"); }
  catch { return null; }
}

function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    setBusy(true); setError("");
    try {
      const data = await api(`/auth/${mode}`, {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });
      onAuth(data);
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  return <div className="auth-layout">
    <section className="auth-story">
      <div className="brand"><span className="brand-mark"><ShieldCheck size={22}/></span> MailShield</div>
      <div className="story-copy">
        <div className="eyebrow"><Sparkles size={14}/> SMART EMAIL SECURITY</div>
        <h1>Spot the signal.<br/><span>Skip the scam.</span></h1>
        <p>Understand suspicious email patterns before you click, reply, or share sensitive information.</p>
        <div className="story-points">
          <div><span><CheckCircle2 size={17}/></span><div><b>Clear explanations</b><small>See which warning signs were detected.</small></div></div>
          <div><span><Activity size={17}/></span><div><b>One simple risk score</b><small>Turn confusing signals into a quick overview.</small></div></div>
        </div>
      </div>
      <div className="story-foot">A learning project for safer email habits.</div>
    </section>
    <section className="auth-panel">
      <div className="auth-card">
        <div className="mobile-brand brand"><span className="brand-mark"><ShieldCheck size={22}/></span> MailShield</div>
        <div className="auth-kicker">{mode === "login" ? "WELCOME BACK" : "GET STARTED"}</div>
        <h2>{mode === "login" ? "Sign in to your workspace" : "Create your workspace"}</h2>
        <p className="muted">{mode === "login" ? "Review email risks with confidence." : "Start checking suspicious email text in seconds."}</p>
        <form onSubmit={submit} className="form-stack">
          {mode === "register" && <label>Full name<input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" minLength="2" required autoComplete="name"/></label>}
          <label>Email address<input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required autoComplete="email"/></label>
          <label>Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 8 characters" minLength="8" required autoComplete={mode === "login" ? "current-password" : "new-password"}/></label>
          {error && <div className="alert error"><AlertTriangle size={16}/>{error}</div>}
          <button className="primary-btn full" disabled={busy}>{busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"} <ArrowRight size={17}/></button>
        </form>
        <div className="switch-auth">{mode === "login" ? "New to MailShield?" : "Already have an account?"} <button onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}>{mode === "login" ? "Create an account" : "Sign in"}</button></div>
        <div className="secure-note"><LockKeyhole size={14}/> Your account is protected with password hashing and token authentication.</div>
      </div>
    </section>
  </div>;
}

function Badge({ classification }) {
  const cls = classification === "Spam" ? "spam" : classification === "Suspicious" ? "suspicious" : "safe";
  const Icon = cls === "spam" ? XCircle : cls === "suspicious" ? AlertTriangle : CheckCircle2;
  return <span className={`badge ${cls}`}><Icon size={14}/>{classification}</span>;
}

function AppShell({ session, onLogout }) {
  const [active, setActive] = useState("analyze");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(emptyStats);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");

  async function refresh() {
    try {
      const [historyData, statsData] = await Promise.all([
        api("/analysis", { token: session.token }),
        api("/analysis/stats", { token: session.token }),
      ]);
      setHistory(historyData.items); setStats(statsData);
    } catch (err) { setError(err.message); }
  }

  useEffect(() => { refresh(); }, []);

  async function analyze(event) {
    event.preventDefault(); setBusy(true); setError(""); setNotice(""); setResult(null);
    try {
      const data = await api("/analysis", {
        token: session.token, method: "POST",
        body: JSON.stringify({ subject, body }),
      });
      setResult(data.analysis);
      await refresh();
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  async function deleteItem(id) {
    try {
      await api(`/analysis/${id}`, { token: session.token, method: "DELETE" });
      setHistory(items => items.filter(item => item._id !== id));
      setNotice("History item deleted.");
      await refresh();
    } catch (err) { setError(err.message); }
  }

  const filteredHistory = useMemo(() => history.filter(item =>
    `${item.subject || ""} ${item.classification}`.toLowerCase().includes(search.toLowerCase())
  ), [history, search]);

  return <div className="app-layout">
    <aside className="sidebar">
      <div className="brand"><span className="brand-mark"><ShieldCheck size={22}/></span><span>MailShield<small>EMAIL INTELLIGENCE</small></span></div>
      <div className="side-label">WORKSPACE</div>
      <button className={`nav-item ${active === "analyze" ? "active" : ""}`} onClick={() => setActive("analyze")}><Mail size={18}/> Analyze email</button>
      <button className={`nav-item ${active === "history" ? "active" : ""}`} onClick={() => setActive("history")}><History size={18}/> Analysis history <span className="nav-count">{stats.total}</span></button>
      <div className="sidebar-bottom">
        <div className="privacy-card"><div className="privacy-icon"><LockKeyhole size={16}/></div><b>Private by design</b><p>Your saved checks are only visible to your account.</p></div>
        <div className="user-row"><div className="avatar">{session.user.name.slice(0,1).toUpperCase()}</div><div className="user-info"><b>{session.user.name}</b><small>{session.user.email}</small></div><button className="icon-btn logout" title="Log out" onClick={onLogout}><LogOut size={17}/></button></div>
      </div>
    </aside>
    <main className="main-area">
      <header className="topbar"><div><div className="breadcrumb">Workspace <span>/</span> {active === "analyze" ? "Email analysis" : "History"}</div><h2>{active === "analyze" ? "Email risk analyzer" : "Analysis history"}</h2></div><div className="top-status"><span className="status-dot"/> Detection engine ready</div></header>
      <div className="content">
        {error && <div className="alert error"><AlertTriangle size={16}/>{error}<button onClick={() => setError("")}>Dismiss</button></div>}
        {notice && <div className="alert success"><CheckCircle2 size={16}/>{notice}<button onClick={() => setNotice("")}>Dismiss</button></div>}
        <section className="stats-grid">
          <StatCard icon={<Activity size={18}/>} label="Emails checked" value={stats.total} tone="blue"/>
          <StatCard icon={<ShieldAlert size={18}/>} label="Flagged as spam" value={stats.spam} tone="red"/>
          <StatCard icon={<AlertTriangle size={18}/>} label="Needs a closer look" value={stats.suspicious} tone="amber"/>
          <StatCard icon={<ShieldCheck size={18}/>} label="Likely safe" value={stats.safe} tone="green"/>
        </section>
        {active === "analyze" ? <div className="analysis-grid">
          <section className="panel analyzer-panel">
            <div className="panel-heading"><div><div className="section-kicker">CONTENT CHECK</div><h3>Inspect an email</h3><p>Paste the subject and message body below.</p></div><span className="panel-icon"><Mail size={20}/></span></div>
            <form onSubmit={analyze}>
              <label className="field-label">Email subject <span>OPTIONAL</span><input value={subject} onChange={e => setSubject(e.target.value)} maxLength="300" placeholder="e.g. Your account needs verification"/></label>
              <label className="field-label">Email body <span>REQUIRED</span><textarea value={body} onChange={e => setBody(e.target.value)} maxLength="20000" required rows="9" placeholder={"Paste the email message here…\n\nTip: remove personal details before checking."}/><small className="char-count">{body.length.toLocaleString()} / 20,000 characters</small></label>
              <div className="privacy-hint"><LockKeyhole size={15}/><span>Analyze only text you are allowed to share. Avoid passwords, account numbers, or private information.</span></div>
              <button className="primary-btn" disabled={busy || !body.trim()}>{busy ? "Analyzing email…" : "Analyze email"} <ArrowRight size={17}/></button>
            </form>
          </section>
          <section className="result-column">
            {result ? <ResultCard result={result}/> : <div className="empty-result"><div className="radar"><div className="radar-ring r1"/><div className="radar-ring r2"/><div className="radar-ring r3"/><span><ShieldCheck size={34}/></span></div><h3>Your results will appear here</h3><p>Run an analysis to see a risk score, classification, and the signals that influenced the result.</p><div className="result-foot"><span><CheckCircle2 size={15}/> Explainable checks</span><span><Activity size={15}/> 0–100 risk score</span></div></div>}
            <div className="method-note"><Sparkles size={17}/><div><b>How the smart check works</b><p>It scans for common phishing and spam signals, then combines them into a simple score. This is a heuristic demo, not a guarantee.</p></div></div>
          </section>
        </div> : <section className="panel history-panel">
          <div className="history-toolbar"><div><div className="section-kicker">YOUR RECORDS</div><h3>Recent analyses</h3><p>Showing up to 100 recent checks.</p></div><div className="searchbox"><Search size={17}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search subject or label…"/></div></div>
          {filteredHistory.length ? <div className="table-wrap"><table><thead><tr><th>EMAIL SUBJECT</th><th>RESULT</th><th>RISK SCORE</th><th>DATE</th><th></th></tr></thead><tbody>{filteredHistory.map(item => <tr key={item._id}><td className="subject-cell">{item.subject || "(No subject)"}</td><td><Badge classification={item.classification}/></td><td><ScoreInline score={item.score}/></td><td>{new Date(item.createdAt).toLocaleDateString()}</td><td><button className="icon-btn delete-btn" title="Delete record" onClick={() => deleteItem(item._id)}><Trash2 size={16}/></button></td></tr>)}</tbody></table></div> : <div className="empty-history"><History size={28}/><b>No matching analyses</b><p>Analyze an email to start building your history.</p></div>}
        </section>}
        <footer className="page-footer"><span>MAILSHIELD <i>•</i> SMART SPAM DETECTION</span><span>Use caution: no automated score can prove an email is safe.</span></footer>
      </div>
    </main>
  </div>;
}

function StatCard({ icon, label, value, tone }) {
  return <div className="stat-card"><div className={`stat-icon ${tone}`}>{icon}</div><div><div className="stat-label">{label}</div><div className="stat-value">{value}</div></div></div>;
}

function ScoreInline({ score }) {
  return <div className="score-inline"><div className="mini-track"><span style={{ width: `${score}%` }}/></div><b>{score}</b></div>;
}

function ResultCard({ result }) {
  const tone = result.classification === "Spam" ? "red" : result.classification === "Suspicious" ? "amber" : "green";
  return <div className="result-card">
    <div className="result-card-top"><div><div className="section-kicker">ANALYSIS COMPLETE</div><h3>Risk assessment</h3></div><span className={`result-icon ${tone}`}>{result.classification === "Spam" ? <ShieldAlert size={22}/> : result.classification === "Suspicious" ? <AlertTriangle size={22}/> : <ShieldCheck size={22}/>}</span></div>
    <div className="score-block"><div className="score-number">{result.score}<span>/100</span></div><Badge classification={result.classification}/><div className="score-track"><span className={tone} style={{ width: `${result.score}%` }}/></div><div className="score-labels"><span>LOW RISK</span><span>HIGH RISK</span></div></div>
    <div className="signals-head"><b>Signals detected</b><span>{result.signals.length} {result.signals.length === 1 ? "signal" : "signals"}</span></div>
    <ul className="signal-list">{result.signals.map((signal, i) => <li key={signal}><span className="signal-dot">{i + 1}</span>{signal}</li>)}</ul>
    <div className={`recommendation ${tone}`}><b>{result.classification === "Spam" ? "Treat this email as high risk" : result.classification === "Suspicious" ? "Verify before taking action" : "No common warning signs found"}</b><p>{result.classification === "Likely Safe" ? "This result does not guarantee safety. Check the sender address and links independently." : "Do not click links, open attachments, or share sensitive information unless you independently verify the sender."}</p></div>
  </div>;
}

export default function App() {
  const [session, setSession] = useState(getSavedSession);
  function onAuth(data) {
    const next = { token: data.token, user: data.user };
    localStorage.setItem("mailshield-session", JSON.stringify(next));
    setSession(next);
  }
  function onLogout() {
    localStorage.removeItem("mailshield-session");
    setSession(null);
  }
  return session ? <AppShell session={session} onLogout={onLogout}/> : <AuthScreen onAuth={onAuth}/>;
}
