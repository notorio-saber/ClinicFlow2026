import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Loader2,
  CheckCircle,
  MessageCircle,
  RefreshCw,
  LogOut,
  Clock,
  Shield,
} from 'lucide-react';
import logo from '@/assets/logo.png';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  query,
  setDoc,
  updateDoc,
} from 'firebase/firestore';

export default function PurchaseScreen() {
  const [isReloading, setIsReloading] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(false);
  const { user, signOut, reloadUserStatus } = useAuth();
  const { toast } = useToast();

  const canBootstrap = useMemo(() => Boolean(user?.uid), [user?.uid]);

  const handleReload = async () => {
    setIsReloading(true);
    await reloadUserStatus();
    setIsReloading(false);
  };

  // Bootstrap para o cenário “primeira instalação”: se NÃO existir nenhum admin ainda,
  // o primeiro usuário pode se promover a admin e ativar a própria clínica.
  const handleBootstrapFirstAdmin = async () => {
    if (!user?.uid) return;

    setIsBootstrapping(true);
    try {
      // 1) Verificar se já existe algum admin (qualquer doc em user_roles)
      const rolesSnap = await getDocs(query(collection(db, 'user_roles'), limit(1)));
      if (!rolesSnap.empty) {
        toast({
          variant: 'destructive',
          title: 'Já existe um admin configurado',
          description: 'A ativação deve ser feita pelo administrador do sistema.',
        });
        return;
      }

      // 2) Promover este usuário a admin
      await setDoc(
        doc(db, 'user_roles', user.uid),
        {
          role: 'admin',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      // 3) Criar tenant e membro owner (mesma lógica do painel admin)
      const tenantRef = doc(collection(db, 'tenants'));
      const tenantId = tenantRef.id;

      await setDoc(tenantRef, {
        name: `Clínica de ${user.displayName || 'Usuário'}`,
        ownerId: user.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        settings: {},
      });

      await addDoc(collection(db, 'tenants', tenantId, 'members'), {
        tenantId,
        userId: user.uid,
        role: 'owner',
        email: user.email || '',
        displayName: user.displayName || '',
        joinedAt: new Date().toISOString(),
      });

      // 4) Ativar usuário e associar tenantId
      await updateDoc(doc(db, 'users', user.uid), {
        isActive: true,
        tenantId,
      });

      toast({
        title: 'Sistema inicializado',
        description: 'Você foi definido como admin e sua clínica foi ativada.',
      });

      // Garantir que a tela atualize imediatamente
      await reloadUserStatus();
    } catch (err) {
      console.error('Bootstrap admin failed:', err);
      toast({
        variant: 'destructive',
        title: 'Erro ao inicializar',
        description: 'Não foi possível ativar sua clínica. Tente novamente.',
      });
    } finally {
      setIsBootstrapping(false);
    }
  };

  const whatsappNumber = '5511999999999'; // Replace with your WhatsApp number
  const whatsappMessage = encodeURIComponent(
    `Olá! Gostaria de adquirir o ClinicFlow.\n\nMeu email: ${user?.email}`
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src={logo} alt="ClinicFlow" className="w-20 h-20 mx-auto mb-4" />
          <h1 className="text-3xl font-display font-bold text-foreground">ClinicFlow</h1>
        </div>

        <Card className="border-border/50 shadow-lg">
          <CardHeader className="text-center pb-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-success/10 mx-auto mb-4">
              <CheckCircle className="w-6 h-6 text-success" />
            </div>
            <CardTitle className="text-2xl font-display">Conta criada com sucesso!</CardTitle>
            <CardDescription className="text-base">
              Bem-vindo(a), <strong>{user?.displayName}</strong>!
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Steps */}
            <div className="space-y-4">
              <h3 className="font-semibold text-center text-muted-foreground">
                Próximos passos para liberar seu acesso:
              </h3>

              <div className="space-y-3">
                {/* Step 1 */}
                <div className="flex items-start gap-4 p-4 rounded-lg bg-success/5 border border-success/20">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-success flex items-center justify-center text-white font-bold text-sm">
                    ✓
                  </div>
                  <div>
                    <p className="font-medium text-success">1. Conta criada</p>
                    <p className="text-sm text-muted-foreground">Sua conta foi criada com sucesso!</p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-primary">2. Adquirir licença</p>
                    <p className="text-sm text-muted-foreground">
                      Entre em contato pelo WhatsApp para adquirir sua licença
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 border border-border">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted-foreground/20 flex items-center justify-center text-muted-foreground font-bold text-sm">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">3. Acesso liberado</p>
                    <p className="text-sm text-muted-foreground">
                      Após confirmação, seu acesso será ativado automaticamente
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Features Preview */}
            <div className="p-4 rounded-lg bg-secondary/50 border border-border">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                O que você terá acesso:
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  Cadastro ilimitado de pacientes
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  Prontuários completos com histórico
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  Exportação de prontuários em PDF
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  Equipe com diferentes níveis de acesso
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  Anexos de fotos e documentos
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="block">
                <Button className="w-full h-12 text-base bg-[#25D366] hover:bg-[#20BD5A] text-white">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Comprar via WhatsApp
                </Button>
              </a>

              <Button
                variant="outline"
                className="w-full"
                onClick={handleReload}
                disabled={isReloading}
              >
                {isReloading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Já comprei - Verificar acesso
              </Button>

              {/* Primeira instalação */}
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Shield className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Primeira instalação?</p>
                    <p className="text-xs text-muted-foreground">
                      Se esta for a primeira conta do sistema (nenhum admin existe ainda), você pode
                      inicializar como admin e ativar sua clínica.
                    </p>
                    <div className="mt-3">
                      <Button
                        variant="secondary"
                        className="w-full"
                        onClick={handleBootstrapFirstAdmin}
                        disabled={!canBootstrap || isBootstrapping}
                      >
                        {isBootstrapping ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Shield className="mr-2 h-4 w-4" />
                        )}
                        Inicializar como admin e ativar
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                variant="ghost"
                className="w-full text-muted-foreground"
                onClick={signOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </Button>
            </div>

            {/* Note */}
            <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
              <Clock className="w-3 h-3" />
              Ativação em até 24 horas após confirmação do pagamento
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

