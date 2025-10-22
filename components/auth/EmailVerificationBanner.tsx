import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useState } from 'react'
import { useUser } from '@/hooks/useUser'
import { MUAY_PURPLE, MUAY_WHITE } from '@/constants/Colors'

const EmailVerificationBanner = () => {
  const { user, resendVerification } = useUser()
  const [isResending, setIsResending] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // 如果已驗證或沒有用戶，不顯示
  if (!user || user.emailVerification) {
    return null
  }

  const handleResend = async () => {
    setIsResending(true)
    setShowSuccess(false)
    try {
      await resendVerification()
      setShowSuccess(true)
      // 3 秒後隱藏成功訊息
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (error) {
      console.error('Resend failed:', error)
    } finally {
      setIsResending(false)
    }
  }

  return (
    <View style={styles.banner}>
      <View style={styles.content}>
        <Ionicons name="mail-outline" size={20} color="#92400e" />
        <View style={styles.textContainer}>
          <Text style={styles.title}>Verify Your Email</Text>
          <Text style={styles.subtitle}>We sent a verification email to {user.email}</Text>
        </View>
      </View>

      <Pressable onPress={handleResend} disabled={isResending || showSuccess} style={styles.button}>
        {isResending ? (
          <ActivityIndicator size="small" color={MUAY_PURPLE} />
        ) : showSuccess ? (
          <>
            <Ionicons name="checkmark-circle" size={16} color="#059669" />
            <Text style={styles.successText}>Sent!</Text>
          </>
        ) : (
          <Text style={styles.buttonText}>Resend</Text>
        )}
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#fef3c7', // amber-100
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b', // amber-500
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    borderRadius: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    gap: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400e', // amber-800
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#78350f', // amber-900
  },
  button: {
    backgroundColor: MUAY_WHITE,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#d97706', // amber-600
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  buttonText: {
    color: MUAY_PURPLE,
    fontSize: 12,
    fontWeight: '600',
  },
  successText: {
    color: '#059669', // green-600
    fontSize: 12,
    fontWeight: '600',
  },
})

export default EmailVerificationBanner
