function StatsCards({ stats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {stats.map((stat, index) => (
        <div key={index} className={`${stat.bgClass} rounded-lg p-4 border ${stat.borderClass}`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`font-semibold ${stat.titleClass}`}>{stat.title}</h3>
              <p className={`text-2xl font-bold mt-1 ${stat.countClass}`}>{stat.count}</p>
            </div>
            <stat.icon className={`w-8 h-8 ${stat.iconClass}`} />
          </div>
        </div>
      ))}
    </div>
  )
}

export default StatsCards