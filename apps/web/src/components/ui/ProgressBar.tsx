interface ProgressBarProps {
  progress: number;
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'accent';
}

const colors = {
  primary: 'bg-primary-500',
  secondary: 'bg-secondary-500',
  accent: 'bg-accent-500',
};

const glowColors = {
  primary: 'shadow-primary-500/50',
  secondary: 'shadow-secondary-500/50',
  accent: 'shadow-accent-500/50',
};

const heights = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

export default function ProgressBar({
  progress,
  className = '',
  showLabel = true,
  size = 'md',
  color = 'primary',
}: ProgressBarProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className={className}>
      {showLabel && (
        <div className="flex justify-between mb-2">
          <span className="text-sm text-dark-400">Progress</span>
          <span className="text-sm font-medium text-white">
            {Math.round(clampedProgress)}%
          </span>
        </div>
      )}
      <div className={`w-full ${heights[size]} bg-dark-700 rounded-full overflow-hidden`}>
        <div
          className={`
            ${heights[size]} ${colors[color]} rounded-full
            transition-all duration-500 ease-out
            shadow-lg ${glowColors[color]}
          `}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
}
