export default function HistoryLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-6 w-32 bg-gray-200 rounded" />
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4 items-center">
            <div className="h-4 w-16 bg-gray-100 rounded" />
            <div className="h-4 w-48 bg-gray-100 rounded" />
            <div className="h-4 w-24 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
