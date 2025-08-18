import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { padding: 12 },
  sectionContainer: { marginBottom: 12 },
  sectionLabel: { fontWeight: 'bold', marginBottom: 8 },
  repeatableHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  repeatableActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  sectionContent: { padding: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 16 },
  modalContent: { backgroundColor: 'white', borderRadius: 8, maxHeight: '80%', padding: 16 },
});
