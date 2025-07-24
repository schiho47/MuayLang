import {
  Keyboard,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
  TextInput,
  Button,
  Pressable,
} from 'react-native'
import { Link } from 'expo-router'
import { useState } from 'react'
import { useUser } from '../../hooks/useUser'
import Spacer from '../../components/Spacer'

// import { Colors } from '../../constants/Colors'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)

  const { login } = useUser()

  const handleSubmit = async () => {
    console.log({ email, password })
    try {
      login(email, password)
    } catch (error) {
      console.log({ error })
      setError(error.message)
    }
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Text style={styles.title}>Login to Your Account</Text>

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
                color: 'rgb(218, 167, 48)',
                fontSize: 16,
                fontWeight: 'bold',
                width: '100%',
                textAlign: 'center',
              }}
            >
              LOGIN
            </Text>
          </Pressable>
        </View>

        {error && <Text style={styles.error}>{error}</Text>}
        <Spacer />
        <Text>Don't have an account? </Text>
        <Spacer height={20} />
        <Link href={'/register'}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: 'bold',
              color: 'rgb(107, 55, 137)',
              marginTop: 20,
              textAlign: 'center',
            }}
          >
            REGISTER
          </Text>
        </Link>
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
