import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F9F9F9' 
  },
  header: { 
    padding: 20, 
    backgroundColor: '#fff', 
    borderBottomWidth: 1, 
    borderColor: '#eee' 
  },
  headerTitle: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: '#B71C1C' 
  },
  content: { 
    padding: 20, 
    paddingBottom: 100 
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginBottom: 20, 
    color: '#333' 
  },
  label: { 
    fontSize: 14, 
    color: '#444', 
    fontWeight: '600', 
    marginBottom: 6, 
    marginTop: 10 
  },
  input: { 
    backgroundColor: '#fff', 
    borderWidth: 1, 
    borderColor: '#DDD', 
    borderRadius: 8, 
    padding: 12 
  },
  inputSelect: { 
    backgroundColor: '#fff', 
    borderWidth: 1, 
    borderColor: '#DDD', 
    borderRadius: 8, 
    padding: 15 
  },
  row: { 
    flexDirection: 'row', 
    justifyContent: 'space-between' 
  },
  
  // Assinatura
  signatureBox: { 
    height: 250, 
    borderWidth: 1, 
    borderColor: '#CCC', 
    backgroundColor: '#FFF', 
    marginTop: 10 
  },
  signatureButtons: { 
    flexDirection: 'row', 
    justifyContent: 'flex-end', 
    marginTop: 10, 
    gap: 10 
  },
  smallBtn: { 
    padding: 10, 
    borderWidth: 1, 
    borderColor: '#CCC', 
    borderRadius: 6 
  },
  smallBtnConfirm: { 
    padding: 10, 
    backgroundColor: '#B71C1C', 
    borderRadius: 6 
  },

  // Modal
  modalHeader: { 
    flexDirection: 'row', 
    padding: 15, 
    alignItems: 'center', 
    borderBottomWidth: 1 
  },
  searchInput: { 
    flex: 1, 
    backgroundColor: '#F5F5F5', 
    padding: 10, 
    borderRadius: 8, 
    marginRight: 10 
  },
  itemLista: { 
    padding: 15, 
    borderBottomWidth: 1, 
    borderColor: '#EEE' 
  },

  // Rodapé
  footer: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    padding: 20, 
    backgroundColor: '#FFF', 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    borderTopWidth: 1, 
    borderColor: '#EEE' 
  },
  btnPrimary: { 
    backgroundColor: '#B71C1C', 
    paddingVertical: 14, 
    paddingHorizontal: 30, 
    borderRadius: 8 
  },
  btnSecondary: { 
    paddingVertical: 14, 
    paddingHorizontal: 20 
  },
});