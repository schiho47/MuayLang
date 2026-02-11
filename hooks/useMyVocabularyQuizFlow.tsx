import { useState, useMemo, useRef, useEffect } from 'react'

export const useMyVocabularyQuizFlow = (
  rawWords: any[], 
  fetchMyVocabularyQuestion: (word: any) => Promise<any>, 
  count: number = 10
) => {
  const [questionPool, setQuestionPool] = useState<any[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [currentQuestion, setCurrentQuestion] = useState<any | null>(null)
  
  // 拼詞互動專用狀態
  const [userSequence, setUserSequence] = useState<{ id: string; text: string }[]>([]) 
  const [shuffledTokens, setShuffledTokens] = useState<{id: string, text: string, used: boolean}[]>([]) 
  
  const [isCorrect, setIsCorrect] = useState(false)
  const [results, setResults] = useState<any[]>([]) // 存放 SummaryItem
  const [resetKey, setResetKey] = useState(0)

  const prefetchedRef = useRef(new Map<number, any>())
  const wrongMapRef = useRef(new Map<number, boolean>())

  // 1. 初始化題庫
  useEffect(() => {
    if (!rawWords?.length) return
    const uniqueMap = new Map<string, any>()
    rawWords.forEach((word) => {
      const key =
        typeof word === 'string' ? word : (word?.$id ?? word?.id ?? '')
      if (!key) return
      if (!uniqueMap.has(String(key))) uniqueMap.set(String(key), word)
    })
    const uniqueWords = Array.from(uniqueMap.values())
    const pool = uniqueWords.sort(() => Math.random() - 0.5).slice(0, count)
    setQuestionPool(pool)
    setCurrentIndex(0)
    setResults([])
    wrongMapRef.current = new Map()
  }, [rawWords, count, resetKey])

  // 2. 題目載入與預取邏輯
  useEffect(() => {
    if (!questionPool[currentIndex]) return
    
    const loadAndPrefetch = async (index: number) => {
      let data = prefetchedRef.current.get(index)
      if (!data) {
        data = await fetchMyVocabularyQuestion(questionPool[index])
        if (data) prefetchedRef.current.set(index, data)
      }

      if (index === currentIndex && data) {
        const normalized = Array.isArray(data) ? data[0] : data
        if (!normalized) return
        setCurrentQuestion(normalized)
        // 將 tokens 轉換為具備唯一 ID 的物件，避免泰文重複單字造成的 Key 衝突
        const tokens = Array.isArray(normalized.tokens_th) ? normalized.tokens_th : []
        const tokenItems = tokens.map((t: string, i: number) => ({
          id: `${t}-${i}`,
          text: t,
          used: false,
        }))
        tokenItems.sort(() => Math.random() - 0.5)
        setShuffledTokens(tokenItems)
      }
      
      // 預取下一題
      const nextIdx = index + 1
      if (nextIdx < questionPool.length && !prefetchedRef.current.has(nextIdx)) {
        fetchMyVocabularyQuestion(questionPool[nextIdx]).then(d => d && prefetchedRef.current.set(nextIdx, d))
      }
    }

    loadAndPrefetch(currentIndex)
    setUserSequence([])
    setIsCorrect(false)
    if (!wrongMapRef.current.has(currentIndex)) wrongMapRef.current.set(currentIndex, false)
  }, [currentIndex, questionPool, fetchMyVocabularyQuestion])

  // 3. 處理拼詞點擊 (先允許任意順序，最後按下一題再驗證)
  const handleTokenClick = (tokenId: string, text: string) => {
    if (!currentQuestion || isCorrect) return
    if (userSequence.length >= currentQuestion.tokens_th.length) return

    setUserSequence(prev => [...prev, { id: tokenId, text }])
    setShuffledTokens(prev => prev.map(t => t.id === tokenId ? { ...t, used: true } : t))
  }

  const handleRemoveToken = (tokenId: string) => {
    if (isCorrect) return
    setUserSequence(prev => {
      const index = prev.findIndex(item => item.id === tokenId)
      if (index === -1) return prev
      const next = [...prev]
      next.splice(index, 1)
      return next
    })
    setShuffledTokens(prev => prev.map(t => t.id === tokenId ? { ...t, used: false } : t))
  }

  // 4. 導航與功能函數
  const handleNext = () => {
    if (!currentQuestion) return

    if (!isCorrect) {
      const totalTokens = shuffledTokens.length || currentQuestion.tokens_th.length
      if (userSequence.length !== totalTokens) {
        return
      }

      const isMatch = currentQuestion.tokens_th.every(
        (token: string, idx: number) => token === userSequence[idx]?.text,
      )

      if (!isMatch) {
        wrongMapRef.current.set(currentIndex, true)
        setUserSequence([])
        setShuffledTokens(prev => prev.map(t => ({ ...t, used: false })))
        return
      }

      const hadWrong = wrongMapRef.current.get(currentIndex) ?? false
      setResults(prev => [
        ...prev.filter(r => r.index !== currentIndex),
        { 
          index: currentIndex, 
          question: currentQuestion.exampleTH, 
          answer: currentQuestion.exampleEN ?? '',
          hadWrong 
        }
      ])
      setIsCorrect(true)
      return
    }

    if (currentIndex < questionPool.length - 1) {
      setCurrentIndex(prev => prev + 1)
    }
  }

  const resetQuiz = () => setResetKey(k => k + 1)

  // 5. 計算衍生參數 (與原本 Hook 100% 兼容)
  const totalQuestions = questionPool.length
  const questionNumber = totalQuestions > 0 ? currentIndex + 1 : 0
  const canGoNext = isCorrect && currentIndex < totalQuestions - 1
  const summaryItems = useMemo(() => results.sort((a, b) => a.index - b.index), [results])
  const correctCount = summaryItems.filter(item => !item.hadWrong).length
  const wrongCount = summaryItems.filter(item => item.hadWrong).length
  const isFinished = totalQuestions > 0 && summaryItems.length === totalQuestions && isCorrect && currentIndex === totalQuestions - 1

  return {
    // 基礎狀態
    questionNumber,
    totalQuestions,
    currentQuestion,
    
    // 拼詞互動狀態
    shuffledTokens, 
    userSequence,
    
    // 控制參數
    isCorrect,
    canGoNext,
    
    // 功能函數
    handleSelectOption: handleTokenClick, // 為了兼容性可 alias
    handleTokenClick,
    handleRemoveToken,
    handleNext,
    resetQuiz,
    
    // 統計參數
    summaryItems,
    correctCount,
    wrongCount,
    isFinished
  }
}