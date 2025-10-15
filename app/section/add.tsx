import { Text, View, TouchableOpacity } from 'react-native'
import React from 'react'
import SettingSection from '@/components/training/SettingSection'
// @ts-ignore - types for components may not be bundled correctly
import { Box, HStack } from '@gluestack-ui/themed'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { MUAY_PURPLE, MUAY_WHITE } from '@/constants/Colors'
import { useCreateTraining } from '@/lib/trainingAPI'

const AddSection = () => {
  const { mutateAsync: addTraining, isPending } = useCreateTraining()

  return (
    <View className="flex-1">
      <Box
        style={{
          backgroundColor: MUAY_WHITE,
          paddingTop: 44,
          paddingBottom: 8,
          paddingHorizontal: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          elevation: 3,
        }}
      >
        <HStack style={{ alignItems: 'center', paddingHorizontal: 8 }}>
          <TouchableOpacity
            onPress={() => {
              router.back()
            }}
            style={{ padding: 8, paddingTop: 20 }}
          >
            <Ionicons name="arrow-back" size={24} color={MUAY_PURPLE} />
          </TouchableOpacity>
          <Text
            style={{
              fontSize: 28,
              fontWeight: 'bold',
              color: MUAY_PURPLE,
              padding: 24,
              paddingLeft: 20,
              paddingTop: 32,
            }}
          >
            Add Training Section
          </Text>
        </HStack>
      </Box>
      <SettingSection handleConfirmApi={addTraining} isPending={isPending} />
    </View>
  )
}

export default AddSection
