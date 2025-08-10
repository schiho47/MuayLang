import Overview from '@/components/training/Overview'
import Session from '@/components/training/Session'
import React from 'react'
import { Text, View, FlatList } from 'react-native'
import { Divider } from 'react-native-paper'
import { MUAY_PURPLE } from '@/constants/Colors'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useTraining } from '@/lib/trainingAPI'
import { convertUTCToLocalString } from '@/utils/dateUtils'
const Training = () => {
  const { data: training, isLoading } = useTraining()
  console.log({ training: training?.[0] })
  const handleAddingSection = () => {
    router.push('/section/add')
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    )
  }

  return (
    <View className="flex-1" style={{ flex: 1 }}>
      <View
        className="flex-row items-center justify-between"
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Text style={{ fontSize: 36, margin: 16, color: MUAY_PURPLE }} className="px-6 mt-4">
          Training
        </Text>
        <Ionicons
          className="me-5"
          name="add-circle"
          size={33}
          color={MUAY_PURPLE}
          onPress={handleAddingSection}
          style={{ marginRight: 16 }}
        />
      </View>
      <Divider />
      <Overview training={training || []} />
      <Divider />
      {training && training.length > 0 && (
        <View style={{ flex: 1 }}>
          <FlatList
            data={training}
            keyExtractor={(item) => item.$id}
            renderItem={({ item }) => (
              <Session
                sessionNumber={item.sessionNumber || 'Group'}
                date={convertUTCToLocalString(item.date, 'yyyy-MM-dd')}
                calories={item.calories}
                duration={item.duration}
                note={item.note}
                photo={item.photos}
                id={item.$id}
              />
            )}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
          />
        </View>
      )}

      {training && training.length === 0 && (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>No training sessions found</Text>
        </View>
      )}
    </View>
  )
}

export default Training
