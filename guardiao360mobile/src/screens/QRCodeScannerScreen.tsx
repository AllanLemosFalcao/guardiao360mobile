import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';

export default function QRCodeScannerScreen() {
  const navigation = useNavigation();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    const getPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };
    getPermissions();
  }, []);

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    setScanned(true);
    
    // --- LÓGICA DE SIMULAÇÃO (MOCK) ---
    Alert.alert(
      "Equipamento Identificado",
      `Código: ${data}\n\nItem: Motosserra Stihl MS 382\nStatus: Operacional\nÚltima Manutenção: 10/11/2025`,
      [
        { 
          text: "Fechar", 
          onPress: () => setScanned(false) 
        },
        {
          text: "Vincular à Ocorrência",
          onPress: () => {
            Alert.alert("Sucesso", "Equipamento vinculado à ocorrência atual (Simulação)");
            navigation.goBack();
          }
        }
      ]
    );
  };

  if (hasPermission === null) {
    return <View style={styles.container}><Text>Solicitando permissão de câmera...</Text></View>;
  }
  if (hasPermission === false) {
    return <View style={styles.container}><Text>Sem acesso à câmera</Text></View>;
  }

  return (
    <SafeAreaView style={styles.container}>
      
      {/* CÂMERA */}
      <CameraView
        style={StyleSheet.absoluteFillObject}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
      />

      {/* OVERLAY (MÁSCARA ESCURA COM QUADRADO TRANSPARENTE) */}
      <View style={styles.overlay}>
        <View style={styles.topOverlay}>
          <Text style={styles.instructionText}>Aponte para o QR Code do equipamento</Text>
        </View>
        
        <View style={styles.middleOverlay}>
          <View style={styles.sideOverlay} />
          <View style={styles.focusedContainer}>
            {/* Cantoneiras Visuais */}
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
          <View style={styles.sideOverlay} />
        </View>
        
        <View style={styles.bottomOverlay}>
          <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
            <Feather name="x" size={32} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.closeText}>Cancelar</Text>
        </View>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  overlay: {
    flex: 1,
  },
  // Áreas escuras
  topOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
  },
  sideOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  middleOverlay: {
    flexDirection: 'row',
    height: 250, 
  },
  focusedContainer: {
    width: 250, 
    height: 250,
  },
  
  // Texto e Botões
  instructionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 40,
  },
  // O ERRO ESTAVA NESTA LINHA ABAIXO (estava cortada):
  closeButton: {
    backgroundColor: 'rgba(255,255,255,0.2)', 
    padding: 15,
    borderRadius: 50,
    marginBottom: 5,
  },
  closeText: {
    color: '#fff',
    fontSize: 14,
  },

  // Cantoneiras
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#00FF00', 
    borderWidth: 4,
  },
  topLeft: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  topRight: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  bottomLeft: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  bottomRight: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },
});