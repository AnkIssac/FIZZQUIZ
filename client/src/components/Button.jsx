// 3D "pop" button with color variants.
const VARIANTS = {
  primary: 'bg-primary',
  accent: 'bg-accent text-[#1A1A2E]',
  success: 'bg-success text-[#0F0F1A]',
  danger: 'bg-danger',
  ghost: 'bg-white/10 border border-white/15',
};

export default function Button({ variant = 'primary', className = '', children, ...props }) {
  return (
    <button
      className={`btn-pop ${VARIANTS[variant] || VARIANTS.primary} px-5 py-3 text-lg ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
