import React, { ReactNode, useState } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import Spacer from './Spacer'
import { MUAY_PURPLE } from '@/constants/Colors'
type AccordionPropsType = {
  title: string
  children: ReactNode
  expanded: boolean
  onToggle: () => void
}
const Accordion: React.FC<AccordionPropsType> = (props) => {
  const { title, children, expanded, onToggle } = props
  return (
    <View className="mb-10  w-full" style={{ marginBottom: 20, width: '100%', marginLeft: 8 }}>
      <TouchableOpacity
        onPress={onToggle}
        className="flex-row items-center justify-center w-full py-2"
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-start',
          width: '100%',
        }}
        activeOpacity={0.7}
      >
        <MaterialIcons name={expanded ? 'expand-less' : 'expand-more'} size={24} color="#6B3789" />
        <Text
          className="ml-2 font-medium text-muay-purple w-[300px]"
          style={{ fontWeight: 'medium', color: MUAY_PURPLE, marginLeft: 4 }}
        >
          {title}
        </Text>
      </TouchableOpacity>

      {expanded && (
        <View className="pl-8 pt-2 " style={{ paddingLeft: 2, paddingTop: 8 }}>
          {children}
        </View>
      )}
    </View>
  )
}

export default Accordion
