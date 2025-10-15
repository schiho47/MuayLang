import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
// @ts-ignore - types for components may not be bundled correctly
import { Box, Divider } from '@gluestack-ui/themed'
import { Ionicons } from '@expo/vector-icons'
import { getPhotoUrl } from '@/utils/photos'
import BigImageModal from './BigImageModal'
import { MUAY_PURPLE } from '@/constants/Colors'
import { router } from 'expo-router'

type SessionProps = {
  sessionNumber: string
  date: string
  calories: string
  duration: string
  note: string
  photo: string[] | string
  id: string
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
  } = props

  // 确保 photo 是数组
  const photoArray = Array.isArray(photo) ? photo : photo ? [photo] : []

  const [selectedPhoto, setSelectedPhoto] = useState('')

  return (
    <>
      <View style={{ margin: 16 }}>
        <Box
          style={{
            marginTop: 16,
            backgroundColor: 'white',
            borderRadius: 8,
            padding: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
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
            </View>
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
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => setSelectedPhoto(item)}>
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
        photo={selectedPhoto}
        visible={!!selectedPhoto}
        onDismiss={() => setSelectedPhoto('')}
      />
    </>
  )
}

export default Session

const styles = StyleSheet.create({})
