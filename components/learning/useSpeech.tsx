import * as Speech from 'expo-speech'

const useSpeech = () => {
  const speak = (text: string, lang = 'th-TH') => {
    Speech.stop()
    Speech.speak(text, {
      language: lang, // 'th-TH' | 'en-US' | 'ja-JP' ...
      pitch: 1.0,
      rate: 1.0,
      onError: (e) => console.log('tts error', e),
    })
  }
  return {
    speak,
  }
}

export default useSpeech
