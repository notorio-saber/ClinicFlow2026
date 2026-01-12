import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

export function useAdminRole() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAdminRole() {
      if (!user?.uid) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        const roleDoc = await getDoc(doc(db, 'user_roles', user.uid));
        if (roleDoc.exists()) {
          const roleData = roleDoc.data();
          setIsAdmin(roleData?.role === 'admin');
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.warn('Could not verify admin role:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    }

    checkAdminRole();
  }, [user?.uid]);

  return { isAdmin, loading };
}
