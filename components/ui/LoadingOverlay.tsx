import { View, ActivityIndicator, Text, StyleSheet, Modal } from 'react-native'
import { MUAY_PURPLE, MUAY_WHITE } from '@/constants/Colors'

type LoadingOverlayProps = {
  visible: boolean
  message?: string
}

const LoadingOverlay = ({ visible, message = 'Loading...' }: LoadingOverlayProps) => {
  if (!visible) return null

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ActivityIndicator size="large" color={MUAY_PURPLE} />
          <Text style={styles.message}>{message}</Text>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: MUAY_WHITE,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    minWidth: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  message: {
    marginTop: 12,
    fontSize: 16,
    color: MUAY_PURPLE,
    fontWeight: '600',
  },
})

export default LoadingOverlay
