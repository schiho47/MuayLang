import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import CustomInput from './CustomInput'

type CustomURLProps = {
  url: string
  value: string
  onChange: (value: string) => void
  error: boolean
  errorMessage: string
}
const CustomURL = (props: CustomURLProps) => {
  const { url } = props

  return (
    <View>
      <CustomInput
        title={'URL'}
        placeholder={'Enter URL'}
        value={url}
        name={'url'}
        onChange={() => {}}
        error={false}
        errorMessage={''}
      />
    </View>
  )
}

export default CustomURL

const styles = StyleSheet.create({})
