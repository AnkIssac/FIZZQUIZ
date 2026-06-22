import { useEffect, useRef, useState } from 'react';
import { useGame } from '../context/GameContext.jsx';

// Simple lobby chat.
export default function ChatBox() {
  const { state, sendChat } = useGame();
  const [text, setText] = useState('');
  const listRef = useRef(null);
  const chat = state.mp.chat || [];

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [chat.length]);

  const submit = (e) => {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    sendChat(t);
    setText('');
  };

  return (
    <div className="fq-card flex h-64 flex-col p-3">
      <div className="mb-2 text-sm font-bold text-text-secondary">💬 Lobby chat</div>
      <div ref={listRef} className="no-scrollbar flex-1 space-y-1 overflow-y-auto pr-1">
        {chat.length === 0 && <div className="text-sm text-text-secondary">Say hi to your crew…</div>}
        {chat.map((m) => (
          <div key={m.id} className="text-sm">
            <span style={{ color: m.avatar?.color }} className="font-bold">
              {m.avatar?.emoji} {m.name}:
            </span>{' '}
            <span className="text-white/90">{m.text}</span>
          </div>
        ))}
      </div>
      <form onSubmit={submit} className="mt-2 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={200}
          placeholder="Type a message…"
          className="flex-1 rounded-xl bg-white/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
        />
        <button className="btn-pop bg-primary px-3 py-2 text-sm" style={{ boxShadow: '0 4px 0 0 rgba(0,0,0,0.35)' }}>
          Send
        </button>
      </form>
    </div>
  );
}
