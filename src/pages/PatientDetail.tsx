import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  ArrowLeft,
  Phone,
  Mail,
  Calendar,
  FileText,
  Plus,
  Loader2,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useMedicalRecords } from "@/hooks/useMedicalRecords";
import { MedicalRecordFormDialog } from "@/components/records/MedicalRecordFormDialog";
import { MedicalRecordCard } from "@/components/records/MedicalRecordCard";
import type { Patient, MedicalRecordFormData } from "@/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

export default function PatientDetail() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [recordDialogOpen, setRecordDialogOpen] = useState(false);

  const { records, loading: recordsLoading, addRecord } = useMedicalRecords(patientId);

  useEffect(() => {
    if (!patientId) return;

    const fetchPatient = async () => {
      try {
        const docSnap = await getDoc(doc(db, "patients", patientId));
        if (docSnap.exists()) {
          setPatient({ id: docSnap.id, ...docSnap.data() } as Patient);
        }
      } catch (error) {
        console.error("Error fetching patient:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [patientId]);

  const handleAddRecord = async (data: MedicalRecordFormData) => {
    try {
      await addRecord(data);
      toast({
        title: "Prontuário criado",
        description: "O prontuário foi adicionado com sucesso.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível criar o prontuário.",
      });
      throw error;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <User className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Paciente não encontrado</p>
        <Button variant="link" onClick={() => navigate("/patients")}>
          Voltar para lista
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/patients")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground">{patient.name}</h1>
          <p className="text-sm text-muted-foreground">Detalhes do paciente</p>
        </div>
      </div>

      {/* Patient Info Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={patient.photoUrl} alt={patient.name} />
              <AvatarFallback className="bg-primary/10 text-primary text-lg font-medium">
                {getInitials(patient.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <h2 className="text-lg font-semibold">{patient.name}</h2>
              <div className="flex flex-wrap gap-2">
                {patient.tags?.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{patient.phone}</span>
            </div>
            {patient.email && (
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{patient.email}</span>
              </div>
            )}
            {patient.dateOfBirth && (
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  {format(new Date(patient.dateOfBirth), "dd 'de' MMMM 'de' yyyy", {
                    locale: ptBR,
                  })}
                </span>
              </div>
            )}
          </div>

          {patient.notes && (
            <>
              <Separator className="my-4" />
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Observações
                </p>
                <p className="text-sm">{patient.notes}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Medical Records Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Prontuários</h2>
            <Badge variant="secondary">{records.length}</Badge>
          </div>
          <Button size="sm" onClick={() => setRecordDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Novo
          </Button>
        </div>

        {recordsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : records.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-muted-foreground text-sm text-center">
                Nenhum prontuário registrado
              </p>
              <Button
                variant="link"
                size="sm"
                onClick={() => setRecordDialogOpen(true)}
              >
                Criar primeiro prontuário
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {records.map((record) => (
              <MedicalRecordCard key={record.id} record={record} />
            ))}
          </div>
        )}
      </div>

      {/* Medical Record Form Dialog */}
      <MedicalRecordFormDialog
        open={recordDialogOpen}
        onOpenChange={setRecordDialogOpen}
        onSubmit={handleAddRecord}
      />
    </div>
  );
}
