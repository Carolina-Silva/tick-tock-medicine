import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import db from '../services/databaseService';

interface Medication {
  id: number;
  name: string;
  interval_hours: number;
}

export default function HomeScreen({ refreshKey }: { refreshKey: number }) {
  const [medications, setMedications] = useState<Medication[]>([]);

  const loadMedications = () => {
    const results = db.getAllSync('SELECT * FROM medications') as Medication[];
    setMedications(results);
  };

  useEffect(() => {
    loadMedications();
  }, [refreshKey]);

  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>Seus Medicamentos</Text>
      {medications.length === 0 ? (
        <Text style={styles.empty}>Nenhum remédio cadastrado.</Text>
      ) : (
        <FlatList
          data={medications}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View>
                <Text style={styles.medName}>{item.name}</Text>
                <Text style={styles.medDetails}>A cada {item.interval_hours} horas</Text>
              </View>
              <TouchableOpacity 
                style={styles.deleteBtn}
                onPress={() => {
                  db.runSync('DELETE FROM medications WHERE id = ?', [item.id]);
                  loadMedications();
                }}
              >
                <Text style={{ color: 'white' }}>X</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  empty: {
    textAlign: 'center',
    color: '#888',
    marginTop: 20,
  },
  card: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  medName: {
    fontSize: 16,
    fontWeight: '600',
  },
  medDetails: {
    fontSize: 14,
    color: '#666',
  },
  deleteBtn: {
    backgroundColor: '#ff5252',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
