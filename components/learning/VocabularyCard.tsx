import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Card } from 'react-native-paper'
import { MUAY_PURPLE, MUAY_WHITE } from '@/constants/Colors'
type VocabularyCardPropsType = {
  thai: string
  romanization: string
  english: string
  onPress: (id: string) => void
  id: string
  tag: string
}
const VocabularyCard: React.FC<VocabularyCardPropsType> = (props) => {
  const { thai, romanization, english, onPress, id, tag } = props
  return (
    <Card
      style={{
        borderRadius: 16,
        borderWidth: 2,
        borderColor: MUAY_PURPLE,
        width: 150,
        height: 150,
        backgroundColor: MUAY_WHITE,
        shadowColor: MUAY_PURPLE,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        padding: 16,
        marginBottom: 24,
      }}
    >
      <Text
        className="w-full h-full"
        onPress={() => onPress(id)}
        style={{ textAlignVertical: 'center' }}
      >
        <Text
          style={{
            fontSize: 35,
            fontWeight: 'bold',
            textAlign: 'center',
            color: MUAY_PURPLE,
            marginBottom: 8,
          }}
        >
          {thai}
        </Text>
        {'\n'}
        <Text style={{ fontSize: 20, textAlign: 'center', fontStyle: 'italic', margin: '5px 0' }}>
          {romanization}
        </Text>
        {'\n'}
        <Text style={{ fontSize: 20, textAlign: 'center' }}>{english}</Text>
      </Text>
    </Card>
  )
}

export default VocabularyCard

const styles = StyleSheet.create({})
