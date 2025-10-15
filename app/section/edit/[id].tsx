import { Text, View, TouchableOpacity } from 'react-native'
import React from 'react'
import SettingSection from '@/components/training/SettingSection'
// @ts-ignore - types for components may not be bundled correctly
import { Box, HStack } from '@gluestack-ui/themed'
import { Ionicons } from '@expo/vector-icons'
import { router, useLocalSearchParams } from 'expo-router'
import { MUAY_PURPLE, MUAY_WHITE } from '@/constants/Colors'
import { useGetTrainingById, useUpdateTraining } from '@/lib/trainingAPI'

const EditSection = () => {
  const { mutateAsync: updateTraining, isPending } = useUpdateTraining()
  const { id } = useLocalSearchParams()
  const { data: training } = useGetTrainingById(id as string)

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
            style={{ padding: 8 }}
          >
            <Ionicons name="arrow-back" size={24} color={MUAY_PURPLE} />
          </TouchableOpacity>
          <Text
            style={{
              fontSize: 28,
              fontWeight: 'bold',
              color: MUAY_PURPLE,
              marginLeft: 16,
            }}
          >
            Edit Training Section
          </Text>
        </HStack>
      </Box>
      <SettingSection
        handleConfirmApi={(data) => updateTraining({ id: id as string, ...data })}
        isEdit={true}
        pageData={training}
        isPending={isPending}
      />
    </View>
  )
}

export default EditSection
