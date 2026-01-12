import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useTenant } from '@/contexts/TenantContext';
import { useAuth } from '@/contexts/AuthContext';
import type { Patient, PatientFormData } from '@/types';

export function usePatients() {
  const { tenant, canEdit } = useTenant();
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tenant?.id) {
      setPatients([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'patients'),
      where('tenantId', '==', tenant.id),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const patientsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Patient[];
        setPatients(patientsData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching patients:', err);
        setError('Erro ao carregar pacientes');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [tenant?.id]);

  const addPatient = useCallback(
    async (data: PatientFormData) => {
      if (!tenant?.id || !user?.uid || !canEdit) {
        throw new Error('Sem permissão para adicionar pacientes');
      }

      const patientData: Omit<Patient, 'id'> = {
        tenantId: tenant.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        dateOfBirth: data.dateOfBirth,
        tags: data.tags || [],
        notes: data.notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: user.uid,
      };

      const docRef = await addDoc(collection(db, 'patients'), patientData);
      return docRef.id;
    },
    [tenant?.id, user?.uid, canEdit]
  );

  const updatePatient = useCallback(
    async (patientId: string, data: Partial<PatientFormData>) => {
      if (!canEdit) {
        throw new Error('Sem permissão para editar pacientes');
      }

      await updateDoc(doc(db, 'patients', patientId), {
        ...data,
        updatedAt: new Date().toISOString(),
      });
    },
    [canEdit]
  );

  const deletePatient = useCallback(
    async (patientId: string) => {
      if (!canEdit) {
        throw new Error('Sem permissão para excluir pacientes');
      }

      await deleteDoc(doc(db, 'patients', patientId));
    },
    [canEdit]
  );

  const searchPatients = useCallback(
    (searchTerm: string) => {
      if (!searchTerm.trim()) return patients;
      
      const term = searchTerm.toLowerCase();
      return patients.filter(
        (patient) =>
          patient.name.toLowerCase().includes(term) ||
          patient.phone.includes(term) ||
          patient.email?.toLowerCase().includes(term)
      );
    },
    [patients]
  );

  return {
    patients,
    loading,
    error,
    addPatient,
    updatePatient,
    deletePatient,
    searchPatients,
  };
}
