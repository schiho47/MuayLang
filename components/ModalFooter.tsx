import { MUAY_PURPLE, MUAY_WHITE } from '@/constants/Colors'
import React from 'react'
import { View, TouchableOpacity, Text, ActivityIndicator } from 'react-native'

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
    <View className="flex-row justify-center gap-10 w-full items-center p-4">
      {isEdit && (
        <TouchableOpacity
          onPress={handleDelete}
          disabled={loading}
          className={`min-w-[150px] rounded-lg bg-[#ef4444] p-4 items-center justify-center text-white font-bold text-lg ${loading ? 'opacity-60' : 'opacity-100'}`}
        >
          {loading ? (
            <ActivityIndicator color={MUAY_WHITE} />
          ) : (
            <Text className="text-white font-bold text-lg">Delete</Text>
          )}
        </TouchableOpacity>
      )}

      {!isEdit && (
        <TouchableOpacity
          onPress={handleBack || (() => {})}
          disabled={loading}
          className={`min-w-[150px] rounded-lg bg-transparent border-2 border-muay-purple p-4 items-center justify-center text-muay-purple font-bold text-lg  ${loading ? 'opacity-60' : 'opacity-100'}`}
        >
          {loading ? (
            <ActivityIndicator color={MUAY_PURPLE} />
          ) : (
            <Text className="text-muay-purple font-bold text-lg">Back</Text>
          )}
        </TouchableOpacity>
      )}

      <TouchableOpacity
        onPress={handelConfirm}
        disabled={loading}
        className={`min-w-[150px] rounded-lg bg-muay-purple p-4 items-center justify-center text-white font-bold text-lg ${loading ? 'opacity-60' : 'opacity-100'}`}
      >
        {loading ? (
          <ActivityIndicator color={MUAY_WHITE} />
        ) : (
          <Text className="text-white font-bold text-lg">
            {confirmText || (isEdit ? 'Update' : 'Add')}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  )
}

export default ModalFooter
