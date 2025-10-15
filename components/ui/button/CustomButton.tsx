import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Button, ButtonGroup, ButtonText, ButtonSpinner, ButtonIcon } from '@gluestack-ui/themed'
type CustomButtonProps = {
  children: React.ReactNode
  onPress: () => void

  size: 'sm' | 'md' | 'lg'

  isSpinner: boolean
  isIcon: boolean
}
const CustomButton = (props: CustomButtonProps) => {
  const { children, onPress, size, isSpinner, isIcon } = props
  return (
    <ButtonGroup>
      <Button onPress={onPress} size={size}>
        <ButtonText />
        {isSpinner && <ButtonSpinner />}
        {isIcon && <ButtonIcon />}
        {children}
      </Button>
    </ButtonGroup>
  )
}

export default CustomButton

const styles = StyleSheet.create({})
