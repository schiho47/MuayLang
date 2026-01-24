import React, { useState } from 'react'
import type { StyleProp, ViewStyle } from 'react-native'
import { Pressable } from '@gluestack-ui/themed'
import { Ionicons } from '@expo/vector-icons'

type SpeakerButtonProps = {
  onPress: () => void
  accessibilityLabel?: string
  size?: number
  color?: string
  disabled?: boolean
  style?: StyleProp<ViewStyle>
  sx?: Record<string, unknown>
}

const SpeakerButton = ({
  onPress,
  accessibilityLabel = 'Speak',
  size = 20,
  color = '#6b7280',
  disabled = false,
  style,
  sx,
}: SpeakerButtonProps) => {
  const [isPressed, setIsPressed] = useState(false)

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      sx={{
        ':active': { opacity: 0.6 },
        ...(sx ?? {}),
      }}
      style={[
        {
          opacity: isPressed ? 0.6 : 1,
          transform: [{ scale: isPressed ? 0.95 : 1 }],
        },
        style,
      ]}
    >
      <Ionicons name="volume-high" size={size} color={color} />
    </Pressable>
  )
}

export default SpeakerButton
