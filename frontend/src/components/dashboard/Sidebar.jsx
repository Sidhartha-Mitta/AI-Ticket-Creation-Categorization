import { LogOut, Ticket } from 'lucide-react'

function Sidebar({ sidebarItems, dashboardView, setDashboardView, setSidebarOpen, onLogout, sidebarOpen }) {
  return (
    <div className={`w-full lg:w-64 bg-white shadow-lg border-r border-gray-200 lg:h-screen lg:fixed lg:left-0 lg:top-0 transition-transform duration-300 ease-in-out ${
      sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
    } ${sidebarOpen ? 'fixed inset-0 z-50 lg:relative lg:inset-auto lg:z-auto' : ''}`}>
      <div className="p-6">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
            <Ticket className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">AI Ticket</h1>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Dashboard</p>
          </div>
        </div>
      </div>
      <nav className="mt-6">
        {sidebarItems.map(item => {
          const IconComponent = item.icon
          return (
            <button
              key={item.key}
              onClick={() => {
                setDashboardView(item.key)
                setSidebarOpen(false) // Close sidebar on mobile after selection
              }}
              className={`w-full text-left px-6 py-3 hover:bg-gray-100 flex items-center transition-colors duration-200 ${dashboardView === item.key ? 'bg-blue-50 border-r-4 border-blue-500' : ''}`}
            >
              <IconComponent className={`mr-3 w-5 h-5 ${dashboardView === item.key ? 'text-blue-600' : 'text-gray-500'}`} />
              <span className={`font-medium ${dashboardView === item.key ? 'text-blue-900' : 'text-gray-700'}`}>{item.label}</span>
            </button>
          )
        })}
        <div className="border-t border-gray-200 mt-6 mb-4"></div>
        <button
          onClick={() => {
            onLogout()
            setSidebarOpen(false)
          }}
          className="w-full text-left px-6 py-3 hover:bg-red-50 flex items-center text-red-600 hover:text-red-700 transition-colors duration-200"
        >
          <LogOut className="mr-3 w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </nav>
    </div>
  )
}

export default Sidebar