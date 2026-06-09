import { cn } from '../../lib/utils';

export function PageHeader({ title, description, children, className }) {
  return (
    <div className={cn('flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4 bg-black/40 backdrop-blur-lg border border-white/10 p-4 rounded-2xl shadow-lg', className)}>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">{title}</h1>
        {description && (
          <p className="mt-1 text-blue-200/80">{description}</p>
        )}
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </div>
  );
}
