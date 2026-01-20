import { useState } from 'react'
import { Ticket, Sparkles, Shield, Zap } from 'lucide-react'

function LoginPage({ onLogin, onSignup, error }) {
  const [currentView, setCurrentView] = useState('login')
  const [loginData, setLoginData] = useState({ username: '', password: '' })
  const [signupData, setSignupData] = useState({ username: '', email: '', password: '' })

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      await onLogin(loginData)
    } catch (err) {
      console.error('Login failed')
    }
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    try {
      await onSignup(signupData)
    } catch (err) {
      console.error('Signup failed')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <header className="text-center">
          <div className="mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Ticket className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Support System</h1>
          <p className="text-gray-600">Sign in to access your support dashboard</p>
        </header>

        {currentView === 'login' ? (
          <form onSubmit={handleLogin} className="bg-white rounded-lg shadow-lg p-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={loginData.username}
                  onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white rounded-lg py-3 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 font-medium"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setCurrentView('signup')}
                className="w-full text-blue-600 hover:text-blue-500 font-medium transition-colors duration-200"
              >
                Create an account
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSignup} className="bg-white rounded-lg shadow-lg p-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="signup-username" className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <input
                  id="signup-username"
                  type="text"
                  value={signupData.username}
                  onChange={(e) => setSignupData({ ...signupData, username: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={signupData.email}
                  onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  id="signup-password"
                  type="password"
                  value={signupData.password}
                  onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white rounded-lg py-3 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 font-medium"
              >
                Create Account
              </button>
              <button
                type="button"
                onClick={() => setCurrentView('login')}
                className="w-full text-blue-600 hover:text-blue-500 font-medium transition-colors duration-200"
              >
                Already have an account?
              </button>
            </div>
          </form>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}

export default LoginPage