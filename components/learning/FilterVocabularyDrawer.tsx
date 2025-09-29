import { StyleSheet, View, Text, ScrollView, Dimensions } from 'react-native'
import React, { useState, useMemo } from 'react'
import ModalFooter from '../ModalFooter'
import CustomAccordion from '../CustomAccordion'
import CustomMultiSelect from '../CustomMultiSelect'
import CustomDateRangeInput from '../CustomDateRangeInput.'
import { MUAY_PURPLE } from '@/constants/Colors'
import { Ionicons } from '@expo/vector-icons'
import useGetTagList from '@/hooks/useGetTagList'
import { FilterDataType, VocabularyDataType, VocabularyFieldEnum } from './type'
import Spacer from '../Spacer'

const SCREEN_WIDTH = Dimensions.get('window').width
type FilterVocabularyDrawerProps = {
  visible: boolean
  onClose: () => void
  vocabularies: VocabularyDataType[]
  handleConfirmAction: (filterData: FilterDataType) => void
}

const FilterVocabularyDrawer = (props: FilterVocabularyDrawerProps) => {
  const { visible, onClose, vocabularies, handleConfirmAction } = props
  const { tagsList } = useGetTagList(true)
  const [filterData, setFilterData] = useState<FilterDataType>({
    vocabulary: '',
    createdAt: [],
    tags: [],
  })

  const handleValueChange = (value: string | string[], field: keyof FilterDataType) => {
    setFilterData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }
  const handleConfirm = () => {
    handleConfirmAction(filterData)
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

  if (!visible) return null

  return (
    <View style={styles.wrapper}>
      <View style={styles.drawerContainer}>
        <ScrollView
          style={{ flexGrow: 0 }}
          contentContainerStyle={{ paddingBottom: 30 }}
          keyboardShouldPersistTaps="handled"
        >
          <CustomAccordion
            title="Filter by Vocabulary"
            leftIcon={<Text style={styles.iconText}>ก</Text>}
            containerStyle={styles.accordion}
          >
            <CustomMultiSelect
              placeholder="Select Vocabulary"
              value={filterData?.vocabulary || []}
              onChange={(value) => handleValueChange(value, 'vocabulary')}
              item={vocabularyItems || []}
            />
          </CustomAccordion>

          <CustomAccordion
            title="Filter by Tag"
            leftIcon={<Ionicons name="pricetag-outline" size={24} color={MUAY_PURPLE} />}
            containerStyle={styles.accordion}
          >
            <CustomMultiSelect
              placeholder="Select Tag"
              value={filterData?.tag || []}
              onChange={(value) => handleValueChange(value, 'tags')}
              item={tagsList || []}
            />
          </CustomAccordion>

          <CustomAccordion
            title="Filter by Created Date"
            leftIcon={<Ionicons name="calendar-outline" size={24} color={MUAY_PURPLE} />}
            containerStyle={styles.accordion}
          >
            <CustomDateRangeInput
              label="Select Created Date"
              value={filterData.createdAt}
              onConfirm={(value) => handleValueChange(value, 'createdAt')}
              startDate={filterData.createdAt[0] ? new Date(filterData.createdAt[0]) : undefined}
              endDate={filterData.createdAt[1] ? new Date(filterData.createdAt[1]) : undefined}
            />
          </CustomAccordion>

          <Spacer height={20} />

          <ModalFooter
            handleBack={onClose}
            handelConfirm={() => handleConfirm(filterData)}
            isEdit={false}
            handleDelete={() => {}}
            confirmText="Filter"
          />
        </ScrollView>
      </View>
    </View>
  )
}

export default FilterVocabularyDrawer
const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: -80,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.0)', // 不要遮罩的話設 0
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  drawerContainer: {
    position: 'absolute',
    bottom: 0,
    width: SCREEN_WIDTH,
    maxHeight: '85%',
    backgroundColor: 'white',
    zIndex: 1000,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  iconText: {
    fontSize: 24,
    color: MUAY_PURPLE,
    height: 24,
    width: 24,
  },
  accordion: {
    backgroundColor: 'white',
    elevation: 0,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
})
