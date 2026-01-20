import React, { useState } from 'react'
import { Box, Text, Pressable, HStack } from '@gluestack-ui/themed'
import { Ionicons } from '@expo/vector-icons'
import { MUAY_PURPLE } from '@/constants/Colors'
import useSpeech from './useSpeech'

type AlphabetCardProps = {
  item: { id: string; letter: string; vocabulary?: string; meaning?: string }
}

const AlphabetCard = (props: AlphabetCardProps) => {
  const { item } = props
  const { letter, vocabulary, meaning } = item
  const { speak } = useSpeech()
  const [isPressed, setIsPressed] = useState(false)

  const speechText = `${letter} ${vocabulary || ''}`.trim()

  return (
    <Pressable
      onPress={() => speak(speechText)}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
    >
      <Box
        borderWidth={1}
        borderColor={MUAY_PURPLE}
        backgroundColor="$backgroundLight0"
        borderRadius="$xl"
        alignItems="center"
        justifyContent="space-between"
        height={120}
        width={120}
        paddingVertical={10}
        paddingHorizontal={10}
        shadowColor="$primary700"
        shadowOffset={{ width: 0, height: 2 }}
        shadowOpacity={0.2}
        shadowRadius={4}
        elevation={3}
        marginRight={4}
        style={{
          opacity: isPressed ? 0.85 : 1,
          transform: [{ scale: isPressed ? 0.98 : 1 }],
        }}
      >
        <HStack width="100%" justifyContent="space-between" alignItems="center">
          <Text fontWeight="$bold" color={MUAY_PURPLE} style={{ fontSize: 48, lineHeight: 48 }}>
            {letter}
          </Text>
          <Ionicons name="volume-high" size={24} color={MUAY_PURPLE} />
        </HStack>
        <HStack width="100%" justifyContent="space-between">
          <Text
            size="sm"
            color={MUAY_PURPLE}
            numberOfLines={2}
            style={{ fontSize: 18, fontWeight: 'bold', flex: 1, marginRight: 6 }}
          >
            {vocabulary || ''}
          </Text>
          <Text
            size="sm"
            color={MUAY_PURPLE}
            numberOfLines={2}
            style={{ fontSize: 18, flex: 1, textAlign: 'right' }}
          >
            {meaning || ''}
          </Text>
        </HStack>
      </Box>
    </Pressable>
  )
}

export default AlphabetCard
