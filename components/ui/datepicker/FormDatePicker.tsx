import React, { useState } from 'react'
import { View, TouchableWithoutFeedback, Platform, Modal, Button } from 'react-native'
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
  const [tempDate, setTempDate] = useState<Date | null>(null)

  const onChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShow(false)
      if (selectedDate) {
        onConfirm(selectedDate)
      }
    } else {
      // iOS: 更新暫時日期
      if (selectedDate) {
        setTempDate(selectedDate)
      }
    }
  }

  const handleConfirm = () => {
    if (tempDate) {
      onConfirm(tempDate)
    }
    setShow(false)
    setTempDate(null)
  }

  const handleCancel = () => {
    setShow(false)
    setTempDate(null)
  }

  const handleOpen = () => {
    setTempDate(date || new Date())
    setShow(true)
  }

  return (
    <FormControl isInvalid={error} style={{ width: '90%', margin: 12 }}>
      <FormControlLabel style={{ marginBottom: 8 }}>
        <FormControlLabelText
          style={{
            fontSize: 14,
            fontWeight: show ? 'bold' : 500,
            color: MUAY_PURPLE,
          }}
        >
          {label}
        </FormControlLabelText>
      </FormControlLabel>

      <TouchableWithoutFeedback onPress={handleOpen}>
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

      {/* Android: 原生日期選擇器 */}
      {Platform.OS === 'android' && show && (
        <DateTimePicker
          testID="dateTimePicker"
          value={tempDate || new Date()}
          mode="date"
          is24Hour={true}
          onChange={onChange}
        />
      )}

      {/* iOS: Modal 包裝的日期選擇器 */}
      {Platform.OS === 'ios' && show && (
        <Modal transparent animationType="slide" visible={show} onRequestClose={handleCancel}>
          <View
            style={{
              flex: 1,
              justifyContent: 'flex-end',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
            }}
          >
            <View style={{ backgroundColor: '#fff', paddingBottom: 20 }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: '#eee',
                }}
              >
                <Button title="Cancel" onPress={handleCancel} color={MUAY_PURPLE} />
                <Button title="Confirm" onPress={handleConfirm} color={MUAY_PURPLE} />
              </View>
              <DateTimePicker
                testID="dateTimePicker"
                value={tempDate || new Date()}
                mode="date"
                display="spinner"
                onChange={onChange}
                style={{ backgroundColor: '#fff' }}
              />
            </View>
          </View>
        </Modal>
      )}
    </FormControl>
  )
}

export default FormDatePicker
