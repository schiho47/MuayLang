import React, { useState, useRef } from 'react'
import { View, Text, Pressable } from 'react-native'
import { Input, InputField } from './index'
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  FormControlError,
  FormControlErrorText,
} from '../form-control'
import { MUAY_PURPLE, MUAY_PURPLE_30 } from '@/constants/Colors'
import { Ionicons } from '@expo/vector-icons'

type FormNumberInputProps = {
  title: string
  placeholder: string
  value: string
  name: string
  onChange: (value: string, name: any) => void
  error?: boolean
  errorMessage?: string
  min?: number
  max?: number
  step?: number
  inline?: boolean
  suffix?: string
}

const FormNumberInput: React.FC<FormNumberInputProps> = (props) => {
  const {
    title,
    placeholder,
    value,
    name,
    onChange,
    error = false,
    errorMessage,
    min = 0,
    max = 999,
    step = 1,
    inline = false,
    suffix,
  } = props
  const [isFocused, setIsFocused] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const handleIncrement = () => {
    const currentValue = parseInt(value) || 0
    const newValue = Math.min(currentValue + step, max)
    onChange(String(newValue), name)
  }

  const handleDecrement = () => {
    const currentValue = parseInt(value) || 0
    const newValue = Math.max(currentValue - step, min)
    onChange(String(newValue), name)
  }

  // 长按连续增加
  const handleLongPressIncrement = () => {
    handleIncrement()
    intervalRef.current = setInterval(() => {
      handleIncrement()
    }, 100) as any
  }

  // 长按连续减少
  const handleLongPressDecrement = () => {
    handleDecrement()
    intervalRef.current = setInterval(() => {
      handleDecrement()
    }, 100) as any
  }

  // 停止长按
  const handlePressOut = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const handleTextChange = (text: string) => {
    // 只允許輸入數字
    const numericText = text.replace(/[^0-9]/g, '')
    onChange(numericText, name)
  }

  return (
    <FormControl isInvalid={error} style={inline ? { flex: 1 } : { width: '90%', margin: 12 }}>
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
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <InputField
          placeholder={placeholder}
          value={value}
          onChangeText={handleTextChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          keyboardType="numeric"
          style={{
            color: '#222',
            fontSize: 16,
            padding: 10,
            flex: 1,
            paddingRight: 6,
          }}
          placeholderTextColor="#bbb"
        />

        {/* Suffix 区域：单位文字 + 上下箭头按钮 */}
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingRight: 6 }}>
          {suffix && (
            <Text
              style={{
                fontSize: 14,
                color: '#666',
                marginRight: 6,
                fontWeight: '500',
              }}
            >
              {suffix}
            </Text>
          )}

          {/* 上下箭頭按鈕組 - 共享邊框，像 iOS 原生 */}
          <View
            style={{
              borderWidth: 1,
              borderColor: MUAY_PURPLE_30,
              borderRadius: 4,
              overflow: 'hidden',
              backgroundColor: '#fff',
            }}
          >
            <Pressable
              onPress={handleIncrement}
              onLongPress={handleLongPressIncrement}
              onPressOut={handlePressOut}
              delayLongPress={200}
              style={({ pressed }) => ({
                backgroundColor: pressed ? MUAY_PURPLE : 'transparent',
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderBottomWidth: 0.5,
                borderBottomColor: MUAY_PURPLE_30,
              })}
            >
              {({ pressed }) => (
                <Ionicons name="chevron-up" size={20} color={pressed ? '#fff' : MUAY_PURPLE} />
              )}
            </Pressable>
            <Pressable
              onPress={handleDecrement}
              onLongPress={handleLongPressDecrement}
              onPressOut={handlePressOut}
              delayLongPress={200}
              style={({ pressed }) => ({
                backgroundColor: pressed ? MUAY_PURPLE : 'transparent',
                paddingHorizontal: 10,
                paddingVertical: 6,
              })}
            >
              {({ pressed }) => (
                <Ionicons name="chevron-down" size={20} color={pressed ? '#fff' : MUAY_PURPLE} />
              )}
            </Pressable>
          </View>
        </View>
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

export default FormNumberInput
