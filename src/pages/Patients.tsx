import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FloatingActionButton } from "@/components/layout/FloatingActionButton";
import { PatientCard } from "@/components/patients/PatientCard";
import { PatientFormDialog } from "@/components/patients/PatientFormDialog";
import { usePatients } from "@/hooks/usePatients";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Patient, PatientFormData } from "@/types";

export default function Patients() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { patients, loading, addPatient, updatePatient, deletePatient, searchPatients } = usePatients();
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [deletePatientId, setDeletePatientId] = useState<string | null>(null);

  const filteredPatients = searchPatients(searchTerm);

  const handleSubmit = async (data: PatientFormData) => {
    try {
      if (editingPatient) {
        await updatePatient(editingPatient.id, data);
        toast({ title: "Paciente atualizado" });
      } else {
        await addPatient(data);
        toast({ title: "Paciente cadastrado" });
      }
      setEditingPatient(null);
    } catch (error) {
      toast({ variant: "destructive", title: "Erro ao salvar paciente" });
      throw error;
    }
  };

  const handleDelete = async () => {
    if (!deletePatientId) return;
    try {
      await deletePatient(deletePatientId);
      toast({ title: "Paciente excluído" });
    } catch (error) {
      toast({ variant: "destructive", title: "Erro ao excluir" });
    } finally {
      setDeletePatientId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pacientes</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gerencie os pacientes da sua clínica
          </p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar paciente..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredPatients.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {searchTerm ? "Nenhum paciente encontrado" : "Nenhum paciente cadastrado"}
          </h3>
          <p className="text-muted-foreground text-sm max-w-xs mb-6">
            {searchTerm ? "Tente outro termo de busca" : "Comece cadastrando seu primeiro paciente."}
          </p>
          {!searchTerm && (
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Cadastrar Paciente
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPatients.map((patient) => (
            <PatientCard
              key={patient.id}
              patient={patient}
              onClick={() => navigate(`/patients/${patient.id}`)}
              onEdit={() => { setEditingPatient(patient); setDialogOpen(true); }}
              onDelete={() => setDeletePatientId(patient.id)}
            />
          ))}
        </div>
      )}

      <FloatingActionButton onClick={() => setDialogOpen(true)} />

      <PatientFormDialog
        open={dialogOpen}
        onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditingPatient(null); }}
        patient={editingPatient}
        onSubmit={handleSubmit}
      />

      <AlertDialog open={!!deletePatientId} onOpenChange={() => setDeletePatientId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir paciente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Todos os prontuários serão mantidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
