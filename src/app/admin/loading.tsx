import LoadingSpinner from '@/components/ui/loading'

export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Sidebar skeleton */}
        <div className="w-64 bg-gray-800 min-h-screen">
          <div className="p-6">
            <div className="h-8 bg-gray-700 rounded w-32 mb-8"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-10 bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>

        {/* Main content skeleton */}
        <div className="flex-1 p-8">
          <div className="animate-pulse space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div className="space-y-2">
                <div className="h-8 bg-gray-300 rounded w-48"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </div>
              <div className="h-10 bg-blue-300 rounded w-32"></div>
            </div>

            {/* Content cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow">
                  <div className="space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-20 bg-gray-100 rounded"></div>
                    <div className="flex justify-between">
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
