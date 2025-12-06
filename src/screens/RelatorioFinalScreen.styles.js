import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  backButton: {
    padding: 8,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },

  // --- Cartões de Seção ---
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2', // Azul padrão sistema
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },

  // --- Inputs ---
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#333',
    backgroundColor: '#FAFAFA',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top', // Para o texto começar em cima no Android
  },

  // --- Linha de Contadores (Vítimas) ---
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  counterContainer: {
    width: '30%',
    alignItems: 'center',
  },
  counterInput: {
    width: '100%',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },

  // --- Checkboxes (Formulários Específicos) ---
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
  },
  checkboxActive: {
    backgroundColor: '#E3F2FD',
    borderColor: '#1976D2',
  },
  checkboxLabel: {
    fontSize: 14,
    marginLeft: 10,
    color: '#333',
  },

  // --- Botão Final ---
  submitButton: {
    backgroundColor: '#388E3C', // Verde para finalizar
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
    elevation: 3,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});