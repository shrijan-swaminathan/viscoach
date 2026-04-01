export function BrandMark({
  compact = false
}: {
  compact?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-11 w-11 place-items-center rounded-2xl border border-lime/40 bg-lime/10 shadow-glow">
        <span className="font-display text-lg font-semibold text-lime">V</span>
      </div>
      <div className={compact ? "hidden sm:block" : ""}>
        <p className="font-display text-lg font-semibold text-white">VisCoach</p>
        <p className="text-xs uppercase tracking-[0.28em] text-mist/60">
          Camera-first form coaching
        </p>
      </div>
    </div>
  );
}
