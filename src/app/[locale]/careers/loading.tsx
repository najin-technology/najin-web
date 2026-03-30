export default function CareersLoading() {
  return (
    <>
      <div className="bg-brand-navy py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-9 w-40 bg-white/20 rounded animate-pulse" />
        </div>
      </div>
      <div className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="h-7 w-40 bg-gray-200 rounded animate-pulse mb-6" />
          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-white rounded-lg border border-gray-200 p-6"
            >
              <div className="h-5 w-1/2 bg-gray-200 rounded animate-pulse mb-3" />
              <div className="flex gap-2">
                <div className="h-5 w-16 bg-gray-100 rounded animate-pulse" />
                <div className="h-5 w-16 bg-gray-100 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
