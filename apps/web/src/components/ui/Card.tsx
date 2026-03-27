interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const paddings = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export default function Card({
  children,
  className = '',
  hover = false,
  glow = false,
  padding = 'md',
  onClick,
}: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        rounded-2xl border border-dark-700/50
        bg-dark-800/50 backdrop-blur-xl
        ${paddings[padding]}
        ${hover ? 'hover:bg-dark-800/70 hover:border-primary-500/30 cursor-pointer transition-all duration-300 hover:-translate-y-0.5' : ''}
        ${glow ? 'glow-primary' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
