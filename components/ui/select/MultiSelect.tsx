import { Text, View, TextInput, TouchableOpacity, ScrollView, Modal, Pressable } from 'react-native'
import React, { useEffect, useState, useMemo } from 'react'
// @ts-ignore - types for components may not be bundled correctly
import { Box } from '@gluestack-ui/themed'
import { Ionicons } from '@expo/vector-icons'
import { MUAY_PURPLE, MUAY_PURPLE_30, MUAY_WHITE } from '@/constants/Colors'

type MultiSelectProps = {
  placeholder: string
  value: string[]
  onChange: (value: string[]) => void
  item: { label: string; value: string }[]
  title?: string
  error?: boolean
  errorMessage?: string
}

const MultiSelect = (props: MultiSelectProps) => {
  const {
    placeholder,
    value: originalValue,
    onChange,
    item: originalItem,
    title,
    error = false,
    errorMessage,
  } = props
  const [open, setOpen] = useState(false)
  const [searchText, setSearchText] = useState('')

  // 本地狀態管理選項，支援動態添加
  const [localItems, setLocalItems] = useState<{ label: string; value: string }[]>(
    originalItem || [],
  )
  const [localValue, setLocalValue] = useState<string[]>(originalValue || [])

  // 過濾後的選項（基於搜索文本）
  const filteredItems = useMemo(() => {
    if (!searchText.trim()) return localItems
    return localItems.filter(
      (item) =>
        item.label.toLowerCase().includes(searchText.toLowerCase()) ||
        item.value.toLowerCase().includes(searchText.toLowerCase()),
    )
  }, [localItems, searchText])

  // 當父元件的 item 變化時，更新本地 items（但保留新添加的選項）
  useEffect(() => {
    if (originalItem && originalItem.length > 0) {
      // 合併父元件的選項和本地新添加的選項
      const existingValues = new Set(originalItem.map((item) => item.value))
      const newItems = localItems.filter((item) => !existingValues.has(item.value))
      setLocalItems([...originalItem, ...newItems])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [originalItem])

  // 當父元件的 value 變化時，更新本地 value
  useEffect(() => {
    if (originalValue && JSON.stringify(originalValue) !== JSON.stringify(localValue)) {
      setLocalValue(originalValue)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [originalValue])

  const toggleSelection = (value: string) => {
    const newValue = localValue.includes(value)
      ? localValue.filter((v) => v !== value)
      : [...localValue, value]
    setLocalValue(newValue)
    onChange(newValue)
  }

  const removeItem = (value: string) => {
    const newValue = localValue.filter((v) => v !== value)
    setLocalValue(newValue)
    onChange(newValue)
  }

  const getSelectedLabels = () => {
    return localItems.filter((item) => localValue.includes(item.value)).map((item) => item.label)
  }

  return (
    <View style={{ width: '90%', margin: 12 }}>
      {!!title && (
        <Text
          style={{
            fontSize: 14,
            fontWeight: open ? 'bold' : 500,
            color: MUAY_PURPLE,
            marginBottom: 8,
          }}
        >
          {title}
        </Text>
      )}

      {/* 選擇器觸發按鈕 */}
      <TouchableOpacity
        onPress={() => setOpen(true)}
        style={{
          borderWidth: 1,
          borderColor: error ? '#ef4444' : open ? MUAY_PURPLE : MUAY_PURPLE_30,
          borderRadius: 4,
          padding: 10,
          minHeight: 48,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
          {localValue.length === 0 ? (
            <Text style={{ color: '#bbb' }}>{placeholder}</Text>
          ) : (
            getSelectedLabels().map((label, index) => (
              <Box
                key={index}
                style={{
                  backgroundColor: MUAY_PURPLE_30,
                  borderRadius: 12,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <Text style={{ color: MUAY_PURPLE, fontSize: 12 }}>{label}</Text>
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation()
                    const item = localItems.find((i) => i.label === label)
                    if (item) removeItem(item.value)
                  }}
                >
                  <Ionicons name="close-circle" size={14} color={MUAY_PURPLE} />
                </TouchableOpacity>
              </Box>
            ))
          )}
        </View>
        <Ionicons name="chevron-down" size={20} color={MUAY_PURPLE_30} />
      </TouchableOpacity>

      {/* 錯誤訊息 */}
      {error && errorMessage && (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
          <Ionicons name="alert-circle" size={14} color="#ef4444" style={{ marginRight: 4 }} />
          <Text style={{ fontSize: 14, color: '#ef4444', flex: 1, fontWeight: '500' }}>
            {errorMessage}
          </Text>
        </View>
      )}

      {/* 下拉選單 Modal */}
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={() => setOpen(false)}
        >
          <Pressable
            style={{
              width: '85%',
              maxHeight: '70%',
              backgroundColor: MUAY_WHITE,
              borderRadius: 8,
              overflow: 'hidden',
            }}
            onPress={(e) => e.stopPropagation()}
          >
            {/* 搜索框 */}
            <View
              style={{
                padding: 12,
                borderBottomWidth: 1,
                borderBottomColor: MUAY_PURPLE_30,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#f5f5f5',
                  borderRadius: 8,
                  paddingHorizontal: 12,
                }}
              >
                <Ionicons name="search" size={20} color="#999" />
                <TextInput
                  placeholder="Search..."
                  value={searchText}
                  onChangeText={setSearchText}
                  style={{
                    flex: 1,
                    padding: 8,
                    fontSize: 16,
                    color: '#222',
                  }}
                  placeholderTextColor="#bbb"
                />
                {searchText.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchText('')}>
                    <Ionicons name="close-circle" size={20} color="#999" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* 選項列表 */}
            <ScrollView style={{ maxHeight: 400 }}>
              {filteredItems.map((item) => (
                <TouchableOpacity
                  key={item.value}
                  onPress={() => toggleSelection(item.value)}
                  style={{
                    padding: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: '#f0f0f0',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      color: localValue.includes(item.value) ? MUAY_PURPLE : '#222',
                      fontWeight: localValue.includes(item.value) ? '600' : 'normal',
                    }}
                  >
                    {item.label}
                  </Text>
                  {localValue.includes(item.value) && (
                    <Ionicons name="checkmark-circle" size={20} color={MUAY_PURPLE} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* 關閉按鈕 */}
            <View
              style={{
                padding: 12,
                borderTopWidth: 1,
                borderTopColor: MUAY_PURPLE_30,
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  setOpen(false)
                  setSearchText('')
                }}
                style={{
                  backgroundColor: MUAY_PURPLE,
                  padding: 12,
                  borderRadius: 8,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: MUAY_WHITE, fontSize: 16, fontWeight: '600' }}>Done</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  )
}

export default MultiSelect
