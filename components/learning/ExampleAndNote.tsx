import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { VocabularyFieldEnum } from './type'
import CustomTextArea from '../CustomTextArea'
import CustomURL from '../CustomURL'
import CustomMultiSelect from '../CustomMultiSelect'
type ExampleAndNoteProps = {
  onChange: (value: string, name: VocabularyFieldEnum) => void
  value: {
    [VocabularyFieldEnum.ThaiExample]: string
    [VocabularyFieldEnum.EnglishExample]: string
    [VocabularyFieldEnum.Note]: string
    [VocabularyFieldEnum.URL]: string
  }
}
const ExampleAndNote: React.FC<ExampleAndNoteProps> = (props) => {
  const { onChange, value } = props
  console.log({ value })
  return (
    <View className="flex  justify-center items-center  h-[200px] mt-10 w-full">
      <CustomTextArea
        title={'Thai Sentence'}
        placeholder="Enter Thai Sentence"
        // value={modalData.thai}
        name={'exampleTH'}
        value={value[VocabularyFieldEnum.ThaiExample]}
        onChange={onChange}
        error={false}
      />

      <CustomTextArea
        title={'English Sentence'}
        placeholder="Enter English Sentence"
        // value={modalData.thai}
        name={'exampleEN'}
        value={value[VocabularyFieldEnum.EnglishExample]}
        onChange={onChange}
        error={false}
      />

      <CustomTextArea
        title={'Note'}
        placeholder={'Enter Note'}
        value={value[VocabularyFieldEnum.Note]}
        name={'note'}
        onChange={onChange}
        error={false}
      />
    </View>
  )
}

export default ExampleAndNote

const styles = StyleSheet.create({})
