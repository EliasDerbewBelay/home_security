import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Alert, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
  StyleSheet
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { GlassCard } from '@/components/ui/GlassCard';
import { router } from 'expo-router';
import { auth, db as configDb } from '@/config/firebaseConfig';
import { doc, onSnapshot, setDoc, arrayUnion, arrayRemove, getFirestore } from 'firebase/firestore';

// Bulletproof fallback to handle any Metro bundling or import ordering anomalies
const db = configDb || getFirestore();

interface ContactObject {
  name: string;
  phone: string;
}

export default function ContactsTabScreen() {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [parentContacts, setParentContacts] = useState<ContactObject[]>([]);
  const [policeContacts, setPoliceContacts] = useState<ContactObject[]>([]);
  
  // Modal Addition Form States
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [editingContact, setEditingContact] = useState<{ contact: ContactObject, listType: 'parent' | 'police' } | null>(null);
  const [contactType, setContactType] = useState<'PERSONAL' | 'POLICE'>('PERSONAL');
  const [contactPhone, setContactPhone] = useState<string>('');
  const [contactName, setContactName] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);
  
  const [adding, setAdding] = useState<boolean>(false);
  const [removingContact, setRemovingContact] = useState<string | null>(null);
  const [retryTrigger, setRetryTrigger] = useState<number>(0);

  // Modal Deletion Confirmation States
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState<boolean>(false);
  const [contactToDelete, setContactToDelete] = useState<{ contact: ContactObject, listType: 'parent' | 'police' } | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const currentUser = auth.currentUser;
  const userId = currentUser?.uid;

  // 1. Unauthenticated Fallback Redirect
  useEffect(() => {
    if (!auth.currentUser) {
      router.replace('/(auth)/login');
    }
  }, []);

  // Helper to parse older string formats safely into objects to prevent client crashes
  const sanitizeContacts = (list: any[]): ContactObject[] => {
    if (!Array.isArray(list)) return [];
    return list.map((item) => {
      if (typeof item === 'string') {
        return { name: '', phone: item };
      }
      return {
        name: item?.name || '',
        phone: item?.phone || ''
      };
    });
  };

  // 2. Real-time Listener on users/${auth.currentUser.uid}
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const docRef = doc(db, 'users', userId);

    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setParentContacts(sanitizeContacts(data.parentContacts));
          setPoliceContacts(sanitizeContacts(data.policeContacts));
        } else {
          setParentContacts([]);
          setPoliceContacts([]);
        }
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Firestore users doc onSnapshot Error:', err);
        setError('Security link unstable. Failed to connect to database.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId, retryTrigger]);

  const handleRetry = () => {
    setRetryTrigger((prev) => prev + 1);
  };

  // 3. Form Validation before Firestore Write
  const handleAddContact = async () => {
    if (!userId) return;
    setFormError(null);
    const trimmedPhone = contactPhone.trim();
    const trimmedName = contactName.trim();

    if (!trimmedPhone) {
      setFormError('Phone number is required.');
      return;
    }
    
    // Validate phone number format (min 3 digits, standard phone characters allowed)
    const phoneRegex = /^[+0-9\s\-()]{3,20}$/;
    if (!phoneRegex.test(trimmedPhone)) {
      setFormError('Invalid phone number format.');
      return;
    }

    // Name constraint check: REQUIRED for PERSONAL, OPTIONAL for POLICE
    if (contactType === 'PERSONAL' && (!trimmedName || trimmedName.length < 2)) {
      setFormError('Name is required and must be at least 2 characters for personal contacts.');
      return;
    }

    setAdding(true);
    try {
      const docRef = doc(db, 'users', userId);
      const contactObject: ContactObject = {
        name: trimmedName,
        phone: trimmedPhone
      };

      if (contactType === 'PERSONAL') {
        await setDoc(docRef, {
          parentContacts: arrayUnion(contactObject)
        }, { merge: true });
      } else {
        await setDoc(docRef, {
          policeContacts: arrayUnion(contactObject)
        }, { merge: true });
      }
      
      // Reset input fields and close modal
      setContactPhone('');
      setContactName('');
      setContactType('PERSONAL');
      setModalVisible(false);
    } catch (err: any) {
      console.error('Add Contact Firestore Error:', err);
      setFormError(err.message || 'Failed to sync with database.');
    } finally {
      setAdding(false);
    }
  };

  const triggerEditContact = (contact: ContactObject, listType: 'parent' | 'police') => {
    setFormError(null);
    setIsEditMode(true);
    setEditingContact({ contact, listType });
    setContactPhone(contact.phone);
    setContactName(contact.name);
    setContactType(listType === 'parent' ? 'PERSONAL' : 'POLICE');
    setModalVisible(true);
  };

  const handleUpdateContact = async () => {
    if (!userId || !editingContact) return;
    setFormError(null);
    const trimmedPhone = contactPhone.trim();
    const trimmedName = contactName.trim();

    if (!trimmedPhone) {
      setFormError('Phone number is required.');
      return;
    }
    const phoneRegex = /^[+0-9\s\-()]{3,20}$/;
    if (!phoneRegex.test(trimmedPhone)) {
      setFormError('Invalid phone number format.');
      return;
    }
    if (contactType === 'PERSONAL' && (!trimmedName || trimmedName.length < 2)) {
      setFormError('Name is required and must be at least 2 characters for personal contacts.');
      return;
    }

    setAdding(true);
    try {
      const docRef = doc(db, 'users', userId);
      const newContact: ContactObject = {
        name: trimmedName,
        phone: trimmedPhone
      };
      
      const oldContact = editingContact.contact;
      const oldListType = editingContact.listType;

      let updatedParent = [...parentContacts];
      let updatedPolice = [...policeContacts];

      // Remove the old contact
      if (oldListType === 'parent') {
        updatedParent = updatedParent.filter(c => !(c.phone === oldContact.phone && c.name === oldContact.name));
      } else {
        updatedPolice = updatedPolice.filter(c => !(c.phone === oldContact.phone && c.name === oldContact.name));
      }

      // Add the updated contact
      if (contactType === 'PERSONAL') {
        updatedParent.push(newContact);
      } else {
        updatedPolice.push(newContact);
      }

      await setDoc(docRef, {
        parentContacts: updatedParent,
        policeContacts: updatedPolice
      }, { merge: true });

      setContactPhone('');
      setContactName('');
      setContactType('PERSONAL');
      setIsEditMode(false);
      setEditingContact(null);
      setModalVisible(false);
    } catch (err: any) {
      console.error('Update Contact Firestore Error:', err);
      setFormError(err.message || 'Failed to update contact.');
    } finally {
      setAdding(false);
    }
  };

  // 4. Custom Delete Confirmation Trigger & Action
  const triggerRemoveContact = (contact: ContactObject, listType: 'parent' | 'police') => {
    setDeleteError(null);
    setContactToDelete({ contact, listType });
    setDeleteConfirmVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!userId || !contactToDelete) return;
    const { contact, listType } = contactToDelete;
    
    setDeleting(true);
    setDeleteError(null);
    try {
      const docRef = doc(db, 'users', userId);
      if (listType === 'parent') {
        await setDoc(docRef, {
          parentContacts: arrayRemove(contact)
        }, { merge: true });
      } else {
        await setDoc(docRef, {
          policeContacts: arrayRemove(contact)
        }, { merge: true });
      }
      setDeleteConfirmVisible(false);
      setContactToDelete(null);
    } catch (err: any) {
      console.error('Delete Contact Firestore Error:', err);
      setDeleteError(err.message || 'Failed to remove contact from database.');
    } finally {
      setDeleting(false);
    }
  };

  const totalEntries = parentContacts.length + policeContacts.length;

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="px-6 pt-16 pb-6 bg-[#0F172A] flex-row items-center justify-between border-b border-white/5">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <FontAwesome5 name="arrow-left" size={20} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-2xl font-bold">Secure Node Contacts</Text>
        </View>
        <View className="w-8 h-8 rounded-full border border-white/20 overflow-hidden bg-white/10" />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 150 }}>
        {/* Info Card */}
        <View className="bg-primary/5 border border-primary/20 rounded-[32px] p-6 mb-8 flex-row items-start">
          <View className="w-12 h-12 bg-primary/10 rounded-2xl items-center justify-center mr-5 mt-1">
             <FontAwesome5 name="shield-alt" size={20} color="#00E676" />
          </View>
          <View className="flex-1">
            <Text className="text-secondary font-bold text-lg mb-2">Secure Guard Protocols</Text>
            <Text className="text-white/40 text-sm leading-relaxed">
              These contacts are mapped directly to your user account `users/${userId?.substring(0, 6)}...` and will automatically get notified during network alarms.
            </Text>
          </View>
        </View>

        {/* Retry Error Banner */}
        {error && (
          <View className="bg-[#FF1744]/10 border border-[#FF1744]/30 rounded-2xl p-5 mb-6 flex-row items-center justify-between">
            <View className="flex-row items-center flex-1 mr-4">
              <FontAwesome5 name="exclamation-triangle" size={18} color="#FF1744" />
              <Text className="text-[#FF1744] font-medium text-xs ml-3 flex-1">{error}</Text>
            </View>
            <TouchableOpacity 
              onPress={handleRetry}
              className="bg-[#FF1744]/20 border border-[#FF1744]/40 px-4 py-2 rounded-xl"
            >
              <Text className="text-[#FF1744] font-bold text-xs">Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* List Header */}
        <View className="flex-row justify-between items-center mb-6 px-2">
          <Text className="text-white/40 text-[10px] font-bold tracking-[4px] uppercase">Active Safeguards</Text>
          <Text className="text-secondary text-[10px] font-bold tracking-[2px] uppercase">
            {loading ? '...' : `${totalEntries} Entries`}
          </Text>
        </View>

        {/* Skeleton Loaders */}
        {loading && (
          <View className="space-y-4 mb-8">
            {[1, 2].map((key) => (
              <GlassCard key={key} className="p-5 flex-row items-center justify-between opacity-40 border-l-4 border-l-white/20 mb-4">
                <View className="flex-row items-center">
                  <View className="w-14 h-14 rounded-full bg-white/5 items-center justify-center mr-4 border border-white/5" />
                  <View>
                    <View className="w-24 h-4 bg-white/10 rounded mb-1" />
                    <View className="w-32 h-3 bg-white/5 rounded mt-1" />
                  </View>
                </View>
                <View className="w-6 h-6 bg-white/10 rounded-full" />
              </GlassCard>
            ))}
          </View>
        )}

        {/* Empty State Banner */}
        {!loading && !error && totalEntries === 0 && (
          <View className="py-12 items-center justify-center">
            <View className="w-16 h-16 bg-white/5 rounded-full items-center justify-center mb-4 border border-white/5">
              <FontAwesome5 name="address-book" size={24} color="rgba(255, 255, 255, 0.2)" />
            </View>
            <Text className="text-white/60 font-bold text-base mb-1">No emergency contacts added yet</Text>
            <Text className="text-white/30 text-xs text-center px-6 leading-relaxed">
              Add guardian or police dispatch phone lines below to secure your network endpoints.
            </Text>
          </View>
        )}

        {/* Saved Contacts Deck */}
        {!loading && totalEntries > 0 && (
          <View className="mb-8">
            {/* Police Numbers Section */}
            {policeContacts.map((contact) => (
              <View key={`police-${contact.phone}-${contact.name}`} className="mb-4">
                <GlassCard className="p-5 flex-row items-center justify-between border-l-4 border-l-[#FF1744]">
                  <View className="flex-row items-center">
                    <View className="w-14 h-14 rounded-full bg-white/5 items-center justify-center mr-4 border border-white/5">
                      <Text className="text-[#FF1744] text-xl font-bold">
                        {contact.name ? contact.name.charAt(0).toUpperCase() : 'E'}
                      </Text>
                    </View>
                    <View>
                      <View className="flex-row items-center mb-1">
                        <Text className="text-white text-lg font-bold mr-3">
                          {contact.name || 'Emergency Dispatch'}
                        </Text>
                        <View className="bg-[#FF1744]/10 px-2 py-0.5 rounded border border-[#FF1744]/20">
                          <Text className="text-[#FF1744] text-[8px] font-bold tracking-widest uppercase">POLICE</Text>
                        </View>
                      </View>
                      <Text className="text-white/50 font-mono text-sm">{contact.phone}</Text>
                    </View>
                  </View>
                  
                  <View className="flex-row items-center">
                    <TouchableOpacity 
                      onPress={() => triggerEditContact(contact, 'police')}
                      className="w-10 h-10 items-center justify-center bg-white/5 rounded-full border border-white/5 mr-3"
                    >
                      <FontAwesome5 name="pen" size={13} color="#00E5FF" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => triggerRemoveContact(contact, 'police')}
                      className="w-10 h-10 items-center justify-center bg-white/5 rounded-full border border-white/5"
                    >
                      <FontAwesome5 name="trash-alt" size={13} color="#FF1744" />
                    </TouchableOpacity>
                  </View>
                </GlassCard>
              </View>
            ))}

            {/* Parent Numbers Section */}
            {parentContacts.map((contact) => (
              <View key={`parent-${contact.phone}-${contact.name}`} className="mb-4">
                <GlassCard className="p-5 flex-row items-center justify-between border-l-4 border-l-[#00E5FF]">
                  <View className="flex-row items-center">
                    <View className="w-14 h-14 rounded-full bg-white/5 items-center justify-center mr-4 border border-white/5">
                      <Text className="text-[#00E5FF] text-xl font-bold">
                        {contact.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View>
                      <View className="flex-row items-center mb-1">
                        <Text className="text-white text-lg font-bold mr-3">{contact.name}</Text>
                        <View className="bg-[#00E5FF]/10 px-2 py-0.5 rounded border border-[#00E5FF]/20">
                          <Text className="text-[#00E5FF] text-[8px] font-bold tracking-widest uppercase">PERSONAL</Text>
                        </View>
                      </View>
                      <Text className="text-white/50 font-mono text-sm">{contact.phone}</Text>
                    </View>
                  </View>
                  
                  <View className="flex-row items-center">
                    <TouchableOpacity 
                      onPress={() => triggerEditContact(contact, 'parent')}
                      className="w-10 h-10 items-center justify-center bg-white/5 rounded-full border border-white/5 mr-3"
                    >
                      <FontAwesome5 name="pen" size={13} color="#00E5FF" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => triggerRemoveContact(contact, 'parent')}
                      className="w-10 h-10 items-center justify-center bg-white/5 rounded-full border border-white/5"
                    >
                      <FontAwesome5 name="trash-alt" size={13} color="#FF1744" />
                    </TouchableOpacity>
                  </View>
                </GlassCard>
              </View>
            ))}
          </View>
        )}

      </ScrollView>

      {/* Floating Add Contact Button */}
      {!loading && (
        <View style={styles.fabContainer}>
          <TouchableOpacity 
            onPress={() => {
              setFormError(null);
              setIsEditMode(false);
              setEditingContact(null);
              setContactPhone('');
              setContactName('');
              setContactType('PERSONAL');
              setModalVisible(true);
            }}
            className="bg-secondary px-8 py-5 rounded-[28px] flex-row items-center shadow-2xl neon-shadow-green"
          >
            <FontAwesome5 name="plus" size={18} color="#0F172A" />
            <Text className="text-background font-bold text-lg ml-4">Add Contact</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 5. Add Contact Popup Card Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          if (!adding) setModalVisible(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="w-full"
          >
            <GlassCard style={styles.modalContent} className="p-8 border border-white/10">
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-white text-2xl font-bold">{isEditMode ? 'Update Guard Link' : 'Secure Guard Link'}</Text>
                <TouchableOpacity disabled={adding} onPress={() => setModalVisible(false)}>
                  <FontAwesome5 name="times" size={20} color="rgba(255,255,255,0.4)" />
                </TouchableOpacity>
              </View>

              {/* Form Validation Errors */}
              {formError && (
                <View className="bg-[#FF1744]/10 border border-[#FF1744]/30 rounded-2xl p-4 mb-6 flex-row items-center">
                  <FontAwesome5 name="exclamation-circle" size={16} color="#FF1744" />
                  <Text className="text-[#FF1744] text-xs font-semibold ml-3 flex-1">{formError}</Text>
                </View>
              )}

              {/* Contact Type Toggle Slider */}
              <View className="mb-6">
                <Text className="text-white/40 text-xs font-bold uppercase mb-3">Protocol Level</Text>
                <View className="flex-row space-x-4 bg-black/40 border border-white/10 rounded-2xl p-1">
                  <TouchableOpacity 
                    disabled={adding}
                    onPress={() => {
                      setFormError(null);
                      setContactType('PERSONAL');
                    }}
                    className={`flex-1 py-4 rounded-xl items-center ${contactType === 'PERSONAL' ? 'bg-[#00E5FF]' : ''}`}
                  >
                    <Text className={`font-bold ${contactType === 'PERSONAL' ? 'text-background' : 'text-white/40'}`}>
                      PERSONAL
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    disabled={adding}
                    onPress={() => {
                      setFormError(null);
                      setContactType('POLICE');
                    }}
                    className={`flex-1 py-4 rounded-xl items-center ${contactType === 'POLICE' ? 'bg-[#FF1744]/20 border border-[#FF1744]/40' : ''}`}
                  >
                    <Text className={`font-bold ${contactType === 'POLICE' ? 'text-white' : 'text-white/40'}`}>
                      POLICE
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Contact Number Input */}
              <View className="mb-6">
                <Text className="text-white/40 text-xs font-bold uppercase mb-3">
                  Phone Number <Text className="text-[#FF1744]">*</Text>
                </Text>
                <TextInput
                  editable={!adding}
                  placeholder={contactType === 'POLICE' ? '911 or Dispatch Line' : '+1 (555) 000-0000'}
                  placeholderTextColor="rgba(255,255,255,0.2)"
                  value={contactPhone}
                  onChangeText={(text) => {
                    setFormError(null);
                    setContactPhone(text);
                  }}
                  keyboardType="phone-pad"
                  className="bg-black/40 border border-white/10 rounded-2xl p-4 text-white font-medium"
                />
              </View>

              {/* Contact Name Input */}
              <View className="mb-8">
                <Text className="text-white/40 text-xs font-bold uppercase mb-3">
                  Name {contactType === 'PERSONAL' ? <Text className="text-[#FF1744]">*</Text> : <Text className="text-white/20">(Optional)</Text>}
                </Text>
                <TextInput
                  editable={!adding}
                  placeholder={contactType === 'POLICE' ? 'Police Station (Optional)' : 'Guardian Full Name'}
                  placeholderTextColor="rgba(255,255,255,0.2)"
                  value={contactName}
                  onChangeText={(text) => {
                    setFormError(null);
                    setContactName(text);
                  }}
                  className="bg-black/40 border border-white/10 rounded-2xl p-4 text-white font-medium"
                />
              </View>

              {/* Action Buttons */}
              <View className="flex-row justify-between items-center">
                <TouchableOpacity disabled={adding} onPress={() => setModalVisible(false)} className="px-6">
                  <Text className="text-white/40 font-bold text-lg">Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  disabled={adding}
                  onPress={isEditMode ? handleUpdateContact : handleAddContact}
                  className={`px-10 py-5 rounded-3xl min-w-[160px] items-center justify-center flex-row ${
                    contactType === 'PERSONAL' ? 'bg-[#00E5FF] neon-shadow-blue' : 'bg-[#FF1744] neon-shadow-red'
                  }`}
                >
                  {adding ? (
                    <ActivityIndicator size="small" color={contactType === 'PERSONAL' ? '#0F172A' : '#ffffff'} />
                  ) : (
                    <Text className={`font-bold text-lg ${contactType === 'PERSONAL' ? 'text-background' : 'text-white'}`}>
                      {isEditMode ? 'Update Link' : 'Link Contact'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </GlassCard>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* 6. Custom Delete Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={deleteConfirmVisible}
        onRequestClose={() => {
          if (!deleting) setDeleteConfirmVisible(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <GlassCard style={[styles.modalContent, { borderColor: 'rgba(255, 23, 68, 0.15)', borderWidth: 1 }]} className="p-8">
            {/* Warning Shield Badge */}
            <View className="w-16 h-16 bg-[#FF1744]/10 rounded-full items-center justify-center mb-6 border border-[#FF1744]/20 self-center">
              <FontAwesome5 name="exclamation-triangle" size={24} color="#FF1744" />
            </View>

            <Text className="text-white text-2xl font-bold text-center mb-3">Delete Guard Link?</Text>
            
            <Text className="text-white/40 text-sm text-center mb-6 leading-relaxed">
              Are you sure you want to remove{' '}
              <Text className="text-white font-bold">
                {contactToDelete?.contact.name || (contactToDelete?.listType === 'police' ? 'Emergency Dispatch' : 'Guardian')}
              </Text>{' '}
              ({contactToDelete?.contact.phone}) from your safeguard network? This action cannot be undone.
            </Text>

            {/* Error Banner inside Modal */}
            {deleteError && (
              <View className="bg-[#FF1744]/10 border border-[#FF1744]/30 rounded-2xl p-4 mb-6 flex-row items-center">
                <FontAwesome5 name="exclamation-circle" size={14} color="#FF1744" />
                <Text className="text-[#FF1744] text-xs font-semibold ml-3 flex-1">{deleteError}</Text>
              </View>
            )}

            {/* Action Buttons */}
            <View className="flex-row justify-between items-center space-x-4">
              <TouchableOpacity 
                disabled={deleting} 
                onPress={() => setDeleteConfirmVisible(false)} 
                className="px-6 py-4 rounded-2xl border border-white/10 flex-1 mr-4 items-center"
              >
                <Text className="text-white/60 font-bold text-base">Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                disabled={deleting}
                onPress={handleConfirmDelete}
                className="bg-[#FF1744] px-6 py-4 rounded-2xl flex-1 items-center neon-shadow-red"
              >
                {deleting ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text className="text-white font-bold text-base">Delete Link</Text>
                )}
              </TouchableOpacity>
            </View>
          </GlassCard>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    position: 'absolute',
    bottom: 110,
    right: 20,
    zIndex: 100,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.95)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 40,
    backgroundColor: '#0F172A',
  }
});
