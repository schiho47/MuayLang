import { KeyboardAvoidingView, ScrollView, Platform, ActivityIndicator, View } from 'react-native'
import React, { useEffect, useState } from 'react'

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
    }
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
    }
  }, [originalPageData])

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
