import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    elevation: 2,
  },
  backButton: {
    padding: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  
  // --- Lista ---
  content: {
    padding: 20,
    paddingBottom: 40,
  },

  // --- Item da Timeline ---
  itemContainer: {
    flexDirection: 'row',
    marginBottom: 0, // O espaçamento é controlado pela altura mínima do conteúdo
  },
  
  // Coluna da Esquerda (Hora)
  timeColumn: {
    width: 60,
    alignItems: 'flex-end',
    paddingRight: 10,
    paddingTop: 4,
  },
  timeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
  },

  // Coluna do Meio (Linha e Ícone)
  indicatorColumn: {
    width: 30,
    alignItems: 'center',
  },
  line: {
    position: 'absolute',
    top: 24, // Começa abaixo do ícone
    bottom: -20, // Estica até o próximo item
    width: 2,
    backgroundColor: '#E0E0E0',
    zIndex: 0,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    borderWidth: 2,
    borderColor: '#fff', // Borda branca para separar da linha
  },

  // Coluna da Direita (Conteúdo)
  cardColumn: {
    flex: 1,
    paddingLeft: 12,
    paddingBottom: 30, // Espaço entre os cards
  },
  card: {
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 13,
    color: '#555',
    marginBottom: 8,
    lineHeight: 18,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  authorText: {
    fontSize: 11,
    color: '#888',
    marginLeft: 4,
  },
});