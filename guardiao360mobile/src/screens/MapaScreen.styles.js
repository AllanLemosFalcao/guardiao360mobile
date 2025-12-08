import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  
  // --- BARRA DE DROPDOWNS (NOVO) ---
  filtersContainer: {
    position: 'absolute',
    top: 50, // Abaixo da StatusBar
    left: 20,
    right: 20,
    flexDirection: 'row', // Lado a lado
    justifyContent: 'space-between',
    zIndex: 10,
  },
  
  // Estilo do Botão do Dropdown
  dropdownButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginHorizontal: 5, // Espaço entre os dois dropdowns
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
  },
  dropdownText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },

  // --- MODAL DE SELEÇÃO (O MENU QUE ABRE) ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)', // Fundo escuro transparente
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.8,
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
    borderBottomColor: '#eee',
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

  // --- CALLOUT (BALÃO) ---
  calloutContainer: {
    width: 220,
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 5,
    paddingBottom: 10,
  },
  calloutHeader: {
    padding: 8,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    alignItems: 'center',
  },
  calloutTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  calloutContent: {
    padding: 10,
  },
  calloutLabel: {
    fontSize: 12,
    color: '#333',
    marginBottom: 2,
  },
  btnDetalhes: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 5,
  },
  btnText: {
    fontSize: 12,
    color: '#1976D2',
    fontWeight: 'bold',
    marginRight: 2,
  },
  
  // --- SETA DO BALÃO ---
  arrow: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderTopColor: '#fff',
    borderWidth: 16,
    alignSelf: 'center',
    marginTop: -32,
  },
  arrowBorder: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderTopColor: '#00000020',
    borderWidth: 16,
    alignSelf: 'center',
    marginTop: -0.5,
  },
  
  // --- LEGENDA ---
  legendContainer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 10,
    borderRadius: 8,
    elevation: 3,
  },
  legendTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#555',
  },
});