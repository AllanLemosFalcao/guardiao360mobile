import { StyleSheet } from 'react-native';

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
    // Sombra para iOS
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
  
  // --- Área de Filtros (Topo) ---
  filtersScroll: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    maxHeight: 60,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipSelected: {
    backgroundColor: '#B71C1C', // Vermelho Bombeiro
    borderColor: '#B71C1C',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  filterTextSelected: {
    color: '#fff',
  },

  // --- Seção: Em Andamento (Parte de Cima) ---
  sectionContainer: {
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  // Card Destacado (Ativo)
  activeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 280, // Largura fixa para permitir scroll horizontal
    borderLeftWidth: 5,
    borderLeftColor: '#F57C00', // Laranja para "Em andamento"
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  activeCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    alignItems: 'center',
  },
  activeLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#F57C00',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    overflow: 'hidden', // Importante para o borderRadius funcionar no texto
  },
  
  // --- Seção: Histórico (Parte de Baixo / Grid) ---
  historyHeader: {
    marginTop: 20,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  // Card Pequeno (Histórico)
  card: {
    backgroundColor: '#fff',
    width: '48%',
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
  statusBadge: {
    marginTop: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: '#E8F5E9',
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
});