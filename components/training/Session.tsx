import { FlatList, Image, Text, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
// @ts-ignore - types for components may not be bundled correctly
import { Box, Divider } from '@gluestack-ui/themed'
import { Ionicons } from '@expo/vector-icons'
import { getPhotoUrl } from '@/utils/photos'
import BigImageModal from './BigImageModal'
import { MUAY_PURPLE } from '@/constants/Colors'
import { router } from 'expo-router'
import { useUser } from '@/hooks/useUser'

type SessionProps = {
  sessionNumber: string
  date: string
  calories: string
  duration: string
  note: string
  photo: string[] | string
  id: string
  maxHeartRate: string
  avgHeartRate: string
}
const Session = (props: SessionProps) => {
  const {
    sessionNumber = '-',
    date,
    calories = '-',
    duration = '-',
    note = '-',
    photo = [],
    id,
    maxHeartRate = '-',
    avgHeartRate = '-',
  } = props

  const { user } = useUser()

  // Ensure photo is an array
  const photoArray = Array.isArray(photo) ? photo : photo ? [photo] : []

  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null)

  return (
    <>
      <View style={{ marginVertical: 8 }}>
        <Box
          style={{
            backgroundColor: 'white',
            paddingHorizontal: 16,
            paddingVertical: 16,
          }}
        >
          {/* Card Title */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{date}</Text>
              <Text style={{ fontSize: 16, color: '#666', marginTop: 4 }}>
                Session {sessionNumber} | {calories} kcal | {duration} min
              </Text>
              <Text style={{ fontSize: 14, color: '#999', marginTop: 2 }}>
                Max HR: {maxHeartRate} bpm | Avg HR: {avgHeartRate} bpm
              </Text>
            </View>
            {!user?.isGuest && (
              <TouchableOpacity
                onPress={() => {
                  router.push({
                    pathname: '/section/edit/[id]' as any,
                    params: { id },
                  })
                }}
                style={{ padding: 8 }}
              >
                <Ionicons name="pencil" size={24} color={MUAY_PURPLE} />
              </TouchableOpacity>
            )}
          </View>

          <Divider style={{ marginVertical: 16 }} />

          {/* Card Content */}
          <Text selectable>{note}</Text>
          {photoArray.length > 0 && (
            <FlatList
              data={photoArray}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ marginTop: 16 }}
              renderItem={({ item, index }) => (
                <TouchableOpacity onPress={() => setSelectedPhotoIndex(index)}>
                  <Image
                    source={{ uri: getPhotoUrl(item) as string }}
                    style={{
                      width: 80,
                      height: 80,
                      marginRight: 8,
                      borderRadius: 8,
                    }}
                  />
                </TouchableOpacity>
              )}
            />
          )}
        </Box>
      </View>
      <BigImageModal
        photos={photoArray}
        visible={selectedPhotoIndex !== null}
        onDismiss={() => setSelectedPhotoIndex(null)}
        initialIndex={selectedPhotoIndex ?? 0}
      />
    </>
  )
}

export default Session
