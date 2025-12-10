import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

// A CHAVE MESTRA:
const TOKEN_KEY = '@Guardiao360:token';
const USER_KEY = '@Guardiao360:user';

export const AuthService = {
  
  login: async (email: string, senha: string) => {
    try {
      // O backend espera { email, senha }
      const response = await api.post('/login', { email, senha });
      
      // O backend retorna { auth: true, token: '...', usuario: {...} }
      const { token, usuario } = response.data;

      if (!token) throw new Error("Servidor não retornou token.");

      // Salva nas chaves corretas
      await AsyncStorage.setItem(TOKEN_KEY, token);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(usuario));

      return { user: usuario, token }; 
    } catch (error: any) {
      console.error("Erro Login:", error);
      throw error.response ? error.response.data : new Error('Falha na conexão com o servidor');
    }
  },

  logout: async () => {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
  },

  getUsuarioLogado: async () => {
    const json = await AsyncStorage.getItem(USER_KEY);
    return json ? JSON.parse(json) : null;
  },

  getToken: async () => {
    return await AsyncStorage.getItem(TOKEN_KEY);
  }
};