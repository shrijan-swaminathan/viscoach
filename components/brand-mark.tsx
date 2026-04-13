import Image from "next/image";

export function BrandMark({
  compact = false
}: {
  compact?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <Image
        src="/viscoach-logo.svg"
        alt="VisCoach logo"
        width={44}
        height={44}
        className="h-11 w-11 rounded-lg"
        priority
      />
      <div className={compact ? "hidden sm:block" : ""}>
        <p className="font-display text-lg font-semibold text-white">VisCoach</p>
        <p className="text-xs uppercase tracking-[0.18em] text-mist/60">
          Camera-first form coaching
        </p>
      </div>
    </div>
  );
}
