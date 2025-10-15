import { VocabularyFieldEnum } from '@/components/learning/type'

export function isAllThai(text: string): boolean {
  return /^[\u0E00-\u0E7F\s]+$/.test(text)
}

export function isRomanization(text: string): boolean {
  return /^[a-zA-Z''\s]+$/.test(text)
}

export function isEnglish(text: string): boolean {
  return /^[a-zA-Z\s]+$/.test(text)
}

export function isURL(text: string): boolean {
  return /^https?:\/\/[^\s]+$/.test(text)
}

export function isNumber(text: string): boolean {
  return /^[0-9]+$/.test(text)
}

export const validators: Record<string, { validate: (v: string) => boolean; message: string }> = {
  [VocabularyFieldEnum.Thai]: {
    validate: isAllThai,
    message: 'Please enter Thai characters.',
  },
  [VocabularyFieldEnum.Romanization]: {
    validate: isRomanization,
    message: 'Please enter Romanized Thai (Latin letters only).',
  },
  [VocabularyFieldEnum.English]: {
    validate: isEnglish,
    message: 'Please enter English letters only.',
  },
  [VocabularyFieldEnum.EnglishExample]: {
    validate: isEnglish,
    message: 'Please enter English letters only.',
  },
  [VocabularyFieldEnum.ThaiExample]: {
    validate: isAllThai,
    message: 'Please enter Thai characters.',
  },
  [VocabularyFieldEnum.URL]: {
    validate: isURL,
    message: 'Please enter a valid URL.',
  },
}
