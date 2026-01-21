import { useState, useEffect } from 'react'
import './App.css'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import useAuthStore from './stores/authStore'
import useTicketsStore from './stores/ticketsStore'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import LandingPage from './pages/LandingPage'

function App() {
  const { isAuthenticated, user, login, signup, logout, error: authError } = useAuthStore()
  const { tickets, loading, error, fetchTickets, createTicket } = useTicketsStore()
  const [dashboardView, setDashboardView] = useState('home')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [showLogin, setShowLogin] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      fetchTickets()
    }
  }, [isAuthenticated])

  const generateTicket = async () => {
    if (!title.trim() || !description.trim()) return

    try {
      await createTicket({ title, description })
      setTitle('')
      setDescription('')
      setDashboardView('my-tickets') // Redirect to tickets page
      toast.success('Ticket created successfully!')
    } catch (err) {
      console.error('Error:', err)
      // Handle specific error messages from backend
      const errorMessage = err.detail || err.message || 'Failed to create ticket. Please try again.'
      toast.error(errorMessage)
    }
  }

  const handleLogout = () => {
    logout()
  }

  const handleGetStarted = () => {
    setShowLogin(true)
  }

  if (!isAuthenticated) {
    if (showLogin) {
      return <LoginPage onLogin={login} onSignup={signup} error={authError} />
    }
    return <LandingPage onGetStarted={handleGetStarted} />
  }

  if (!user) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center space-x-4">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
          <div className="text-gray-900 font-medium">Loading your dashboard...</div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <DashboardPage
        user={user}
        tickets={tickets}
        dashboardView={dashboardView}
        setDashboardView={setDashboardView}
        title={title}
        setTitle={setTitle}
        description={description}
        setDescription={setDescription}
        generateTicket={generateTicket}
        loading={loading}
        error={error}
        onLogout={handleLogout}
      />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  )
}

export default App