import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { registerForPushNotificationsAsync } from './src/services/notificationService';
import * as Notifications from 'expo-notifications';
import { setupDatabase } from './src/services/databaseService';
import AddMedication from './src/screens/AddMedication';
import HomeScreen from './src/screens/HomeScreen';

export default function App() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [view, setView] = useState<'home' | 'add'>('home');

  useEffect(() => {
    async function init() {
      await registerForPushNotificationsAsync();
      setupDatabase();
    }
    init();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>ContaCerta</Text>
        <TouchableOpacity 
          style={styles.navBtn} 
          onPress={() => setView(view === 'home' ? 'add' : 'home')}
        >
          <Text style={styles.navBtnText}>{view === 'home' ? '+ Novo' : 'Voltar'}</Text>
        </TouchableOpacity>
      </View>

      {view === 'home' ? (
        <HomeScreen refreshKey={refreshKey} />
      ) : (
        <AddMedication onSave={() => {
          setRefreshKey(prev => prev + 1);
          setView('home');
        }} />
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