import React from 'react'
import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { Ionicons } from '@expo/vector-icons'
import { getPhotoUrl } from '@/utils/photos'

type Props = {
  photos: string[]
  setPhotos: (photos: string[]) => void
}

const PhotoUploader = ({ photos, setPhotos }: Props) => {
  const pickImage = async () => {
    if (photos.length > 2) return
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    })
    console.log({ result })
    if (!result.canceled) {
      const uris = result.assets.map((asset) => asset.uri)
      console.log({ uris })
      setPhotos([...photos, ...uris])
    }
  }

  const removePhoto = (uri: string) => {
    setPhotos(photos.filter((p) => p !== uri))
  }

  // 判斷是否為本地 URI 還是 Appwrite 文件 ID
  const getImageUri = (photo: string) => {
    if (photo.startsWith('file://') || photo.startsWith('content://')) {
      // 本地文件 URI
      return photo
    } else {
      // Appwrite 文件 ID
      return getPhotoUrl(photo)
    }
  }

  console.log({ photos })
  return (
    <View
      className="bg-white rounded-xl px-4 py-4 mt-4"
      style={{
        marginBottom: 20,
        width: '90%',
        margin: 12,
        padding: 12,
        backgroundColor: 'white',
      }}
    >
      <View
        className="flex-row items-center mb-2"
        style={{
          marginBottom: 10,
          display: 'flex',
          flexDirection: 'row',
        }}
      >
        <Ionicons name="image-outline" size={18} color="gray" />
        <Text className="ml-2 text-gray-600 font-medium" style={{ marginLeft: 10, fontSize: 16 }}>
          Photos
        </Text>
      </View>

      {photos.length > 0 && (
        <ScrollView horizontal className="mb-4" showsHorizontalScrollIndicator={false}>
          {photos.map((uri, index) => (
            <View
              key={index}
              className="relative mr-3"
              style={{ marginRight: 10, position: 'relative' }}
            >
              <Image
                source={{ uri: getImageUri(uri) }}
                className="w-[80px] h-[80px] rounded-lg"
                style={{ width: 80, height: 80, borderRadius: 10 }}
              />
              <TouchableOpacity
                onPress={() => removePhoto(uri)}
                className="absolute -top-2 -right-2 bg-white rounded-full shadow-sm"
                style={{
                  position: 'absolute',
                  top: -10,
                  right: -10,
                  backgroundColor: 'white',
                  borderRadius: 10,
                }}
              >
                <Ionicons name="close-circle" size={25} color="red" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      <TouchableOpacity
        onPress={pickImage}
        disabled={photos.length >= 2}
        className="border border-gray-300 rounded-xl py-3 flex-row items-center justify-center"
        style={{
          borderColor: '#000',
          borderRadius: 10,
          padding: 10,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: photos.length >= 2 ? 0.5 : 1,
        }}
      >
        <Ionicons
          name="add-circle-outline"
          size={20}
          color="gray"
          style={{ marginRight: 10, fontSize: 20 }}
        />
        <Text className="ml-2 text-gray-500 font-medium" style={{ fontSize: 20 }}>
          Add Photo
        </Text>
      </TouchableOpacity>
    </View>
  )
}

export default PhotoUploader
