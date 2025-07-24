import {
  Button,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import { Link } from 'expo-router'
import { useState } from 'react'
import { useUser } from '../../hooks/useUser'
import Spacer from '../../components/Spacer'
// import { Colors } from '../../constants/Colors'

// import { useUser } from '../../hooks/useUser'

const Register = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)

  const { register } = useUser()
  const handleSubmit = async () => {
    setError(null)
    console.log({ email, password })
    try {
      await register(email, password)
    } catch (error: { message: string }) {
      setError(error.message || 'error')
    }
  }
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Text style={styles.title}>Register an Account</Text>
        <TextInput
          placeholder="Email"
          style={{ width: '80%', marginBottom: 20 }}
          keyboardType="email-address"
          onChangeText={setEmail}
          value={email}
        />

        <TextInput
          placeholder="Password"
          style={{ width: '80%', marginBottom: 20 }}
          onChangeText={setPassword}
          value={password}
          secureTextEntry
        />
        <View style={{ width: '90%' }}>
          <Pressable
            onPress={handleSubmit}
            style={{
              backgroundColor: 'white',
              paddingVertical: 12,
              paddingHorizontal: 24,
              borderRadius: 8,
            }}
          >
            <Text
              style={{
                color: 'rgb(107, 55, 137)',
                fontSize: 16,
                fontWeight: 'bold',
                width: '100%',
                textAlign: 'center',
              }}
            >
              REGISTER
            </Text>
          </Pressable>
        </View>

        {error && <Text style={styles.error}>{error}</Text>}
        <Spacer />
        <Text>Already have an account? </Text>
        <Spacer height={20} />
        <Link href={'/login'}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: 'bold',
              color: 'rgb(218, 167, 48)',
              marginTop: 20,
              textAlign: 'center',
            }}
          >
            LOGIN
          </Text>
        </Link>
      </View>
    </TouchableWithoutFeedback>
  )
}

export default Register

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    fontSize: 18,
    marginBottom: 30,
  },
  error: {
    // color: Colors.warning,
    // padding: 10,
    // backgroundColor: '#f5c1c8',
    // borderColor: Colors.warning,
    // borderWidth: 1,
    // borderRadius: 6,
    // marginHorizontal: 10,
  },
  fixToText: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
})
