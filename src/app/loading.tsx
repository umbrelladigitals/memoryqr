import LoadingSpinner from '@/components/ui/loading'

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="text-center space-y-4">
        <LoadingSpinner size="xl" />
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-800">Yükleniyor...</h3>
          <p className="text-gray-600">Lütfen bekleyin</p>
        </div>
      </div>
    </div>
  )
}
