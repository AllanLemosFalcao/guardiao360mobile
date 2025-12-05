import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function MapaScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Feather name="map" size={60} color="#ddd" />
        <Text style={styles.text}>Mapa de Ocorrências</Text>
        <Text style={styles.subText}>Integração com Google Maps em breve</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  text: { fontSize: 18, fontWeight: 'bold', color: '#555', marginTop: 20 },
  subText: { color: '#888', marginTop: 8 }
});