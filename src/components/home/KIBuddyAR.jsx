import { useState } from "react";

/*
  KI Buddy AR Component
  Features:
  - Avatar Widget (Pseudo-3D ready)
  - Voice Input (SpeechRecognition)
  - Voice Output (SpeechSynthesis)
  - State Machine
  - Aktives AR Overlay (Kamera + Pfeil + Anweisung)
*/

export default function KIBuddyAR() {
  const [state, setState] = useState("idle"); // idle | listening | thinking | speaking
  const [arActive, setArActive] = useState(false);

  /* === VOICE === */
  function startVoice() {
    const SpeechRec =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      alert("Speech API nicht unterstützt");
      return;
    }

    setState("listening");

    const rec = new SpeechRec();
    rec.lang = "de-DE";
    rec.start();

    rec.onresult = () => {
      setState("thinking");
      setTimeout(() => {
        speak(
          "Hier ist ein guter Angelspot. Aktiviere AR für die exakte Wurfrichtung."
        );
        setState("speaking");
      }, 1200);
    };
  }

  function speak(text) {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "de-DE";
    window.speechSynthesis.speak(u);
  }

  /* === AR === */
  async function startAR() {
    try {
      await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      setArActive(true);
    } catch {
      alert("Kamera-Zugriff verweigert");
    }
  }

  function stopAR() {
    setArActive(false);
  }

  return (
    <>
      {/* === KI WIDGET === */}
      <div className={`ki-widget ${state}`}>
        <div className="avatar-ring">
          {/* avatar.png durch deinen KI-Avatar ersetzen */}
          <img src="/avatar.png" className="avatar" alt="KI Buddy" />
        </div>

        <button onClick={startVoice}>🎤 Sprechen</button>
        <button className="secondary" onClick={startAR}>
          📷 AR aktivieren
        </button>
      </div>

      {/* === AR OVERLAY === */}
      {arActive && (
        <div className="ar-overlay">
          <div className="ar-hud">
            <div className="arrow">⬇️</div>
            <div className="hint">HIER AUSWERFEN</div>
          </div>
          <button className="close" onClick={stopAR}>
            ✕
          </button>
        </div>
      )}

      {/* === STYLES (Component-Scoped) === */}
      <style>{`
        .ki-widget{
          position:fixed;
          right:16px;
          bottom:16px;
          width:230px;
          padding:16px;
          background:rgba(20,30,60,0.65);
          backdrop-filter:blur(14px);
          border-radius:22px;
          box-shadow:0 0 40px rgba(0,255,198,.5);
          text-align:center;
          color:white;
          z-index:10;
        }

        .avatar-ring{
          width:140px;
          height:140px;
          margin:auto;
          border-radius:50%;
          border:3px solid #00ffc6;
          animation:pulse 3s infinite;
        }

        .avatar{
          width:100%;
          height:100%;
          border-radius:50%;
        }

        button{
          width:100%;
          margin-top:10px;
          padding:10px;
          background:#00ffc6;
          color:#000;
          border:none;
          border-radius:12px;
          font-weight:bold;
          cursor:pointer;
        }

        button.secondary{
          background:#6a5cff;
          color:white;
        }

        .listening .avatar-ring{border-color:lime;}
        .thinking .avatar-ring{border-color:violet;}
        .speaking .avatar-ring{border-color:cyan;}

        @keyframes pulse{
          0%{box-shadow:0 0 10px cyan;}
          50%{box-shadow:0 0 30px cyan;}
          100%{box-shadow:0 0 10px cyan;}
        }

        .ar-overlay{
          position:fixed;
          inset:0;
          background:transparent;
          z-index:20;
        }

        .ar-hud{
          position:absolute;
          bottom:80px;
          width:100%;
          text-align:center;
        }

        .arrow{
          font-size:64px;
          animation:bounce 1.5s infinite;
        }

        .hint{
          font-size:22px;
          color:#00ffc6;
        }

        .close{
          position:absolute;
          top:16px;
          right:16px;
          padding:10px 14px;
          background:red;
          border:none;
          border-radius:50%;
          color:white;
          cursor:pointer;
        }

        @keyframes bounce{
          0%{transform:translateY(0)}
          50%{transform:translateY(12px)}
          100%{transform:translateY(0)}
        }
      `}</style>
    </>
  );
}