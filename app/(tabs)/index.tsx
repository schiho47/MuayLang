import { Image } from 'expo-image'
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Animated } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useMemo, useEffect, useRef, useState } from 'react'

import ParallaxScrollView from '@/components/parallax-scroll-view'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { MUAY_PURPLE, MUAY_WHITE } from '@/constants/Colors'
import { useVocabularies } from '@/lib/learningAPI'
import { useTraining } from '@/lib/trainingAPI'
import { VocabularyDataType, VocabularyFieldEnum } from '@/components/learning/type'
import VocabularyCard from '@/components/learning/VocabularyCard'
import { useUser } from '../../hooks/useUser'
import EmailVerificationBanner from '../../components/auth/EmailVerificationBanner'
// @ts-ignore - types for components may not be bundled correctly
import { Divider, Spinner, Box } from '@gluestack-ui/themed'

export default function HomeScreen() {
  const { user, logout } = useUser()
  console.log('👤 HomeScreen - Current user ID:', user?.$id)
  const { data: vocabularies, isLoading: vocabLoading } = useVocabularies(user?.$id)
  const { data: training, isLoading: trainingLoading } = useTraining(user?.$id)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  console.log('📚 HomeScreen - vocabularies count:', vocabularies?.length)
  console.log('🥊 HomeScreen - training count:', training?.length)

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(-50)).current
  const scaleAnim = useRef(new Animated.Value(0.8)).current
  const sectionFadeAnim = useRef(new Animated.Value(0)).current

  // Start animations
  useEffect(() => {
    // Title animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 40,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 40,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start()

    // Delayed start for content section animation
    setTimeout(() => {
      Animated.timing(sectionFadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start()
    }, 400)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Favorite vocabularies
  const favoriteVocabularies = useMemo(() => {
    if (!vocabularies) return []
    return (vocabularies as unknown as VocabularyDataType[]).filter(
      (vocab) => vocab[VocabularyFieldEnum.Favorite] === true,
    )
  }, [vocabularies])

  // Recent training records (latest 3)
  const recentTraining = useMemo(() => {
    if (!training) return []
    return [...training]
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3)
  }, [training])

  // Weekly statistics
  const weekStats = useMemo(() => {
    if (!training) return { sessions: 0, calories: 0, duration: 0 }

    const today = new Date()
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

    const thisWeek = (training as any[]).filter((item: any) => new Date(item.date) >= weekAgo)

    return {
      sessions: thisWeek.length,
      calories: thisWeek.reduce((acc: number, item: any) => acc + Number(item.calories || 0), 0),
      duration: thisWeek.reduce((acc: number, item: any) => acc + Number(item.duration || 0), 0),
    }
  }, [training])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: MUAY_PURPLE, dark: '#1D3D47' }}
      headerImage={<Image source={require('@/assets/images/logoBig.png')} style={styles.logo} />}
    >
      {/* Logout/Exit button - Top right */}
      <View style={styles.logoutContainer}>
        <Text style={styles.userEmail}>{user?.isGuest ? 'Guest Mode' : user?.email}</Text>
        <TouchableOpacity
          onPress={handleLogout}
          disabled={isLoggingOut}
          style={styles.logoutButton}
        >
          {isLoggingOut ? (
            <Spinner size="small" />
          ) : (
            <Ionicons name="log-out-outline" size={24} color={MUAY_PURPLE} />
          )}
        </TouchableOpacity>
      </View>

      {/* Email Verification Banner */}
      <EmailVerificationBanner />

      <ThemedView style={styles.titleContainer}>
        <Animated.View
          style={[
            styles.thaiTitleWrapper,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            },
          ]}
        >
          <Animated.Text style={styles.thaiTitleShadow}>สวัสดี</Animated.Text>
          <Animated.Text style={styles.thaiTitle}>สวัสดี</Animated.Text>
        </Animated.View>
      </ThemedView>
      <Animated.Text
        style={[
          styles.subtitle,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        Welcome to MuayLang
      </Animated.Text>

      <Divider my={16} bgColor={MUAY_PURPLE} w="100%" h={1.5} />

      {/* Learning Section - My Favorites */}
      <Animated.View style={{ opacity: sectionFadeAnim }}>
        <ThemedView style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Ionicons name="heart" size={24} color="#ef4444" />
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              My Favorites
            </ThemedText>
            <TouchableOpacity onPress={() => router.push('/(tabs)/learning')}>
              <Ionicons name="arrow-forward" size={20} color={MUAY_PURPLE} />
            </TouchableOpacity>
          </View>

          {vocabLoading ? (
            <View style={styles.loadingContainer}>
              <Spinner />
            </View>
          ) : favoriteVocabularies.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
              {favoriteVocabularies.slice(0, 5).map((vocab) => (
                <View key={vocab.$id} style={{ marginRight: 12 }}>
                  <VocabularyCard
                    item={vocab}
                    id={vocab.$id}
                    onPress={(id) => {
                      if (!user?.isGuest) {
                        router.push(`/vocabulary/edit/${id}`)
                      }
                    }}
                  />
                </View>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="heart-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No favorite vocabulary yet</Text>
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/learning')}
                style={styles.emptyButton}
              >
                <Text style={styles.emptyButtonText}>Browse Vocabulary</Text>
              </TouchableOpacity>
            </View>
          )}
        </ThemedView>
      </Animated.View>

      <Divider my={16} bgColor={MUAY_PURPLE} w="100%" h={1.5} />

      {/* Training Section - Weekly Stats + Recent Training */}
      <Animated.View style={{ opacity: sectionFadeAnim }}>
        <ThemedView style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Ionicons name="fitness" size={24} color={MUAY_PURPLE} />
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Training Overview
            </ThemedText>
            <TouchableOpacity onPress={() => router.push('/(tabs)/training')}>
              <Ionicons name="arrow-forward" size={20} color={MUAY_PURPLE} />
            </TouchableOpacity>
          </View>

          {trainingLoading ? (
            <View style={styles.loadingContainer}>
              <Spinner />
            </View>
          ) : (
            <>
              {/* Weekly stats cards */}
              <View style={styles.statsGrid}>
                <Box style={styles.statCard}>
                  <Ionicons name="calendar" size={32} color={MUAY_PURPLE} />
                  <Text style={styles.statValue}>{weekStats.sessions}</Text>
                  <Text style={styles.statLabel}>This Week</Text>
                </Box>
                <Box style={styles.statCard}>
                  <Ionicons name="flame" size={32} color="#ef4444" />
                  <Text style={styles.statValue}>{weekStats.calories}</Text>
                  <Text style={styles.statLabel}>Calories</Text>
                </Box>
                <Box style={styles.statCard}>
                  <Ionicons name="time" size={32} color={MUAY_PURPLE} />
                  <Text style={styles.statValue}>{weekStats.duration}</Text>
                  <Text style={styles.statLabel}>Minutes</Text>
                </Box>
              </View>

              {/* Recent training */}
              {recentTraining.length > 0 && (
                <View style={{ marginTop: 16 }}>
                  <Text style={styles.subsectionTitle}>Recent Sessions</Text>
                  {recentTraining.map((item: any) => (
                    <TouchableOpacity
                      key={item.$id}
                      onPress={() => {
                        if (!user?.isGuest) {
                          router.push(`/section/edit/${item.$id}`)
                        }
                      }}
                      style={styles.trainingItem}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={styles.trainingDate}>
                          {new Date(item.date).toLocaleDateString()}
                        </Text>
                        <Text style={styles.trainingInfo}>
                          {item.sessionNumber ? `Session ${item.sessionNumber}` : 'Extra'} •{' '}
                          {item.calories} kcal • {item.duration} min
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color="#999" />
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {recentTraining.length === 0 && (
                <View style={styles.emptyContainer}>
                  <Ionicons name="barbell-outline" size={48} color="#ccc" />
                  <Text style={styles.emptyText}>No training records yet</Text>
                  <TouchableOpacity
                    onPress={() => router.push('/(tabs)/training')}
                    style={styles.emptyButton}
                  >
                    <Text style={styles.emptyButtonText}>Add Training</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
        </ThemedView>
      </Animated.View>
    </ParallaxScrollView>
  )
}
const styles = StyleSheet.create({
  titleContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  thaiTitleWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thaiTitleShadow: {
    position: 'absolute',
    fontSize: 52,
    fontWeight: 'bold',
    color: MUAY_PURPLE,
    lineHeight: 76,
    textAlign: 'center',
    opacity: 0.2,
    transform: [{ translateY: 2 }, { translateX: 2 }],
  },
  thaiTitle: {
    fontSize: 52,
    fontWeight: 'bold',
    color: MUAY_PURPLE,
    lineHeight: 76,
    textAlign: 'center',
    textShadowColor: 'rgba(107, 55, 137, 0.3)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
  },
  subtitle: {
    fontSize: 30,
    color: '#666',
    textAlign: 'center',
  },
  logo: {
    height: 178,
    width: '80%',
    maxWidth: 300,
    alignSelf: 'center',
  },
  logoutContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  userEmail: {
    fontSize: 12,
    color: MUAY_PURPLE,
    fontWeight: '500',
  },
  logoutButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: MUAY_WHITE,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    flex: 1,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
  },
  emptyButton: {
    backgroundColor: MUAY_PURPLE,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 8,
  },
  emptyButtonText: {
    color: MUAY_WHITE,
    fontSize: 14,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: MUAY_PURPLE,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: MUAY_PURPLE,
    marginBottom: 8,
  },
  trainingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  trainingDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 4,
  },
  trainingInfo: {
    fontSize: 14,
    color: '#666',
  },
})
