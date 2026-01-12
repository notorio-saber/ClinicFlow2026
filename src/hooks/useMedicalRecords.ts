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
import { useTenant } from '@/contexts/TenantContext';
import { useAuth } from '@/contexts/AuthContext';
import type { MedicalRecord, MedicalRecordFormData, RecordRevision } from '@/types';

export function useMedicalRecords(patientId: string | undefined) {
  const { tenant, canEdit } = useTenant();
  const { user } = useAuth();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tenant?.id || !patientId) {
      setRecords([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'medicalRecords'),
      where('tenantId', '==', tenant.id),
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
  }, [tenant?.id, patientId]);

  const addRecord = useCallback(
    async (data: MedicalRecordFormData) => {
      if (!tenant?.id || !user?.uid || !patientId || !canEdit) {
        throw new Error('Sem permissão para adicionar prontuários');
      }

      const recordData: Omit<MedicalRecord, 'id'> = {
        tenantId: tenant.id,
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
        createdBy: user.uid,
        revisionHistory: [],
      };

      const docRef = await addDoc(collection(db, 'medicalRecords'), recordData);
      return docRef.id;
    },
    [tenant?.id, user?.uid, patientId, canEdit]
  );

  const updateRecord = useCallback(
    async (recordId: string, data: Partial<MedicalRecordFormData>, changeDescription: string) => {
      if (!canEdit || !user) {
        throw new Error('Sem permissão para editar prontuários');
      }

      // Get current record to add to revision history
      const recordRef = doc(db, 'medicalRecords', recordId);
      const recordSnap = await getDoc(recordRef);
      
      if (!recordSnap.exists()) {
        throw new Error('Prontuário não encontrado');
      }

      const currentData = recordSnap.data() as MedicalRecord;
      const revision: RecordRevision = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        userId: user.uid,
        userName: user.displayName || 'Usuário',
        changes: changeDescription,
      };

      const revisionHistory = [...(currentData.revisionHistory || []), revision];

      await updateDoc(recordRef, {
        ...data,
        updatedAt: new Date().toISOString(),
        updatedBy: user.uid,
        revisionHistory,
      });
    },
    [canEdit, user]
  );

  return {
    records,
    loading,
    error,
    addRecord,
    updateRecord,
  };
}
