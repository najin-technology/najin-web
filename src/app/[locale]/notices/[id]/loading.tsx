export default function NoticeDetailLoading() {
  return (
    <>
      <div className="bg-[#1B2A4A] py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-8 w-2/3 bg-white/20 rounded animate-pulse mb-3" />
          <div className="h-4 w-32 bg-white/10 rounded animate-pulse" />
        </div>
      </div>
      <div className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-4/6 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    </>
  );
}
