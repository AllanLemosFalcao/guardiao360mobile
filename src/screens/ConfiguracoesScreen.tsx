import React from 'react';
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView 
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { styles } from './ConfiguracoesScreen.styles';

export default function ConfiguracoesScreen() {
  const navigation = useNavigation();

  const handleLogout = () => {
    // Aqui viria a lógica de limpar sessão
    navigation.navigate('Login' as never);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Feather name="chevron-left" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Configurações</Text>
        </View>

        {/* Perfil */}
        <View style={styles.profileSection}>
          <Image 
            source={{ uri: 'https://github.com/github.png' }} // Foto de exemplo
            style={styles.avatar}
          />
          <Text style={styles.userName}>Capitão João Silva</Text>
          <Text style={styles.userUnit}>Unidade: 3º Batalhão – Recife</Text>
        </View>

        {/* Menu de Opções */}
        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Acessibilidade</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Editar perfil</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Atualizações</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Suporte</Text>
          </TouchableOpacity>
        </View>

        {/* Botão Logout */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Feather name="log-out" size={24} color="#333" />
            <Text style={styles.logoutText}>Log out</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}