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
  date?: Date | string | null
  onConfirm: (date: Date) => void
  error?: boolean
  errorMessage?: string
}

const FormDatePicker: React.FC<FormDatePickerProps> = (props) => {
  const { label, date, onConfirm, error = false, errorMessage } = props
  const [show, setShow] = useState(false)
  const [tempDate, setTempDate] = useState<Date | null>(null)

  const normalizeDate = (value: Date | string | null | undefined): Date | null => {
    if (!value) return null
    if (value instanceof Date) {
      return Number.isFinite(value.getTime()) ? value : null
    }
    const d = new Date(value)
    return Number.isFinite(d.getTime()) ? d : null
  }

  const normalizedDate = normalizeDate(date)

  const WebDateInput = ({
    value,
    onChange,
  }: {
    value: string
    onChange: (nextValue: string) => void
  }) => {
    // Use a real DOM input on web; RNW TextInput does not support type="date".
    return React.createElement('input', {
      type: 'date',
      value,
      onChange: (e: any) => onChange(e?.target?.value ?? ''),
      style: {
        width: '100%',
        height: 48,
        border: 'none',
        outline: 'none',
        backgroundColor: 'transparent',
        color: '#222',
        fontSize: 16,
        padding: 10,
      },
    } as any)
  }

  const parseWebDate = (yyyyMmDd: string): Date | null => {
    // Expect "YYYY-MM-DD" from <input type="date" />
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(yyyyMmDd)
    if (!m) return null
    const year = Number(m[1])
    const month = Number(m[2])
    const day = Number(m[3])
    if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return null

    // Create local date at noon to avoid timezone/DST edge cases.
    const d = new Date(year, month - 1, day, 12, 0, 0, 0)
    return Number.isFinite(d.getTime()) ? d : null
  }

  const onChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShow(false)
      if (selectedDate) {
        onConfirm(selectedDate)
      }
    } else {
      // iOS: Update temporary date
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
    if (Platform.OS === 'web') return
    setTempDate(normalizedDate || new Date())
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

      {Platform.OS === 'web' ? (
        <View>
          <View
            style={{
              borderColor: error ? '#ef4444' : MUAY_PURPLE_30,
              borderWidth: 1,
              borderRadius: 4,
              minHeight: 48,
              width: '100%',
            }}
          >
            <WebDateInput
              value={normalizedDate ? formatLocalDate(normalizedDate) : ''}
              onChange={(value) => {
                const next = parseWebDate(value)
                if (next) onConfirm(next)
              }}
            />
          </View>
        </View>
      ) : (
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
                value={normalizedDate ? formatLocalDate(normalizedDate) : ''}
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
      )}

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

      {/* Android: Native date picker */}
      {Platform.OS === 'android' && show && (
        <DateTimePicker
          testID="dateTimePicker"
          value={tempDate || new Date()}
          mode="date"
          is24Hour={true}
          onChange={onChange}
        />
      )}

      {/* iOS: Modal-wrapped date picker */}
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
