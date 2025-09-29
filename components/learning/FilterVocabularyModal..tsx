import React, { useMemo, useState } from 'react'
import {
  Modal,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  KeyboardAvoidingView,
  SafeAreaView,
} from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import CustomInput from '../CustomInputOld'
import Spacer from '../Spacer'

import ModalFooter from '../ModalFooter'
import { FilterDataType, VocabularyDataType, VocabularyFieldEnum } from './type'

import { useGetVocabularyTagList } from '../../lib/learningAPI'
import CustomDropDownPick from '../CustomDropDownPick'
import { MUAY_PURPLE } from '@/constants/Colors'
import useGetTagList from '@/hooks/useGetTagList'
import CustomDatePicker from '../CustomDateRangeInput.'
import CustomMultiSelect from '../CustomMultiSelect'

type FilterVocabularyModalProps = {
  handleClose: (isUpdate: boolean) => void
  handleConfirm: (data: FilterDataType) => void
  vocabularies: VocabularyDataType[]
}

const FilterVocabularyModal: React.FC<FilterVocabularyModalProps> = (props) => {
  const { handleClose, handleConfirm, vocabularies } = props

  const { tagsList } = useGetTagList()
  const [filterData, setFilterData] = useState<FilterDataType>({
    vocabulary: '',
    createdAt: '',
    tag: '',
  })

  // const { data: vocabularyTagList, isLoading: isLoadingTagList } = useGetVocabularyTagList()
  const handleValueChange = (value: string, field: keyof FilterDataType) => {
    setFilterData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const vocabularyItems = useMemo(
    () => [
      { label: 'All', value: undefined },
      ...(vocabularies?.map((item) => ({
        label: item[VocabularyFieldEnum.English],
        value: item.$id,
      })) || []),
    ],
    [vocabularies]
  )

  return (
    <Modal
      animationType="slide"
      transparent
      visible={true}
      onRequestClose={() => handleClose(false)}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <SafeAreaView style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <View
            className="flex-1 justify-center items-center bg-black/40"
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(0,0,0,0.4)',
            }}
          >
            <KeyboardAvoidingView
              behavior="padding"
              style={{ flex: 1, width: '100%' }}
              keyboardVerticalOffset={64}
            >
              <View
                className="bg-white rounded-2xl shadow-lg items-center relative p-5 w-full overflow-x-hidden"
                style={{
                  borderRadius: 10,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,
                  elevation: 5,
                  backgroundColor: 'white',
                  padding: 16,
                }}
              >
                <TouchableOpacity
                  onPress={() => handleClose(false)}
                  className="absolute top-1 right-1 p-2 z-10"
                  hitSlop={10}
                >
                  <MaterialIcons name="close" size={22} color="#6B3789" />
                </TouchableOpacity>
                <Text
                  className="text-[28px] font-bold text-muay-purple mb-2 mt-4"
                  style={{
                    fontSize: 28,
                    fontWeight: 'bold',
                    color: MUAY_PURPLE,
                    marginBottom: 8,
                    marginTop: 16,
                    marginLeft: 16,
                  }}
                >
                  Filter Vocabulary
                </Text>
                {/* <CustomMultiSelect
                  placeholder="Select Vocabulary"
                  value={filterData.vocabulary.split(',')}
                  onChange={(value) => handleValueChange(value.join(','), 'vocabulary')}
                  item={vocabularyItems as { label: string; value: string }[]}
                  title="Vocabulary"
                /> */}
                <Spacer height={20} />

                <CustomMultiSelect
                  placeholder="Select Tag"
                  value={[]}
                  onChange={(value) => handleValueChange(value.join(','), 'tag')}
                  item={[]}
                  title="Tags"
                />

                <Spacer height={20} />
                <CustomDatePicker
                  label="Select Created Date"
                  value={filterData.createdAt}
                  onChange={handleValueChange}
                />
                {/* <CustomDropDownPick
                  zIndex={2000}
                  items={createdDateItems}
                  handleValueChange={handleValueChange}
                  placeholder="Select Created Date"
                  field="createdAt"
                /> */}
                <Spacer height={30} />
                <ModalFooter
                  handleClose={() => handleClose(false)}
                  handelConfirm={() => handleConfirm(filterData)}
                  isEdit={false}
                  handleDelete={() => {}}
                />
              </View>
            </KeyboardAvoidingView>
          </View>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </Modal>
  )
}

const styles = StyleSheet.create({})

export default FilterVocabularyModal
