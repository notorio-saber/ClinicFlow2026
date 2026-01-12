import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './AuthContext';
import type { Tenant, TenantMember, TenantMemberRole } from '@/types';

interface TenantContextType {
  tenant: Tenant | null;
  members: TenantMember[];
  currentMember: TenantMember | null;
  loading: boolean;
  error: string | null;
  canEdit: boolean;
  canManageMembers: boolean;
  inviteMember: (email: string, role: TenantMemberRole) => Promise<void>;
  updateMemberRole: (memberId: string, role: TenantMemberRole) => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;
  updateTenantSettings: (settings: Partial<Tenant>) => Promise<void>;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [members, setMembers] = useState<TenantMember[]>([]);
  const [currentMember, setCurrentMember] = useState<TenantMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch tenant and member data
  useEffect(() => {
    if (!user?.uid || !user?.tenantId) {
      setTenant(null);
      setMembers([]);
      setCurrentMember(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Subscribe to tenant document
    const unsubTenant = onSnapshot(
      doc(db, 'tenants', user.tenantId),
      (doc) => {
        if (doc.exists()) {
          setTenant({ id: doc.id, ...doc.data() } as Tenant);
        } else {
          setTenant(null);
        }
      },
      (err) => {
        console.error('Error fetching tenant:', err);
        setError('Erro ao carregar dados da clínica');
      }
    );

    // Subscribe to members collection
    const unsubMembers = onSnapshot(
      collection(db, 'tenants', user.tenantId, 'members'),
      (snapshot) => {
        const membersList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as TenantMember[];
        
        setMembers(membersList);
        
        // Find current user's member record
        const current = membersList.find((m) => m.userId === user.uid);
        setCurrentMember(current || null);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching members:', err);
        setError('Erro ao carregar membros');
        setLoading(false);
      }
    );

    return () => {
      unsubTenant();
      unsubMembers();
    };
  }, [user?.uid, user?.tenantId]);

  const canEdit = currentMember?.role === 'owner' || currentMember?.role === 'staff';
  const canManageMembers = currentMember?.role === 'owner';

  const inviteMember = async (email: string, role: TenantMemberRole) => {
    if (!tenant || !user || !canManageMembers) {
      throw new Error('Sem permissão para convidar membros');
    }

    try {
      // Check if user exists
      const usersQuery = query(
        collection(db, 'users'),
        where('emailLower', '==', email.toLowerCase())
      );
      const usersSnapshot = await getDocs(usersQuery);

      if (usersSnapshot.empty) {
        throw new Error('Usuário não encontrado. O usuário precisa criar uma conta primeiro.');
      }

      const invitedUser = usersSnapshot.docs[0].data();

      // Check if already a member
      const existingMember = members.find(
        (m) => m.email.toLowerCase() === email.toLowerCase()
      );
      if (existingMember) {
        throw new Error('Este usuário já é membro da clínica');
      }

      // Add member
      const memberData: Omit<TenantMember, 'id'> = {
        tenantId: tenant.id,
        userId: invitedUser.uid,
        role,
        email: invitedUser.email,
        displayName: invitedUser.displayName,
        joinedAt: new Date().toISOString(),
        invitedBy: user.uid,
      };

      await addDoc(collection(db, 'tenants', tenant.id, 'members'), memberData);

      // Update the invited user's tenantId
      await updateDoc(doc(db, 'users', invitedUser.uid), {
        tenantId: tenant.id,
      });
    } catch (err: any) {
      console.error('Error inviting member:', err);
      throw new Error(err.message || 'Erro ao convidar membro');
    }
  };

  const updateMemberRole = async (memberId: string, role: TenantMemberRole) => {
    if (!tenant || !canManageMembers) {
      throw new Error('Sem permissão para alterar roles');
    }

    try {
      await updateDoc(doc(db, 'tenants', tenant.id, 'members', memberId), { role });
    } catch (err) {
      console.error('Error updating member role:', err);
      throw new Error('Erro ao atualizar role');
    }
  };

  const removeMember = async (memberId: string) => {
    if (!tenant || !canManageMembers) {
      throw new Error('Sem permissão para remover membros');
    }

    const memberToRemove = members.find((m) => m.id === memberId);
    if (memberToRemove?.role === 'owner') {
      throw new Error('Não é possível remover o proprietário');
    }

    try {
      // Remove from tenant members
      await deleteDoc(doc(db, 'tenants', tenant.id, 'members', memberId));

      // Remove tenantId from user
      if (memberToRemove) {
        await updateDoc(doc(db, 'users', memberToRemove.userId), {
          tenantId: null,
        });
      }
    } catch (err) {
      console.error('Error removing member:', err);
      throw new Error('Erro ao remover membro');
    }
  };

  const updateTenantSettings = async (settings: Partial<Tenant>) => {
    if (!tenant || !canManageMembers) {
      throw new Error('Sem permissão para alterar configurações');
    }

    try {
      await updateDoc(doc(db, 'tenants', tenant.id), {
        ...settings,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Error updating tenant:', err);
      throw new Error('Erro ao atualizar configurações');
    }
  };

  const value: TenantContextType = {
    tenant,
    members,
    currentMember,
    loading,
    error,
    canEdit,
    canManageMembers,
    inviteMember,
    updateMemberRole,
    removeMember,
    updateTenantSettings,
  };

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}
