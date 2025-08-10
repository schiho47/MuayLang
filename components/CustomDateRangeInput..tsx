import React, { useState } from 'react'
import { View, TouchableWithoutFeedback } from 'react-native'
import { TextInput } from 'react-native-paper'
import { DatePickerModal } from 'react-native-paper-dates'
import { MUAY_PURPLE } from '@/constants/Colors' // 你原本的顏色
import { formatLocalDate } from '@/utils/dateUtils'

type Props = {
  label: string
  startDate?: Date
  endDate?: Date
  onConfirm: (range: [startDate: Date, endDate: Date], field: string) => void
}

const CustomDateRangeInput = (props: Props) => {
  const { label, startDate, endDate, onConfirm } = props
  const [open, setOpen] = useState(false)

  return (
    <View style={{ marginBottom: 20, width: '90%', margin: 12 }}>
      <TouchableWithoutFeedback onPress={() => setOpen(true)}>
        <View pointerEvents="box-only">
          <TextInput
            label={label}
            value={
              startDate && endDate
                ? `${formatLocalDate(startDate)} - ${formatLocalDate(endDate)}`
                : ''
            }
            editable={false}
            showSoftInputOnFocus={false}
            onFocus={() => setOpen(true)}
            mode="outlined"
            outlineColor={MUAY_PURPLE} // 👈 default border
            activeOutlineColor={MUAY_PURPLE} // 👈 focused border
            placeholder="Select Created Date"
            placeholderTextColor="#aaa" // 👈 placeholder color
            theme={{
              colors: {
                placeholder: '#aaa', // 替代方案
                primary: MUAY_PURPLE, // label 顏色
              },
            }}
          />
        </View>
      </TouchableWithoutFeedback>

      <DatePickerModal
        mode="range"
        locale="en"
        visible={open}
        startDate={startDate || undefined}
        endDate={endDate || undefined}
        onDismiss={() => setOpen(false)}
        onConfirm={({ startDate, endDate }) => {
          setOpen(false)
          if (startDate && endDate) {
            console.log({ startDate, endDate })
            onConfirm([startDate, endDate], 'createdAt')
          }
        }}
      />
    </View>
  )
}

export default CustomDateRangeInput
