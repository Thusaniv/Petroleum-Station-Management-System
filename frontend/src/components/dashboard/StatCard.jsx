import { cn } from '../../lib/utils';

const variantStyles = {
  default: 'bg-black/40 backdrop-blur-md border-white/10',
  primary: 'bg-yellow-500/10 backdrop-blur-md border-yellow-500/20',
  success: 'bg-emerald-500/10 backdrop-blur-md border-emerald-500/20',
  warning: 'bg-orange-500/10 backdrop-blur-md border-orange-500/20',
  danger: 'bg-rose-500/10 backdrop-blur-md border-rose-500/20',
};

const iconStyles = {
  default: 'bg-white/10 text-white',
  primary: 'bg-yellow-500/20 text-yellow-400',
  success: 'bg-emerald-500/20 text-emerald-400',
  warning: 'bg-orange-500/20 text-orange-400',
  danger: 'bg-rose-500/20 text-rose-400',
};

export function StatCard({ title, value, subtitle, icon: Icon, trend, variant = 'default' }) {
  return (
    <div
      className={cn(
        'stat-card rounded-xl border p-6 transition-all duration-300 hover:shadow-lg hover:shadow-white/5',
        variantStyles[variant]
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-yellow-200/80">{title}</p>
          <p className="text-3xl font-bold tracking-tight text-white">{value}</p>
          {subtitle && <p className="text-sm text-yellow-200/60">{subtitle}</p>}
          {trend && (
            <div className="flex items-center gap-1">
              <span
                className={cn(
                  'text-sm font-medium',
                  trend.isPositive ? 'text-emerald-400' : 'text-rose-400'
                )}
              >
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
              <span className="text-xs text-yellow-200/40">vs last month</span>
            </div>
          )}
        </div>
        <div className={cn('rounded-xl p-3', iconStyles[variant])}>
          {Icon && <Icon className="h-6 w-6" />}
        </div>
      </div>
    </div>
  );
}
