import { useState } from "react";
import { Building2, Users, Bell, Palette, ChevronRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTenant } from "@/contexts/TenantContext";
import { Separator } from "@/components/ui/separator";
import { ClinicSettingsDialog } from "@/components/settings/ClinicSettingsDialog";
import { TeamManagementDialog } from "@/components/settings/TeamManagementDialog";
import { AppearanceDialog } from "@/components/settings/AppearanceDialog";

interface SettingsItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick?: () => void;
}

function SettingsItem({ icon, title, description, onClick }: SettingsItemProps) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-4 p-4 hover:bg-muted/50 rounded-lg transition-colors text-left">
      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground truncate">{description}</p>
      </div>
      <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
    </button>
  );
}

export default function Settings() {
  const { tenant } = useTenant();
  const [clinicOpen, setClinicOpen] = useState(false);
  const [teamOpen, setTeamOpen] = useState(false);
  const [appearanceOpen, setAppearanceOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground text-sm mt-1">Personalize sua clínica e preferências</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Minha Clínica</CardTitle>
          <CardDescription>{tenant?.name || "Configure os dados da sua clínica"}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          <SettingsItem icon={<Building2 className="h-5 w-5" />} title="Dados da Clínica" description="Nome, endereço, telefone e logo" onClick={() => setClinicOpen(true)} />
          <Separator />
          <SettingsItem icon={<Users className="h-5 w-5" />} title="Equipe" description="Gerencie membros e permissões" onClick={() => setTeamOpen(true)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Preferências</CardTitle>
          <CardDescription>Personalize a experiência do app</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          <SettingsItem icon={<Palette className="h-5 w-5" />} title="Aparência" description="Tema claro ou escuro" onClick={() => setAppearanceOpen(true)} />
        </CardContent>
      </Card>

      <div className="text-center py-4">
        <p className="text-xs text-muted-foreground">ClinicFlow v1.0.0</p>
      </div>

      <ClinicSettingsDialog open={clinicOpen} onOpenChange={setClinicOpen} />
      <TeamManagementDialog open={teamOpen} onOpenChange={setTeamOpen} />
      <AppearanceDialog open={appearanceOpen} onOpenChange={setAppearanceOpen} />
    </div>
  );
}
