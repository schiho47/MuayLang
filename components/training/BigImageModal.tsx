import { getPhotoUrl } from '@/utils/photos'
import React from 'react'
import { Image, StyleSheet, View, TouchableOpacity } from 'react-native'
import { Modal } from 'react-native-paper'
import { Ionicons } from '@expo/vector-icons'

type BigImageModalProps = {
  photo: string
  visible: boolean
  onDismiss: () => void
}
const BigImageModal = (props: BigImageModalProps) => {
  const { photo, visible, onDismiss } = props
  const imageUrl = getPhotoUrl(photo)
  console.log({ photo, imageUrl, visible })
  return (
    <Modal
      visible={visible}
      onDismiss={onDismiss}
      contentContainerStyle={{
        backgroundColor: 'black',
        margin: 0,
        padding: 0,
        width: '100%',
        height: '100%',
      }}
    >
      <View style={{ position: 'relative', flex: 1 }}>
        <TouchableOpacity
          onPress={onDismiss}
          style={{
            position: 'absolute',
            top: 50,
            right: 20,
            zIndex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            borderRadius: 20,
            padding: 8,
          }}
        >
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>

        <Image
          source={{ uri: imageUrl }}
          style={{
            width: '100%',
            height: '100%',
            resizeMode: 'contain',
          }}
          onError={(error) => console.log('Image loading error:', error)}
          onLoad={() => console.log('Image loaded successfully')}
        />
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({})

export default BigImageModal
