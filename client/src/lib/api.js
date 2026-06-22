// Thin REST client for the FizzQuiz server.
const BASE = '/api';

export async function getTopics() {
  const res = await fetch(`${BASE}/topics`);
  if (!res.ok) throw new Error('Failed to load topics');
  return res.json();
}

export async function getStats() {
  const res = await fetch(`${BASE}/stats`);
  if (!res.ok) throw new Error('Failed to load stats');
  return res.json();
}

export async function buildSoloGame(config) {
  const res = await fetch(`${BASE}/solo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });
  if (!res.ok) throw new Error('Failed to build solo game');
  return res.json();
}
