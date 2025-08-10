import React, { useState } from 'react'
import { View, TouchableWithoutFeedback } from 'react-native'

import { DatePickerModal } from 'react-native-paper-dates'
import CustomInput from './CustomInput'
import { formatLocalDate } from '@/utils/dateUtils'

type Props = {
  label: string
  date?: Date | null
  onConfirm: (date: Date, field: string) => void
  error: boolean
  errorMessage: string
} & Omit<
  React.ComponentProps<typeof CustomInput>,
  'title' | 'value' | 'onChange' | 'name' | 'placeholder' | 'error' | 'errorMessage'
>

const CustomDatePicker = (props: Props) => {
  const { label, date, onConfirm, error, errorMessage, ...otherProps } = props
  const [open, setOpen] = useState(false)

  return (
    <View>
      <TouchableWithoutFeedback onPress={() => setOpen(true)}>
        <View pointerEvents="box-only">
          <CustomInput
            title={label}
            value={date ? formatLocalDate(date) : ''}
            placeholder="Select Date"
            name="date"
            onChange={() => {}} // Required by CustomInput but not used for date picker
            error={error}
            errorMessage={errorMessage}
            {...otherProps}
          />
        </View>
      </TouchableWithoutFeedback>

      <DatePickerModal
        mode="single"
        locale="zh-TW"
        visible={open}
        startDate={date || undefined}
        endDate={date || undefined}
        onDismiss={() => setOpen(false)}
        onConfirm={({ date }) => {
          setOpen(false)
          if (date) {
            console.log({ date })
            onConfirm(date, 'createdAt')
          }
        }}
      />
    </View>
  )
}

export default CustomDatePicker
