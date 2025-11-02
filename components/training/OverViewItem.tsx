import { Text, View, TouchableOpacity } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import { MUAY_PURPLE } from '@/constants/Colors'

type OverViewItemProps = {
  title: string
  description: string | React.ReactNode
  icon: string
  onPress?: () => void
  isClickable?: boolean
  compact?: boolean
}

const OverViewItem = (props: OverViewItemProps) => {
  const { title, description, icon, onPress, isClickable = false, compact = false } = props

  const content = (
    <>
      <Ionicons name={icon as any} color={MUAY_PURPLE} size={compact ? 18 : 26} />
      <Text
        className="text-muay-purple font-bold flex-1 text-left"
        style={{ fontSize: compact ? 12 : 24 }}
      >
        {title}
      </Text>

      <Text
        className="text-muay-purple font-bold flex-1 text-right"
        style={{
          fontSize: compact ? 14 : 24,
          opacity: isClickable ? 0.7 : 1,
        }}
      >
        {description}
      </Text>
    </>
  )

  if (isClickable && onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        className={`flex flex-row justify-between items-center rounded-lg p-1 ${compact ? 'gap-1.5 mb-1.5' : 'gap-3 mb-3'}`}
      >
        {content}
      </TouchableOpacity>
    )
  }

  return (
    <View
      className={`flex flex-row justify-between items-center ${compact ? 'gap-1.5 mb-1.5' : 'gap-3 mb-3'}`}
    >
      {content}
    </View>
  )
}

export default OverViewItem
