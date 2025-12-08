import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

export const AuthService = {
  
  // 1. FAZER LOGIN E GUARDAR NO COFRE
  login: async (email: string, senha: string) => {
    try {
      const response = await api.post('/login', { email, senha });
      const { token, usuario } = response.data;

      // Guarda o Token e os Dados no celular
      await AsyncStorage.setItem('@Guardiao360:token', token);
      await AsyncStorage.setItem('@Guardiao360:user', JSON.stringify(usuario));

      return usuario;
    } catch (error: any) {
      throw error.response ? error.response.data : new Error('Erro de Conexão');
    }
  },

  // 2. FAZER LOGOUT (LIMPAR O COFRE)
  logout: async () => {
    await AsyncStorage.clear();
  },

  // 3. LER O USUÁRIO (PARA EXIBIR NA HOME)
  getUsuarioLogado: async () => {
    const json = await AsyncStorage.getItem('@Guardiao360:user');
    return json ? JSON.parse(json) : null;
  },

  // 4. VERIFICAR SE TEM TOKEN (PARA O APP SABER SE VAI PRA HOME DIRETO)
  getToken: async () => {
    return await AsyncStorage.getItem('@Guardiao360:token');
  }
};