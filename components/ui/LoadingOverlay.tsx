import { View, ActivityIndicator, Text, Modal } from 'react-native'
import { MUAY_PURPLE, MUAY_WHITE } from '@/constants/Colors'

type LoadingOverlayProps = {
  visible: boolean
  message?: string
}

const LoadingOverlay = ({ visible, message = 'Loading...' }: LoadingOverlayProps) => {
  if (!visible) return null

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View className="flex-1 justify-center items-center bg-black/50">
        <View
          className="rounded-xl p-6 items-center min-w-[150px] shadow-lg"
          style={{ backgroundColor: MUAY_WHITE }}
        >
          <ActivityIndicator size="large" color={MUAY_PURPLE} />
          <Text className="mt-3 text-base font-semibold" style={{ color: MUAY_PURPLE }}>
            {message}
          </Text>
        </View>
      </View>
    </Modal>
  )
}

export default LoadingOverlay
