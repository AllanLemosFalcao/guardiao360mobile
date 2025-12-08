import axios from 'axios';

// ⚠️ IMPORTANTE: SUBSTITUA PELO SEU IPV4 DO COMPUTADOR
// Não use 'localhost' e nem '127.0.0.1'
// No Windows, rode 'ipconfig' no terminal para descobrir (Ex: 192.168.1.5)
const API_URL = 'http://192.168.3.16:3000/api'; 

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // Espera 10 segundos antes de desistir
});

export default api;