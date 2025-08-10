import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import { Card, Divider, IconButton } from 'react-native-paper'
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
  photo: string
  id: string
}
const Session = (props: SessionProps) => {
  const {
    sessionNumber = '-',
    date,
    calories = '-',
    duration = '-',
    note = '-',
    photo = '',
    id,
  } = props

  const [selectedPhoto, setSelectedPhoto] = useState('')

  return (
    <>
      <View style={{ margin: 16 }}>
        <Card style={{ marginTop: 16 }}>
          <Card.Title
            title={date}
            subtitle={`Session ${sessionNumber} | ${calories} kcal | ${duration} min `}
            titleStyle={{ fontSize: 20, fontWeight: 'bold' }}
            subtitleStyle={{ fontSize: 16 }}
            right={(props) => (
              <IconButton
                {...props}
                icon="pencil"
                iconColor={MUAY_PURPLE}
                style={{ margin: 0, padding: 0 }}
                onPress={() => {
                  router.push({
                    pathname: '/section/edit/[id]',
                    params: { id },
                  })
                }}
              />
            )}
          />
          <Divider style={{ marginVertical: 16 }} />
          <Card.Content>
            <Text selectable>{note}</Text>
            {photo && (
              <FlatList
                data={photo}
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
          </Card.Content>
        </Card>
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
