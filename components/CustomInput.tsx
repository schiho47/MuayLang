import React, { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { TextInput } from 'react-native-paper'
import { MUAY_PURPLE, MUAY_PURPLE_30 } from '../constants/Colors'
import { CheckModalError, VocabularyFieldEnum } from './learning/type'

type CustomInputProps = {
  title: string
  placeholder: string
  value: string
  name: keyof CheckModalError | string
  onChange: (value: string, name: VocabularyFieldEnum) => void
  error: boolean
  errorMessage: string
}
const CustomInput: React.FC<CustomInputProps> = (props) => {
  const { title, placeholder, value, name, onChange, error, errorMessage } = props
  const [isFocused, setIsFocused] = useState(false)
  return (
    <View style={{ width: '90%', margin: 12 }}>
      <TextInput
        label={isFocused || value ? title : ''}
        placeholder={placeholder}
        placeholderTextColor="#bbb"
        value={value}
        onChangeText={(value) => onChange(value, name as VocabularyFieldEnum)}
        error={error}
        mode="outlined"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        theme={{
          colors: {
            primary: isFocused ? MUAY_PURPLE : MUAY_PURPLE_30,
            outline: MUAY_PURPLE_30,
            error: '#ef4444',
            text: '#222',
            placeholder: '#bbb',
          },
        }}
        style={{
          height: 40,
        }}
      />

      {error && (
        <Text className="text-red-500" style={{ color: '#ef4444' }}>
          {errorMessage}
        </Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({})

export default CustomInput
