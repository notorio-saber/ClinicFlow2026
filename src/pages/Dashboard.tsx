import { Users, Calendar, AlertCircle, Activity, ChevronRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePatients } from "@/hooks/usePatients";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentPatientCard } from "@/components/dashboard/RecentPatientCard";
import { FloatingActionButton } from "@/components/layout/FloatingActionButton";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const { patients, loading } = usePatients();
  const navigate = useNavigate();

  const firstName = user?.displayName?.split(" ")[0] || "Usuário";

  // Últimos 4 pacientes
  const recentPatients = patients.slice(0, 4).map(patient => ({
    id: patient.id,
    name: patient.name,
    lastProcedure: patient.notes || "Sem procedimentos",
    lastVisitDate: new Date(patient.updatedAt || patient.createdAt),
  }));

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Olá, {firstName}! 👋
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Aqui está o resumo da sua clínica
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          title="Pacientes"
          value={patients.length}
          subtitle="Total cadastrados"
          icon={Users}
          variant="neutral"
        />
        <StatCard
          title="Agenda Hoje"
          value={0}
          subtitle="Procedimentos"
          icon={Calendar}
          variant="warning"
        />
        <StatCard
          title="Pendências"
          value={0}
          subtitle="Retornos atrasados"
          icon={AlertCircle}
          variant="danger"
        />
        <StatCard
          title="Procedimentos"
          value={0}
          subtitle="Este mês"
          icon={Activity}
          variant="success"
        />
      </div>

      {/* Recent Patients Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            Últimos Pacientes
          </h2>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/patients" className="text-primary text-sm">
              Ver todos
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : recentPatients.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhum paciente cadastrado</p>
            <Button 
              variant="link" 
              className="mt-2"
              onClick={() => navigate("/patients")}
            >
              Cadastrar primeiro paciente
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {recentPatients.map((patient) => (
              <RecentPatientCard
                key={patient.id}
                name={patient.name}
                lastProcedure={patient.lastProcedure}
                lastVisitDate={patient.lastVisitDate}
                onClick={() => navigate(`/patients/${patient.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <FloatingActionButton onClick={() => navigate("/patients")} />
    </div>
  );
}
