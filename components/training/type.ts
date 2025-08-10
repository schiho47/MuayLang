export enum TrainingFieldEnum {
  SessionNumber = 'sessionNumber',
  Date = 'date',
  Calories = 'calories',
  Duration = 'duration',
  Note = 'note',
}

export type TrainingDataType = {
  calories: number
  date: string
  duration: number
  note: string
  photos: string[]
  sessionNumber: string
  $id: string
}
