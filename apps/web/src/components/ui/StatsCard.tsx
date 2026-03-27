interface StatsCardProps {
  icon: string;
  label: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
  className?: string;
}

export default function StatsCard({
  icon,
  label,
  value,
  trend,
  trendUp,
  className = '',
}: StatsCardProps) {
  return (
    <div
      className={`
        rounded-2xl border border-dark-700/50 bg-dark-800/50 backdrop-blur-xl p-6
        hover:border-primary-500/20 transition-all duration-300
        ${className}
      `}
    >
      <div className="flex items-start justify-between mb-4">
        <span className="text-2xl">{icon}</span>
        {trend && (
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              trendUp
                ? 'bg-secondary-500/10 text-secondary-400'
                : 'bg-red-500/10 text-red-400'
            }`}
          >
            {trend}
          </span>
        )}
      </div>
      <p className="text-3xl font-bold text-white mb-1">{value}</p>
      <p className="text-sm text-dark-400">{label}</p>
    </div>
  );
}
