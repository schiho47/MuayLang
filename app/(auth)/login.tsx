import {
  Keyboard,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
  TextInput,
  Pressable,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from 'react-native'
import { Link } from 'expo-router'
import { useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { useUser } from '@/hooks/useUser'
import Spacer from '@/components/Spacer'
import { MUAY_PURPLE, MUAY_WHITE } from '@/constants/Colors'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showEmailSuggestions, setShowEmailSuggestions] = useState(false)

  const { login } = useUser()

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

  const handleQuickLogin = async () => {
    // 開發用快速登入
    setEmail('sukiho47@gmail.com')
    setPassword('sukiho471234567')
    setLoading(true)
    setError(null)

    try {
      await login('sukiho47@gmail.com', 'sukiho471234567')
    } catch (error: any) {
      console.error('Quick login error:', error)
      setError(error.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await login(email, password)
    } catch (error: any) {
      console.error('Login error:', error)
      setError(error.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <TouchableOpacity onPress={handleQuickLogin} style={styles.iconContainer}>
          <Ionicons name="log-in" size={60} color={MUAY_WHITE} />
        </TouchableOpacity>

        <Text style={styles.title}>Login to Your Account</Text>

        <View style={styles.inputWrapper}>
          <View style={styles.inputContainer}>
            <Ionicons name="mail" size={20} color={MUAY_PURPLE} style={styles.inputIcon} />
            <TextInput
              placeholder="Email"
              style={styles.input}
              keyboardType="email-address"
              onChangeText={handleEmailChange}
              value={email}
              autoCapitalize="none"
              placeholderTextColor="#999"
            />
          </View>

          {showEmailSuggestions && (
            <View style={styles.suggestionsContainer}>
              {emailDomains.map((domain) => (
                <Pressable
                  key={domain}
                  style={styles.suggestionItem}
                  onPress={() => selectEmailDomain(domain)}
                >
                  <Text style={styles.suggestionText}>
                    {email}
                    {domain}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        <View style={[styles.inputContainer, { marginBottom: 16 }]}>
          <Ionicons name="lock-closed" size={20} color={MUAY_PURPLE} style={styles.inputIcon} />
          <TextInput
            placeholder="Password"
            style={styles.input}
            onChangeText={setPassword}
            value={password}
            secureTextEntry={!showPassword}
            placeholderTextColor="#999"
          />
          <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
            <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color={MUAY_PURPLE} />
          </Pressable>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={16} color="#ef4444" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <Pressable
          onPress={handleSubmit}
          disabled={loading}
          style={[styles.loginButton, loading && styles.buttonDisabled]}
        >
          {loading ? (
            <ActivityIndicator color={MUAY_WHITE} />
          ) : (
            <Text style={styles.loginButtonText}>LOGIN</Text>
          )}
        </Pressable>

        <Spacer height={20} />

        <View style={styles.registerPrompt}>
          <Text style={styles.promptText}>Don't have an account? </Text>
          <Link href={'/(auth)/register'}>
            <Text style={styles.registerLink}>REGISTER</Text>
          </Link>
        </View>
      </View>
    </TouchableWithoutFeedback>
  )
}

export default Login

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: MUAY_PURPLE,
    padding: 24,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    textAlign: 'center',
    fontSize: 28,
    fontWeight: 'bold',
    color: MUAY_WHITE,
    marginBottom: 40,
  },
  inputWrapper: {
    width: '100%',
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: MUAY_WHITE,
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#222',
  },
  eyeIcon: {
    padding: 8,
  },
  suggestionsContainer: {
    backgroundColor: MUAY_WHITE,
    borderRadius: 8,
    marginTop: 4,
    overflow: 'hidden',
  },
  suggestionItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  suggestionText: {
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    width: '100%',
    gap: 8,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    flex: 1,
  },
  loginButton: {
    width: '100%',
    backgroundColor: 'rgb(218, 167, 48)',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: MUAY_WHITE,
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  promptText: {
    color: MUAY_WHITE,
    fontSize: 14,
  },
  registerLink: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'rgb(218, 167, 48)',
  },
})
