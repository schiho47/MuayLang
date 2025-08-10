import { format, parseISO } from 'date-fns'

/**
 * 將 UTC 時間字串轉換為本地時間
 * @param utcDateString - UTC 時間字串，例如 "2025-07-18T23:59:59.999+00:00"
 * @returns 本地時間的 Date 物件
 */
export const convertUTCToLocal = (utcDateString: string): Date => {
  return parseISO(utcDateString)
}

/**
 * 將 Date 物件格式化為本地日期字串
 * @param date - Date 物件
 * @param formatString - 格式化字串，預設為 "yyyy-MM-dd"
 * @returns 格式化後的日期字串
 */
export const formatLocalDate = (date: Date, formatString: string = 'yyyy-MM-dd'): string => {
  return format(date, formatString)
}

/**
 * 將 UTC 時間字串轉換為本地日期字串
 * @param utcDateString - UTC 時間字串
 * @param formatString - 格式化字串，預設為 "yyyy-MM-dd"
 * @returns 格式化後的本地日期字串
 */
export const convertUTCToLocalString = (
  utcDateString: string,
  formatString: string = 'yyyy-MM-dd'
): string => {
  const localDate = convertUTCToLocal(utcDateString)
  return formatLocalDate(localDate, formatString)
}

/**
 * 獲取當前本地時間的 Date 物件
 * @returns 當前本地時間
 */
export const getCurrentLocalDate = (): Date => {
  return new Date()
}

/**
 * 將本地時間轉換為 UTC 時間字串
 * @param localDate - 本地時間的 Date 物件
 * @returns UTC 時間字串
 */
export const convertLocalToUTC = (localDate: Date): string => {
  return localDate.toISOString()
}

/*
使用範例：

// 1. 將 UTC 時間字串轉換為本地時間
const utcString = "2025-07-18T23:59:59.999+00:00"
const localDate = convertUTCToLocal(utcString)
console.log(localDate) // 2025-07-19T00:00:00.000+08:00 (假設在 UTC+8 時區)

// 2. 格式化本地日期
const formattedDate = formatLocalDate(localDate) // "2025-07-19"
const formattedWithTime = formatLocalDate(localDate, 'yyyy-MM-dd HH:mm:ss') // "2025-07-19 00:00:00"

// 3. 直接從 UTC 字串轉換為本地日期字串
const localDateString = convertUTCToLocalString(utcString) // "2025-07-19"

// 4. 獲取當前本地時間
const now = getCurrentLocalDate()

// 5. 將本地時間轉換為 UTC
const utcString = convertLocalToUTC(now)
*/
