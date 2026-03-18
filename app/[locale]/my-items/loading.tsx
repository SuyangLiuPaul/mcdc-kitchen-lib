export default function MyItemsLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-pulse">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="h-8 bg-gray-200 rounded-lg w-36 mb-2" />
          <div className="h-4 bg-gray-100 rounded w-64" />
        </div>
      </div>
      <div className="flex justify-end mb-4">
        <div className="h-9 bg-gray-200 rounded-lg w-32" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="h-40 bg-gray-200" />
            <div className="p-4 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-100 rounded w-1/4" />
              <div className="h-7 bg-gray-100 rounded-lg mt-3" />
              <div className="flex gap-2 mt-2">
                <div className="flex-1 h-8 bg-gray-100 rounded-lg" />
                <div className="flex-1 h-8 bg-gray-100 rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
