import {
  Keyboard,
  Pressable,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
  ActivityIndicator,
  Platform,
} from 'react-native'
import { Link, useRouter } from 'expo-router'
import { useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { useUser } from '@/hooks/useUser'
import { MUAY_PURPLE, MUAY_WHITE } from '@/constants/Colors'

const Register = () => {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showEmailSuggestions, setShowEmailSuggestions] = useState(false)

  const { register } = useUser()

  const emailDomains = ['@gmail.com', '@hotmail.com', '@yahoo.com']

  const handleEmailChange = (text: string) => {
    // Convert to lowercase
    const lowerText = text.toLowerCase()
    setEmail(lowerText)

    // Show suggestions if user hasn't typed @ yet
    const hasAtSymbol = lowerText.includes('@')
    setShowEmailSuggestions(!hasAtSymbol && lowerText.length > 0)
  }

  const selectEmailDomain = (domain: string) => {
    setEmail(email + domain)
    setShowEmailSuggestions(false)
  }

  const handleSubmit = async () => {
    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      await register(email, password)
      // Registration successful, auto-redirect. If still here, show success message
      setSuccess('Registration successful! Please check your email for verification.')
    } catch (error: any) {
      console.error('Register error:', error)
      setError(error.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const Content = (
    <View
      className="flex-1 justify-center items-center p-6"
      style={{ backgroundColor: MUAY_PURPLE }}
    >
      <Pressable
        onPress={() => router.replace('/(auth)')}
        style={{ position: 'absolute', top: 48, left: 16, zIndex: 10 }}
        hitSlop={10}
      >
        <Ionicons name="arrow-back" size={28} color={MUAY_WHITE} />
      </Pressable>
      <View className="mb-6">
        <Ionicons name="person-add" size={60} color={MUAY_WHITE} />
      </View>

      <Text className="text-center text-[28px] font-bold mb-10" style={{ color: MUAY_WHITE }}>
        Create Your Account
      </Text>

      <View className="w-full mb-4">
        <View
          className="flex-row items-center w-full rounded-lg px-4"
          style={{ backgroundColor: MUAY_WHITE }}
        >
          <Ionicons name="mail" size={20} color={MUAY_PURPLE} className="mr-3" />
          <TextInput
            placeholder="Email"
            className="flex-1 py-3.5 text-base text-[#222]"
            keyboardType="email-address"
            onChangeText={handleEmailChange}
            value={email}
            autoCapitalize="none"
            placeholderTextColor="#999"
          />
        </View>

        {showEmailSuggestions && (
          <View className="rounded-lg mt-1 overflow-hidden" style={{ backgroundColor: MUAY_WHITE }}>
            {emailDomains.map((domain) => (
              <Pressable
                key={domain}
                className="py-3 px-4 border-b border-[#f0f0f0]"
                onPress={() => selectEmailDomain(domain)}
              >
                <Text className="text-sm text-[#666]">
                  {email}
                  {domain}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      <View
        className="flex-row items-center w-full rounded-lg px-4 mb-4"
        style={{ backgroundColor: MUAY_WHITE }}
      >
        <Ionicons name="lock-closed" size={20} color={MUAY_PURPLE} className="mr-3" />
        <TextInput
          placeholder="Password (min 8 characters)"
          className="flex-1 py-3.5 text-base text-[#222]"
          onChangeText={setPassword}
          value={password}
          secureTextEntry={!showPassword}
          placeholderTextColor="#999"
        />
        <Pressable onPress={() => setShowPassword(!showPassword)} className="p-2">
          <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color={MUAY_PURPLE} />
        </Pressable>
      </View>

      {error && (
        <View className="flex-row items-center bg-red-100 p-3 rounded-lg mb-4 w-full gap-2">
          <Ionicons name="alert-circle" size={16} color="#ef4444" />
          <Text className="text-red-500 text-sm flex-1">{error}</Text>
        </View>
      )}

      {success && (
        <View className="flex-row items-center bg-green-100 p-3 rounded-lg mb-4 w-full gap-2">
          <Ionicons name="checkmark-circle" size={16} color="#10b981" />
          <Text className="text-green-600 text-sm flex-1">{success}</Text>
        </View>
      )}

      <Pressable
        onPress={handleSubmit}
        disabled={loading}
        className="w-full py-4 rounded-lg items-center"
        style={[{ backgroundColor: MUAY_WHITE }, loading && { opacity: 0.6 }]}
      >
        {loading ? (
          <ActivityIndicator color={MUAY_PURPLE} />
        ) : (
          <Text className="text-base font-bold" style={{ color: MUAY_PURPLE }}>
            REGISTER
          </Text>
        )}
      </Pressable>

      <View className="h-5" />

      <View className="flex-row items-center">
        <Text className="text-sm" style={{ color: MUAY_WHITE }}>
          Already have an account?{' '}
        </Text>
        <Link href={'/login'}>
          <Text className="text-sm font-bold" style={{ color: 'rgb(218, 167, 48)' }}>
            LOGIN
          </Text>
        </Link>
      </View>
    </View>
  )

  return Platform.OS === 'web' ? (
    Content
  ) : (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      {Content}
    </TouchableWithoutFeedback>
  )
}

export default Register
