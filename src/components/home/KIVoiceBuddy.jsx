import { InvokeLLM } from "@/integrations/Core";
import { useState, useRef, useEffect } from "react";

const SYSTEM = `Du bist Marina, eine freundliche und erfahrene Angelexpertin in der App CatchGbt.
Du beantwortest ausschließlich Fragen rund ums Angeln auf Deutsch — kurz, präzise, max. 3 Sätze.
Themen: Köder, Angeltechniken, Ruten, Rollen, Fischarten, Gewässer, Wetter, Jahreszeiten, Knoten, Angelschein, Ausrüstung.
Bist du nach etwas anderem gefragt, lenkst du charmant zurück zum Angeln.`;

export default function KIVoiceBuddy() {
  const [messages, setMessages] = useState([
    { role: "system", text: "Hallo! Ich bin Marina — stelle mir eine Angel-Frage!" }
  ]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState("");
  const [tonAn, setTonAn] = useState(true);
  const [recording, setRecording] = useState(false);
  const [waveBars, setWaveBars] = useState([4, 4, 4, 4, 4]);

  const chatRef = useRef();
  const recRef = useRef(null);
  const waveRef = useRef(null);
  const synth = useRef(window.speechSynthesis);

  useEffect(() => {
    if (chatRef.current)
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  function startWave() {
    waveRef.current = setInterval(() => {
      setWaveBars([...Array(5)].map(() => Math.random() * 18 + 4));
    }, 120);
  }
  function stopWave() {
    clearInterval(waveRef.current);
    setWaveBars([4, 4, 4, 4, 4]);
  }

  function speak(text) {
    synth.current.cancel();
    setStatus("speaking");
    startWave();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "de-DE";
    u.pitch = 1.15;
    u.rate = 1.0;
    const vs = synth.current.getVoices();
    const v =
      vs.find((x) => /Helena|Marlene|Katja|Anna/i.test(x.name)) ||
      vs.find((x) => x.lang === "de-DE" || x.lang === "de-AT") ||
      vs[0];
    if (v) u.voice = v;
    u.onend = () => { setStatus(""); stopWave(); };
    u.onerror = () => { setStatus(""); stopWave(); };
    synth.current.speak(u);
  }

  function stopSpeaking() {
    synth.current.cancel();
    stopWave();
    setStatus("");
  }

  async function ask(q) {
    setStatus("thinking");
    try {
      const response = await InvokeLLM({
        prompt: q,
        system_prompt: SYSTEM,
        add_context_from_internet: false,
      });
      const ans = response || "Keine Antwort erhalten.";
      setMessages((m) => [...m, { role: "assistant", text: ans }]);
      if (tonAn) speak(ans);
      else setStatus("");
    } catch (e) {
      setStatus("");
      setMessages((m) => [
        ...m,
        { role: "system", text: "Fehler – bitte erneut versuchen." },
      ]);
    }
  }

  function sendText() {
    const q = input.trim();
    if (!q) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text: q }]);
    ask(q);
  }

  function toggleMic() {
    if (recording) { stopMic(); return; }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setMessages((m) => [
        ...m,
        { role: "system", text: "Spracherkennung wird nicht unterstützt." },
      ]);
      return;
    }
    const rec = new SR();
    rec.lang = "de-DE";
    rec.interimResults = false;
    rec.onresult = (e) => {
      const q = e.results[0][0].transcript;
      stopMic();
      setMessages((m) => [...m, { role: "user", text: q }]);
      ask(q);
    };
    rec.onerror = () => stopMic();
    rec.onend = () => { if (recRef.current) stopMic(); };
    rec.start();
    recRef.current = rec;
    setRecording(true);
    setStatus("listening");
  }

  function stopMic() {
    try { recRef.current?.stop(); } catch {}
    recRef.current = null;
    setRecording(false);
    if (status === "listening") setStatus("");
  }

  const avatarShadow =
    status === "speaking"
      ? "0 0 0 4px rgba(34,211,200,0.4)"
      : status === "listening"
      ? "0 0 0 4px rgba(124,58,237,0.5)"
      : "none";

  const statusText = {
    listening: "Ich höre zu...",
    speaking: "Marina spricht...",
    thinking: "Denke nach...",
    "": "Tippe oder aktiviere das Mikrofon",
  };

  return (
    <div style={{ background: "#060d1a", borderRadius: 16, overflow: "hidden", fontFamily: "Inter, sans-serif", border: "1px solid #1a2a3a", display: "flex", flexDirection: "column" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px 10px", borderBottom: "1px solid #111e2e" }}>
        <span style={{ fontSize: 16, fontWeight: 600, color: "#22d3c8" }}>KI Voice-Buddy</span>
        <button
          onClick={() => { setTonAn((t) => !t); if (tonAn) synth.current.cancel(); }}
          style={{ display: "flex", alignItems: "center", gap: 6, background: tonAn ? "#22d3c8" : "#0d2020", border: "1px solid #22d3c8", borderRadius: 20, padding: "4px 12px", fontSize: 12, color: tonAn ? "#060d1a" : "#22d3c8", fontWeight: 500, cursor: "pointer" }}
        >
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: tonAn ? "#060d1a" : "#22d3c8", display: "inline-block" }} />
          {tonAn ? "Ton an" : "Ton aus"}
        </button>
      </div>

      {/* Voice control row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", background: "#08111f" }}>
        <span style={{ fontSize: 12, color: "#8899aa", maxWidth: 160, lineHeight: 1.4 }}>
          Sprachsteuerung aktivieren
        </span>
        <button
          onClick={toggleMic}
          style={{ display: "flex", alignItems: "center", gap: 7, background: recording ? "#22d3c8" : "#0d2a28", border: "1px solid #22d3c8", borderRadius: 10, padding: "8px 14px", color: recording ? "#060d1a" : "#22d3c8", fontSize: 13, fontWeight: 500, cursor: "pointer" }}
        >
          <span>{recording ? "Aktiv" : "Aus"}</span>
        </button>
      </div>

      <div style={{ padding: "6px 16px 8px", fontSize: 11, color: "#445566", fontStyle: "italic" }}>
        {statusText[status] || statusText[""]}
      </div>

      {/* Avatar */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", background: "#0a1624", borderTop: "1px solid #111e2e", borderBottom: "1px solid #111e2e" }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: "linear-gradient(135deg,#7c3aed,#4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0, boxShadow: avatarShadow, transition: "box-shadow 0.3s" }}>
          M
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#e0f0ff" }}>Marina</div>
          <div style={{ fontSize: 12, color: "#556677" }}>Deine KI-Angelexpertin</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 3, height: 24, opacity: status === "speaking" ? 1 : 0, transition: "opacity 0.3s" }}>
          {waveBars.map((h, i) => (
            <div key={i} style={{ width: 3, height: h, background: "#22d3c8", borderRadius: 2, transition: "height 0.1s" }} />
          ))}
        </div>
      </div>

      {/* Chat */}
      <div ref={chatRef} style={{ padding: "12px 14px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, maxHeight: 200, minHeight: 120, background: "#060d1a" }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            fontSize: m.role === "system" ? 11 : 13,
            lineHeight: 1.5,
            padding: "9px 12px",
            borderRadius: 12,
            maxWidth: "88%",
            alignSelf: m.role === "user" ? "flex-end" : m.role === "system" ? "center" : "flex-start",
            background: m.role === "user" ? "#131f33" : m.role === "system" ? "transparent" : "#0d1e14",
            color: m.role === "user" ? "#aabbd0" : m.role === "system" ? "#445566" : "#7adba0",
            border: m.role === "system" ? "none" : m.role === "user" ? "1px solid #1e2f44" : "1px solid #163025",
            fontStyle: m.role === "system" ? "italic" : "normal",
            textAlign: m.role === "system" ? "center" : "left",
          }}>
            {m.text}
          </div>
        ))}
      </div>

      {/* Input */}
      <div style={{ display: "flex", gap: 8, padding: "12px 14px 14px", background: "#08111f", borderTop: "1px solid #111e2e" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendText()}
          placeholder="Frage stellen..."
          style={{ flex: 1, background: "#0d1a2a", border: "1px solid #1e2f44", borderRadius: 10, padding: "10px 14px", color: "#ccdde8", fontSize: 13, outline: "none" }}
        />
        <button
          onClick={sendText}
          style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)", border: "none", borderRadius: 10, padding: "10px 16px", color: "white", fontWeight: 600, fontSize: 13, cursor: "pointer" }}
        >
          Senden
        </button>
        <button
          onClick={stopSpeaking}
          style={{ background: "#0d1a2a", border: "1px solid #1e2f44", borderRadius: 10, padding: "10px 12px", color: "#556677", cursor: "pointer" }}
        >
          Stop
        </button>
      </div>

      <div style={{ textAlign: "center", fontSize: 11, color: "#223344", padding: "0 14px 10px", background: "#08111f", textTransform: "uppercase", letterSpacing: 0.5 }}>
        {status || "Bereit"}
      </div>
    </div>
  );
}