import { Pressable, Text } from 'react-native'
import React from 'react'
import { Box, Center, HStack } from '@gluestack-ui/themed'
import { MUAY_PURPLE, MUAY_PURPLE_30 } from '@/constants/Colors'
import useSpeech from '../../hooks/useSpeech'
import SpeakerButton from '@/components/ui/SpeakerButton'
type VowelItem = {
  char: string
  closed: string
  roman: string
  }
  
  type VowelPairProps = {
  pair: { short: VowelItem; long: VowelItem | null }
  isClosedMode: boolean
  }
const VowelPairRow = (props: VowelPairProps) => {
    const { pair, isClosedMode } = props
  const { speak } = useSpeech()

  const longValue = isClosedMode ? pair?.long?.closed : pair?.long?.char
  const hasLongValue = !!longValue

  return (
<HStack space="md" reversed={false} mb="$4" justifyContent="space-between" px="$4">
      {/* 短音卡片 - 使用 VStack 處理內部層級 */}
      <Pressable
        style={{ flex: 1 }}
        onPress={() => speak(isClosedMode ? pair.short.closed : pair.short.char)}
      >
        <Box
          bg="$secondary50"
          p="$4"
          rounded="$xl"
          borderWidth={1}   
          borderColor="$secondary200"
          alignItems="center"
          position="relative"
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: 'bold',
              color: MUAY_PURPLE,
              position: 'absolute',
              top: 8,
              left: 8,
            }}
          >
            SHORT
          </Text>
          <SpeakerButton
            onPress={() => speak(isClosedMode ? pair.short.closed : pair.short.char)}
            accessibilityLabel="Speak short vowel"
            size={18}
            color={MUAY_PURPLE}
            style={{ position: 'absolute', top: 8, right: 8 }}
          />
          <Center h="$20">
            <Text
              style={{ fontSize: 48, fontWeight: 'bold', color: MUAY_PURPLE }}
              numberOfLines={1}
            >
              {isClosedMode ? pair.short.closed : pair.short.char}
            </Text>
          </Center>
          <Text style={{ fontSize: 14, color: '$textLight500' }}>{pair.short.roman}</Text>
        </Box>
      </Pressable>

      {/* 長音卡片 */}
      <Pressable
        style={{ flex: 1 }}
        onPress={() => {
          if (pair?.long) {
            speak(isClosedMode ? pair?.long?.closed : pair?.long?.char)
          }
        }}
      >
        <Box
          bg="$secondary50"
          p="$4"
          rounded="$xl"
          borderWidth={1}
          borderColor="$secondary200"
          alignItems="center"
          position="relative"
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: 'bold',
              color: MUAY_PURPLE,
              position: 'absolute',
              top: 8,
              left: 8,
            }}
          >
            LONG
          </Text>
          {hasLongValue && (
            <SpeakerButton
              onPress={() => {
                if (pair?.long) {
                  speak(isClosedMode ? pair?.long?.closed : pair?.long?.char)
                }
              }}
              accessibilityLabel="Speak long vowel"
              size={24}
              color={MUAY_PURPLE}
              style={{ position: 'absolute', top: 8, right: 16 }}
            />
          )}

          <Center h="$20">
            <Text
              style={{
                fontSize: hasLongValue ? 48 : 32,
                fontWeight: 'bold',
                color: hasLongValue ? MUAY_PURPLE : MUAY_PURPLE_30,
              }}
              numberOfLines={1}
            >
              {longValue || '—'}
            </Text>
          </Center>
          <Text style={{ fontSize: 14, color: '$textLight500' }}>{pair?.long?.roman}</Text>
        </Box>
      </Pressable>
    </HStack>
  )
}

export default VowelPairRow
