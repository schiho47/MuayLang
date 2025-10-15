import React, { useState } from 'react'
import { View, TouchableWithoutFeedback, Platform } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { Input, InputField } from '../input'
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  FormControlError,
  FormControlErrorText,
} from '../form-control'
import { MUAY_PURPLE, MUAY_PURPLE_30 } from '@/constants/Colors'
import { Ionicons } from '@expo/vector-icons'
import { formatLocalDate } from '@/utils/dateUtils'

type FormDatePickerProps = {
  label: string
  date?: Date | null
  onConfirm: (date: Date) => void
  error?: boolean
  errorMessage?: string
}

const FormDatePicker: React.FC<FormDatePickerProps> = (props) => {
  const { label, date, onConfirm, error = false, errorMessage } = props
  const [show, setShow] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  const onChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date
    setShow(Platform.OS === 'ios')
    if (currentDate) {
      onConfirm(currentDate)
    }
  }

  return (
    <FormControl isInvalid={error} style={{ width: '90%', margin: 12 }}>
      <FormControlLabel style={{ marginBottom: 8 }}>
        <FormControlLabelText
          style={{
            fontSize: 14,
            fontWeight: isFocused || show ? 'bold' : 500,
            color: MUAY_PURPLE,
          }}
        >
          {label}
        </FormControlLabelText>
      </FormControlLabel>

      <TouchableWithoutFeedback onPress={() => setShow(true)}>
        <View pointerEvents="box-only">
          <Input
            variant="outline"
            size="md"
            isInvalid={error}
            style={{
              borderColor: error ? '#ef4444' : show ? MUAY_PURPLE : MUAY_PURPLE_30,
              borderWidth: 1,
              borderRadius: 4,
              minHeight: 48,
            }}
          >
            <InputField
              placeholder="Select Date"
              value={date ? formatLocalDate(date) : ''}
              editable={false}
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
        </View>
      </TouchableWithoutFeedback>

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

      {show && (
        <DateTimePicker
          testID="dateTimePicker"
          value={date || new Date()}
          mode="date"
          is24Hour={true}
          onChange={onChange}
        />
      )}
    </FormControl>
  )
}

export default FormDatePicker
