import { Users, Calendar, AlertCircle, Activity, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentPatientCard } from "@/components/dashboard/RecentPatientCard";
import { FloatingActionButton } from "@/components/layout/FloatingActionButton";
import { Button } from "@/components/ui/button";

// Dados mock para demonstração
const mockPatients = [
  {
    id: "1",
    name: "Maria Silva Santos",
    lastProcedure: "Botox - Região frontal",
    lastVisitDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 dias atrás
  },
  {
    id: "2",
    name: "João Carlos Oliveira",
    lastProcedure: "Preenchimento labial",
    lastVisitDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 dias atrás
  },
  {
    id: "3",
    name: "Ana Paula Ferreira",
    lastProcedure: "Harmonização facial",
    lastVisitDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12), // 12 dias atrás
  },
  {
    id: "4",
    name: "Carlos Eduardo Lima",
    lastProcedure: "Bioestimulador",
    lastVisitDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30), // 30 dias atrás
  },
];

export default function Dashboard() {
  const { user } = useAuth();

  const firstName = user?.displayName?.split(" ")[0] || "Usuário";

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
          value={128}
          subtitle="Total cadastrados"
          icon={Users}
          variant="neutral"
        />
        <StatCard
          title="Agenda Hoje"
          value={5}
          subtitle="Procedimentos"
          icon={Calendar}
          variant="warning"
        />
        <StatCard
          title="Pendências"
          value={3}
          subtitle="Retornos atrasados"
          icon={AlertCircle}
          variant="danger"
        />
        <StatCard
          title="Procedimentos"
          value={47}
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

        <div className="space-y-2">
          {mockPatients.map((patient) => (
            <RecentPatientCard
              key={patient.id}
              name={patient.name}
              lastProcedure={patient.lastProcedure}
              lastVisitDate={patient.lastVisitDate}
              onClick={() => console.log("Navigate to patient", patient.id)}
            />
          ))}
        </div>
      </div>

      {/* FAB */}
      <FloatingActionButton to="/patients/new" />
    </div>
  );
}
