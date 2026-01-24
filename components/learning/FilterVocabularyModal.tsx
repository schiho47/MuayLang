import React, { useState, useMemo } from 'react'
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, Platform } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { MUAY_PURPLE, MUAY_PURPLE_30 } from '@/constants/Colors'
import useGetTagList from '@/hooks/useGetTagList'
import { FilterDataType, VocabularyDataType, VocabularyFieldEnum } from './type'
import { Divider } from '@gluestack-ui/themed'
import SearchInput from '@/components/ui/SearchInput'

type SearchField = 'thai' | 'english' | 'romanization'

type FilterVocabularyModalProps = {
  isOpen: boolean
  onClose: () => void
  vocabularies: VocabularyDataType[]
  handleConfirmAction: (filterData: FilterDataType) => void
}

// Field name mapping (component external constant)
const FIELD_MAP: Record<SearchField, VocabularyFieldEnum> = {
  thai: VocabularyFieldEnum.Thai,
  english: VocabularyFieldEnum.English,
  romanization: VocabularyFieldEnum.Romanization,
}

const FilterVocabularyModal: React.FC<FilterVocabularyModalProps> = (props) => {
  const { isOpen, onClose, vocabularies, handleConfirmAction } = props
  const { tagsList } = useGetTagList(true)

  const [searchText, setSearchText] = useState('')
  const [searchField, setSearchField] = useState<SearchField>('english')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [tagSearchText, setTagSearchText] = useState('')
  const [showFavoriteOnly, setShowFavoriteOnly] = useState(false)

  // Debug logs
  console.log('FilterVocabularyModal render:', {
    isOpen,
    vocabulariesCount: vocabularies?.length,
    tagsListCount: tagsList?.length,
    searchText,
    searchField,
  })

  // Filter vocabularies based on search text and field
  const filteredVocabularies = useMemo(() => {
    if (!searchText.trim()) return []

    const searchLower = searchText.toLowerCase().trim()
    const fieldKey = FIELD_MAP[searchField]

    const filtered = vocabularies
      .filter((vocab) => {
        const fieldValue = String(vocab[fieldKey] || '').toLowerCase()
        return fieldValue.includes(searchLower)
      })
      .slice(0, 5) // Limit to show first 5 results

    console.log('Filtered vocabularies:', {
      searchText,
      searchField,
      fieldKey,
      filteredCount: filtered.length,
      totalCount: vocabularies.length,
    })

    return filtered
  }, [searchText, searchField, vocabularies])

  // Filter tags based on search text - only filter when search text exists
  const filteredTags = useMemo(() => {
    if (!tagSearchText.trim()) return []

    const searchLower = tagSearchText.toLowerCase().trim()
    return (tagsList || []).filter((tag) => tag.label.toLowerCase().includes(searchLower))
  }, [tagSearchText, tagsList])

  const handleConfirm = () => {
    const filterData: FilterDataType = {
      vocabulary: searchText,
      createdAt: [],
      tags: selectedTags,
      favorite: showFavoriteOnly ? true : undefined,
    }
    handleConfirmAction(filterData)
    onClose()
  }

  const handleReset = () => {
    setSearchText('')
    setSearchField('english')
    setSelectedTags([])
    setTagSearchText('')
    setShowFavoriteOnly(false)
  }

  const toggleTag = (tagValue: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagValue) ? prev.filter((t) => t !== tagValue) : [...prev, tagValue],
    )
  }

  return (
    <Modal visible={isOpen} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity
        activeOpacity={1}
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'flex-start',
        }}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
          style={{
            backgroundColor: 'white',
            borderBottomLeftRadius: 20,
            borderBottomRightRadius: 20,

            height: 425,
            width: '100%',
            paddingTop: Platform.OS === 'ios' ? 44 : 24,
          }}
        >
          {/* Drag indicator */}
          <View style={{ alignItems: 'center', paddingVertical: 8 }}>
            <View style={{ width: 40, height: 4, backgroundColor: '#ccc', borderRadius: 2 }} />
          </View>

          {/* Title */}
          <Text
            style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: MUAY_PURPLE,
              textAlign: 'center',
              paddingVertical: 12,
              paddingHorizontal: 16,
            }}
          >
            Filter Vocabulary
          </Text>
          <Divider mb={16} />
          <ScrollView
            style={{ flex: 1, marginTop: 12 }}
            contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 16 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Search field selection (Radio) */}
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
              {(['thai', 'english', 'romanization'] as SearchField[]).map((field) => (
                <TouchableOpacity
                  key={field}
                  onPress={() => setSearchField(field)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    paddingVertical: 6,
                    paddingHorizontal: 12,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: searchField === field ? MUAY_PURPLE : MUAY_PURPLE_30,
                    backgroundColor: searchField === field ? MUAY_PURPLE : 'transparent',
                  }}
                >
                  <View
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: 8,
                      borderWidth: 2,
                      borderColor: searchField === field ? '#fff' : MUAY_PURPLE,
                      backgroundColor: searchField === field ? '#fff' : 'transparent',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {searchField === field && (
                      <View
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: MUAY_PURPLE,
                        }}
                      />
                    )}
                  </View>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '600',
                      color: searchField === field ? '#fff' : MUAY_PURPLE,
                    }}
                  >
                    {field === 'thai' ? 'Thai' : field === 'english' ? 'English' : 'Romanization'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Search input box */}
            <SearchInput
              value={searchText}
              onChangeText={setSearchText}
              placeholder={`Search by ${searchField}`}
              onClear={() => setSearchText('')}
            />

            {/* Search results (real-time display) */}
            {searchText.trim() && filteredVocabularies.length > 0 && (
              <ScrollView
                style={{
                  borderWidth: 1,
                  borderColor: MUAY_PURPLE_30,
                  borderRadius: 8,
                  backgroundColor: '#fff',
                  maxHeight: 200,
                  marginBottom: 20,
                }}
              >
                {filteredVocabularies.map((vocab, index) => {
                  const fieldKey = FIELD_MAP[searchField]
                  return (
                    <TouchableOpacity
                      key={vocab.$id}
                      onPress={() => setSearchText(String(vocab[fieldKey] || ''))}
                      style={{
                        padding: 12,
                        borderBottomWidth: index < filteredVocabularies.length - 1 ? 1 : 0,
                        borderBottomColor: '#f0f0f0',
                      }}
                    >
                      <Text style={{ fontSize: 16, color: '#222', fontWeight: '500' }}>
                        {vocab[VocabularyFieldEnum.Thai]}
                      </Text>
                      <Text style={{ fontSize: 14, color: '#666', marginTop: 2 }}>
                        {vocab[VocabularyFieldEnum.English]} (
                        {vocab[VocabularyFieldEnum.Romanization]})
                      </Text>
                    </TouchableOpacity>
                  )
                })}
              </ScrollView>
            )}

            {/* My Favorites filter */}
            <TouchableOpacity
              onPress={() => setShowFavoriteOnly(!showFavoriteOnly)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 12,
                borderWidth: 1,
                borderColor: showFavoriteOnly ? MUAY_PURPLE : MUAY_PURPLE_30,
                borderRadius: 8,
                backgroundColor: showFavoriteOnly ? `${MUAY_PURPLE}10` : '#fff',
                marginTop: 20,
                marginBottom: 20,
              }}
            >
              <View
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 4,
                  borderWidth: 2,
                  borderColor: showFavoriteOnly ? MUAY_PURPLE : MUAY_PURPLE_30,
                  backgroundColor: showFavoriteOnly ? MUAY_PURPLE : 'transparent',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}
              >
                {showFavoriteOnly && <Ionicons name="checkmark" size={16} color="#fff" />}
              </View>
              <Ionicons
                name={showFavoriteOnly ? 'heart' : 'heart-outline'}
                size={20}
                color={showFavoriteOnly ? '#ef4444' : MUAY_PURPLE}
                style={{ marginRight: 8 }}
              />
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: showFavoriteOnly ? '600' : '400',
                  color: '#222',
                  flex: 1,
                }}
              >
                Show Favorites Only
              </Text>
            </TouchableOpacity>

            {/* Tag search title */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 12,
              }}
            >
              <Ionicons name="pricetag" size={20} color={MUAY_PURPLE} style={{ marginRight: 8 }} />
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: MUAY_PURPLE,
                }}
              >
                Filter by Tags
              </Text>
              {selectedTags.length > 0 && (
                <View
                  style={{
                    marginLeft: 8,
                    backgroundColor: MUAY_PURPLE,
                    borderRadius: 12,
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                  }}
                >
                  <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>
                    {selectedTags.length}
                  </Text>
                </View>
              )}
            </View>

            {/* Tag search box - Always visible */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: MUAY_PURPLE_30,
                borderRadius: 8,
                paddingHorizontal: 12,
                backgroundColor: '#fff',
                marginBottom: 12,
              }}
            >
              <Ionicons name="pricetag-outline" size={20} color={MUAY_PURPLE_30} />
              <TextInput
                placeholder="Search tags..."
                value={tagSearchText}
                onChangeText={setTagSearchText}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  paddingHorizontal: 8,
                  fontSize: 16,
                  color: '#222',
                }}
                placeholderTextColor="#bbb"
              />
              {tagSearchText.length > 0 && (
                <TouchableOpacity onPress={() => setTagSearchText('')}>
                  <Ionicons name="close-circle" size={20} color={MUAY_PURPLE_30} />
                </TouchableOpacity>
              )}
            </View>

            {/* Tag search results - Only show when search text exists */}
            {tagSearchText.trim() && filteredTags.length > 0 && (
              <ScrollView
                style={{
                  borderWidth: 1,
                  borderColor: MUAY_PURPLE_30,
                  borderRadius: 8,
                  backgroundColor: '#fff',
                  maxHeight: 150,
                  marginBottom: 12,
                }}
              >
                {filteredTags.map((tag, index) => {
                  const isSelected = selectedTags.includes(tag.value)
                  return (
                    <TouchableOpacity
                      key={tag.value}
                      onPress={() => toggleTag(tag.value)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        padding: 12,
                        borderBottomWidth: index < filteredTags.length - 1 ? 1 : 0,
                        borderBottomColor: '#f0f0f0',
                        gap: 10,
                        backgroundColor: isSelected ? `${MUAY_PURPLE}10` : 'transparent',
                      }}
                    >
                      <View
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 4,
                          borderWidth: 2,
                          borderColor: isSelected ? MUAY_PURPLE : MUAY_PURPLE_30,
                          backgroundColor: isSelected ? MUAY_PURPLE : 'transparent',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {isSelected && <Ionicons name="checkmark" size={14} color="#fff" />}
                      </View>
                      <Text
                        style={{
                          fontSize: 14,
                          color: '#222',
                          flex: 1,
                          fontWeight: isSelected ? '600' : '400',
                        }}
                      >
                        {tag.label}
                      </Text>
                    </TouchableOpacity>
                  )
                })}
              </ScrollView>
            )}

            {tagSearchText.trim() && filteredTags.length === 0 && (
              <View
                style={{
                  padding: 20,
                  borderWidth: 1,
                  borderColor: MUAY_PURPLE_30,
                  borderRadius: 8,
                  backgroundColor: '#f9f9f9',
                  marginBottom: 12,
                }}
              >
                <Text style={{ textAlign: 'center', color: '#999', fontSize: 14 }}>
                  No tags found for &ldquo;{tagSearchText}&rdquo;
                </Text>
              </View>
            )}

            {/* Selected tags */}
            {selectedTags.length > 0 && (
              <View style={{ marginTop: 8 }}>
                <Text
                  style={{
                    fontSize: 12,
                    color: MUAY_PURPLE,
                    fontWeight: '600',
                    marginBottom: 8,
                  }}
                >
                  Selected Tags ({selectedTags.length})
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {selectedTags.map((tagValue) => {
                    const tag = tagsList?.find((t) => t.value === tagValue)
                    return (
                      <View
                        key={tagValue}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          backgroundColor: MUAY_PURPLE,
                          paddingVertical: 6,
                          paddingHorizontal: 10,
                          borderRadius: 16,
                          gap: 6,
                        }}
                      >
                        <Text style={{ fontSize: 12, color: '#fff', fontWeight: '600' }}>
                          {tag?.label || tagValue}
                        </Text>
                        <TouchableOpacity onPress={() => toggleTag(tagValue)}>
                          <Ionicons name="close-circle" size={16} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    )
                  })}
                </View>
              </View>
            )}
          </ScrollView>

          {/* Footer buttons */}
          <View
            style={{
              flexDirection: 'row',
              gap: 10,
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderTopWidth: 1,
              borderTopColor: '#eee',
            }}
          >
            <TouchableOpacity
              onPress={handleReset}
              style={{
                flex: 1,
                borderRadius: 8,
                backgroundColor: 'transparent',
                borderWidth: 2,
                borderColor: MUAY_PURPLE,
                padding: 14,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: MUAY_PURPLE, fontSize: 16, fontWeight: '600' }}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleConfirm}
              style={{
                flex: 1,
                borderRadius: 8,
                backgroundColor: MUAY_PURPLE,
                padding: 14,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>Filter</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  )
}

export default FilterVocabularyModal
