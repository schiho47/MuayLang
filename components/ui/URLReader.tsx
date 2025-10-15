import { Image, Text, View, TouchableOpacity, Linking } from 'react-native'
import React, { useState } from 'react'
// @ts-ignore - types for components may not be bundled correctly
import { Box } from '@gluestack-ui/themed'
import { Input, InputField } from './input'
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  FormControlError,
  FormControlErrorText,
} from './form-control'
import { MUAY_PURPLE, MUAY_PURPLE_30 } from '@/constants/Colors'
import { Ionicons } from '@expo/vector-icons'
import useLinkPreview from '@/hooks/useLinkPreview'
import { VocabularyFieldEnum } from '@/components/learning/type'
type URLReaderProps = {
  value: string
  onChange: (value: string, name: string) => void
  error: boolean
  errorMessage: string
  name: string
  isOptional?: boolean
}
const URLReader = (props: URLReaderProps) => {
  const { value, onChange, error, errorMessage, name, isOptional = true } = props
  const [isFocused, setIsFocused] = useState(false)
  const { data: previewData } = useLinkPreview(value)

  return (
    <FormControl isInvalid={error} style={{ width: '90%', margin: 12 }}>
      <FormControlLabel style={{ marginBottom: 8 }}>
        <FormControlLabelText
          style={{
            fontSize: 14,
            fontWeight: isFocused ? 'bold' : 500,
            color: MUAY_PURPLE,
          }}
        >
          URL {isOptional && '(optional)'}
        </FormControlLabelText>
      </FormControlLabel>

      <Input
        variant="outline"
        size="md"
        isInvalid={error}
        style={{
          borderColor: error ? '#ef4444' : isFocused ? MUAY_PURPLE : MUAY_PURPLE_30,
          borderWidth: 1,
          borderRadius: 4,
          minHeight: 48,
        }}
      >
        <InputField
          placeholder={isOptional ? 'Enter URL (optional)' : 'Enter URL'}
          value={value}
          onChangeText={(value) => onChange(value, name as VocabularyFieldEnum)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={{
            color: '#222',
            fontSize: 16,
            padding: 10,
          }}
          placeholderTextColor="#bbb"
        />
      </Input>

      {error && errorMessage && (
        <FormControlError style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
          <Ionicons name="alert-circle" size={14} color="#ef4444" style={{ marginRight: 4 }} />
          <FormControlErrorText
            style={{ fontSize: 14, color: '#ef4444', flex: 1, fontWeight: '500' }}
          >
            {errorMessage}
          </FormControlErrorText>
        </FormControlError>
      )}

      {previewData && 'images' in previewData && (
        <TouchableOpacity onPress={() => Linking.openURL(previewData.url)} style={{ marginTop: 8 }}>
          <Box
            style={{
              borderRadius: 8,
              overflow: 'hidden',
              backgroundColor: 'white',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            {previewData.images?.[0] && (
              <Image
                source={{ uri: previewData.images[0] }}
                style={{ height: 180, objectFit: 'contain' }}
              />
            )}
            <View style={{ padding: 16 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 4 }}>
                {previewData.title}
              </Text>
              <Text style={{ fontSize: 14, color: '#666' }} numberOfLines={2}>
                {previewData.description}
              </Text>
            </View>
          </Box>
        </TouchableOpacity>
      )}
    </FormControl>
  )
}

export default URLReader
