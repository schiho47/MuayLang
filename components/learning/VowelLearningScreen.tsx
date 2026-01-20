import { ScrollView, Text,  Switch } from 'react-native'
import React, { useState } from 'react'
import { Box, Heading, HStack, VStack } from '@gluestack-ui/themed';
import { basicVowels, complexVowels, diphthongs } from '@/lib/vowels';
import VowelPairRow from './VowelPairRow';
import { MUAY_PURPLE } from '@/constants/Colors';


const VowelLearningScreen = () => {
    const [isClosedMode, setIsClosedMode] =useState(false);
  return (
    <ScrollView style={{ backgroundColor: '$white' }}>
    <VStack p="$4" space="lg">
      {/* 控制區域 */}
      <HStack justifyContent="space-between" alignItems="center" bg="$secondary100" p="$3" rounded="$lg" mb="$3">
        <Text style={{ fontSize: 14, fontWeight: 'bold', color: MUAY_PURPLE }}>Closed Syllable</Text>
        <Switch value={isClosedMode} onValueChange={setIsClosedMode} />
      </HStack>

      {/* 1. 基礎母音 (單母音) */}
      <Box>
        <Heading size="md" mb="$3" color={MUAY_PURPLE}>Basic Vowels</Heading>
        {basicVowels.map((item) => (
          <VowelPairRow key={item.pairId} pair={item} isClosedMode={isClosedMode} />
        ))}
      </Box>

      {/* 2. 複合母音 */}
      <Box>
        <Heading size="md" mb="$3" color={MUAY_PURPLE}>Complex Vowels</Heading>
        {complexVowels.map((item) => (
          <VowelPairRow key={item.pairId} pair={item} isClosedMode={isClosedMode} />
        ))}
      </Box>

      {/* 3. 雙母音 */}
      <Box>
        <Heading size="md" mb="$3" color={MUAY_PURPLE}>Diphthongs Vowels</Heading>
        {diphthongs.map((item) => (
          <VowelPairRow key={item.pairId} pair={item} isClosedMode={isClosedMode} />
        ))}
      </Box>
    </VStack>
  </ScrollView>
  )
}

export default VowelLearningScreen

