import { View } from 'react-native'
import React from 'react'
// @ts-ignore - types for components may not be bundled correctly
import { Box } from '@gluestack-ui/themed'

import OverViewItem from './OverViewItem'

import { TrainingDataType } from './type'

type OverviewProps = {
  training: TrainingDataType[] | undefined
}
const Overview = (props: OverviewProps) => {
  const { training = [] } = props
  const isPersonalTraining = training.filter((item) => item.sessionNumber)
  const sessionTaken = isPersonalTraining.length
  const totalCalories = isPersonalTraining.reduce((acc, item) => +acc + +item.calories, 0)
  const totalDuration = isPersonalTraining.reduce((acc, item) => +acc + +item.duration, 0)

  return (
    <View style={{ margin: 16 }}>
      <Box
        style={{
          backgroundColor: 'white',
          borderRadius: 8,
          padding: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <OverViewItem
          title="Session Taken"
          description={`${sessionTaken}/20`}
          icon="checkmark-circle"
        />
        <OverViewItem title="Total Calories" description={`${totalCalories} kcal`} icon="flame" />
        <OverViewItem title="Total Duration" description={`${totalDuration} min`} icon="time" />
        <OverViewItem title="Next Session" description={'2025-08-12'} icon="calendar-outline" />
      </Box>
    </View>
  )
}

export default Overview
