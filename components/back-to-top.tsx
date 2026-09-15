"use client";

export function BackToTop() {
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="block w-full bg-nav-3 py-[15px] text-center text-[13px] leading-[19px] text-white transition-colors duration-150 ease-(--ease-amzn) hover:bg-[#485769] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white"
    >
      Back to top
    </button>
  );
}
