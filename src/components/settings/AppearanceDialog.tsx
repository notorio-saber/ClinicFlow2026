import { useTheme } from "next-themes";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

interface AppearanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AppearanceDialog({
  open,
  onOpenChange,
}: AppearanceDialogProps) {
  const { theme, setTheme } = useTheme();

  const themes = [
    {
      id: "light",
      label: "Claro",
      icon: Sun,
      description: "Tema claro para uso diurno",
    },
    {
      id: "dark",
      label: "Escuro",
      icon: Moon,
      description: "Tema escuro para uso noturno",
    },
    {
      id: "system",
      label: "Sistema",
      icon: Monitor,
      description: "Segue as configurações do dispositivo",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Aparência</DialogTitle>
          <DialogDescription>
            Escolha o tema de sua preferência
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-4">
          {themes.map((t) => (
            <Button
              key={t.id}
              variant="outline"
              className={cn(
                "flex items-center justify-start gap-4 h-auto p-4",
                theme === t.id && "border-primary bg-primary/5"
              )}
              onClick={() => setTheme(t.id)}
            >
              <div
                className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center",
                  theme === t.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <t.icon className="h-5 w-5" />
              </div>
              <div className="text-left">
                <p className="font-medium">{t.label}</p>
                <p className="text-sm text-muted-foreground">{t.description}</p>
              </div>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
