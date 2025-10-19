export enum TrainingFieldEnum {
  SessionNumber = 'sessionNumber',
  Date = 'date',
  Calories = 'calories',
  Duration = 'duration',
  Note = 'note',
  MaxHeartRate = 'maxHeartRate',
  AvgHeartRate = 'avgHeartRate',
}

export type TrainingDataType = {
  calories: number
  date: string
  duration: number
  note: string
  photos: string[]
  sessionNumber: string
  maxHeartRate: number
  avgHeartRate: number
  $id: string
}
