import { MUAY_PURPLE } from '@/constants/Colors'
import React from 'react'
import { View } from 'react-native'
import { Button } from 'react-native-paper'

type ModalFooterProps = {
  handleBack?: () => void
  handelConfirm: () => void
  handleDelete?: () => void
  isEdit?: boolean
  confirmText?: string
  loading?: boolean
}
const ModalFooter: React.FC<ModalFooterProps> = (props) => {
  const {
    handleBack,
    handelConfirm = () => {},
    isEdit,
    handleDelete = () => {},
    confirmText,
    loading,
  } = props

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 40,
        width: '100%',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
      }}
    >
      {isEdit && (
        <Button
          mode="contained"
          onPress={handleDelete}
          disabled={loading}
          buttonColor="#ef4444"
          textColor="white"
          style={{
            minWidth: 150,
            borderRadius: 8,
          }}
          contentStyle={{
            paddingVertical: 4,
          }}
          loading={loading}
        >
          Delete
        </Button>
      )}

      {!isEdit && (
        <Button
          mode="outlined"
          onPress={handleBack || (() => {})}
          disabled={loading}
          textColor={MUAY_PURPLE}
          style={{
            minWidth: 150,
            borderRadius: 8,
            borderColor: MUAY_PURPLE,
          }}
          contentStyle={{
            paddingVertical: 4,
          }}
          loading={loading}
        >
          Back
        </Button>
      )}

          {/* <Button
            mode="contained"
            onPress={handelConfirm}
            disabled={loading}
            buttonColor={MUAY_PURPLE}
            textColor="white"
            style={{
              minWidth: 150,
              borderRadius: 8,
            }}
            contentStyle={{
              paddingVertical: 4,
            }}
            loading={loading}
          >
            {confirmText || (isEdit ? 'Update' : 'Add')}
          </Button> */}
    </View>
  )
}

export default ModalFooter
