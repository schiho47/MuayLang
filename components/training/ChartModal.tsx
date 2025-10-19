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
}

const ChartModal: React.FC<ChartModalProps> = ({
  visible,
  onClose,
  chartData,
  currentData,
  chartTitle,
}) => {
  const { width, height } = useWindowDimensions()

  // 判断是否横屏
  const isLandscape = width > height

  // 根据屏幕方向调整图表尺寸
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
                marginBottom: isLandscape ? 10 : 20,
                textAlign: 'center',
              }}
            >
              {chartTitle}
            </Text>
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
                    // 隐藏边界点
                    if (dataPointIndex >= currentData.length) {
                      return 'transparent'
                    }
                    return MUAY_PURPLE
                  }}
                  renderDotContent={({ x, y, index }) => {
                    // 只显示实际数据点的数值，不显示边界点
                    if (index >= currentData.length) {
                      return null
                    }
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
                          backgroundColor: 'rgba(107, 55, 137, 0.8)',
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
