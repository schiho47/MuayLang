import React, { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { TextInput } from 'react-native-paper'
import { MUAY_PURPLE, MUAY_PURPLE_30 } from '../constants/Colors'
import { CheckModalError, VocabularyFieldEnum } from './learning/type'
type CustomTextProps = {
  title: string
  placeholder: string
  value: string
  name: keyof CheckModalError | string
  onChange: (value: string, name: VocabularyFieldEnum) => void
  error: boolean
}
const CustomTextArea: React.FC<CustomTextProps> = (props) => {
  const { title, placeholder, value, name, onChange, error } = props
  const [isFocused, setIsFocused] = useState(false)
  return (
    <View style={{ width: '90%', margin: 12 }}>
      <TextInput
        label={isFocused || value ? title : ''}
        // className="border border-muay-purple/30 focus:border-muay-purple rounded-md px-2 py-2 w-full text-[16px] h-[60px] mb-5"
        placeholder={placeholder}
        placeholderTextColor="#bbb"
        multiline={true}
        numberOfLines={4}
        value={value}
        mode="outlined"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        theme={{
          colors: {
            primary: isFocused ? MUAY_PURPLE : MUAY_PURPLE_30,
            outline: isFocused ? MUAY_PURPLE : MUAY_PURPLE_30,
            error: '#ef4444',
            text: '#222',
            placeholder: '#bbb',
          },
        }}
        style={{
          height: 80,
        }}
        contentStyle={{
          height: 80,
        }}
        onChangeText={(value) => onChange(value, name as VocabularyFieldEnum)}
      />

      {error && <Text className="text-red-500"> *This is a required field</Text>}
    </View>
  )
}

const styles = StyleSheet.create({})

export default CustomTextArea
