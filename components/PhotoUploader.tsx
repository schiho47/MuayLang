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
    if (!result.canceled) {
      const uris = result.assets.map((asset) => asset.uri)
      setPhotos([...photos, ...uris])
    }
  }

  const removePhoto = (uri: string) => {
    setPhotos(photos.filter((p) => p !== uri))
  }

  // 判斷是否為本地 URI 還是 Appwrite 檔案 ID
  const getImageUri = (photo: string) => {
    if (photo.startsWith('file://') || photo.startsWith('content://')) {
      // 本地檔案 URI
      return photo
    } else {
      // Appwrite 檔案 ID
      return getPhotoUrl(photo)
    }
  }

  return (
    <View
      style={{
        marginBottom: 20,
        width: '90%',
        margin: 12,
        padding: 12,
        backgroundColor: 'white',
        borderRadius: 12,
      }}
    >
      <View
        style={{
          marginBottom: 10,
          display: 'flex',
          flexDirection: 'row',
        }}
      >
        <Ionicons name="image-outline" size={18} color="gray" />
        <Text style={{ marginLeft: 10, fontSize: 16, color: '#666', fontWeight: '500' }}>
          Photos
        </Text>
      </View>

      {photos.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          {photos.map((uri, index) => (
            <View key={index} style={{ marginRight: 10, position: 'relative' }}>
              <Image
                source={{ uri: getImageUri(uri) }}
                style={{ width: 80, height: 80, borderRadius: 10 }}
              />
              <TouchableOpacity
                onPress={() => removePhoto(uri)}
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
        style={{
          borderColor: '#ccc',
          borderWidth: 1,
          borderRadius: 10,
          padding: 10,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: photos.length >= 2 ? 0.5 : 1,
        }}
      >
        <Ionicons name="add-circle-outline" size={20} color="gray" style={{ marginRight: 10 }} />
        <Text style={{ fontSize: 16, color: '#666', fontWeight: '500' }}>Add Photo</Text>
      </TouchableOpacity>
    </View>
  )
}

export default PhotoUploader
