import React from 'react'
import { Image, Linking, Platform, useWindowDimensions } from 'react-native'
import {
  Box,
  Heading,
  Text,
  HStack,
  VStack,
  Icon,
  Link,
  LinkText,
  Spinner,
  ExternalLinkIcon,
} from '@gluestack-ui/themed'
import { useDiscovery } from '@/lib/discoveryAPI'
import { MUAY_PURPLE, MUAY_PURPLE_30, MUAY_WHITE } from '@/constants/Colors'
import DiscovertDefault from './DiscoveryDefault'
import { Ionicons } from '@expo/vector-icons'
import { getTodayKey } from '@/utils/dateUtils'

type DiscoveryItem = {
  title: string
  content: string
  link: string
  imageUrl: string
}

const Discovery = () => {
  const { data: discoveryData, isLoading } = useDiscovery(getTodayKey())
  const discovery = (Array.isArray(discoveryData) ? discoveryData[0] : discoveryData) as
    | DiscoveryItem
    | undefined
  const { width } = useWindowDimensions()
  const isMobileWeb = Platform.OS === 'web' && width < 768

  if (isLoading) {
    return (
      <Box p="$4" bg="$backgroundLight50" borderRadius="$lg" alignItems="center">
        <Spinner size="small" />
        <Text size="xs" mt="$2">
          Discovering ...
        </Text>
      </Box>
    )
  }

  // 如果今天剛好沒資料，顯示一個溫馨的預設值
  if (!discovery) return <DiscovertDefault />
  const link = discovery.link

  return (
    <Box
      p="$5"
      bg={MUAY_WHITE}
      borderRadius="$2xl"
      borderWidth={1}
      borderColor={MUAY_PURPLE_30}
      m="$2"
    >
      <VStack space="md">
        <HStack justifyContent="space-between" alignItems="center">
          <HStack space="xs" alignItems="center">
            <HStack alignItems="center" space="xs">
              <Heading size="sm" color={MUAY_PURPLE} sub>
                MUAY THAI DISCOVERY
              </Heading>
              <Ionicons name="search" size={16} color={MUAY_PURPLE} />
            </HStack>
          </HStack>
          <Text size="md" color="$textLight700" style={{ fontWeight: 'bold', fontSize: 16 }}>
            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </Text>
        </HStack>

        {Platform.OS === 'web' && !isMobileWeb ? (
          <HStack space="md" alignItems="flex-start">
            <VStack space="xs" flex={1}>
              <Heading size="md" color="$textLight900" marginVertical={4}>
                {discovery.title}
              </Heading>
              <Text size="sm" color="$textLight700" lineHeight="$md" fontSize={16}>
                {discovery.content || ''}
              </Text>
            </VStack>
            {discovery.imageUrl && (
              <Image
                source={{ uri: discovery.imageUrl }}
                style={{ width: 140, height: 140, borderRadius: 12 }}
                resizeMode="cover"
              />
            )}
          </HStack>
        ) : (
          <VStack space="sm">
            {discovery.imageUrl && (
              <Image
                source={{ uri: discovery.imageUrl }}
                style={{ width: '100%', height: 200, borderRadius: 12 }}
                resizeMode="cover"
              />
            )}
            <VStack space="xs">
              <Heading size="md" color="$textLight900" marginVertical={4}>
                {discovery.title}
              </Heading>
              <Text size="sm" color="$textLight700" lineHeight="$md">
                {discovery.content || ''}
              </Text>
            </VStack>
          </VStack>
        )}

        {link && (
          <Link isExternal onPress={() => Linking.openURL(link)} mt="$1">
            <HStack alignItems="center" space="xs">
              <LinkText size="xs" color="$primary700" fontSize={14}>
                Learn more on Wikipedia
              </LinkText>
              <Icon as={ExternalLinkIcon} size="xs" color="$primary700" />
            </HStack>
          </Link>
        )}
      </VStack>
    </Box>
  )
}

export default Discovery
