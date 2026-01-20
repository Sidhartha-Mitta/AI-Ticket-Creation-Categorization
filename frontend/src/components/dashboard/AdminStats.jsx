import { BarChart3 } from 'lucide-react'

function AdminStats({ adminLoading, adminStats }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">System Statistics</h2>
        {adminLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
            <span className="ml-3 text-gray-600">Loading statistics...</span>
          </div>
        ) : adminStats ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h3 className="font-semibold text-blue-900">Total Tickets</h3>
              <p className="text-2xl font-bold text-blue-600 mt-1">{adminStats.total_tickets || 0}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <h3 className="font-semibold text-green-900">Completed</h3>
              <p className="text-2xl font-bold text-green-600 mt-1">{adminStats.tickets_by_status?.Completed || 0}</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
              <h3 className="font-semibold text-orange-900">In Progress</h3>
              <p className="text-2xl font-bold text-orange-600 mt-1">{adminStats.tickets_by_status?.['In-Process'] || 0}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <h3 className="font-semibold text-purple-900">Submitted</h3>
              <p className="text-2xl font-bold text-purple-600 mt-1">{adminStats.tickets_by_status?.Submitted || 0}</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No statistics available</p>
            <p className="text-sm text-gray-400 mt-2">Stats data: {JSON.stringify(adminStats)}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminStats