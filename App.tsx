import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { registerForPushNotificationsAsync } from './src/services/notificationService';
import { setupDatabase } from './src/services/databaseService';
import AddMedication from './src/screens/AddMedication';
import HomeScreen from './src/screens/HomeScreen';
import MedicationDetails from './src/screens/MedicationDetails';
import { Appbar, MD3LightTheme as DefaultTheme, PaperProvider } from 'react-native-paper';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#2196F3', // Original blue color of the app
  },
};

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

  const isDetailsView = view === 'details';

  return (
    <PaperProvider theme={theme}>
      <SafeAreaView style={styles.container}>
        <Appbar.Header>
          {isDetailsView ? (
            <Appbar.BackAction onPress={handleBack} />
          ) : null}
          <Appbar.Content title="TICK TOCK medicine" />
          {view === 'home' ? (
            <Appbar.Action icon="plus" onPress={() => setView('add')} />
          ) : view === 'add' ? (
            <Appbar.BackAction onPress={() => setView('home')} />
          ) : null}
        </Appbar.Header>

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
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
});