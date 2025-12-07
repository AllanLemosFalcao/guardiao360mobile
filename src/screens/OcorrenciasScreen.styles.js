import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  // --- Header Superior ---
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  backButton: {
    padding: 4,
  },
  
  // --- NOVO: Área de Filtros (Dropdowns) ---
  filtersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#FAFAFA',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  dropdownButton: {
    flex: 1,
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD',
    marginHorizontal: 4,
    elevation: 1,
  },
  dropdownText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },

  // --- MODAL (Menu Suspenso) ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.85,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#1976D2',
    textAlign: 'center',
  },
  modalItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalItemText: {
    fontSize: 14,
    color: '#333',
  },
  modalItemTextSelected: {
    color: '#1976D2',
    fontWeight: 'bold',
  },

  // --- Seção: Histórico (Cards Originais Mantidos) ---
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 20,
    paddingTop: 10,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  // Card Pequeno (Histórico) - MANTIDO IDÊNTICO
  card: {
    backgroundColor: '#fff',
    width: '48%', // Mantendo 2 colunas
    borderRadius: 12,
    padding: 12,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#eee',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#444',
  },
  cardLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 2,
    marginTop: 4,
  },
  cardValue: {
    fontWeight: '500',
    color: '#000',
  },
  statusText: {
    marginTop: 8,
    fontSize: 10,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
  },
});