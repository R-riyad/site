interface BrandLogoProps {
  className?: string;
  compact?: boolean;
}

export default function BrandLogo({ className = '', compact = false }: BrandLogoProps) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <svg
        aria-hidden="true"
        viewBox="0 0 48 48"
        className="h-10 w-10 shrink-0"
        fill="none"
      >
        <rect x="1" y="1" width="46" height="46" rx="15" fill="#261F1A" />
        <path d="M13 15.5h22M24 15.5v21M17 36.5h14" stroke="#D9B793" strokeWidth="2.4" strokeLinecap="round" />
        <path d="m35.5 9 .9 2.6L39 12.5l-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9.9-2.6Z" fill="#F1DDC8" />
      </svg>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="text-[15px] font-semibold tracking-[0.18em]">TEKİN</span>
          <span className="mt-1.5 text-[8px] font-medium tracking-[0.22em] opacity-55">ÖZENLE SEÇİLDİ</span>
        </span>
      )}
    </span>
  );
}
