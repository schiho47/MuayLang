import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Redirect } from 'expo-router'

const Dashboard = () => {
  return <Redirect href="/(dashboard)/training" />
  return (
    <View>
      <Text>Dashboard</Text>
    </View>
  )
}

export default Dashboard

const styles = StyleSheet.create({})
