import React, { useState } from 'react';
import { View, StyleSheet, Alert, Image } from 'react-native';
import { TextInput, Button, Card, Text } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import db from '../services/databaseService';
import * as Notifications from 'expo-notifications';

export default function AddMedication({ onSave }: { onSave: () => void }) {
  const [name, setName] = useState('');
  const [interval, setInterval] = useState('');
  const [days, setDays] = useState('');
  const [image, setImage] = useState<string | null>(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const saveMedication = async () => {
    try {
      if (!name || !interval || !days) {
        Alert.alert("Erro", "Preencha todos os campos");
        return;
      }

      let finalPhotoUri = null;

      if (image) {
        const fileName = `${Date.now()}.jpg`;
        finalPhotoUri = `${FileSystem.documentDirectory}${fileName}`;

        const info = await FileSystem.getInfoAsync(image);
        if (info.exists) {
          await FileSystem.copyAsync({
            from: image,
            to: finalPhotoUri,
          });
        }
      }

      const intervalNum = parseInt(interval);
      const daysNum = parseInt(days);
      const startDate = new Date();

      const result = db.runSync(
        'INSERT INTO medications (name, interval_hours, duration_days, start_datetime, photo_uri) VALUES (?, ?, ?, ?, ?)',
        [name, intervalNum, daysNum, startDate.toISOString(), finalPhotoUri]
      );

      const medicationId = result.lastInsertRowId;

      const totalDoses = Math.floor((daysNum * 24) / intervalNum);

      for (let i = 0; i < totalDoses; i++) {
        const doseTime = new Date(startDate.getTime() + i * intervalNum * 60 * 60 * 1000);
        db.runSync(
          'INSERT INTO dosages (medication_id, scheduled_time) VALUES (?, ?)',
          [medicationId, doseTime.toISOString()]
        );

        if (doseTime > new Date()) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: "Hora do Remédio",
              body: `Tomar: ${name}`,
              data: { medicationId: medicationId }
            },
            identifier: `${medicationId}-${i}`,
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.DATE,
              date: doseTime,
            },
          });
        }
      }

      Alert.alert("Sucesso", "Tratamento agendado!");
      onSave();
    } catch (error) {
      console.error(error);
      Alert.alert("Erro no salvamento", String(error));
    }
  };

  return (
    <View style={styles.form}>
      <Card style={styles.imagePicker} onPress={pickImage}>
        {image ? (
          <Card.Cover source={{ uri: image }} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text>Toque para tirar foto do remédio</Text>
          </View>
        )}
      </Card>

      <TextInput label="Nome do Remédio" value={name} onChangeText={setName} style={styles.input} mode="outlined" />
      <TextInput label="Intervalo (horas)" value={interval} onChangeText={setInterval} keyboardType="numeric" style={styles.input} mode="outlined" />
      <TextInput label="Duração (dias)" value={days} onChangeText={setDays} keyboardType="numeric" style={styles.input} mode="outlined" />

      <Button mode="contained" onPress={saveMedication} style={styles.button}>
        Salvar Tratamento
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  form: { padding: 20 },
  input: { marginBottom: 10 },
  imagePicker: {
    marginBottom: 15,
  },
  imagePlaceholder: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0'
  },
  button: {
    marginTop: 10,
  }
});