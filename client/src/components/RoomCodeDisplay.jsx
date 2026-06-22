import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

// Large styled room code + copy button + QR code of the join URL.
export default function RoomCodeDisplay({ code }) {
  const [copied, setCopied] = useState(false);
  const joinUrl = `${window.location.origin}/?room=${code}`;

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="fq-card neon-border flex flex-col items-center gap-4 p-5">
      <div className="text-text-secondary font-bold tracking-widest">ROOM CODE</div>
      <button
        onClick={() => copy(code)}
        className="font-display text-5xl md:text-6xl tracking-[0.3em] text-accent hover:scale-105 transition-transform"
        title="Click to copy code"
      >
        {code}
      </button>
      <div className="rounded-xl bg-white p-2">
        <QRCodeSVG value={joinUrl} size={120} />
      </div>
      <button onClick={() => copy(joinUrl)} className="btn-pop bg-white/10 px-4 py-2 text-sm" style={{ boxShadow: '0 4px 0 0 rgba(0,0,0,0.35)' }}>
        {copied ? '✅ Copied!' : '🔗 Copy invite link'}
      </button>
    </div>
  );
}
