import { User } from 'lucide-react'

function ProfileView({ user }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h2>
      <div className="space-y-6">
        <div className="flex items-center space-x-6">
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{user.username}</h3>
            <p className="text-gray-600 capitalize">{user.role || 'User'}</p>
            {user.role === 'support' && user.supportCategory && (
              <p className="text-sm text-gray-500">Category: {user.supportCategory}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
            <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{user.username}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{user.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md capitalize">{user.role || 'User'}</p>
          </div>
          {user.role === 'support' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Support Category</label>
              <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{user.supportCategory || 'Not assigned'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProfileView