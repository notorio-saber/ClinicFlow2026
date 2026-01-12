import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, UserPlus, Crown, Trash2 } from "lucide-react";
import { useTenant } from "@/contexts/TenantContext";
import { useToast } from "@/hooks/use-toast";
import type { TenantMemberRole } from "@/types";

const inviteSchema = z.object({
  email: z.string().email("Email inválido"),
  role: z.enum(["staff", "readonly"]),
});

type InviteFormData = z.infer<typeof inviteSchema>;

interface TeamManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TeamManagementDialog({
  open,
  onOpenChange,
}: TeamManagementDialogProps) {
  const [loading, setLoading] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const { members, inviteMember, removeMember, canManageMembers } = useTenant();
  const { toast } = useToast();

  const form = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: "",
      role: "staff",
    },
  });

  const handleInvite = async (data: InviteFormData) => {
    try {
      setLoading(true);
      await inviteMember(data.email, data.role as TenantMemberRole);
      toast({
        title: "Membro adicionado",
        description: "O usuário agora faz parte da equipe.",
      });
      form.reset();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Não foi possível adicionar o membro.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (memberId: string) => {
    try {
      setRemovingId(memberId);
      await removeMember(memberId);
      toast({
        title: "Membro removido",
        description: "O usuário foi removido da equipe.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Não foi possível remover o membro.",
      });
    } finally {
      setRemovingId(null);
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

  const getRoleBadge = (role: TenantMemberRole) => {
    switch (role) {
      case "owner":
        return (
          <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">
            <Crown className="h-3 w-3 mr-1" />
            Proprietário
          </Badge>
        );
      case "staff":
        return <Badge variant="secondary">Equipe</Badge>;
      case "readonly":
        return <Badge variant="outline">Visualização</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Gerenciar Equipe</DialogTitle>
          <DialogDescription>
            Adicione ou remova membros da sua clínica
          </DialogDescription>
        </DialogHeader>

        {/* Invite Form */}
        {canManageMembers && (
          <>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleInvite)}
                className="space-y-3"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email do usuário</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="usuario@email.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Permissão</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="staff">
                            Equipe - pode editar pacientes
                          </SelectItem>
                          <SelectItem value="readonly">
                            Visualização - apenas consulta
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <UserPlus className="mr-2 h-4 w-4" />
                  )}
                  Adicionar Membro
                </Button>
              </form>
            </Form>

            <Separator className="my-2" />
          </>
        )}

        {/* Members List */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">
            Membros da equipe ({members.length})
          </h4>
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-border"
            >
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                  {getInitials(member.displayName)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">
                  {member.displayName}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {member.email}
                </p>
              </div>

              {getRoleBadge(member.role)}

              {canManageMembers && member.role !== "owner" && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemove(member.id)}
                  disabled={removingId === member.id}
                >
                  {removingId === member.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 text-destructive" />
                  )}
                </Button>
              )}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
