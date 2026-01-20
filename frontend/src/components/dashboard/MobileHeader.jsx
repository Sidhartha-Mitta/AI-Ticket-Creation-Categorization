import { Menu, X, Ticket } from 'lucide-react'

function MobileHeader({ sidebarOpen, setSidebarOpen }) {
  return (
    <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 p-4 flex items-center justify-between">
      <div className="flex items-center">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
          <Ticket className="w-4 h-4 text-white" />
        </div>
        <h1 className="text-lg font-bold text-gray-900">AI Support</h1>
      </div>
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>
    </div>
  )
}

export default MobileHeader