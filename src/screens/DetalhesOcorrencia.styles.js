import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  // --- Header Superior ---
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#555',
  },

  // --- Área de Botões de Etapas ---
  actionButtonsContainer: {
    flexDirection: 'row',
    padding: 16,
    justifyContent: 'space-between',
    backgroundColor: '#FAFAFA',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  stageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  btnEtapa23: {
    backgroundColor: '#1976D2', // Azul
  },
  btnEtapa4: {
    backgroundColor: '#388E3C', // Verde
  },
  stageButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
    marginLeft: 6,
  },

  // --- Conteúdo Principal ---
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  
  // Título da Ocorrência
  ocorrenciaTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#C62828',
    marginBottom: 20,
  },

  // Linhas de Detalhes
  detailRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  detailLabel: {
    width: 110,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#777',
    textAlign: 'right',
    marginRight: 12,
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    color: '#444',
  },
  
  // Badge de Status
  statusBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
  },

  // --- Seção Mídias ---
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 30,
    marginBottom: 16,
  },
  mediaRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  mediaItem: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#eee',
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#999',
    overflow: 'hidden',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  descriptionText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
    marginBottom: 20,
  },

  // --- Botões Inferiores ---
  grayButton: {
    backgroundColor: '#E0E0E0',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  grayButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginLeft: 12,
  },
});