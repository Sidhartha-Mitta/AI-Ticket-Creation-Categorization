function EmptyState({ icon: Icon, message, subMessage }) {
  return (
    <div className="text-center py-12">
      <Icon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <p className="text-gray-500">{message}</p>
      {subMessage && <p className="text-sm text-gray-400 mt-2">{subMessage}</p>}
    </div>
  )
}

export default EmptyState