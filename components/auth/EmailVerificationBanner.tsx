import React, { useState } from 'react'
import { View, Text, TouchableOpacity, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useUser } from '../../hooks/useUser'
import { MUAY_PURPLE, MUAY_WHITE } from '@/constants/Colors'

export default function EmailVerificationBanner() {
  // 🚧 Temporarily disabled - Email verification feature
  return null

  /* 
  const { user, resendVerification } = useUser()
  const [isResending, setIsResending] = useState(false)

  // Show banner if user is logged in but email is not verified
  if (!user || user.emailVerification) {
    return null
  }

  const handleResendVerification = async () => {
    setIsResending(true)
    try {
      await resendVerification()
      Alert.alert('Verification Email Sent', 'Please check your inbox and click the verification link', [{ text: 'OK' }])
    } catch (error) {
      Alert.alert('Failed to Send', 'Unable to send verification email. Please try again later', [{ text: 'OK' }])
    } finally {
      setIsResending(false)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="mail-unread-outline" size={20} color={MUAY_WHITE} />
        <Text style={styles.text}>Please verify your email</Text>
        <TouchableOpacity
          onPress={handleResendVerification}
          disabled={isResending}
          style={styles.button}
        >
          <Text style={styles.buttonText}>{isResending ? 'Sending...' : 'Resend'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
  */
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
