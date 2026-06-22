import { SOURCE_TAGS } from '@shared/constants.js';

// Cosmetic 🌍 Global / 🇮🇳 Cultural flag tag shown on every question.
export default function SourceTag({ source }) {
  const tag = SOURCE_TAGS[source] || SOURCE_TAGS.classic;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-text-secondary">
      <span aria-hidden>{tag.flag}</span>
      {tag.label}
    </span>
  );
}
