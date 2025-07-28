import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import IconButtonWithHaptic from './IconButtonWithHaptic'
import { MUAY_WHITE, MUAY_PURPLE } from '@/constants/Colors'

type ModalFooterProps = {
  handleBack?: () => void
  handelConfirm: () => void
  handleDelete?: () => void
  isEdit?: boolean
  confirmText?: string
}
const ModalFooter: React.FC<ModalFooterProps> = (props) => {
  const {
    handleBack,
    handelConfirm = () => {},
    isEdit,
    handleDelete = () => {},
    confirmText,
  } = props
  return (
    <View
      className="flex-row justify-center gap-10 w-full items-center"
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 40,
        width: '100%',
        alignItems: 'center',
      }}
    >
      {isEdit && (
        <IconButtonWithHaptic onPress={handleBack || (() => {})} singleContent={true}>
          <Text
            className="trounded-lg px-7 py-2 bg-red-800 shadow w-[150px] text-center text-white"
            style={{
              borderRadius: 8,
              padding: 14,
              backgroundColor: '#ef4444',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
              width: 150,
              textAlign: 'center',
              color: '#fff',
            }}
            onPress={handleDelete}
          >
            Delete
          </Text>
        </IconButtonWithHaptic>
      )}
      {!isEdit && (
        <IconButtonWithHaptic onPress={handleBack || (() => {})} singleContent={true}>
          <Text
            className="trounded-lg px-7 py-2 bg-muay-white shadow w-[150px] text-center"
            style={{
              borderRadius: 8,
              padding: 14,
              backgroundColor: MUAY_WHITE,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
              width: 150,
              textAlign: 'center',
            }}
          >
            Back
          </Text>
        </IconButtonWithHaptic>
      )}

      <IconButtonWithHaptic onPress={handelConfirm} singleContent={true}>
        <Text
          className="trounded-lg px-8 py-2 font-700 text-[16px] bg-muay-purple text-muay-white shadow w-[150px] text-center shadow-black/60 shadowRadius"
          style={{
            borderRadius: 8,
            padding: 16,
            fontWeight: '700',
            fontSize: 16,
            backgroundColor: MUAY_PURPLE,
            color: MUAY_WHITE,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
            width: 150,
            textAlign: 'center',
          }}
        >
          {confirmText || (isEdit ? 'Edit' : 'Add')}
        </Text>
      </IconButtonWithHaptic>
    </View>
  )
}

export default ModalFooter

const styles = StyleSheet.create({})
