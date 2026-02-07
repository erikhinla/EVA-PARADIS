"use client";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-nero px-4 pb-8 pt-4" aria-label="Footer">
      <div className="mx-auto max-w-lg text-center">
        <div className="mb-4 h-px w-full bg-gradient-to-r from-transparent via-white/5 to-transparent" />

        <p className="text-[10px] leading-relaxed text-cream/15">
          This site contains links to age-restricted content. By proceeding,
          you confirm you are 18+ and agree to view adult content. All content
          is produced by consenting adults.
        </p>

        <p className="mt-3 text-[9px] uppercase tracking-[0.2em] text-cream/10">
          &copy; {year} Eva Paradis
        </p>
      </div>
    </footer>
  );
}
