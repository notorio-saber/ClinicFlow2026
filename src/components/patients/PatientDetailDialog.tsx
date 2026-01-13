import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Phone, Mail, Calendar, FileText, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Patient } from "@/types";

interface PatientDetailDialogProps {
  patient: Patient | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PatientDetailDialog({
  patient,
  open,
  onOpenChange,
}: PatientDetailDialogProps) {
  if (!patient) return null;

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
      return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  const calculateAge = (dateOfBirth: string) => {
    try {
      const today = new Date();
      const birthDate = new Date(dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return `${age} anos`;
    } catch {
      return "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="sr-only">Ficha do Paciente</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-100px)]">
          <div className="space-y-6 pr-4">
            {/* Header com Avatar e Nome */}
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={patient.photoUrl} alt={patient.name} />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-medium">
                  {getInitials(patient.name)}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold text-foreground">{patient.name}</h2>
              {patient.dateOfBirth && (
                <p className="text-sm text-muted-foreground">
                  {calculateAge(patient.dateOfBirth)}
                </p>
              )}
              {patient.tags && patient.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 justify-center mt-2">
                  {patient.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {/* Informações de Contato */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Contato
              </h3>
              
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Phone className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Telefone</p>
                    <p className="font-medium">{patient.phone}</p>
                  </div>
                </div>

                {patient.email && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Mail className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="font-medium">{patient.email}</p>
                    </div>
                  </div>
                )}

                {patient.dateOfBirth && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Calendar className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Data de Nascimento</p>
                      <p className="font-medium">{formatDate(patient.dateOfBirth)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Observações */}
            {patient.notes && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Observações
                  </h3>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <FileText className="h-4 w-4 text-primary mt-0.5" />
                    <p className="text-sm text-foreground whitespace-pre-wrap">{patient.notes}</p>
                  </div>
                </div>
              </>
            )}

            {/* Data de Cadastro */}
            <Separator />
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <User className="h-3 w-3" />
              <span>Cadastrado em {formatDate(patient.createdAt)}</span>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
