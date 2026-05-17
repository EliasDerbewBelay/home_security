import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc, 
  Timestamp,
  getFirestore
} from 'firebase/firestore';
import { auth, db as configDb } from '@/config/firebaseConfig';

// Bulletproof fallback to handle any Metro bundling or import ordering anomalies
const db = configDb || getFirestore();

export interface FirestoreEmergencyContact {
  id?: string;
  ownerId: string;
  name: string;
  phone: string;
  type: 'PERSONAL' | 'POLICE';
  initial: string;
  color: string;
  createdAt: Timestamp;
}

export function useEmergencyContacts() {
  const [contacts, setContacts] = useState<FirestoreEmergencyContact[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<string | null>(null); // holds contact ID being deleted
  const [retryTrigger, setRetryTrigger] = useState<number>(0);

  const currentUser = auth.currentUser;
  const userId = currentUser?.uid;

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const q = query(
      collection(db, 'contacts'),
      where('ownerId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedContacts: FirestoreEmergencyContact[] = [];
        snapshot.forEach((document) => {
          const data = document.data();
          fetchedContacts.push({
            id: document.id,
            ownerId: data.ownerId,
            name: data.name,
            phone: data.phone,
            type: data.type,
            initial: data.initial,
            color: data.color,
            createdAt: data.createdAt,
          } as FirestoreEmergencyContact);
        });
        setContacts(fetchedContacts);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Firestore onSnapshot Error:', err);
        setError('Failed to fetch emergency contacts. Security link unstable.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId, retryTrigger]);

  const handleRetry = () => {
    setRetryTrigger((prev) => prev + 1);
  };

  const addContact = async (
    name: string, 
    phone: string, 
    type: 'PERSONAL' | 'POLICE'
  ): Promise<void> => {
    // 1. Security Check
    const activeUser = auth.currentUser;
    if (!activeUser) {
      throw new Error('Action blocked. You must be authenticated to add contacts.');
    }

    // 2. Validation
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName || trimmedName.length < 2) {
      throw new Error('Name is required and must be at least 2 characters.');
    }

    // Basic regex: allow +, numbers, spaces, hyphens, parentheses (7 to 20 chars)
    const phoneRegex = /^[+0-9\s\-()]{7,20}$/;
    if (!trimmedPhone || !phoneRegex.test(trimmedPhone)) {
      throw new Error('Please enter a valid phone number.');
    }

    if (type !== 'PERSONAL' && type !== 'POLICE') {
      throw new Error("Invalid contact type. Must be either 'PERSONAL' or 'POLICE'.");
    }

    setAdding(true);

    try {
      const initial = trimmedName.charAt(0).toUpperCase();
      const color = type === 'POLICE' ? '#FF1744' : '#00E5FF';

      const contactPayload: Omit<FirestoreEmergencyContact, 'id'> = {
        ownerId: activeUser.uid, // Hardcoded server-side assignment
        name: trimmedName,
        phone: trimmedPhone,
        type,
        initial,
        color,
        createdAt: Timestamp.now(),
      };

      await addDoc(collection(db, 'contacts'), contactPayload);
    } catch (err: any) {
      console.error('Firestore addDoc Error:', err);
      throw new Error(err.message || 'Server error. Failed to secure new contact.');
    } finally {
      setAdding(false);
    }
  };

  const deleteContact = async (contactId: string): Promise<void> => {
    const activeUser = auth.currentUser;
    if (!activeUser) {
      throw new Error('Action blocked. You must be authenticated to delete contacts.');
    }

    setDeleting(contactId);

    try {
      await deleteDoc(doc(db, 'contacts', contactId));
    } catch (err: any) {
      console.error('Firestore deleteDoc Error:', err);
      throw new Error(err.message || 'Failed to remove contact from database.');
    } finally {
      setDeleting(null);
    }
  };

  return {
    contacts,
    loading,
    error,
    adding,
    deleting,
    addContact,
    deleteContact,
    retry: handleRetry,
  };
}
