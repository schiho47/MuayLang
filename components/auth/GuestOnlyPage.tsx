import { Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import GuestOnly from './GuestOnly'
import { router } from 'expo-router'
import { Image } from 'expo-image'
import { MUAY_PURPLE } from '@/constants/Colors'

const FirstScreenImage = require('@/assets/images/firstScreen.png')

const GuestOnlyPage = () => {
  return (
    <GuestOnly>
      <View style={styles.container}>
        <Image source={FirstScreenImage} style={styles.image} resizeMode="contain" />
        <View style={styles.buttonContainer}>
          <Pressable
            onPress={() => router.replace('/(auth)/register')}
            style={styles.registerButton}
          >
            <Text style={styles.registerButtonText}>REGISTER</Text>
          </Pressable>
          <Pressable onPress={() => router.replace('/(auth)/login')} style={styles.loginButton}>
            <Text style={styles.loginButtonText}>LOGIN</Text>
          </Pressable>
        </View>
      </View>
    </GuestOnly>
  )
}

export default GuestOnlyPage

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: MUAY_PURPLE,
    padding: 24,
  },
  image: {
    width: '100%',
    height: 400,
    marginBottom: 60,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 20,
    width: '100%',
    paddingHorizontal: 24,
  },
  registerButton: {
    backgroundColor: 'white',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  registerButtonText: {
    color: MUAY_PURPLE,
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginButton: {
    backgroundColor: 'rgb(218, 167, 48)',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
})
