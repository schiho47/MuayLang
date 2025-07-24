import React from 'react'
import { StyleSheet, View, Text, TextInput } from 'react-native'

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
  return (
    <View className="w-full  px-5">
      {title ? (
        <Text className="text-muay-purple font-medium mb-3 w-50 text-[16px]">{title}</Text>
      ) : null}

      <TextInput
        className="border border-muay-purple/30 focus:border-muay-purple rounded-md px-2 py-2 w-full text-[16px] h-[60px] mb-5"
        placeholder={placeholder}
        placeholderTextColor="#bbb"
        multiline={true}
        value={value}
        onChangeText={(value) => onChange(value, name as VocabularyFieldEnum)}
      />

      {error && <Text className="text-red-500"> *This is a required field</Text>}
    </View>
  )
}

const styles = StyleSheet.create({})

export default CustomTextArea
