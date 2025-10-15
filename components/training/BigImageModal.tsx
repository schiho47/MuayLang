import { getPhotoUrl } from '@/utils/photos'
import React from 'react'
import { Image, StyleSheet, View, TouchableOpacity, Modal } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

type BigImageModalProps = {
  photo: string
  visible: boolean
  onDismiss: () => void
}
const BigImageModal = (props: BigImageModalProps) => {
  const { photo, visible, onDismiss } = props
  const imageUrl = getPhotoUrl(photo)
  return (
    <Modal visible={visible} onRequestClose={onDismiss} transparent animationType="fade">
      <View style={{ position: 'relative', flex: 1, backgroundColor: 'black' }}>
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
          onError={(error) => {
            // 靜默處理圖片載入錯誤
          }}
          onLoad={() => {
            // 靜默處理圖片載入成功
          }}
        />
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({})

export default BigImageModal
