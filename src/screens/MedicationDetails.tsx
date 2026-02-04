import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';
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
      <TouchableOpacity onPress={onBack} style={styles.backBtn}>
        <Text style={styles.backBtnText}>← Voltar</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        {medication.photo_uri && (
          <Image source={{ uri: medication.photo_uri }} style={styles.medImage} />
        )}
        <Text style={styles.title}>{medication.name}</Text>
      </View>

      <FlatList
        data={dosages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={[styles.doseCard, item.status === 'taken' && styles.doseTaken]}>
            <Text style={styles.doseText}>
              {new Date(item.scheduled_time).toLocaleString('pt-BR')}
            </Text>
            {item.status === 'pending' ? (
              <TouchableOpacity 
                style={styles.takeBtn} 
                onPress={() => {
                  markDoseAsTaken(item.id);
                  loadDosages();
                }}
              >
                <Text style={styles.takeBtnText}>Marcar como Tomado</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.takenText}>✔ Tomado</Text>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  backBtn: { marginBottom: 20 },
  backBtnText: { color: '#2196F3', fontSize: 16, fontWeight: 'bold' },
  header: { alignItems: 'center', marginBottom: 20 },
  medImage: { width: 120, height: 120, borderRadius: 60, marginBottom: 10 },
  title: { fontSize: 24, fontWeight: 'bold' },
  doseCard: { 
    padding: 15, 
    backgroundColor: '#f1f1f1', 
    borderRadius: 8, 
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  doseTaken: { backgroundColor: '#e8f5e9', opacity: 0.7 },
  doseText: { fontSize: 14 },
  takeBtn: { backgroundColor: '#4CAF50', padding: 8, borderRadius: 5 },
  takeBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  takenText: { color: '#4CAF50', fontWeight: 'bold' }
});