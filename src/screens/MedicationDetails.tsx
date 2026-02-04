import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Card, List, Button, Text, Icon } from 'react-native-paper';
import { getDosagesByMedication, markDoseAsTaken } from '../services/databaseService';

export default function MedicationDetails({ medication, onBack }: { medication: any, onBack: () => void }) {
  const [dosages, setDosages] = useState<any[]>([]);

  const loadDosages = () => {
    const data = getDosagesByMedication(medication.id);
    setDosages(data);
  };

  useEffect(() => {
    loadDosages();
  }, []);

  return (
    <View style={styles.container}>
      <Card style={styles.headerCard}>
        {medication.photo_uri && <Card.Cover source={{ uri: medication.photo_uri }} />}
        <Card.Title title={medication.name} titleStyle={styles.title} />
      </Card>

      <FlatList
        data={dosages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <List.Item
            title={`Tomar em: ${new Date(item.scheduled_time).toLocaleString('pt-BR')}`}
            style={[styles.doseCard, item.status === 'taken' && styles.doseTaken]}
            right={() =>
              item.status === 'pending' ? (
                <Button
                  mode="contained"
                  onPress={() => {
                    markDoseAsTaken(item.id);
                    loadDosages();
                  }}
                >
                  Tomar
                </Button>
              ) : (
                <View style={styles.takenContainer}>
                   <Icon source="check-circle" size={24} color="green"/>
                  <Text style={styles.takenText}>Tomado</Text>
                </View>
              )
            }
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  headerCard: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  doseCard: {
    backgroundColor: '#f1f1f1',
    borderRadius: 8,
    marginBottom: 10,
  },
  doseTaken: {
    backgroundColor: '#e8f5e9',
  },
  takenContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10
  },
  takenText: {
    marginLeft: 8,
    color: 'green',
    fontWeight: 'bold',
  }
});