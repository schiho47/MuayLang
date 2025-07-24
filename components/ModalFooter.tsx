import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import IconButtonWithHaptic from './IconButtonWithHaptic'

type ModalFooterProps = {
  handleBack?: () => void
  handelConfirm: () => void
  handleDelete?: () => void
  isEdit?: boolean
}
const ModalFooter: React.FC<ModalFooterProps> = (props) => {
  const { handleBack, handelConfirm = () => {}, isEdit, handleDelete = () => {} } = props
  return (
    <View className="flex-row justify-center gap-10 w-full items-center">
      {isEdit && (
        <IconButtonWithHaptic
          onPress={handleBack || (() => {})}
          children={
            <Text
              className="trounded-lg px-7 py-2 bg-red-800 shadow w-[150px] text-center text-white"
              onPress={handleDelete}
            >
              Delete
            </Text>
          }
          singleContent={true}
        />
      )}
      {!isEdit && (
        <IconButtonWithHaptic
          onPress={handleBack || (() => {})}
          children={
            <Text className="trounded-lg px-7 py-2 bg-muay-white shadow w-[150px] text-center">
              Back
            </Text>
          }
          singleContent={true}
        />
      )}

      <IconButtonWithHaptic
        onPress={handelConfirm}
        children={
          <Text className="trounded-lg px-8 py-2 font-700 text-[16px] bg-muay-purple text-muay-white shadow w-[150px] text-center shadow-black/60 shadowRadius">
            Add
          </Text>
        }
        singleContent={true}
      />
    </View>
  )
}

export default ModalFooter

const styles = StyleSheet.create({})
