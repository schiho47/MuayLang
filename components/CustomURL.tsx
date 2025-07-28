import { Image, Text, View, TouchableOpacity, Linking } from 'react-native'
import React from 'react'
import CustomInput from './CustomInput'
import { Card } from 'react-native-paper'
import useLinkPreview from '@/hooks/useLinkPreview'
type CustomURLProps = {
  value: string
  onChange: (value: string, name: string) => void
  error: boolean
  errorMessage: string
  name: string
}
const CustomURL = (props: CustomURLProps) => {
  const { value, onChange, error, errorMessage, name } = props
  const { data: previewData, isLoading } = useLinkPreview(value)

  /*
  回傳範例：
  {
    title: 'OrmOrmM on X',
    description: 'วันนี้หน้าทลมีแต่คำว่า พี่สาว',
    images: ['https://pbs.twimg.com/media/xxx.jpg'],
    url: 'https://x.com/ormmormm/status/1944045200051253386',
  }
  */

  return (
    <View style={{ width: '100%' }}>
      <CustomInput
        title={'URL'}
        placeholder={'Enter URL (optional)'}
        value={value}
        name={name}
        onChange={onChange}
        error={error}
        errorMessage={errorMessage}
      />

      {previewData && (
        <TouchableOpacity onPress={() => Linking.openURL(previewData.url)}>
          <Card style={{ marginVertical: 8, overflowY: 'scroll' }}>
            {previewData.images?.[0] && (
              <Image
                source={{ uri: previewData.images[0] }}
                style={{ height: 180, objectFit: 'contain' }}
              />
            )}
            <Card.Content>
              <Text variant="titleMedium">{previewData.title}</Text>
              <Text variant="bodySmall" numberOfLines={2}>
                {previewData.description}
              </Text>
            </Card.Content>
          </Card>
        </TouchableOpacity>
      )}
    </View>
  )
}

export default CustomURL
