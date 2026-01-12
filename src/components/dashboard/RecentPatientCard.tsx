import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface RecentPatientCardProps {
  name: string;
  lastProcedure?: string;
  lastVisitDate?: Date;
  avatarUrl?: string;
  onClick?: () => void;
}

export function RecentPatientCard({
  name,
  lastProcedure,
  lastVisitDate,
  onClick,
}: RecentPatientCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getDaysSinceVisit = (date?: Date) => {
    if (!date) return null;
    const now = new Date();
    const diff = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diff;
  };

  const daysSince = getDaysSinceVisit(lastVisitDate);

  const getBadgeVariant = (days: number | null) => {
    if (days === null) return "secondary";
    if (days <= 7) return "default";
    if (days <= 30) return "secondary";
    return "outline";
  };

  return (
    <Card
      className="cursor-pointer hover:bg-muted/50 transition-colors border-border/50"
      onClick={onClick}
    >
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary/10 text-primary text-sm">
              {getInitials(name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground truncate">{name}</p>
            {lastProcedure && (
              <p className="text-xs text-muted-foreground truncate">
                {lastProcedure}
              </p>
            )}
          </div>

          {daysSince !== null && (
            <Badge variant={getBadgeVariant(daysSince)} className="shrink-0">
              {daysSince === 0
                ? "Hoje"
                : daysSince === 1
                ? "Ontem"
                : `${daysSince}d`}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
