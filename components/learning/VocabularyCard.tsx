import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
type VocabularyCardPropsType = {
  thai: string
  romanization: string
  english: string
  onPress: (id: string) => void
  id: string
}
const VocabularyCard: React.FC<VocabularyCardPropsType> = (props) => {
  const { thai, romanization, english, onPress, id } = props
  return (
    <View className="border-2 border-muay-purple rounded-xl w-[150px] bg-muay-white shadow-md px-6 py-4 mb-6 h-[150px]">
      <Text
        className="w-full h-full"
        onPress={() => onPress(id)}
        style={{ textAlignVertical: 'center' }}
      >
        <Text className="text-[35px] font-bold text-center text-muay-purple mb-2">{thai}</Text>
        {'\n'}
        <Text className="text-[20px] text-muay-purple/70 italic text-center">{romanization}</Text>
        {'\n'}
        <Text className="text-[20px] text-gray-700 text-center">{english}</Text>
      </Text>
    </View>
  )
}

export default VocabularyCard

const styles = StyleSheet.create({})
