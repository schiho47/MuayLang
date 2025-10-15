import { View } from 'react-native'
import React from 'react'
import { VocabularyFieldEnum } from './type'
import FormTextarea from '../ui/textarea/FormTextarea'

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

  return (
    <View style={{ width: '100%', alignItems: 'center' }}>
      <FormTextarea
        title="Thai Sentence"
        placeholder="Enter Thai Sentence"
        name="exampleTH"
        value={value[VocabularyFieldEnum.ThaiExample]}
        onChange={onChange}
        error={false}
      />

      <FormTextarea
        title="English Sentence"
        placeholder="Enter English Sentence"
        name="exampleEN"
        value={value[VocabularyFieldEnum.EnglishExample]}
        onChange={onChange}
        error={false}
      />

      <FormTextarea
        title="Note"
        placeholder="Enter Note"
        name="note"
        value={value[VocabularyFieldEnum.Note]}
        onChange={onChange}
        error={false}
      />
    </View>
  )
}

export default ExampleAndNote
