import Overview from '@/components/training/Overview'
import Session from '@/components/training/Session'
import React from 'react'
import { StyleSheet, View } from 'react-native'
// @ts-ignore - types for components may not be bundled correctly
import { Divider } from '@gluestack-ui/themed'
import { MUAY_PURPLE, MUAY_WHITE } from '@/constants/Colors'
import { Ionicons } from '@expo/vector-icons'
import { useTraining } from '@/lib/trainingAPI'
import { convertUTCToLocalString } from '@/utils/dateUtils'
import { TrainingDataType } from '@/components/training/type'
import ParallaxScrollView from '@/components/parallax-scroll-view'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { IconSymbol } from '@/components/ui/icon-symbol'
import { router } from 'expo-router'

export default function Training() {
  const { data: training } = useTraining()
  console.log({ training: training?.[0] })

  const handleAddingSection = () => {
    router.push('/section/add')
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: MUAY_PURPLE, dark: '#353636' }}
      headerOverflow="visible"
      headerImage={
        <View style={styles.headerContainer}>
          <View style={styles.textContainer}>
            <ThemedText type="title" style={styles.headerIcon}>
              มวยไทย
            </ThemedText>
          </View>
          <IconSymbol name="figure.boxing" size={52} color={MUAY_WHITE} style={styles.boxingIcon} />
        </View>
      }
    >
      <ThemedView style={styles.trainingHeader}>
        <View style={styles.actionButtons}>
          <Ionicons
            name="add-circle"
            size={33}
            color={MUAY_PURPLE}
            onPress={handleAddingSection}
            style={styles.actionIcon}
          />
        </View>
      </ThemedView>
      <Divider />
      <Overview training={(training as unknown as TrainingDataType[]) || []} />
      <Divider />
      {training && training.length > 0 && (
        <View>
          {training.map((item: any) => (
            <Session
              key={item.$id}
              sessionNumber={item.sessionNumber || 'Group'}
              date={convertUTCToLocalString(item.date, 'yyyy-MM-dd')}
              calories={String(item.calories)}
              duration={String(item.duration)}
              note={item.note}
              photo={item.photos || []}
              id={item.$id}
              maxHeartRate={String(item.maxHeartRate || '-')}
              avgHeartRate={String(item.avgHeartRate || '-')}
            />
          ))}
        </View>
      )}

      {training && training.length === 0 && (
        <ThemedView
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}
        >
          <ThemedText>No training sessions found</ThemedText>
        </ThemedView>
      )}
    </ParallaxScrollView>
  )
}

const styles = StyleSheet.create({
  headerContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  textContainer: {
    flex: 1,
  },
  headerIcon: {
    fontSize: 90,
    lineHeight: 120,
    fontWeight: 'bold',
    color: MUAY_WHITE,
    height: 100,
    textAlign: 'center',
  },
  boxingIcon: {
    position: 'absolute',
    right: 24,
    top: 50,
  },
  trainingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  actionIcon: {
    padding: 4,
  },
})
