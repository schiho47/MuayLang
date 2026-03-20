import { KeyboardAvoidingView, ScrollView, Platform, ActivityIndicator, View, Text, TouchableOpacity, Alert } from 'react-native'
import React, { useEffect, useMemo, useState } from 'react'

import FormInput from '../ui/input/FormInput'
import FormNumberInput from '../ui/input/FormNumberInput'
import FormTextarea from '../ui/textarea/FormTextarea'
import FormDatePicker from '../ui/datepicker/FormDatePicker'
import PhotoUploader from '../PhotoUploader'
import ModalFooter from '../ModalFooter'
import LoadingOverlay from '../ui/LoadingOverlay'
import { router } from 'expo-router'
import { uploadPhoto } from '@/utils/photos'
import { TrainingFieldEnum } from './type'
import { CheckModalError } from '../learning/type'
import { trainingValidators } from '@/utils/validators'
import { useDeleteTraining } from '@/lib/trainingAPI'
import { MUAY_PURPLE } from '@/constants/Colors'
import { useUser } from '@/hooks/useUser'
import { useTrainingNoteAI, type TrainingNoteSupplement } from '@/hooks/useTrainingNoteAI'
import { useAddVocabulary, useVocabularies } from '@/lib/learningAPI'
import type { VocabularyDataType } from '@/components/learning/type'
import useSpeech from '@/hooks/useSpeech'
import SpeakerButton from '@/components/ui/SpeakerButton'

type SettingSectionProps = {
  handleConfirmApi: (pageData: any) => void
  isEdit?: boolean
  pageData?: any
  isPending?: boolean
}
const initialPageData = {
  sessionNumber: '',
  date: null,
  calories: '',
  duration: '',
  note: '',
  photos: [],
  maxHeartRate: '',
  avgHeartRate: '',
  noteAiTopic: '',
  noteAiFeedback: '',
  noteAiSupplements: '',
  noteAiGeneratedAt: '',
  noteAiModel: '',
}
const isRequiredFields = [
  TrainingFieldEnum.Date,
  TrainingFieldEnum.Calories,
  TrainingFieldEnum.Duration,
  TrainingFieldEnum.Note,
  TrainingFieldEnum.MaxHeartRate,
  TrainingFieldEnum.AvgHeartRate,
]

