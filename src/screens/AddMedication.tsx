import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';
import db from '../services/databaseService';
import * as Notifications from 'expo-notifications';

export default function AddMedication({ onSave }: { onSave: () => void }) {
  const [name, setName] = useState('');
  const [interval, setInterval] = useState('');
  const [days, setDays] = useState('');

  const saveMedication = async () => {
    if (!name || !interval || !days) {
      Alert.alert("Erro", "Preencha todos os campos");
      return;
    }

    const intervalNum = parseInt(interval);
    const daysNum = parseInt(days);
    const startDate = new Date();
    const startIso = startDate.toISOString();

    const result = db.runSync(
      'INSERT INTO medications (name, interval_hours, duration_days, start_datetime) VALUES (?, ?, ?, ?)',
      [name, intervalNum, daysNum, startIso]
    );

    const medicationId = result.lastInsertRowId;
    const totalDoses = Math.floor((daysNum * 24) / intervalNum);

    for (let i = 0; i < totalDoses; i++) {
      const doseTime = new Date(startDate.getTime() + i * intervalNum * 60 * 60 * 1000);
      const doseIso = doseTime.toISOString();

      db.runSync(
        'INSERT INTO dosages (medication_id, scheduled_time) VALUES (?, ?)',
        [medicationId, doseIso]
      );

      if (doseTime > new Date()) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Hora do Remédio",
            body: `Tomar: ${name}`,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: doseTime,
          },
        });
      }
    }

    Alert.alert("Sucesso", "Tratamento agendado!");
    setName('');
    setInterval('');
    setDays('');
    onSave();
  };

  return (
    <View style={styles.form}>
      <TextInput
        placeholder="Nome do Remédio"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <TextInput
        placeholder="Intervalo (horas)"
        value={interval}
        onChangeText={setInterval}
        keyboardType="numeric"
        style={styles.input}
      />
      <TextInput
        placeholder="Duração (dias)"
        value={days}
        onChangeText={setDays}
        keyboardType="numeric"
        style={styles.input}
      />
      <Button title="Salvar Tratamento" onPress={saveMedication} />
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    padding: 20,
    width: '100%',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
});