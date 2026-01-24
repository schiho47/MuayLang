import React from 'react'
import { TextInput, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { MUAY_PURPLE_30 } from '@/constants/Colors'

type SearchInputProps = {
  value: string
  onChangeText: (text: string) => void
  placeholder: string
  onClear: () => void
  iconPosition?: 'left' | 'right'
  onIconPress?: () => void
  showClear?: boolean
  iconFilledWhenValue?: boolean
  iconDisabled?: boolean
}

const SearchInput = ({
  value,
  onChangeText,
  placeholder,
  onClear,
  iconPosition = 'left',
  onIconPress,
  showClear = true,
  iconFilledWhenValue = false,
  iconDisabled = false,
}: SearchInputProps) => {
  const iconName = iconFilledWhenValue
    ? value.length > 0
      ? 'search'
      : 'search-outline'
    : 'search'
  const IconWrapper = onIconPress && !iconDisabled ? TouchableOpacity : View
  const iconColor = iconDisabled ? '#cbd5e1' : '#6b7280'
  const iconOpacity = iconDisabled ? 0.35 : 1

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: MUAY_PURPLE_30,
        borderRadius: 8,
        paddingHorizontal: 12,
        backgroundColor: '#fff',
        marginBottom: 8,
      }}
    >
      {iconPosition === 'left' ? (
        <IconWrapper onPress={onIconPress}>
          <Ionicons
            name={iconName}
            size={20}
            color={iconColor}
            style={{ opacity: iconOpacity }}
          />
        </IconWrapper>
      ) : null}
      <TextInput
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        style={{
          flex: 1,
          paddingVertical: 12,
          paddingHorizontal: 8,
          fontSize: 16,
          color: '#222',
        }}
        placeholderTextColor="#bbb"
      />
      {showClear && value.length > 0 ? (
        <TouchableOpacity onPress={onClear}>
          <Ionicons name="close-circle" size={20} color={MUAY_PURPLE_30} />
        </TouchableOpacity>
      ) : null}
      {iconPosition === 'right' ? (
        <IconWrapper onPress={onIconPress}>
          <Ionicons
            name={iconName}
            size={20}
            color={iconColor}
            style={{ opacity: iconOpacity }}
          />
        </IconWrapper>
      ) : null}
    </View>
  )
}

export default SearchInput
