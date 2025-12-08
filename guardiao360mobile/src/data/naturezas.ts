// src/data/naturezas.ts

export const naturezasCBMPE = [
  // --- GRUPO 1: INCÊNDIOS (Baseado em GBI.csv) ---
  { codigo: '1.01', descricao: 'INCENDIO EM VEGETACAO', tipo: 'Incêndio' },
  { codigo: '1.02', descricao: 'INCENDIO EM RESIDENCIA', tipo: 'Incêndio' },
  { codigo: '1.03', descricao: 'INCENDIO EM VEICULO', tipo: 'Incêndio' },
  { codigo: '1.04', descricao: 'INCENDIO EM LIXO', tipo: 'Incêndio' },
  { codigo: '1.05', descricao: 'INCENDIO EM COMERCIO', tipo: 'Incêndio' },

  // --- GRUPO 2: SALVAMENTOS (Baseado em GBS.csv) ---
  { codigo: '2.01', descricao: 'QUEDA DE ARVORE', tipo: 'Salvamento' },
  { codigo: '2.02', descricao: 'CAPTURA DE ANIMAL', tipo: 'Salvamento' },
  { codigo: '2.03', descricao: 'VISTORIA', tipo: 'Prevenção' },
  { codigo: '2.04', descricao: 'ABASTECIMENTO D\'AGUA', tipo: 'Social' },
  { codigo: '2.05', descricao: 'ENXAME DE ABELHAS', tipo: 'Salvamento' },
  
  // --- GRUPO 3: APH (Baseado em GBAPH.csv) ---
  { codigo: '3.01', descricao: 'ACIDENTE MOTO X CARRO', tipo: 'APH' },
  { codigo: '3.02', descricao: 'QUEDA DE PROPRIA ALTURA', tipo: 'APH' },
  { codigo: '3.03', descricao: 'MAL SUBITO', tipo: 'APH' },
  { codigo: '3.04', descricao: 'FERIMENTO ARMA DE FOGO', tipo: 'APH' },
  { codigo: '3.05', descricao: 'ATROPELAMENTO', tipo: 'APH' },
];