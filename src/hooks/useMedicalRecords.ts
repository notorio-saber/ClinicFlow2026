import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  getDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import type { MedicalRecord, MedicalRecordFormData, RecordRevision } from '@/types';

export function useMedicalRecords(patientId: string | undefined) {
  const { user, firebaseUser } = useAuth();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userId = firebaseUser?.uid;

  useEffect(() => {
    if (!userId || !patientId) {
      setRecords([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'medicalRecords'),
      where('userId', '==', userId),
      where('patientId', '==', patientId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const recordsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as MedicalRecord[];
        setRecords(recordsData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching medical records:', err);
        setError('Erro ao carregar prontuários');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId, patientId]);

  const addRecord = useCallback(
    async (data: MedicalRecordFormData) => {
      if (!userId || !patientId) {
        throw new Error('Sessão expirada. Faça login novamente.');
      }

      const recordData: Omit<MedicalRecord, 'id'> = {
        userId,
        patientId,
        procedureType: data.procedureType,
        chiefComplaint: data.chiefComplaint,
        professionalAssessment: data.professionalAssessment,
        procedureDetails: data.procedureDetails,
        productsUsed: data.productsUsed || [],
        treatedAreas: data.treatedAreas || [],
        postCareInstructions: data.postCareInstructions,
        additionalNotes: data.additionalNotes,
        attachments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: userId,
        revisionHistory: [],
      };

      const docRef = await addDoc(collection(db, 'medicalRecords'), recordData);
      return docRef.id;
    },
    [userId, patientId]
  );

  const updateRecord = useCallback(
    async (recordId: string, data: Partial<MedicalRecordFormData>, changeDescription: string) => {
      if (!userId || !user) {
        throw new Error('Sessão expirada. Faça login novamente.');
      }

      const recordRef = doc(db, 'medicalRecords', recordId);
      const recordSnap = await getDoc(recordRef);
      
      if (!recordSnap.exists()) {
        throw new Error('Prontuário não encontrado');
      }

      const currentData = recordSnap.data() as MedicalRecord;
      const revision: RecordRevision = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        userId: userId,
        userName: user.displayName || 'Usuário',
        changes: changeDescription,
      };

      const revisionHistory = [...(currentData.revisionHistory || []), revision];

      await updateDoc(recordRef, {
        ...data,
        updatedAt: new Date().toISOString(),
        updatedBy: userId,
        revisionHistory,
      });
    },
    [userId, user]
  );

  return {
    records,
    loading,
    error,
    addRecord,
    updateRecord,
  };
}
