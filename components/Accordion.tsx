import { ReactNode, useState } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import Spacer from './Spacer'
type AccordionPropsType = {
  title: string
  children: ReactNode
  expanded: boolean
  onToggle: () => void
}
const Accordion: React.FC<AccordionPropsType> = (props) => {
  const { title, children, expanded, onToggle } = props
  return (
    <View className="mb-10  w-full">
      <TouchableOpacity
        onPress={onToggle}
        className="flex-row items-center justify-center w-full py-2"
        activeOpacity={0.7}
      >
        <MaterialIcons name={expanded ? 'expand-less' : 'expand-more'} size={24} color="#6B3789" />
        <Text className="ml-2 font-medium text-muay-purple w-[300px]">{title}</Text>
      </TouchableOpacity>

      {expanded && <View className="pl-8 pt-2 ">{children}</View>}
    </View>
  )
}

export default Accordion
