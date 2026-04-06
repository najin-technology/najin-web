export default function FaqLoading() {
  return (
    <>
      <div className="relative bg-brand-navy py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-9 w-40 bg-white/20 rounded animate-pulse" />
          <div className="h-5 w-64 bg-white/10 rounded animate-pulse mt-3" />
        </div>
      </div>
      <div className="py-12 md:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-5">
              <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
