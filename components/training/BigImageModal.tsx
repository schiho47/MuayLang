import { getPhotoUrl } from '@/utils/photos'
import React, { useRef, useEffect, useState } from 'react'
import {
  Image,
  View,
  TouchableOpacity,
  Modal,
  FlatList,
  Dimensions,
  Text,
  SafeAreaView,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'

type BigImageModalProps = {
  photos: string[]
  visible: boolean
  onDismiss: () => void
  initialIndex?: number
}

const BigImageModal = (props: BigImageModalProps) => {
  const { photos, visible, onDismiss, initialIndex = 0 } = props
  const flatListRef = useRef<FlatList>(null)
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const screenWidth = Dimensions.get('window').width

  useEffect(() => {
    if (visible && initialIndex !== undefined) {
      setCurrentIndex(initialIndex)
      // 延遲滾動，確保 Modal 已完全顯示
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({ index: initialIndex, animated: false })
      }, 100)
    }
  }, [visible, initialIndex])

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0)
    }
  }).current

  return (
    <Modal visible={visible} onRequestClose={onDismiss} transparent animationType="fade">
      <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>
        <View style={{ flex: 1 }}>
          <TouchableOpacity
            onPress={onDismiss}
            style={{
              position: 'absolute',
              top: 10,
              right: 20,
              zIndex: 10,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              borderRadius: 20,
              padding: 8,
            }}
          >
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>

          {/* 照片索引指示器 */}
          {photos.length > 1 && (
            <View
              style={{
                position: 'absolute',
                top: 10,
                left: 0,
                right: 0,
                zIndex: 10,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: 'white', fontSize: 14, fontWeight: '600' }}>
                {currentIndex + 1} / {photos.length}
              </Text>
            </View>
          )}

          <FlatList
            ref={flatListRef}
            data={photos}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
            keyExtractor={(item, index) => `${item}-${index}`}
            renderItem={({ item }) => (
              <View style={{ width: screenWidth, justifyContent: 'center', alignItems: 'center' }}>
                <Image
                  source={{ uri: getPhotoUrl(item) as string }}
                  style={{
                    width: screenWidth,
                    height: '100%',
                    resizeMode: 'contain',
                  }}
                />
              </View>
            )}
          />
        </View>
      </SafeAreaView>
    </Modal>
  )
}

export default BigImageModal
