interface Props { size?: number; className?: string; }

export function CornerRadiusIcon({ size = 16, className }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Sol üst köşe — yuvarlak */}
      <path d="M4 20 L4 8 Q4 4 8 4 L20 4" />

      {/* Sağ üst — nokta */}
      <circle cx="20" cy="8" r="1" fill="currentColor" stroke="none" />
      {/* Sağ orta — nokta */}
      <circle cx="20" cy="13" r="1" fill="currentColor" stroke="none" />
      {/* Sağ alt — nokta */}
      <circle cx="20" cy="18" r="1" fill="currentColor" stroke="none" />

      {/* Sol alt — nokta */}
      <circle cx="8" cy="20" r="1" fill="currentColor" stroke="none" />
      {/* Orta alt — nokta */}
      <circle cx="13" cy="20" r="1" fill="currentColor" stroke="none" />
      {/* Sağ alt köşe — nokta */}
      <circle cx="18" cy="20" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
