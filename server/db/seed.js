// Seeds the SQLite database with every question from /server/db/questions.
// Run with: npm run seed  (from repo root) or node db/seed.js (from /server)
import { getDb, closeDb, DB_PATH } from './database.js';
import { QUESTIONS_BY_TOPIC } from './questions/index.js';

const LETTERS = ['A', 'B', 'C', 'D'];

function seed() {
  const db = getDb();

  // Fresh start each seed run so counts stay accurate.
  db.exec('DELETE FROM questions;');
  db.exec("DELETE FROM sqlite_sequence WHERE name='questions';");

  const insert = db.prepare(`
    INSERT INTO questions
      (topic, difficulty, source, question, option_a, option_b, option_c, option_d, correct, explanation, image_url, audio_kind)
    VALUES
      (@topic, @difficulty, @source, @question, @a, @b, @c, @d, @correct, @explanation, @image_url, @audio_kind)
  `);

  let total = 0;
  const perTopic = {};
  const perSource = { classic: 0, cultural: 0 };
  const perDifficulty = { easy: 0, medium: 0, hard: 0 };
  const problems = [];

  const insertAll = db.transaction(() => {
    for (const [topic, questions] of Object.entries(QUESTIONS_BY_TOPIC)) {
      perTopic[topic] = 0;
      questions.forEach((q, idx) => {
        // Validate before inserting so a bad row is caught loudly.
        if (!Array.isArray(q.o) || q.o.length !== 4) {
          problems.push(`${topic}[${idx}]: needs exactly 4 options`);
          return;
        }
        if (typeof q.c !== 'number' || q.c < 0 || q.c > 3) {
          problems.push(`${topic}[${idx}]: correct index must be 0-3`);
          return;
        }
        if (!['easy', 'medium', 'hard'].includes(q.d)) {
          problems.push(`${topic}[${idx}]: bad difficulty "${q.d}"`);
          return;
        }
        if (!['classic', 'cultural'].includes(q.s)) {
          problems.push(`${topic}[${idx}]: bad source "${q.s}"`);
          return;
        }

        insert.run({
          topic,
          difficulty: q.d,
          source: q.s,
          question: q.q,
          a: q.o[0],
          b: q.o[1],
          c: q.o[2],
          d: q.o[3],
          correct: LETTERS[q.c],
          explanation: q.e || '',
          image_url: q.img || null,
          audio_kind: q.audio || null,
        });

        total += 1;
        perTopic[topic] += 1;
        perSource[q.s] += 1;
        perDifficulty[q.d] += 1;
      });
    }
  });

  insertAll();

  if (problems.length) {
    console.error('\n⚠️  Validation problems found:');
    problems.forEach((p) => console.error('   - ' + p));
  }

  console.log('\n🫧  FizzQuiz seed complete');
  console.log('   Database:', DB_PATH);
  console.log('   Total questions:', total);
  console.log('   By source:', perSource);
  console.log('   By difficulty:', perDifficulty);
  console.log('   By topic:');
  for (const [t, n] of Object.entries(perTopic)) {
    console.log(`     ${t.padEnd(12)} ${n}`);
  }
  if (total < 1000) {
    console.warn(`\n⚠️  Only ${total} questions seeded (target is 1000+).`);
  } else {
    console.log(`\n✅  ${total} questions seeded (target 1000+ met).`);
  }

  closeDb();
}

seed();
