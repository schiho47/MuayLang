import React, { useState, useEffect } from 'react'
import { Text, TouchableOpacity, View, Platform } from 'react-native'
// @ts-ignore - types for components may not be bundled correctly
import { Box, Divider } from '@gluestack-ui/themed'
import { Ionicons } from '@expo/vector-icons'
import * as Clipboard from 'expo-clipboard'
import { MUAY_PURPLE, MUAY_WHITE } from '@/constants/Colors'
import SpeakerButton from '@/components/ui/SpeakerButton'
import { VocabularyDataType, VocabularyFieldEnum } from './type'
import useSpeech from '../../hooks/useSpeech'
import { useUpdateVocabulary } from '@/lib/learningAPI'
import { useUser } from '@/hooks/useUser'

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
  const { mutate: updateVocabulary } = useUpdateVocabulary()
  const { user } = useUser()

  const [isFavorite, setIsFavorite] = useState(item[VocabularyFieldEnum.Favorite] || false)

  // Sync favorite status
  useEffect(() => {
    setIsFavorite(item[VocabularyFieldEnum.Favorite] || false)
  }, [item])

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text)
    console.log('Copied to clipboard:', text)
  }

  const toggleFavorite = (e: any) => {
    e.stopPropagation() // Prevent triggering card's onPress

    // Prevent guests from updating favorites
    if (user?.isGuest) {
      console.log('Guest users cannot modify favorites')
      return
    }

    const newFavoriteState = !isFavorite
    setIsFavorite(newFavoriteState)

    // Update database
    updateVocabulary({
      id: item.$id,
      data: { favorite: newFavoriteState },
    })
  }

  return (
    <Box
      style={{
        borderRadius: 16,
        width: 300,
        height: 440,
        backgroundColor: MUAY_WHITE,
        shadowColor: MUAY_PURPLE,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        padding: 16,
        marginBottom: 24,
        position: 'relative',
        // Web needs 'auto' for scrolling, native needs 'hidden'
        overflow: (Platform.OS === 'web' ? 'auto' : 'hidden') as any,
      }}
    >
      {/* Favorite button - Top right (hidden for guests) */}
      {!isLoading && !user?.isGuest && (
        <TouchableOpacity
          onPress={toggleFavorite}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            zIndex: 10,
            padding: 4,
          }}
        >
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={28}
            color={isFavorite ? '#ef4444' : MUAY_PURPLE}
          />
        </TouchableOpacity>
      )}

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
                  marginTop: 24,
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
                <SpeakerButton
                  onPress={() => speak(thai)}
                  accessibilityLabel="Speak Thai"
                  size={32}
                  color={MUAY_PURPLE}
                />
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
                  <SpeakerButton
                    onPress={() => speak(exampleTH)}
                    accessibilityLabel="Speak example Thai"
                    size={20}
                    color={MUAY_PURPLE}
                    style={{ marginLeft: 8 }}
                  />
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
