import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { List } from 'react-native-paper'
import { MUAY_PURPLE } from '@/constants/Colors'

type CustomAccordionProps = {
  title: string
  children: React.ReactNode
  leftIcon?: React.ReactNode
}
const CustomAccordion = (props: CustomAccordionProps) => {
  const { title, children, leftIcon = <></> } = props

  return (
    <List.Section title="">
      <List.Accordion
        title={title}
        titleStyle={{ marginLeft: 12, color: MUAY_PURPLE }}
        left={(props) => leftIcon}
      >
        {children}
      </List.Accordion>
    </List.Section>
  )
}

export default CustomAccordion

const styles = StyleSheet.create({})
