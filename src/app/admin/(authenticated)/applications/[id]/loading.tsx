export default function ApplicationDetailLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gray-200" />
        <div className="space-y-1.5">
          <div className="h-5 w-24 rounded bg-gray-200" />
          <div className="h-3 w-32 rounded bg-gray-100" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <div className="h-3 w-16 rounded bg-gray-100" />
                <div className="h-4 w-full rounded bg-gray-200" />
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
          <div className="h-4 w-20 rounded bg-gray-200" />
          <div className="h-9 w-full rounded bg-gray-100" />
          <div className="h-9 w-full rounded bg-gray-100" />
        </div>
      </div>
    </div>
  );
}
