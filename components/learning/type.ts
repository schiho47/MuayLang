export enum VocabularyFieldEnum {
  Thai = 'thai',
  Romanization = 'romanization',
  English = 'english',
  ThaiExample = 'exampleTH',
  EnglishExample = 'exampleEN',
  Note = 'note',
  URL = 'url',
  Tags = 'tags',
  Favorite = 'favorite',
}

export type VocabularyDetailDataType = {
  $id: string
  [VocabularyFieldEnum.Thai]: string
  [VocabularyFieldEnum.Romanization]: string
  [VocabularyFieldEnum.English]: string
  [VocabularyFieldEnum.ThaiExample]: string
  [VocabularyFieldEnum.EnglishExample]: string
  [VocabularyFieldEnum.Note]: string
  [VocabularyFieldEnum.URL]: string
  [VocabularyFieldEnum.Tags]: string[]
  [VocabularyFieldEnum.Favorite]?: boolean
}

export interface VocabularyDataType extends VocabularyDetailDataType {
  $id: string
  title: string
}

export type CheckModalError = {
  [VocabularyFieldEnum.Thai]: { status: boolean; message: string }
  [VocabularyFieldEnum.Romanization]: { status: boolean; message: string }
  [VocabularyFieldEnum.English]: { status: boolean; message: string }
  [VocabularyFieldEnum.ThaiExample]: { status: boolean; message: string }
  [VocabularyFieldEnum.EnglishExample]: { status: boolean; message: string }
  [VocabularyFieldEnum.URL]: { status: boolean; message: string }
}

export type FilterDataType = {
  vocabulary: string | string[]
  createdAt: string[]
  tags: string[]
  favorite?: boolean
}
