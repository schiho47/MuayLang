import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
// @ts-ignore - types for components may not be bundled correctly
import { Box, Divider } from '@gluestack-ui/themed'
import { Ionicons } from '@expo/vector-icons'
import * as Clipboard from 'expo-clipboard'
import { MUAY_PURPLE, MUAY_WHITE } from '@/constants/Colors'
import { VocabularyDataType } from './type'
import useSpeech from './useSpeech'

type VocabularyCardPropsType = {
  item: VocabularyDataType
  onPress: (id: string) => void
  id: string

  isLoading?: boolean
}
const VocabularyCard: React.FC<VocabularyCardPropsType> = (props) => {
  const { item, onPress = () => {}, id = 'id', isLoading = false } = props
  const { thai, romanization, english, exampleTH, exampleEN } = item
  const { speak } = useSpeech()

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text)
    console.log('Copied to clipboard:', text)
  }

  return (
    <Box
      style={{
        borderRadius: 16,
        width: 300,
        height: 400,
        backgroundColor: MUAY_WHITE,
        shadowColor: MUAY_PURPLE,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        padding: 16,
        marginBottom: 24,
        // justifyContent: 'center',
        // alignItems: 'center',
      }}
    >
      <TouchableOpacity onPress={() => onPress(id)} style={{ width: '100%' }}>
        <View style={{ width: '100%' }}>
          {isLoading ? (
            <>
              <View
                style={{ height: 35, backgroundColor: '#f0f0f0', borderRadius: 8, marginBottom: 8 }}
              />
              <View
                style={{
                  height: 22,
                  backgroundColor: '#f0f0f0',
                  borderRadius: 6,
                  marginVertical: 4,
                }}
              />
              <View style={{ height: 22, backgroundColor: '#f0f0f0', borderRadius: 6 }} />
            </>
          ) : (
            <>
              <Text
                style={{
                  fontSize: 52,
                  fontWeight: 'bold',
                  textAlign: 'center',
                  color: MUAY_PURPLE,
                  marginBottom: 8,
                }}
              >
                {thai}
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  gap: 16,
                  marginVertical: 8,
                }}
              >
                <TouchableOpacity onPress={() => speak(thai)}>
                  <Ionicons name="volume-high" size={32} color={MUAY_PURPLE} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => copyToClipboard(thai)}>
                  <Ionicons name="copy-outline" size={32} color={MUAY_PURPLE} />
                </TouchableOpacity>
              </View>
              <Text
                style={{
                  fontSize: 24,
                  textAlign: 'center',
                  fontStyle: 'italic',
                  marginVertical: 4,
                }}
              >
                {romanization}
              </Text>
              <Text style={{ fontSize: 24, textAlign: 'center' }}>{english}</Text>

              {exampleTH && <Divider my={28} />}
              {exampleTH && (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 14,
                    marginLeft: 16,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 22,
                      color: MUAY_PURPLE,
                      fontWeight: 700,
                      flex: 1,
                    }}
                  >
                    {exampleTH}
                  </Text>
                  <TouchableOpacity onPress={() => speak(exampleTH)} style={{ marginLeft: 8 }}>
                    <Ionicons name="volume-high" size={20} color={MUAY_PURPLE} />
                  </TouchableOpacity>
                </View>
              )}
              <Text style={{ fontSize: 18, marginLeft: 16 }}>{exampleEN}</Text>
            </>
          )}
        </View>
      </TouchableOpacity>
    </Box>
  )
}

export default VocabularyCard
