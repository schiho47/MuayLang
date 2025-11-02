import React from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  useWindowDimensions,
} from 'react-native'
import { LineChart } from 'react-native-chart-kit'
import { Ionicons } from '@expo/vector-icons'
import { MUAY_PURPLE, MUAY_WHITE } from '@/constants/Colors'

type ChartModalProps = {
  visible: boolean
  onClose: () => void
  chartData: {
    labels: string[]
    datasets: {
      data: number[]
      color: (opacity?: number) => string
      strokeWidth: number
      withDots: boolean
    }[]
  }
  currentData: number[]
  chartTitle: string
  trainingsWithLabels?: any[]
}

const ChartModal: React.FC<ChartModalProps> = ({
  visible,
  onClose,
  chartData,
  currentData,
  chartTitle,
  trainingsWithLabels = [],
}) => {
  const { width, height } = useWindowDimensions()

  // Check if landscape mode
  const isLandscape = width > height

  // Adjust chart size based on screen orientation
  const chartWidth = isLandscape
    ? Math.max(width - 100, currentData.length * 120)
    : Math.max(width - 40, currentData.length * 100)

  const chartHeight = isLandscape ? height - 200 : 400

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.9)' }}>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <TouchableOpacity
            style={{
              position: 'absolute',
              top: 10,
              right: 20,
              zIndex: 10,
              padding: 10,
            }}
            onPress={onClose}
          >
            <Ionicons name="close" size={32} color={MUAY_WHITE} />
          </TouchableOpacity>

          <View style={{ flex: 1, justifyContent: 'center' }}>
            <Text
              style={{
                fontSize: isLandscape ? 16 : 20,
                fontWeight: 'bold',
                color: MUAY_WHITE,
                marginBottom: 8,
                textAlign: 'center',
              }}
            >
              {chartTitle}
            </Text>

            {/* Legend */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 16,
                marginBottom: isLandscape ? 10 : 20,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <View
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: MUAY_PURPLE,
                  }}
                />
                <Text style={{ fontSize: 11, color: MUAY_WHITE }}>PT</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <View
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: '#f97316',
                  }}
                />
                <Text style={{ fontSize: 11, color: MUAY_WHITE }}>Extra</Text>
              </View>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={true}
              contentContainerStyle={{ alignItems: 'center' }}
            >
              <View style={{ padding: isLandscape ? 10 : 20 }}>
                <LineChart
                  data={chartData}
                  width={chartWidth}
                  height={chartHeight}
                  yAxisLabel=""
                  yAxisSuffix=""
                  yAxisInterval={1}
                  fromZero={false}
                  segments={5}
                  formatXLabel={(value) => {
                    return value || ''
                  }}
                  chartConfig={{
                    backgroundColor: '#1e1e1e',
                    backgroundGradientFrom: '#1e1e1e',
                    backgroundGradientTo: '#1e1e1e',
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(107, 55, 137, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                    style: {
                      borderRadius: 8,
                    },
                    propsForDots: {
                      r: '6',
                      strokeWidth: '3',
                      stroke: MUAY_PURPLE,
                    },
                    propsForBackgroundLines: {
                      strokeDasharray: '',
                      stroke: '#444',
                      strokeWidth: 1,
                    },
                  }}
                  getDotColor={(dataPoint, dataPointIndex) => {
                    // Hide boundary points
                    if (dataPointIndex >= currentData.length) {
                      return 'transparent'
                    }
                    // PT Session purple, Extra Session orange
                    const item = trainingsWithLabels[dataPointIndex]
                    return item?.isExtra ? '#f97316' : MUAY_PURPLE
                  }}
                  renderDotContent={({ x, y, index }) => {
                    // Only show values for actual data points, not boundary points
                    if (index >= currentData.length) {
                      return null
                    }
                    const item = trainingsWithLabels[index]
                    const dotColor = item?.isExtra ? '#f97316' : MUAY_PURPLE
                    return (
                      <Text
                        key={index}
                        style={{
                          position: 'absolute',
                          left: x - 20,
                          top: y - 25,
                          fontSize: 14,
                          fontWeight: 'bold',
                          color: MUAY_WHITE,
                          backgroundColor: item?.isExtra
                            ? 'rgba(249, 115, 22, 0.8)'
                            : 'rgba(107, 55, 137, 0.8)',
                          paddingHorizontal: 6,
                          paddingVertical: 3,
                          borderRadius: 4,
                        }}
                      >
                        {Math.round(currentData[index])}
                      </Text>
                    )
                  }}
                  bezier
                  style={{
                    borderRadius: 8,
                  }}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  )
}

export default ChartModal
