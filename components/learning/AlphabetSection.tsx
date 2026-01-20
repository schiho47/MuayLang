import { FlatList, Text, View } from 'react-native'
import React from 'react'
import AlphabetCard from './AlphabetCard'
import { MUAY_PURPLE } from '@/constants/Colors'
import { highAlphabet, middleAlphabet, lowAlphabet } from '@/lib/consonantData'
import { HStack } from '@gluestack-ui/themed'
import Spacer from '../Spacer'

type AlphabetItem = { id: string; letter: string }

const RenderRow = ({
  data,
  renderSeparator,
}: {
  data: AlphabetItem[]
  renderSeparator: () => React.ReactElement
}) => {
  return (
    <FlatList
      data={data}
      renderItem={({ item }) => <AlphabetCard item={item} />}
      keyExtractor={(item) => item.id}
      horizontal
      showsHorizontalScrollIndicator={false}
      ItemSeparatorComponent={renderSeparator}
      contentContainerStyle={{ paddingHorizontal: 4, paddingBottom: 20 }}
      style={{ flexGrow: 0 }}
    />
  )
}

const AlphabetSection = () => {
  const renderSeparator = () => <View style={{ width: 12 }} />

  return (
      <View>
      <Text  style={{ fontSize: 20, fontWeight: 'bold', color: MUAY_PURPLE,marginBottom: 16 }} >
        High class consonants
      </Text>
      <RenderRow data={highAlphabet} renderSeparator={renderSeparator} />
    <Spacer/>
      <Text style={{ fontSize: 20, fontWeight: 'bold', color: MUAY_PURPLE, marginBottom: 16 }}>
        Middle class consonants
      </Text>
      <RenderRow data={middleAlphabet} renderSeparator={renderSeparator} />
      <Spacer/>
      
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: MUAY_PURPLE, marginBottom:  16 }}>
        Low class consonants
      </Text>
      <RenderRow data={lowAlphabet} renderSeparator={renderSeparator} />
     
      </View>
  )
}

export default AlphabetSection
