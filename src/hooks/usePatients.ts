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
  const { firebaseUser } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userId = firebaseUser?.uid;

  useEffect(() => {
    if (!userId) {
      setPatients([]);
      setLoading(false);
      return;
    }

    console.log('[usePatients] Starting query with userId:', userId);

    const q = query(
      collection(db, 'patients'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const patientsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Patient[];
        console.log('[usePatients] Received patients:', patientsData.length);
        setPatients(patientsData);
        setLoading(false);
      },
      (err) => {
        console.error('[usePatients] Error fetching patients:', err.message);
        setError('Erro ao carregar pacientes: ' + err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  const addPatient = useCallback(
    async (data: PatientFormData) => {
      if (!userId) {
        throw new Error('Sessão expirada. Faça login novamente.');
      }

      const patientData: Omit<Patient, 'id'> = {
        userId: userId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        dateOfBirth: data.dateOfBirth,
        tags: data.tags || [],
        notes: data.notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: userId,
      };

      const docRef = await addDoc(collection(db, 'patients'), patientData);
      return docRef.id;
    },
    [userId]
  );

  const updatePatient = useCallback(
    async (patientId: string, data: Partial<PatientFormData>) => {
      if (!userId) {
        throw new Error('Sessão expirada. Faça login novamente.');
      }

      await updateDoc(doc(db, 'patients', patientId), {
        ...data,
        updatedAt: new Date().toISOString(),
      });
    },
    [userId]
  );

  const deletePatient = useCallback(
    async (patientId: string) => {
      if (!userId) {
        throw new Error('Sessão expirada. Faça login novamente.');
      }

      await deleteDoc(doc(db, 'patients', patientId));
    },
    [userId]
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
