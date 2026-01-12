import { Building2, Users, Bell, Palette } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTenant } from "@/contexts/TenantContext";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

interface SettingsItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick?: () => void;
}

function SettingsItem({ icon, title, description, onClick }: SettingsItemProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 hover:bg-muted/50 rounded-lg transition-colors text-left"
    >
      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
        {icon}
      </div>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Personalize sua clínica e preferências
        </p>
      </div>

      {/* Clinic Info Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Minha Clínica</CardTitle>
          <CardDescription>
            {tenant?.name || "Configure os dados da sua clínica"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          <SettingsItem
            icon={<Building2 className="h-5 w-5" />}
            title="Dados da Clínica"
            description="Nome, endereço, telefone e logo"
            onClick={() => console.log("Open clinic settings")}
          />
          <Separator />
          <SettingsItem
            icon={<Users className="h-5 w-5" />}
            title="Equipe"
            description="Gerencie membros e permissões"
            onClick={() => console.log("Open team settings")}
          />
        </CardContent>
      </Card>

      {/* Preferences Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Preferências</CardTitle>
          <CardDescription>
            Personalize a experiência do app
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          <SettingsItem
            icon={<Bell className="h-5 w-5" />}
            title="Notificações"
            description="Lembretes e alertas"
            onClick={() => console.log("Open notifications settings")}
          />
          <Separator />
          <SettingsItem
            icon={<Palette className="h-5 w-5" />}
            title="Aparência"
            description="Tema claro ou escuro"
            onClick={() => console.log("Open appearance settings")}
          />
        </CardContent>
      </Card>

      {/* App Info */}
      <div className="text-center py-4">
        <p className="text-xs text-muted-foreground">
          ClinicFlow v1.0.0
        </p>
      </div>
    </div>
  );
}
