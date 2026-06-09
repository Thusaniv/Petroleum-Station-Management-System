import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';
import { Home, Building2, Factory } from 'lucide-react';

const typeConfig = {
  domestic: { 
    label: 'Domestic', 
    icon: Home, 
    className: 'bg-primary/10 text-primary border-primary/20' 
  },
  commercial: { 
    label: 'Commercial', 
    icon: Building2, 
    className: 'bg-secondary/20 text-secondary-foreground border-secondary/30' 
  },
  industrial: { 
    label: 'Industrial', 
    icon: Factory, 
    className: 'bg-accent/20 text-accent-foreground border-accent/30' 
  },
};

export function ConnectionTypeBadge({ type, showIcon = true, className }) {
  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <Badge 
      variant="outline" 
      className={cn('font-medium gap-1.5', config.className, className)}
    >
      {showIcon && <Icon className="h-3.5 w-3.5" />}
      {config.label}
    </Badge>
  );
}
