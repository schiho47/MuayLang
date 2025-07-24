import React, { ReactNode } from 'react'
import { TouchableOpacity, StyleSheet, ViewStyle, View } from 'react-native'
import * as Haptics from 'expo-haptics'

type Props = {
  onPress: () => void
  children: React.ReactNode
  style?: ViewStyle
  hapticType?: 'selection' | 'impact' | 'notification'
  singleContent: boolean
  icon?: ReactNode
}

const IconButtonWithHaptic: React.FC<Props> = (props) => {
  const { onPress, children, style, hapticType = 'selection', singleContent, icon } = props
  const handlePress = () => {
    switch (hapticType) {
      case 'impact':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        break
      case 'notification':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        break
      default:
        Haptics.selectionAsync()
    }
    onPress()
  }

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7} style={[styles.button, style]}>
      {singleContent ? (
        children
      ) : (
        <View className="flex-row justify-around items-center border-2 border-muay-purple rounded-xl px-4 py-1 w-[100px] ">
          {children}
        </View>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    padding: 6,
    borderRadius: 100,
  },
})

export default IconButtonWithHaptic
