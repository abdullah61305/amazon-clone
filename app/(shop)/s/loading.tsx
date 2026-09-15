export default function Loading() {
  return (
    <div className="flex flex-1 flex-col bg-white" aria-busy="true" aria-label="Loading results">
      <div className="flex items-center justify-between border-b border-line px-3 py-[10px] sm:px-5">
        <div className="skeleton h-4 w-56" />
        <div className="skeleton h-7 w-36 rounded-lg" />
      </div>
      <div className="flex gap-6 px-3 sm:px-5">
        <div className="hidden w-[230px] shrink-0 space-y-5 py-4 lg:block">
          {[5, 3, 6, 4].map((n, i) => (
            <div key={i} className="space-y-2">
              <div className="skeleton h-4 w-28" />
              {Array.from({ length: n }, (_, j) => (
                <div key={j} className="skeleton h-3 w-40" />
              ))}
            </div>
          ))}
        </div>
        <div className="flex-1 py-4">
          <div className="skeleton mb-4 h-6 w-24" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="flex gap-3 sm:flex-col">
                <div className="skeleton aspect-square w-[42%] shrink-0 sm:w-full" />
                <div className="flex-1 space-y-2 sm:pt-2">
                  <div className="skeleton h-4 w-full" />
                  <div className="skeleton h-4 w-3/4" />
                  <div className="skeleton h-3 w-1/2" />
                  <div className="skeleton h-7 w-24" />
                  <div className="skeleton h-8 w-28 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
