import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, TextInput } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { GlassCard } from '@/components/ui/GlassCard';
import { router } from 'expo-router';
import { showComingSoon } from '@/utils/feedback';

export default function EmergencyContactsScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '', type: 'PERSONAL' });
  const [contacts, setContacts] = useState([
    { id: '1', name: 'Police', type: 'EMERGENCY', number: '911', initial: 'P', color: '#FF1744' },
    { id: '2', name: 'Mom', type: 'PERSONAL', number: '+1 (555) 0123-4567', initial: 'M', color: '#00E5FF' },
  ]);

  const handleAddContact = () => {
    if (!newContact.name || !newContact.phone) return;
    
    const id = (contacts.length + 1).toString();
    const initial = newContact.name.charAt(0).toUpperCase();
    const color = newContact.type === 'POLICE' ? '#FF1744' : '#00E5FF';
    
    setContacts([...contacts, { 
      id, 
      name: newContact.name, 
      type: newContact.type, 
      number: newContact.phone, 
      initial, 
      color 
    }]);
    
    setNewContact({ name: '', phone: '', type: 'PERSONAL' });
    setModalVisible(false);
  };

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="px-6 pt-16 pb-6 bg-[#0F172A] flex-row items-center justify-between border-b border-white/5">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <FontAwesome5 name="arrow-left" size={20} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-2xl font-bold">Emergency Contacts</Text>
        </View>
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => showComingSoon('Emergency Notifications')}>
            <FontAwesome5 name="bell" size={18} color="#00E676" style={{ marginRight: 20 }} />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => showComingSoon('Active Guardian Profile')}
            className="w-8 h-8 rounded-full border border-white/20 overflow-hidden"
          >
             <View className="bg-white/10 w-full h-full" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 150 }}>
        {/* Info Card */}
        <View className="bg-primary/5 border border-primary/20 rounded-[32px] p-6 mb-8 flex-row items-start">
          <View className="w-12 h-12 bg-primary/10 rounded-2xl items-center justify-center mr-5 mt-1">
             <FontAwesome5 name="shield-alt" size={20} color="#00E676" />
          </View>
          <View className="flex-1">
            <Text className="text-secondary font-bold text-lg mb-2">Secure Protocols Active</Text>
            <Text className="text-white/40 text-sm leading-relaxed">
              Your emergency contacts will be automatically notified via encrypted channels if an intrusion is detected at your primary node.
            </Text>
          </View>
        </View>

        {/* List Header */}
        <View className="flex-row justify-between items-center mb-6 px-2">
          <Text className="text-white/40 text-[10px] font-bold tracking-[4px] uppercase">Active Guardians</Text>
          <Text className="text-secondary text-[10px] font-bold tracking-[2px] uppercase">{contacts.length} Entries</Text>
        </View>

        {/* Contacts List */}
        {contacts.map((contact, index) => (
          <View key={contact.id} className="relative mb-4">
            {index === 0 && (
              <View className="absolute -inset-[1px] bg-danger/10 rounded-[24px] border border-danger/20" />
            )}
            <GlassCard className="p-5 flex-row items-center justify-between border-l-4" style={{ borderLeftColor: contact.color }}>
              <View className="flex-row items-center">
                <View className="w-14 h-14 rounded-full bg-white/5 items-center justify-center mr-4 border border-white/5">
                  <Text style={{ color: contact.color }} className="text-xl font-bold">{contact.initial}</Text>
                </View>
                <View>
                  <View className="flex-row items-center mb-1">
                    <Text className="text-white text-xl font-bold mr-3">{contact.name}</Text>
                    <View className="bg-white/5 px-2 py-0.5 rounded border border-white/10">
                      <Text className="text-white/40 text-[8px] font-bold tracking-widest uppercase">{contact.type}</Text>
                    </View>
                  </View>
                  <Text className="text-white/50 font-mono text-sm">{contact.number}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => showComingSoon('Guardian Prioritization')}>
                <FontAwesome5 name="equals" size={16} color="rgba(255,255,255,0.2)" />
              </TouchableOpacity>
            </GlassCard>
          </View>
        ))}

        {/* Add New Node Placeholder */}
        <TouchableOpacity 
          onPress={() => setModalVisible(true)}
          className="border-2 border-dashed border-white/5 rounded-[32px] p-8 items-center justify-center mt-4"
        >
          <View className="w-12 h-12 bg-white/5 rounded-full items-center justify-center mb-4">
            <FontAwesome5 name="plus" size={16} color="#00E5FF" />
          </View>
          <Text className="text-white/20 font-mono text-[10px] tracking-[4px] uppercase">Secure New Node</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Add Contact Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <GlassCard style={styles.modalContent} className="p-8 border border-white/10">
            <View className="flex-row justify-between items-center mb-8">
              <Text className="text-white text-2xl font-bold">Add Contact</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <FontAwesome5 name="times" size={20} color="rgba(255,255,255,0.4)" />
              </TouchableOpacity>
            </View>

            <View className="mb-6">
              <Text className="text-white/40 text-xs font-bold uppercase mb-3">Name</Text>
              <TextInput
                placeholder="Contact name"
                placeholderTextColor="rgba(255,255,255,0.2)"
                value={newContact.name}
                onChangeText={(text) => setNewContact({...newContact, name: text})}
                className="bg-black/40 border border-white/10 rounded-2xl p-4 text-white font-medium"
              />
            </View>

            <View className="mb-8">
              <Text className="text-white/40 text-xs font-bold uppercase mb-3">Phone</Text>
              <TextInput
                placeholder="+1 (555) 000-0000"
                placeholderTextColor="rgba(255,255,255,0.2)"
                value={newContact.phone}
                onChangeText={(text) => setNewContact({...newContact, phone: text})}
                keyboardType="phone-pad"
                className="bg-black/40 border border-white/10 rounded-2xl p-4 text-white font-medium"
              />
            </View>

            <View className="mb-10">
              <Text className="text-white/40 text-xs font-bold uppercase mb-3">Type</Text>
              <View className="flex-row space-x-4">
                <TouchableOpacity 
                  onPress={() => setNewContact({...newContact, type: 'POLICE'})}
                  className={`flex-1 py-4 rounded-2xl items-center border ${newContact.type === 'POLICE' ? 'bg-[#FF1744]/20 border-[#FF1744]' : 'bg-white/5 border-white/10'}`}
                >
                  <Text className={`font-bold ${newContact.type === 'POLICE' ? 'text-white' : 'text-white/40'}`}>POLICE</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => setNewContact({...newContact, type: 'PERSONAL'})}
                  className={`flex-1 py-4 rounded-2xl items-center border ${newContact.type === 'PERSONAL' ? 'bg-[#00E5FF] border-[#00E5FF]' : 'bg-white/5 border-white/10'} ml-4`}
                >
                  <Text className={`font-bold ${newContact.type === 'PERSONAL' ? 'text-background' : 'text-white/40'}`}>PERSONAL</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View className="flex-row justify-between items-center">
              <TouchableOpacity onPress={() => setModalVisible(false)} className="px-6">
                <Text className="text-white/40 font-bold text-lg">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleAddContact}
                className="bg-secondary px-10 py-5 rounded-3xl neon-shadow-green"
              >
                <Text className="text-background font-bold text-lg">Add Contact</Text>
              </TouchableOpacity>
            </View>
          </GlassCard>
        </View>
      </Modal>

      {/* Floating Add Button */}
      <View style={styles.fabContainer}>
        <TouchableOpacity 
          onPress={() => setModalVisible(true)}
          className="bg-secondary px-8 py-5 rounded-[28px] flex-row items-center shadow-2xl neon-shadow-green"
        >
          <FontAwesome5 name="plus" size={18} color="#0F172A" />
          <Text className="text-background font-bold text-lg ml-4">Add Contact</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    position: 'absolute',
    bottom: 40,
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

