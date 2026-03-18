export default function HomeLoading() {
  return (
    <div className="animate-pulse">
      {/* Hero skeleton */}
      <div className="bg-gradient-to-br from-indigo-50 via-white to-blue-50 border-b border-indigo-100 py-14 px-6 text-center">
        <div className="h-10 bg-indigo-100 rounded-xl w-64 mx-auto mb-4" />
        <div className="h-5 bg-indigo-50 rounded-lg w-80 mx-auto" />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters skeleton */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <div className="flex-1 h-12 bg-gray-200 rounded-xl" />
          <div className="w-48 h-12 bg-gray-200 rounded-xl" />
        </div>
        <div className="h-4 bg-gray-100 rounded w-28 mt-3" />

        {/* Cards skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="h-52 bg-gray-200" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/3 mt-1" />
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                  <div className="w-5 h-5 bg-gray-200 rounded-full" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
