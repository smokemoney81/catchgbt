import { useState } from "react";

/*
  KI Buddy Widget – lokal
  - Auto-Spracherkennung (EU)
  - Antwort in erkannter Sprache
  - Sprachmodi: kurz (Free) | detailliert (Pro)
  - Speech → Text | Text → Speech
  - Keine Speicherung
*/

export default function KIBuddyWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [state, setState] = useState("idle"); // idle | listening | thinking | speaking
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [lang, setLang] = useState("en-US");
  const [plan, setPlan] = useState("free"); // free | pro

  /* =======================
     SPRACHE → TEXT
  ======================= */
  function listen() {
    const SpeechRec =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      alert("SpeechRecognition nicht unterstützt");
      return;
    }

    setState("listening");
    const rec = new SpeechRec();
    rec.continuous = false;
    rec.interimResults = false;
    rec.start();

    rec.onresult = (e) => {
      const text = e.results[0][0].transcript;
      const language = detectLanguage(text);
      setLang(language);
      setInput(text);
      process(text, language);
    };
  }

  /* =======================
     TEXT → SPRACHE
  ======================= */
  function speak(text, language) {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setState("idle");
      return;
    }
    
    setState("speaking");
    const u = new SpeechSynthesisUtterance(text);
    u.lang = language;
    u.onend = () => setState("idle");
    window.speechSynthesis.speak(u);
  }

  /* =======================
     SPRACHERKENNUNG (EU)
  ======================= */
  function detectLanguage(text) {
    const t = text.toLowerCase();

    if (/[äöüß]|köder|wetter|hecht/.test(t)) return "de-DE";
    if (/the |bait|pike|weather/.test(t)) return "en-US";
    if (/le |la |poisson|météo/.test(t)) return "fr-FR";
    if (/el |pez|clima/.test(t)) return "es-ES";
    if (/il |pesce|meteo/.test(t)) return "it-IT";
    if (/de |vis|weer/.test(t)) return "nl-NL";
    if (/ryba|pogoda/.test(t)) return "pl-PL";

    return "en-US";
  }

  /* =======================
     LOGIK (FREE / PRO)
  ======================= */
  function process(text, language) {
    setState("thinking");

    const shortMode = plan === "free";
    let answer = shortMode
      ? shortAnswer(language, text)
      : detailedAnswer(language, text);

    setResponse(answer);
    speak(answer, language);
  }

  /* =======================
     KURZ (FREE)
  ======================= */
  function shortAnswer(lang, text) {
    const t = text.toLowerCase();

    if (lang === "de-DE") {
      if (t.includes("hecht")) return "Hecht steht oft an Krautkanten.";
      if (t.includes("köder")) return "Gummifisch oder Wobbler.";
      return "Kurzantwort aktiv (Free).";
    }

    if (lang === "en-US") {
      if (t.includes("pike")) return "Pike stays near weed edges.";
      if (t.includes("bait")) return "Soft lure or crankbait.";
      return "Short answer mode (Free).";
    }

    return "Short answer.";
  }

  /* =======================
     DETAILLIERT (PRO)
  ======================= */
  function detailedAnswer(lang, text) {
    const t = text.toLowerCase();

    if (lang === "de-DE") {
      if (t.includes("hecht"))
        return "Hechte halten sich bevorzugt an Krautkanten, Holzstrukturen und flachen Uferzonen auf. Besonders aktiv sind sie morgens und abends.";
      if (t.includes("köder"))
        return "Je nach Jahreszeit funktionieren Gummifische, Jerkbaits und Wobbler sehr gut. Größe und Farbe sollten an Wassertrübung angepasst werden.";
      return "Detaillierte Analyse aktiv (Pro).";
    }

    if (lang === "en-US") {
      if (t.includes("pike"))
        return "Pike usually stay near weed edges, submerged structures and shallow areas, especially active during early morning and evening.";
      if (t.includes("bait"))
        return "Soft lures, jerkbaits and crankbaits work well depending on water clarity and season.";
      return "Detailed analysis mode (Pro).";
    }

    return "Detailed answer.";
  }

  return (
    <>
      {!isOpen && (
        <button className="ki-buddy-btn" onClick={() => setIsOpen(true)}>
          KI Buddy
        </button>
      )}

      {isOpen && (
        <div className={`ki-widget ${state}`}>
          <div className="header">
            <span>KI Buddy — {plan === "free" ? "Free" : "Pro"}</span>
            <button className="close-btn" onClick={() => setIsOpen(false)}>×</button>
          </div>

          <textarea
            placeholder="Sprich oder schreibe…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />

          <button onClick={() => process(input, lang)}>Antworten</button>
          <button className="secondary" onClick={listen}>
            Sprechen
          </button>

          <button
            className="toggle"
            onClick={() => setPlan(plan === "free" ? "pro" : "free")}
          >
            Modus wechseln
          </button>

          <pre className="response">{response}</pre>
        </div>
      )}

      <style>{`
        .ki-buddy-btn{
          position:fixed;
          right:16px;
          bottom:16px;
          padding:12px 20px;
          background:#00ffc6;
          border:none;
          border-radius:25px;
          color:black;
          font-weight:bold;
          cursor:pointer;
          box-shadow:0 4px 15px rgba(0,255,198,.4);
          z-index:999;
          font-family:Arial, sans-serif;
        }

        .ki-buddy-btn:hover{
          background:#00e6b3;
          box-shadow:0 6px 20px rgba(0,255,198,.6);
        }

        .ki-widget{
          position:fixed;
          right:16px;
          bottom:16px;
          width:280px;
          padding:14px;
          background:#0b1220;
          border-radius:18px;
          box-shadow:0 0 30px rgba(0,255,198,.4);
          color:white;
          font-family:Arial, sans-serif;
          z-index:999;
        }

        .header{
          display:flex;
          justify-content:space-between;
          align-items:center;
          font-weight:bold;
          margin-bottom:6px;
          color:#00ffc6;
        }

        .close-btn{
          background:transparent;
          border:none;
          color:#00ffc6;
          font-size:24px;
          cursor:pointer;
          padding:0;
          width:auto;
          margin:0;
          line-height:1;
        }

        .close-btn:hover{
          color:white;
        }

        textarea{
          width:100%;
          height:70px;
          padding:8px;
          border-radius:8px;
          border:none;
          margin-bottom:6px;
        }

        button{
          width:100%;
          padding:8px;
          margin-top:6px;
          border:none;
          border-radius:10px;
          background:#00ffc6;
          color:black;
          font-weight:bold;
          cursor:pointer;
        }

        button.secondary{
          background:#6a5cff;
          color:white;
        }

        button.toggle{
          background:#333;
          color:white;
        }

        .response{
          margin-top:10px;
          font-size:13px;
          white-space:pre-wrap;
          color:#00ffc6;
        }

        .listening{outline:2px solid lime;}
        .thinking{outline:2px solid violet;}
        .speaking{outline:2px solid cyan;}
      `}</style>
    </>
  );
}