const SettingSection = (props: SettingSectionProps) => {
  const { handleConfirmApi, isEdit = false, pageData: originalPageData, isPending } = props
  const { user } = useUser()

  const [pageData, setPageData] = useState(initialPageData)
  const [isSaving, setIsSaving] = useState(false)
  const { mutateAsync: deleteTraining, isPending: isDeleting } = useDeleteTraining()
  const { generate, loading: aiLoading, error: aiError } = useTrainingNoteAI()
  const { mutateAsync: addVocabulary, isPending: isAddingVocabulary } = useAddVocabulary()
  const { data: vocabularies } = useVocabularies(user?.$id)
  const { speak } = useSpeech()
  const [supplements, setSupplements] = useState<TrainingNoteSupplement[]>([])
  const [addedMap, setAddedMap] = useState<Record<number, boolean>>({})
  const [locallyAddedThai, setLocallyAddedThai] = useState<Record<string, boolean>>({})

  const normalizeThaiKey = (thai: string) => thai.replace(/\s+/g, ' ').trim()

  const existingThaiSet = useMemo(() => {
    const list = (vocabularies as unknown as VocabularyDataType[]) || []
    const set = new Set<string>()
    for (const item of list) {
      const key = normalizeThaiKey(String((item as any)?.thai ?? ''))
      if (key) set.add(key)
    }
    return set
  }, [vocabularies])

  // Clean Appwrite document data, remove internal properties
  const cleanAppwriteData = (data: any) => {
    if (!data) return initialPageData

    return {
      sessionNumber: data.sessionNumber || '',
      date: data.date || null,
      calories: data.calories || '',
      duration: data.duration || '',
      note: data.note || '',
      photos: data.photos || [],
      maxHeartRate: data.maxHeartRate || null,
      avgHeartRate: data.avgHeartRate || null,
      noteAiTopic: data.noteAiTopic || '',
      noteAiFeedback: data.noteAiFeedback || '',
      noteAiSupplements: data.noteAiSupplements || '',
      noteAiGeneratedAt: data.noteAiGeneratedAt || '',
      noteAiModel: data.noteAiModel || '',
    }
  }

  const hydrateSupplements = (raw?: string) => {
    if (!raw) return []
    try {
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? (parsed as TrainingNoteSupplement[]) : []
    } catch {
      return []
    }
  }

  const parseBilingual = (raw?: string) => {
    const text = String(raw ?? '')
    const idx = text.indexOf('\nEN:')
    if (idx >= 0) {
      return { th: text.slice(0, idx).trim(), en: text.slice(idx + 4).trim() }
    }
    return { th: text.trim(), en: '' }
  }

  const [error, setError] = useState({
    [TrainingFieldEnum.SessionNumber]: { status: false, message: '' },
    [TrainingFieldEnum.Date]: { status: false, message: '' },
    [TrainingFieldEnum.Calories]: { status: false, message: '' },
    [TrainingFieldEnum.Duration]: { status: false, message: '' },
    [TrainingFieldEnum.Note]: { status: false, message: '' },
    [TrainingFieldEnum.MaxHeartRate]: { status: false, message: '' },
    [TrainingFieldEnum.AvgHeartRate]: { status: false, message: '' },
  })

  const handleChange = (value: string | string[] | Date, name: string) => {
    let isError = { status: false, message: '' }
    if (!value && isRequiredFields.includes(name as TrainingFieldEnum)) {
      isError = { status: true, message: '* This is a required field' }
    } else if (trainingValidators[name]) {
      const valid = trainingValidators[name].validate(value as string)
      isError = { status: !valid, message: valid ? '' : trainingValidators[name].message }
    }
    setError((prev) => ({ ...prev, [name]: isError }))

    const updatedPageData = { ...pageData, [name]: value }
    setPageData(updatedPageData)

    // Check that average heart rate cannot exceed maximum heart rate
    if (name === TrainingFieldEnum.AvgHeartRate || name === TrainingFieldEnum.MaxHeartRate) {
      const avgHR =
        name === TrainingFieldEnum.AvgHeartRate
          ? parseInt(value as string) || 0
          : parseInt(updatedPageData.avgHeartRate) || 0
      const maxHR =
        name === TrainingFieldEnum.MaxHeartRate
          ? parseInt(value as string) || 0
          : parseInt(updatedPageData.maxHeartRate) || 0

      if (avgHR > 0 && maxHR > 0 && avgHR > maxHR) {
        setError((prev) => ({
          ...prev,
          [TrainingFieldEnum.AvgHeartRate]: {
            status: true,
            message: 'Avg HR cannot be greater than Max HR',
          },
        }))
      } else {
        // Clear average heart rate error (if previously set)
        if (
          error[TrainingFieldEnum.AvgHeartRate].message === 'Avg HR cannot be greater than Max HR'
        ) {
          setError((prev) => ({
            ...prev,
            [TrainingFieldEnum.AvgHeartRate]: { status: false, message: '' },
          }))
        }
      }
    }
  }
  const handleConfirm = (pageData: any) => {
    const newError = {} as CheckModalError
    for (const key in pageData || {}) {
      if (isRequiredFields.includes(key as TrainingFieldEnum) && !pageData[key]) {
        ;(newError as any)[key] = {
          status: true,
          message: '* This is a required field',
        }
      }
    }

    // Check that average heart rate cannot exceed maximum heart rate
    const avgHR = parseInt(pageData.avgHeartRate) || 0
    const maxHR = parseInt(pageData.maxHeartRate) || 0
    if (avgHR > 0 && maxHR > 0 && avgHR > maxHR) {
      ;(newError as any)[TrainingFieldEnum.AvgHeartRate] = {
        status: true,
        message: 'Avg HR cannot be greater than Max HR',
      }
    }

    setError((prev) => ({ ...prev, ...newError }))

    // Check if there are any errors
    const hasErrors = Object.values({ ...error, ...newError }).some((err) => err.status)

    // Only execute handleSaveData if there are no errors
    if (!hasErrors) {
      handleSaveData()
    }
  }

  const handleSaveData = async () => {
    setIsSaving(true)

    try {
      // Prepare data and add userId (only when creating)
      const dataToSave = isEdit ? pageData : { ...pageData, userId: user?.$id }

      if (pageData.photos.length > 0) {
        // Separate newly uploaded photos (local URI) and existing photos (Appwrite file IDs)
        const newPhotos = pageData.photos.filter(
          (photo: string) => photo.startsWith('file://') || photo.startsWith('content://'),
        )
        const existingPhotos = pageData.photos.filter(
          (photo: string) => !photo.startsWith('file://') && !photo.startsWith('content://'),
        )

        // Only upload new photos
        const newFileIds =
          newPhotos.length > 0
            ? await Promise.all(newPhotos.map((photo: string) => uploadPhoto(photo)))
            : []

        // Merge existing photo IDs and newly uploaded photo IDs
        const allFileIds = [...existingPhotos, ...newFileIds]

        await handleConfirmApi({ ...dataToSave, photos: allFileIds })
      } else {
        await handleConfirmApi(dataToSave)
      }

      router.back()
    } catch (error) {
      console.error('Save failed:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    await deleteTraining(originalPageData?.$id || '')
    router.back()
  }

  useEffect(() => {
    if (originalPageData) {
      setPageData(cleanAppwriteData(originalPageData))
      setSupplements(hydrateSupplements(originalPageData?.noteAiSupplements))
    }
  }, [originalPageData])

  const hasGeneratedAI = !!pageData.noteAiGeneratedAt || !!pageData.noteAiSupplements
  const canRunAI = !!pageData.note?.trim() && !user?.isGuest && !hasGeneratedAI

  const handleGenerateAI = async () => {
    if (!canRunAI) return
    const result = await generate({
      date: pageData.date as any,
      sessionNumber: String(pageData.sessionNumber ?? ''),
      duration: pageData.duration as any,
      calories: pageData.calories as any,
      maxHeartRate: pageData.maxHeartRate as any,
      avgHeartRate: pageData.avgHeartRate as any,
      note: String(pageData.note ?? ''),
    })
    if (!result) return

    // De-duplicate within this generation (AI can repeat across items)
    const uniq: TrainingNoteSupplement[] = []
    const seen = new Set<string>()
    for (const s of result.supplements || []) {
      const key = normalizeThaiKey(String(s?.thai ?? ''))
      if (!key) continue
      if (seen.has(key)) continue
      seen.add(key)
      uniq.push(s)
      if (uniq.length >= 3) break
    }
    const nextSupplements = uniq
    setSupplements(nextSupplements)
    setAddedMap({})
    setLocallyAddedThai({})

    const nowIso = new Date().toISOString()
    const nextPageData = {
      ...pageData,
      noteAiTopic: `${result.topic_th}\nEN: ${result.topic_en}`.trim(),
      noteAiFeedback: `${result.feedback_th}\nEN: ${result.feedback_en}`.trim(),
      noteAiSupplements: JSON.stringify(nextSupplements),
      noteAiGeneratedAt: nowIso,
      noteAiModel: 'gemini-2.0-flash',
    }

    setPageData(nextPageData)
    // Persist immediately in edit mode so next open can display it.
    if (isEdit) {
      try {
        await handleConfirmApi(nextPageData)
      } catch (e) {
        // Keep UI state, but inform user they need to press Update to save if update fails.
        Alert.alert('Save failed', 'AI content generated, but failed to save. Please press Update to save.')
      }
    }
  }

  const handleAddSupplementToVocab = async (item: TrainingNoteSupplement, index: number) => {
    if (user?.isGuest) return
    if (addedMap[index]) return
    const thaiKey = normalizeThaiKey(String(item.thai ?? ''))
    const exists = (!!thaiKey && existingThaiSet.has(thaiKey)) || (!!thaiKey && locallyAddedThai[thaiKey])
    if (exists) {
      Alert.alert('Already exists', 'This word already exists in My Vocabularies.')
      return
    }

    const tags = Array.isArray(item.tags) ? item.tags : []
    const dateTag = pageData.date ? [`training:${String(pageData.date)}`] : []
    const topicTag = pageData.noteAiTopic ? [`topic:${pageData.noteAiTopic}`] : []

    const payload: any = {
      userId: user?.$id,
      thai: item.thai || '',
      romanization: item.romanization || '',
      english: item.english || '',
      exampleTH: item.exampleTH || '',
      exampleEN: item.exampleEN || '',
      note: `From training note${pageData.date ? ` (${String(pageData.date)})` : ''}`,
      url: '',
      tags: [...new Set([...tags, ...dateTag, ...topicTag])],
      favorite: false,
    }

    const res: any = await addVocabulary(payload)
    if (res?.success !== false) {
      setAddedMap((prev) => ({ ...prev, [index]: true }))
      if (thaiKey) setLocallyAddedThai((prev) => ({ ...prev, [thaiKey]: true }))
    }
  }

  return (
    <View style={{ flex: 1 }}>
      {isPending && (
        <ActivityIndicator animating={true} color={MUAY_PURPLE} style={{ marginTop: 100 }} />
      )}
      {!isPending && (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView
            style={{ flex: 1, width: '100%', marginTop: 20, marginLeft: 12 }}
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={true}
          >
            <FormInput
              title="Session Number"
              placeholder="Session"
              value={String(pageData.sessionNumber)}
              name="sessionNumber"
              onChange={(value) => handleChange(value, 'sessionNumber')}
              error={error[TrainingFieldEnum.SessionNumber].status}
              errorMessage={error[TrainingFieldEnum.SessionNumber].message}
            />
            <FormDatePicker
              label="Date"
              onConfirm={(date) => handleChange(date, 'date')}
              date={pageData.date}
              error={error[TrainingFieldEnum.Date].status}
              errorMessage={error[TrainingFieldEnum.Date].message}
            />
            <FormNumberInput
              title="Calories"
              placeholder="Calories"
              value={String(pageData.calories || '')}
              name="calories"
              onChange={(value) => handleChange(value, 'calories')}
              error={error[TrainingFieldEnum.Calories].status}
              errorMessage={error[TrainingFieldEnum.Calories].message}
              min={0}
              max={2000}
              step={10}
              suffix="kcal"
            />
            <FormNumberInput
              title="Duration"
              placeholder="Duration"
              value={String(pageData.duration || '')}
              name="duration"
              onChange={(value) => handleChange(value, 'duration')}
              error={error[TrainingFieldEnum.Duration].status}
              errorMessage={error[TrainingFieldEnum.Duration].message}
              min={0}
              max={300}
              step={5}
              suffix="min"
            />

            {/* Heart rate fields - Side by side display */}
            <View
              style={{
                flexDirection: 'row',
                gap: 12,
                width: '90%',
                margin: 12,
              }}
            >
              <FormNumberInput
                title="Max HR"
                placeholder="Max"
                value={String(pageData.maxHeartRate || '')}
                name="maxHeartRate"
                onChange={(value) => handleChange(value, 'maxHeartRate')}
                error={error[TrainingFieldEnum.MaxHeartRate].status}
                errorMessage={error[TrainingFieldEnum.MaxHeartRate].message}
                min={60}
                max={220}
                step={1}
                inline={true}
                suffix="bpm"
              />
              <FormNumberInput
                title="Avg HR"
                placeholder="Avg"
                value={String(pageData.avgHeartRate || '')}
                name="avgHeartRate"
                onChange={(value) => handleChange(value, 'avgHeartRate')}
                error={error[TrainingFieldEnum.AvgHeartRate].status}
                errorMessage={error[TrainingFieldEnum.AvgHeartRate].message}
                min={60}
                max={200}
                step={1}
                inline={true}
                suffix="bpm"
              />
            </View>
            <FormTextarea
              title="Note"
              placeholder="Note"
              value={pageData.note}
              name="note"
              onChange={(value) => handleChange(value, 'note')}
              error={error[TrainingFieldEnum.Note].status}
              errorMessage={error[TrainingFieldEnum.Note].message}
            />

            {/* AI feedback + supplements */}
            <View
              style={{
                width: '90%',
                margin: 12,
                padding: 12,
                borderWidth: 1,
                borderColor: '#eee',
                borderRadius: 12,
                backgroundColor: 'white',
              }}
            >
              <Text style={{ color: MUAY_PURPLE, fontWeight: '700', marginBottom: 8 }}>
                AI Note Coach
              </Text>

              <TouchableOpacity
                onPress={handleGenerateAI}
                disabled={!canRunAI || aiLoading}
                style={{
                  backgroundColor: MUAY_PURPLE,
                  paddingVertical: 10,
                  borderRadius: 10,
                  opacity: !canRunAI || aiLoading ? 0.35 : 1,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: 'white', fontWeight: '700' }}>
                  {aiLoading
                    ? 'Generating…'
                    : user?.isGuest
                      ? 'Guest cannot use AI'
                      : hasGeneratedAI
                        ? 'Already generated'
                        : 'Get AI feedback'}
                </Text>
              </TouchableOpacity>

              {aiError ? (
                <Text style={{ color: '#ef4444', marginTop: 8 }}>{aiError}</Text>
              ) : null}

              {pageData.noteAiFeedback ? (
                <View style={{ marginTop: 10 }}>
                  {(() => {
                    const topic = parseBilingual(pageData.noteAiTopic)
                    const fb = parseBilingual(pageData.noteAiFeedback)
                    return (
                      <>
                        {topic.th ? (
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Text style={{ color: MUAY_PURPLE, fontWeight: '700', marginBottom: 4, flex: 1 }}>
                              {topic.th}
                            </Text>
                            <SpeakerButton
                              onPress={() => speak(topic.th)}
                              accessibilityLabel="Speak Thai topic"
                              size={18}
                              color={MUAY_PURPLE}
                            />
                          </View>
                        ) : null}
                        {topic.en ? (
                          <Text style={{ color: '#666', marginTop: 2, marginBottom: 6 }}>{topic.en}</Text>
                        ) : null}

                        {fb.th ? (
                          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                            <Text style={{ color: '#111', lineHeight: 20, flex: 1 }}>{fb.th}</Text>
                            <SpeakerButton
                              onPress={() => speak(fb.th)}
                              accessibilityLabel="Speak Thai feedback"
                              size={18}
                              color={MUAY_PURPLE}
                            />
                          </View>
                        ) : null}
                        {fb.en ? (
                          <Text style={{ color: '#666', marginTop: 6, lineHeight: 18 }}>{fb.en}</Text>
                        ) : null}
                      </>
                    )
                  })()}
                </View>
              ) : null}

              {supplements.length > 0 ? (
                <View style={{ marginTop: 12 }}>
                  <Text style={{ color: MUAY_PURPLE, fontWeight: '700', marginBottom: 8 }}>
                    Thai supplements (3)
                  </Text>
                  {supplements.map((s, idx) => {
                    const added = !!addedMap[idx]
                    const thaiKey = normalizeThaiKey(String(s.thai ?? ''))
                    const exists =
                      (!!thaiKey && existingThaiSet.has(thaiKey)) || (!!thaiKey && locallyAddedThai[thaiKey])
                    const buttonLabel = added ? 'Added' : exists ? 'Already exists' : 'Add to My Vocabularies'
                    return (
                      <View
                        key={`${idx}-${s.thai}`}
                        style={{
                          borderWidth: 1,
                          borderColor: '#f0f0f0',
                          borderRadius: 12,
                          padding: 10,
                          marginBottom: 10,
                        }}
                      >
                        <Text style={{ fontWeight: '800', color: '#111' }}>
                          {s.thai} {s.romanization ? `(${s.romanization})` : ''}
                        </Text>
                        <SpeakerButton
                          onPress={() => speak(s.thai)}
                          accessibilityLabel={`Speak Thai word ${idx + 1}`}
                          size={18}
                          color={MUAY_PURPLE}
                          style={{ marginTop: 6 }}
                        />
                        <Text style={{ color: '#333', marginTop: 4 }}>{s.english}</Text>
                        {s.exampleTH ? (
                          <View style={{ marginTop: 6 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                              <Text style={{ color: '#111', flex: 1 }}>{s.exampleTH}</Text>
                              <SpeakerButton
                                onPress={() => speak(s.exampleTH)}
                                accessibilityLabel={`Speak Thai example ${idx + 1}`}
                                size={18}
                                color={MUAY_PURPLE}
                              />
                            </View>
                          </View>
                        ) : null}
                        {s.exampleEN ? (
                          <Text style={{ color: '#555', marginTop: 2 }}>{s.exampleEN}</Text>
                        ) : null}

                        <TouchableOpacity
                          onPress={() => handleAddSupplementToVocab(s, idx)}
                          disabled={user?.isGuest || isAddingVocabulary || added || exists}
                          style={{
                            marginTop: 8,
                            backgroundColor: added ? '#2ecc71' : exists ? '#9ca3af' : MUAY_PURPLE,
                            paddingVertical: 8,
                            borderRadius: 10,
                            opacity: user?.isGuest || isAddingVocabulary ? 0.5 : 1,
                            alignItems: 'center',
                          }}
                        >
                          <Text style={{ color: 'white', fontWeight: '800' }}>
                            {buttonLabel}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )
                  })}
                </View>
              ) : null}
            </View>

            <PhotoUploader
              photos={pageData.photos}
              setPhotos={(photos: string[]) => handleChange(photos, 'photos')}
            />
          </ScrollView>

          <View
            style={{
              backgroundColor: 'white',
              borderTopWidth: 1,
              borderTopColor: '#f0f0f0',
              marginBottom: 10,
            }}
          >
            <ModalFooter
              confirmText={isEdit ? 'Update' : 'Add'}
              handelConfirm={() => handleConfirm(pageData)}
              isEdit={isEdit}
              handleBack={() => router.back()}
              handleDelete={handleDelete}
              loading={isPending || isDeleting}
            />
          </View>
        </KeyboardAvoidingView>
      )}

      <LoadingOverlay
        visible={isSaving}
        message={isEdit ? 'Updating training...' : 'Creating training...'}
      />
    </View>
  )
}

export default SettingSection
