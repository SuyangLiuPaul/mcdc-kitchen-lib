export default function AdminLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
      <div className="h-8 bg-gray-200 rounded-lg w-48 mb-8" />
      <div className="space-y-10">
        {[0, 1].map((s) => (
          <section key={s}>
            <div className="h-6 bg-gray-200 rounded w-28 mb-4" />
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="h-10 bg-gray-50" />
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-4 px-4 py-3 border-t border-gray-100">
                  <div className="flex-1 h-4 bg-gray-100 rounded" />
                  <div className="w-20 h-4 bg-gray-100 rounded" />
                  <div className="w-16 h-4 bg-gray-100 rounded" />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
