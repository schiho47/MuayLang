import { StyleSheet, View, Image, Text, Pressable, Button } from 'react-native'
import React, { useEffect } from 'react'
import { Link, Redirect, useRouter } from 'expo-router'
import SLOGAN from '../assets/image/firstScreen.png'
import GuestOnly from '../components/auth/GuestOnly'
import '../global.css'

const Home = () => {
  return <Redirect href="/(dashboard)/learning" />
  return (
    <View></View>
    // <GuestOnly>
    //   <View style={styles.container}>
    //     <Image source={SLOGAN} style={styles.image} resizeMode="contain" />
    //     <View style={styles.fixToText}>
    //       <Pressable
    //         onPress={() => router.replace('/register')}
    //         style={{
    //           backgroundColor: 'white',
    //           paddingVertical: 12,
    //           paddingHorizontal: 24,
    //           borderRadius: 8,
    //         }}
    //       >
    //         <Text
    //           style={{ color: 'rgb(107, 55, 137)', fontSize: 16, fontWeight: 'bold', width: 80 }}
    //         >
    //           REGISTER
    //         </Text>
    //       </Pressable>
    //       <Pressable
    //         onPress={() => router.replace('/login')}
    //         style={{
    //           backgroundColor: 'rgb(218, 167, 48)',
    //           paddingVertical: 12,
    //           paddingHorizontal: 24,
    //           borderRadius: 8,
    //         }}
    //       >
    //         <Text
    //           style={{
    //             color: 'white',
    //             fontSize: 16,
    //             fontWeight: 'bold',
    //             width: 80,
    //             textAlign: 'center',
    //           }}
    //         >
    //           LOGIN
    //         </Text>
    //       </Pressable>
    //     </View>
    //   </View>
    // </GuestOnly>
  )
}

export default Home

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgb(107, 55, 137)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  image: {
    width: '100%',
    height: 600, // 可依圖片比例調整
    marginBottom: 40,
  },
  link: {
    fontSize: 18,
    color: 'blue',
    marginVertical: 10,
  },
  fixToText: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 20,
  },
})
