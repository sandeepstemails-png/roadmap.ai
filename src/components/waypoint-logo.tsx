export function WaypointMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M12 2L22 21H14.5L12 16L9.5 21H2L12 2Z"
        fill="#E76F2C"
      />
      <path d="M12 2L15 8L12 11L9 8L12 2Z" fill="#F3986A" />
    </svg>
  );
}

export function WaypointLogo({ className }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2 ${className ?? ""}`}>
      <WaypointMark className="size-6" />
      <span className="font-[family-name:var(--font-fraunces)] text-xl font-bold tracking-tight text-[#241B14]">
        Waypoint
      </span>
    </span>
  );
}
