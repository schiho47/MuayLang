import { View } from 'react-native'
import React from 'react'

type SpacerProps = {
  height?: number
  width?: number
}

const Spacer: React.FC<SpacerProps> = ({ height = 10, width = 0 }) => {
  return <View style={{ height, width }} />
}

export default Spacer

