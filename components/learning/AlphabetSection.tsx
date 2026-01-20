import { FlatList, ScrollView, Text, View, Platform } from 'react-native'
import React from 'react'
import AlphabetCard from './AlphabetCard'
import { MUAY_PURPLE } from '@/constants/Colors'
import { highAlphabet, middleAlphabet, lowAlphabet } from '@/lib/consonantData'

type AlphabetItem = { id: string; letter: string }

const RenderRow = ({
  data,
  renderSeparator,
}: {
  data: AlphabetItem[]
  renderSeparator: () => React.ReactElement
}) => {
  if (Platform.OS === 'web') {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 4, gap: 12,paddingBottom: 20 }}
      >
        {data.map((item) => (
          <AlphabetCard key={item.id} item={item} />
        ))}
      </ScrollView>
    )
  }

  return (
    <FlatList
      data={data}
      renderItem={({ item }) => <AlphabetCard item={item} />}
      keyExtractor={(item) => item.id}
      horizontal
      showsHorizontalScrollIndicator={false}
      ItemSeparatorComponent={renderSeparator}
      contentContainerStyle={{ paddingHorizontal: 4 ,marginBottom: 20 }}
    />
  )
}

const AlphabetSection = () => {
  const renderSeparator = () => <View style={{ width: 12 }} />

  return (
    <View style={{ paddingHorizontal: 8 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', color: MUAY_PURPLE, marginBottom: 10 }}>
        High class consonants
      </Text>
      <RenderRow data={highAlphabet} renderSeparator={renderSeparator} />
      <Text style={{ fontSize: 20, fontWeight: 'bold', color: MUAY_PURPLE, marginBottom: 10 }}>
        Middle class consonants
      </Text>
      <RenderRow data={middleAlphabet} renderSeparator={renderSeparator} />
      <Text style={{ fontSize: 20, fontWeight: 'bold', color: MUAY_PURPLE, marginBottom:  10 }}>
        Low class consonants
      </Text>
      <RenderRow data={lowAlphabet} renderSeparator={renderSeparator} />
    </View>
  )
}

export default AlphabetSection
