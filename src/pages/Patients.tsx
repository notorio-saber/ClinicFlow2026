import { Users, Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FloatingActionButton } from "@/components/layout/FloatingActionButton";

export default function Patients() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pacientes</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gerencie os pacientes da sua clínica
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar paciente..."
          className="pl-10"
        />
      </div>

      {/* Empty State */}
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Users className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Nenhum paciente cadastrado
        </h3>
        <p className="text-muted-foreground text-sm max-w-xs mb-6">
          Comece cadastrando seu primeiro paciente para gerenciar prontuários e procedimentos.
        </p>
        <Button className="gradient-primary text-white">
          <Plus className="h-4 w-4 mr-2" />
          Cadastrar Paciente
        </Button>
      </div>

      {/* FAB */}
      <FloatingActionButton to="/patients/new" />
    </div>
  );
}
