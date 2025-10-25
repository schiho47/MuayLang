import React, { useState } from 'react'
import { View, Text, TouchableOpacity, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useUser } from '../../hooks/useUser'
import { MUAY_PURPLE, MUAY_WHITE } from '@/constants/Colors'

export default function EmailVerificationBanner() {
  const { user, resendVerification } = useUser()
  const [isResending, setIsResending] = useState(false)

  // 如果用户已登录但邮箱未验证，显示横幅
  if (!user || user.emailVerification) {
    return null
  }

  const handleResendVerification = async () => {
    setIsResending(true)
    try {
      await resendVerification()
      Alert.alert('驗證郵件已發送', '請檢查您的郵箱並點擊驗證連結', [{ text: '確定' }])
    } catch (error) {
      Alert.alert('發送失敗', '無法發送驗證郵件，請稍後再試', [{ text: '確定' }])
    } finally {
      setIsResending(false)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="mail-unread-outline" size={20} color={MUAY_WHITE} />
        <Text style={styles.text}>請驗證您的郵箱</Text>
        <TouchableOpacity
          onPress={handleResendVerification}
          disabled={isResending}
          style={styles.button}
        >
          <Text style={styles.buttonText}>{isResending ? '發送中...' : '重新發送'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = {
  container: {
    backgroundColor: '#f59e0b',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    padding: 12,
  },
  content: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
  },
  text: {
    flex: 1,
    color: MUAY_WHITE,
    fontSize: 14,
    fontWeight: '500' as const,
  },
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  buttonText: {
    color: MUAY_WHITE,
    fontSize: 12,
    fontWeight: '600' as const,
  },
}
