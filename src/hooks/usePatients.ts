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
import { useAuth } from '@/contexts/AuthContext';
import type { Patient, PatientFormData } from '@/types';

export function usePatients() {
  const { user, firebaseUser } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const tenantId = user?.tenantId;
  const authUid = firebaseUser?.uid;

  useEffect(() => {
    if (!tenantId) {
      setPatients([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'patients'),
      where('tenantId', '==', tenantId),
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
  }, [tenantId]);

  const addPatient = useCallback(
    async (data: PatientFormData) => {
      console.log('[usePatients] addPatient check:', { tenantId, authUid });
      
      if (!tenantId) {
        throw new Error('Sua clínica ainda não foi configurada. Finalize o processo de ativação.');
      }
      
      if (!authUid) {
        throw new Error('Sessão expirada. Faça login novamente.');
      }

      const patientData: Omit<Patient, 'id'> = {
        tenantId: tenantId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        dateOfBirth: data.dateOfBirth,
        tags: data.tags || [],
        notes: data.notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: authUid,
      };

      const docRef = await addDoc(collection(db, 'patients'), patientData);
      return docRef.id;
    },
    [tenantId, authUid]
  );

  const updatePatient = useCallback(
    async (patientId: string, data: Partial<PatientFormData>) => {
      if (!tenantId) {
        throw new Error('Sua clínica ainda não está ativa. Aguarde a ativação pelo administrador.');
      }

      await updateDoc(doc(db, 'patients', patientId), {
        ...data,
        updatedAt: new Date().toISOString(),
      });
    },
    [tenantId]
  );

  const deletePatient = useCallback(
    async (patientId: string) => {
      if (!tenantId) {
        throw new Error('Sua clínica ainda não está ativa. Aguarde a ativação pelo administrador.');
      }

      await deleteDoc(doc(db, 'patients', patientId));
    },
    [tenantId]
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
