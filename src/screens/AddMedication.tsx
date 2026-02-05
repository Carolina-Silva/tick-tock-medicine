import React, { useState } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
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
  const [startDate, setStartDate] = useState(new Date());
  
  const [showPicker, setShowPicker] = useState(false);
  const [mode, setMode] = useState<'date' | 'time'>('date');

  const pickImage = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Erro", "Precisamos de permissão para a câmera");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const showMode = (currentMode: 'date' | 'time') => {
    setMode(currentMode);
    setShowPicker(true);
  };

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowPicker(false);
    if (event.type === 'set' && selectedDate) {
      setStartDate(selectedDate);
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
        await FileSystem.copyAsync({ from: image, to: finalPhotoUri });
      }

      const intervalNum = parseFloat(interval.replace(',', '.'));
      const daysNum = parseInt(days);

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
      Alert.alert("Erro", String(error));
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

      <TextInput 
        label="Nome do Remédio" 
        value={name} 
        onChangeText={setName} 
        style={styles.input} 
        mode="outlined" 
      />

      <View style={styles.row}>
        <Button 
          mode="outlined" 
          onPress={() => showMode('date')} 
          style={styles.flexBtn}
          icon="calendar"
        >
          {startDate.toLocaleDateString('pt-BR')}
        </Button>

        <Button 
          mode="outlined" 
          onPress={() => showMode('time')} 
          style={styles.flexBtn}
          icon="clock"
        >
          {startDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </Button>
      </View>

      {showPicker && (
        <DateTimePicker
          value={startDate}
          mode={mode}
          is24Hour={true}
          display="default"
          onChange={onChangeDate}
        />
      )}

      <TextInput 
        label="Intervalo (ex: 8 ou 5.5)" 
        value={interval} 
        onChangeText={setInterval} 
        keyboardType="numeric" 
        style={styles.input} 
        mode="outlined" 
      />

      <TextInput 
        label="Duração (dias)" 
        value={days} 
        onChangeText={setDays} 
        keyboardType="numeric" 
        style={styles.input} 
        mode="outlined" 
      />

      <Button 
        mode="contained" 
        onPress={saveMedication} 
        style={styles.button}
      >
        Salvar Tratamento
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  form: { padding: 20 },
  input: { marginBottom: 10 },
  row: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 10 
  },
  flexBtn: { flex: 1, marginHorizontal: 2 },
  imagePicker: { marginBottom: 15 },
  imagePlaceholder: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0'
  },
  button: { marginTop: 10 }
});