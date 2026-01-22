import { format, parseISO } from 'date-fns'

/**
 * Convert UTC time string to local time
 * @param utcDateString - UTC time string, e.g. "2025-07-18T23:59:59.999+00:00"
 * @returns Date object in local time
 */
export const convertUTCToLocal = (utcDateString: string): Date => {
  return parseISO(utcDateString)
}

/**
 * Format Date object to local date string
 * @param date - Date object
 * @param formatString - Format string, default is "yyyy-MM-dd"
 * @returns Formatted date string
 */
export const formatLocalDate = (date: Date, formatString: string = 'yyyy-MM-dd'): string => {
  return format(date, formatString)
}

/**
 * Convert UTC time string to local date string
 * @param utcDateString - UTC time string
 * @param formatString - Format string, default is "yyyy-MM-dd"
 * @returns Formatted local date string
 */
export const convertUTCToLocalString = (
  utcDateString: string,
  formatString: string = 'yyyy-MM-dd',
): string => {
  const localDate = convertUTCToLocal(utcDateString)
  return formatLocalDate(localDate, formatString)
}

/**
 * Get current local time as Date object
 * @returns Current local time
 */
export const getCurrentLocalDate = (): Date => {
  return new Date()
}

/**
 * Convert local time to UTC time string
 * @param localDate - Date object in local time
 * @returns UTC time string
 */
export const convertLocalToUTC = (localDate: Date): string => {
  return localDate.toISOString()
}
export const getTodayKey = () => {
  const now = new Date()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  return `${mm}${dd}`
}
/*
Usage Examples:

// 1. Convert UTC time string to local time
const utcString = "2025-07-18T23:59:59.999+00:00"
const localDate = convertUTCToLocal(utcString)
console.log(localDate) // 2025-07-19T00:00:00.000+08:00 (assuming UTC+8 timezone)

// 2. Format local date
const formattedDate = formatLocalDate(localDate) // "2025-07-19"
const formattedWithTime = formatLocalDate(localDate, 'yyyy-MM-dd HH:mm:ss') // "2025-07-19 00:00:00"

// 3. Directly convert UTC string to local date string
const localDateString = convertUTCToLocalString(utcString) // "2025-07-19"

// 4. Get current local time
const now = getCurrentLocalDate()

// 5. Convert local time to UTC
const utcString = convertLocalToUTC(now)
*/

export const getRandomFourDate = () => {
  const today = new Date()
  const end = new Date(today)
  end.setDate(end.getDate() - 1) // 昨天

  const start = new Date(end.getFullYear(), 0, 1) // 今年 1/1

  // 計算從 1/1 到昨天的總天數差 (毫秒換算)
  const diffTime = end.getTime() - start.getTime()
  const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1

  // 如果總天數不足 4 天，直接回傳所有天數
  if (totalDays <= 4) {
    return Array.from({ length: totalDays }, (_, i) => {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      return formatDate(d)
    })
  }

  // 隨機抽 4 個不重複的整數 (天數索引)
  const chosenIndices = new Set()
  while (chosenIndices.size < 4) {
    const randomIdx = Math.floor(Math.random() * totalDays)
    chosenIndices.add(randomIdx)
  }

  // 只針對選中的那 4 天進行日期格式化
  return Array.from(chosenIndices).map((idx) => {
    const targetDate = new Date(start)
    targetDate.setDate(start.getDate() + idx)
    return formatDate(targetDate)
  })
}
export const formatDate = (date: Date) => {
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${mm}${dd}`
}
