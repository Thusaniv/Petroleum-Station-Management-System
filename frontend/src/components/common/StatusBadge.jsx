import { Badge } from "../ui/badge";
import { cn } from '../../lib/utils';

const statusConfig = {
  active: { label: 'Active', variant: 'default', className: 'bg-success/10 text-success border-success/20 hover:bg-success/20' },
  suspended: { label: 'Suspended', variant: 'secondary', className: 'bg-warning/10 text-warning border-warning/20 hover:bg-warning/20' },
  disconnected: { label: 'Disconnected', variant: 'destructive', className: 'bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20' },
  faulty: { label: 'Faulty', variant: 'destructive', className: 'bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20' },
  replaced: { label: 'Replaced', variant: 'secondary', className: 'bg-muted text-muted-foreground' },
  pending: { label: 'Pending', variant: 'outline', className: 'bg-warning/10 text-warning border-warning/20 hover:bg-warning/20' },
  paid: { label: 'Paid', variant: 'default', className: 'bg-success/10 text-success border-success/20 hover:bg-success/20' },
  overdue: { label: 'Overdue', variant: 'destructive', className: 'bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20' },
  partial: { label: 'Partial', variant: 'secondary', className: 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20' },
};

export function StatusBadge({ status, className }) {
  const config = statusConfig[status];
  
  return (
    <Badge 
      variant={config.variant} 
      className={cn('font-medium', config.className, className)}
    >
      {config.label}
    </Badge>
  );
}
