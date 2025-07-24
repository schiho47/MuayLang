import { StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import DropDownPicker from 'react-native-dropdown-picker'
import { FilterDataType } from './learning/type'

type CustomDropDownPickProps = {
  items: { label: string; value: string | undefined }[]
  handleValueChange: (value: string, field: keyof FilterDataType) => void
  placeholder: string
  field: keyof FilterDataType
  zIndex: number // 👈 加這個
}
const CustomDropDownPick = (props: CustomDropDownPickProps) => {
  const { items, handleValueChange, placeholder, zIndex, field } = props
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState<string | null>(null)
  return (
    <View style={{ zIndex: open ? zIndex : zIndex - 10 }}>
      <DropDownPicker
        open={open}
        setOpen={setOpen}
        value={value}
        setValue={(val) => setValue(val === undefined ? null : val)}
        placeholder={placeholder}
        items={items}
        searchable={true}
        style={{
          backgroundColor: '#fafafa',
          borderColor: 'rgb(107, 55, 137)',
          borderWidth: 2,
        }}
        containerStyle={{
          marginHorizontal: 16,
          marginTop: 8,
          width: '90%',
          zIndex: zIndex, // 👈 這裡
        }}
        dropDownContainerStyle={{
          borderColor: 'rgb(107, 55, 137)',
          zIndex: zIndex, // 👈 下拉選單 z-index
        }}
        onChangeValue={(value) => handleValueChange(value as string, field)}
        textStyle={{
          color: 'rgb(107, 55, 137)',
          fontWeight: 'bold',
        }}
      />
    </View>
  )
}

export default CustomDropDownPick

const styles = StyleSheet.create({})
