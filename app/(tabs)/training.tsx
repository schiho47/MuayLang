import Overview from '@/components/training/Overview'
import Session from '@/components/training/Session'
import React from 'react'
import { View, Text } from 'react-native'
import { MUAY_PURPLE, MUAY_WHITE } from '@/constants/Colors'
import { Ionicons } from '@expo/vector-icons'
import { useTraining } from '@/lib/trainingAPI'
import { convertUTCToLocalString } from '@/utils/dateUtils'
import { TrainingDataType } from '@/components/training/type'
import ParallaxScrollView from '@/components/parallax-scroll-view'
import { IconSymbol } from '@/components/ui/icon-symbol'
import { router } from 'expo-router'
import { useUser } from '@/hooks/useUser'

export default function Training() {
  const { user } = useUser()
  const { data: training } = useTraining(user?.$id)

  const handleAddingSection = () => {
    // Prevent guests from adding
    if (user?.isGuest) {
      console.log('Guest users cannot add training sessions')
      return
    }
    router.push('/section/add')
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: MUAY_PURPLE, dark: '#353636' }}
      headerOverflow="visible"
      headerImage={
        <View className="flex-1 flex-row items-center justify-between px-6 pt-10">
          <View className="flex-1">
            <Text
              className="text-[100px] leading-[120px] font-bold text-center h-[100px]"
              style={{ color: MUAY_WHITE }}
            >
              มวยไทย
            </Text>
          </View>
          <IconSymbol
            name="figure.boxing"
            size={52}
            color={MUAY_WHITE}
            style={{ position: 'absolute', right: 20, top: 50 }}
          />
        </View>
      }
    >
      {!user?.isGuest && (
        <View className="flex-row items-center justify-end px-4 py-2">
          <View className="flex-row gap-4">
            <Ionicons
              name="add-circle"
              size={33}
              color={MUAY_PURPLE}
              onPress={handleAddingSection}
              className="p-1"
            />
          </View>
        </View>
      )}
      <View className="w-full h-[1px] bg-gray-300" />
      <Overview training={Array.isArray(training) ? (training as TrainingDataType[]) : []} />
      <View className="w-full h-[1px] bg-gray-300" />
      {Array.isArray(training) && training.length > 0 && (
        <View>
          {training.map((item: any) => (
            <Session
              key={item.$id}
              sessionNumber={item.sessionNumber || 'Group'}
              date={convertUTCToLocalString(item.date, 'yyyy-MM-dd')}
              calories={String(item.calories)}
              duration={String(item.duration)}
              note={item.note}
              photo={item.photos || []}
              id={item.$id}
              maxHeartRate={String(item.maxHeartRate || '-')}
              avgHeartRate={String(item.avgHeartRate || '-')}
            />
          ))}
        </View>
      )}

      {Array.isArray(training) && training.length === 0 && (
        <View className="flex-1 justify-center items-center p-5">
          <Text>No training sessions found</Text>
        </View>
      )}
    </ParallaxScrollView>
  )
}
