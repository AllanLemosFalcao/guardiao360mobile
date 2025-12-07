import { StyleSheet, Platform } from 'react-native';

export const styles = StyleSheet.create({
  // --- Estrutura Principal ---
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5', // Fundo levemente cinza para destacar os cards
  },
  
  // --- Cabeçalho (Header) ---
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    // Sombra suave no Header
    elevation: 2, 
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    paddingTop: Platform.OS === 'android' ? 40 : 12, // Ajuste para StatusBar
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  backButton: {
    padding: 4,
  },

  // --- Barra de Ações (Botões Coloridos) ---
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFF',
    marginBottom: 10,
  },
  stageButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3, // Sombra no Android
    shadowColor: '#000', // Sombra no iOS
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    height: 70, // Altura fixa para manter os 3 botões iguais
  },
  stageButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 11, // Fonte levemente menor para caber em telas pequenas
    marginTop: 4,
    textTransform: 'uppercase',
  },
  // Obs: As cores de fundo (backgroundColor) dos botões estão definidas inline no arquivo .tsx 
  // para permitir cores diferentes (Azul, Laranja, Verde).

  // --- Conteúdo Scrollável ---
  content: {
    padding: 16,
    paddingBottom: 40,
  },

  // --- Título e ID ---
  ocorrenciaTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 2,
  },

  // --- Linhas de Detalhes (Lista) ---
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  detailLabel: {
    fontSize: 14,
    color: '#757575',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 15,
    color: '#212121',
    fontWeight: 'bold',
    maxWidth: '60%', // Evita que texto longo quebre o layout
    textAlign: 'right',
  },

  // --- Badge de Status ---
  statusBadge: {
    backgroundColor: '#FF9800', // Cor padrão (Pendente), muda logicamente no TSX
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },

  // --- Seção de Texto (Resumo) ---
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 24,
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EEE',
  },

  // --- Botão Timeline (Cinza) ---
  grayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ECEFF1',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#CFD8DC',
  },
  grayButtonText: {
    marginLeft: 10,
    color: '#455A64',
    fontWeight: 'bold',
    fontSize: 14,
  },
});