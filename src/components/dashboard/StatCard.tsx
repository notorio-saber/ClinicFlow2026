import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatCardVariant = "neutral" | "warning" | "danger" | "success";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: StatCardVariant;
}

const variantClasses: Record<StatCardVariant, string> = {
  neutral: "stat-card-neutral",
  warning: "stat-card-warning",
  danger: "stat-card-danger",
  success: "stat-card-success",
};

const iconColors: Record<StatCardVariant, string> = {
  neutral: "text-muted-foreground",
  warning: "text-yellow-500",
  danger: "text-red-500",
  success: "text-green-500",
};

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = "neutral",
}: StatCardProps) {
  return (
    <Card className={cn("border-0", variantClasses[variant])}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              {title}
            </p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div
            className={cn(
              "h-10 w-10 rounded-full flex items-center justify-center bg-background/50",
              iconColors[variant]
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
