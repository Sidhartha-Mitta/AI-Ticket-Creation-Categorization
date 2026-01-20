function LoadingSpinner({ message }) {
  return (
    <div className="text-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
      <p className="text-gray-500">{message}</p>
    </div>
  )
}

export default LoadingSpinner