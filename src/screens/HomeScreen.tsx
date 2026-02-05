import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, Image } from 'react-native';
import { Card, Text, IconButton } from 'react-native-paper';
import db from '../services/databaseService';
import * as Notifications from 'expo-notifications';

interface Medication {
  id: number;
  name: string;
  interval_hours: number;
  duration_days: number;
  photo_uri: string | null;
}

interface HomeScreenProps {
  refreshKey: number;
  onSelectMedication: (medication: any) => void;
}

export default function HomeScreen({ refreshKey, onSelectMedication }: HomeScreenProps) {
  const [medications, setMedications] = useState<Medication[]>([]);

  const loadMedications = () => {
    const results = db.getAllSync(
      'SELECT * FROM medications'
    ) as Medication[];

    setMedications(results);
  };

  useEffect(() => {
    loadMedications();
  }, [refreshKey]);

  return (
    <View style={styles.container}>
      {medications.length === 0 ? (
        <Text style={styles.empty}>Nenhum remédio cadastrado.</Text>
      ) : (
        <FlatList
          data={medications}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <Card style={styles.card} onPress={() => onSelectMedication(item)}>
              <Card.Content style={styles.cardContent}>
                {item.photo_uri && (
                  <Image source={{ uri: item.photo_uri }} style={styles.image} />
                )}
                <View style={styles.detailsContainer}>
                  <Text style={styles.medName}>{item.name}</Text>
                  <Text style={styles.medDetails}>
                    A cada {item.interval_hours} horas
                  </Text>
                </View>
                <IconButton
                  icon="delete"
                  onPress={async (e) => {
                    e.stopPropagation();

                    const totalDoses = Math.floor((item.duration_days * 24) / item.interval_hours);

                    for (let i = 0; i < totalDoses; i++) {
                      await Notifications.cancelScheduledNotificationAsync(`${item.id}-${i}`);
                    }

                    db.runSync('DELETE FROM medications WHERE id = ?', [item.id]);
                    loadMedications();
                  }}
                  style={styles.deleteButton}
                />
              </Card.Content>
            </Card>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    flex: 1,
  },
  empty: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  card: {
    marginBottom: 10,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
  },
  detailsContainer: {
    flex: 1,
  },
  medName: {
    fontSize: 16,
    fontWeight: '600',
  },
  medDetails: {
    fontSize: 14,
    color: '#666',
  },
  deleteButton: {
    marginLeft: 'auto',
  },
});
