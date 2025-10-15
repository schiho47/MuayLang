import React, { useState } from 'react'
import { Input, InputField } from './index'
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  FormControlError,
  FormControlErrorText,
} from '../form-control'
import { MUAY_PURPLE, MUAY_PURPLE_30 } from '@/constants/Colors'
import { CheckModalError, VocabularyFieldEnum } from '@/components/learning/type'
import { Ionicons } from '@expo/vector-icons'

type FormInputProps = {
  title: string
  placeholder: string
  value: string
  name: keyof CheckModalError | string
  onChange: (value: string, name: VocabularyFieldEnum) => void
  error: boolean
  errorMessage?: string
}

const FormInput: React.FC<FormInputProps> = (props) => {
  const { title, placeholder, value, name, onChange, error, errorMessage } = props
  const [isFocused, setIsFocused] = useState(false)

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
          {title}
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
          placeholder={placeholder}
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
    </FormControl>
  )
}

export default FormInput
