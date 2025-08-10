import { Text, View } from 'react-native'
import React from 'react'
import SettingSection from '@/components/training/SettingSection'
import { Appbar } from 'react-native-paper'
import { router, useLocalSearchParams } from 'expo-router'
import { MUAY_PURPLE } from '@/constants/Colors'
import { useGetTrainingById, useUpdateTraining } from '@/lib/trainingAPI'

const EditSection = () => {
  const { mutateAsync: updateTraining, isPending } = useUpdateTraining()
  const { id } = useLocalSearchParams()
  const { data: training } = useGetTrainingById(id as string)

  return (
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
              Edit Training Section
            </Text>
          }
        />
      </Appbar.Header>
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
