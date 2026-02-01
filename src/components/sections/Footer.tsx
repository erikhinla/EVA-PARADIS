"use client";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-nero px-4 py-8" aria-label="Footer">
      <div className="mx-auto max-w-lg text-center">
        <p className="text-[10px] leading-relaxed text-cream/20">
          This site contains links to age-restricted content. By proceeding,
          you confirm you are 18+ and agree to view adult content. All content
          is produced by consenting adults.
        </p>

        <p className="mt-4 text-[9px] uppercase tracking-widest text-cream/10">
          &copy; {year} Eva Paradis.
        </p>
      </div>
    </footer>
  );
}
