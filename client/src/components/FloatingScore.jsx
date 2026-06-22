// A "+100" score delta that floats up and fades. Render with a unique key to replay.
export default function FloatingScore({ value }) {
  if (!value) return null;
  return (
    <div className="pointer-events-none absolute inset-x-0 -top-2 grid place-items-center">
      <span className="animate-floatUp font-display text-3xl text-success drop-shadow">+{value}</span>
    </div>
  );
}
