import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { registerForPushNotificationsAsync } from './src/services/notificationService';
import * as Notifications from 'expo-notifications';
import { setupDatabase } from './src/services/databaseService';
import AddMedication from './src/screens/AddMedication';
import HomeScreen from './src/screens/HomeScreen';
import MedicationDetails from './src/screens/MedicationDetails';

type ViewState = 'home' | 'add' | 'details';

export default function App() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [view, setView] = useState<ViewState>('home');
  const [selectedMedication, setSelectedMedication] = useState<any>(null);

  useEffect(() => {
    async function init() {
      await registerForPushNotificationsAsync();
      setupDatabase();
    }
    init();
  }, []);

  const handleSelectMedication = (medication: any) => {
    setSelectedMedication(medication);
    setView('details');
  };

  const handleBack = () => {
    setSelectedMedication(null);
    setView('home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>ContaCerta</Text>
        {view !== 'details' && (
          <TouchableOpacity 
            style={styles.navBtn} 
            onPress={() => setView(view === 'home' ? 'add' : 'home')}
          >
            <Text style={styles.navBtnText}>{view === 'home' ? '+ Novo' : 'Voltar'}</Text>
          </TouchableOpacity>
        )}
      </View>

      {view === 'home' && (
        <HomeScreen 
          refreshKey={refreshKey} 
          onSelectMedication={handleSelectMedication} 
        />
      )}

      {view === 'add' && (
        <AddMedication onSave={() => {
          setRefreshKey(prev => prev + 1);
          setView('home');
        }} />
      )}

      {view === 'details' && selectedMedication && (
        <MedicationDetails 
          medication={selectedMedication} 
          onBack={handleBack} 
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 50 },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20,
    marginBottom: 10 
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#2196F3' },
  navBtn: { backgroundColor: '#2196F3', padding: 8, borderRadius: 5 },
  navBtnText: { color: '#fff', fontWeight: 'bold' }
});