import { View } from 'react-native'
import React from 'react'
import { Card } from 'react-native-paper'

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
      <Card>
        <Card.Content>
          <OverViewItem
            title="Session Taken"
            description={`${sessionTaken}/20`}
            icon="check-circle"
          />
          <OverViewItem title="Total Calories" description={`${totalCalories} kcal`} icon="fire" />
          <OverViewItem title="Total Duration" description={`${totalDuration} min`} icon="clock" />
          <OverViewItem title="Next Session" description={'2025-08-12'} icon="calendar" />
        </Card.Content>
      </Card>
    </View>
  )
}

export default Overview
