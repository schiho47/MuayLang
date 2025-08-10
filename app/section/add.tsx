import { StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import SettingSection from '@/components/training/SettingSection'
import { Appbar } from 'react-native-paper'
import { router } from 'expo-router'
import { MUAY_PURPLE } from '@/constants/Colors'
import { useCreateTraining } from '@/lib/trainingAPI'
import { uploadPhoto } from '@/utils/photos'
import LoadingOverlay from '@/components/LoadingOverlay'

const AddSection = () => {
  const { mutateAsync: addTraining, isPending } = useCreateTraining()

  return (
    <LoadingOverlay visible={isPending}>
      <View className="flex-1">
        <Appbar.Header>
          <Appbar.BackAction
            onPress={() => {
              router.back()
            }}
          />
          <Appbar.Content
            title={
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: 'bold',
                  color: MUAY_PURPLE,
                  marginBottom: 8,
                  marginTop: 16,
                }}
              >
                Add Training Section
              </Text>
            }
          />
        </Appbar.Header>
        <SettingSection handleConfirmApi={addTraining} />
      </View>
    </LoadingOverlay>
  )
}

export default AddSection

const styles = StyleSheet.create({})
