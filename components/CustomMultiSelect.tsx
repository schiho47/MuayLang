import { Text, View } from 'react-native'
import React, { useEffect, useMemo, useState } from 'react'
import DropDownPicker from 'react-native-dropdown-picker'
import { Chip } from 'react-native-paper'
import { MUAY_PURPLE, MUAY_PURPLE_30 } from '@/constants/Colors'

type CustomMultiSelectProps = {
  placeholder: string
  value: string[]
  onChange: (value: string[]) => void
  item: { label: string; value: string }[]
  title?: string
}

const CustomMultiSelect = (props: CustomMultiSelectProps) => {
  const { placeholder, value: originalValue, onChange, item: originalItem, title } = props
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState<string[]>(originalValue)
  const [isFocused, setIsFocused] = useState(false)

  const [items, setItems] = useState<{ label: string; value: string }[]>(originalItem || [])
  console.log({ originalItem, originalValue })

  // 當 originalValue 變化時，更新內部 value 狀態
  //   useEffect(() => {
  //     setValue(originalValue)
  //   }, [originalValue])
  useEffect(() => {
    setItems(originalItem)
  }, [originalItem])

  return (
    <View style={{ width: '90%', margin: 12 }}>
      {!!title && (open || value?.length > 0 || items?.length > 0) && (
        <Text
          style={{
            position: 'absolute',
            top: -10,
            left: 20,
            backgroundColor: '#f2f2f2',
            paddingHorizontal: 4,
            fontSize: 12,
            color: open ? MUAY_PURPLE : 'black',
            zIndex: 1001,
          }}
        >
          {title}
        </Text>
      )}
      <DropDownPicker
        open={open}
        value={value}
        items={items}
        multiple={true}
        setOpen={setOpen}
        setValue={setValue}
        onChangeValue={(value) => {
          onChange((value as string[]) || [])
        }}
        setItems={setItems}
        placeholder={placeholder}
        mode="BADGE"
        style={{
          borderWidth: 1,
          borderColor: MUAY_PURPLE_30,
          borderRadius: 4,
        }}
        placeholderStyle={{
          color: '#bbb',
        }}
        containerStyle={{
          borderColor: MUAY_PURPLE_30,
        }}
        searchable={true}
        addCustomItem={true}
        zIndex={1000}
        selectedItemLabelStyle={{
          fontWeight: 'bold',
          color: MUAY_PURPLE,
        }}
        dropDownContainerStyle={{
          borderColor: MUAY_PURPLE_30,
        }}
        searchContainerStyle={{
          borderColor: MUAY_PURPLE_30,
          borderBottomColor: MUAY_PURPLE_30,
        }}
        searchTextInputProps={{
          onFocus: () => setIsFocused(true),
          onBlur: () => setIsFocused(false),
        }}
        searchPlaceholder="Search"
        searchTextInputStyle={{
          color: isFocused ? MUAY_PURPLE : MUAY_PURPLE_30,
        }}
        textStyle={{
          fontSize: 16,
          fontWeight: 'normal',
        }}
        renderBadgeItem={(props) => <Chip>{props.label}</Chip>}
      />
    </View>
  )
}

export default CustomMultiSelect
