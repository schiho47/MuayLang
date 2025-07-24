import React from 'react'
import { StyleSheet, View, Text, TextInput } from 'react-native'
import IconButtonWithHaptic from './IconButtonWithHaptic'
import { CheckModalError, VocabularyFieldEnum } from './learning/type'

type CustomInputProps = {
  title: string
  placeholder: string
  action?: { title: string; onPress: () => void }
  value: string
  name: keyof CheckModalError | string
  onChange: (value: string, name: VocabularyFieldEnum) => void
  error: boolean
  errorMessage: string
}
const CustomInput: React.FC<CustomInputProps> = (props) => {
  const { title, placeholder, action, value, name, onChange, error, errorMessage } = props
  return (
    <View className="w-90 m-3 px-5">
      <Text className="text-muay-purple font-medium mb-3 w-50 text-[16px]">{title}</Text>
      {action && (
        <View className="flex-row items-center">
          <TextInput
            className="border border-muay-purple/30 focus:border-muay-purple rounded-md px-2 py-2 w-80 text-[16px] h-[40px]"
            placeholder={placeholder}
            placeholderTextColor="#bbb"
            value={value}
            onChangeText={(value) => onChange(value, name as VocabularyFieldEnum)}
          />
          <IconButtonWithHaptic
            onPress={action.onPress}
            children={
              <Text className="text-center border text-muay-purple border-muay-purple p-2 h-[40px] align-middle pt-3 rounded-md">
                {action.title}
              </Text>
            }
            singleContent={true}
          />
        </View>
      )}
      {!action && (
        <TextInput
          className="border border-muay-purple/30 focus:border-muay-purple rounded-md px-2 py-2 w-full text-[16px] h-[40px]"
          placeholder={placeholder}
          placeholderTextColor="#bbb"
          value={value}
          onChangeText={(value) => onChange(value, name as VocabularyFieldEnum)}
        />
      )}
      {error && <Text className="text-red-500">{errorMessage}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({})

export default CustomInput
