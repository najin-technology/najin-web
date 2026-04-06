export default function BusinessLoading() {
  return (
    <>
      <div className="relative bg-brand-navy py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-9 w-32 bg-white/20 rounded animate-pulse" />
          <div className="h-5 w-64 bg-white/10 rounded animate-pulse mt-3" />
        </div>
      </div>
      <div className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {[1, 2, 3].map((i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className={`h-64 bg-gray-200 rounded-xl animate-pulse ${i % 2 === 0 ? "md:order-2" : ""}`} />
              <div className="space-y-4">
                <div className="h-7 w-48 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
                <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
                <div className="h-4 w-2/3 bg-gray-100 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
