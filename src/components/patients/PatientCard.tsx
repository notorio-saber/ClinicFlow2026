import { User, Phone, Calendar, ChevronRight, MoreVertical, Trash2, Edit } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Patient } from "@/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PatientCardProps {
  patient: Patient;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function PatientCard({ patient, onClick, onEdit, onDelete }: PatientCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors">
      <Avatar className="h-12 w-12" onClick={onClick}>
        <AvatarImage src={patient.photoUrl} alt={patient.name} />
        <AvatarFallback className="bg-primary/10 text-primary font-medium">
          {getInitials(patient.name)}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0 cursor-pointer" onClick={onClick}>
        <h3 className="font-medium text-foreground truncate">{patient.name}</h3>
        <div className="flex items-center gap-3 mt-1">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Phone className="h-3 w-3" />
            {patient.phone}
          </span>
          {patient.dateOfBirth && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {formatDate(patient.dateOfBirth)}
            </span>
          )}
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="shrink-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onDelete} className="text-destructive">
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button variant="ghost" size="icon" onClick={onClick} className="shrink-0">
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      </Button>
    </div>
  );
}
