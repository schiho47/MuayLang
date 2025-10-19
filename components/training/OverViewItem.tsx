import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
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
        className="text-muay-purple text-2xl font-bold"
        style={{ fontSize: compact ? 12 : 24, textAlign: 'left', flex: 1 }}
      >
        {title}
      </Text>

      <Text
        className="text-muay-purple text-2xl font-bold"
        style={{
          fontSize: compact ? 14 : 24,
          flex: 1,
          textAlign: 'right',
          opacity: isClickable ? 0.7 : 1,
          fontWeight: 'bold',
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
        style={[styles.container, styles.clickable, compact && { gap: 6, marginBottom: 6 }]}
      >
        {content}
      </TouchableOpacity>
    )
  }

  return <View style={[styles.container, compact && { gap: 6, marginBottom: 6 }]}>{content}</View>
}

export default OverViewItem

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  clickable: {
    borderRadius: 8,
    padding: 4,
  },
})
