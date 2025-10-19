import { View, Dimensions, Text, ScrollView, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
// @ts-ignore - types for components may not be bundled correctly
import { Box } from '@gluestack-ui/themed'
import { LineChart } from 'react-native-chart-kit'

import OverViewItem from './OverViewItem'
import ChartModal from './ChartModal'
import { TrainingDataType } from './type'
import { MUAY_PURPLE } from '@/constants/Colors'

type OverviewProps = {
  training: TrainingDataType[] | undefined
}

type ChartType = 'calories' | 'maxHR' | 'avgHR'

const Overview = (props: OverviewProps) => {
  const { training = [] } = props
  const isPersonalTraining = training.filter((item) => item.sessionNumber)
  const sessionTaken = isPersonalTraining.length
  const totalCalories = isPersonalTraining.reduce((acc, item) => +acc + +item.calories, 0)
  const totalDuration = isPersonalTraining.reduce((acc, item) => +acc + +item.duration, 0)

  const [isChartModalVisible, setIsChartModalVisible] = useState(false)
  const [chartType, setChartType] = useState<ChartType>('calories')

  // 准备图表数据
  const sortedTraining = [...isPersonalTraining].sort((a, b) => {
    const sessionA = parseInt(String(a.sessionNumber)) || 0
    const sessionB = parseInt(String(b.sessionNumber)) || 0
    return sessionA - sessionB
  })

  // 准备不同类型的图表数据
  const caloriesData = sortedTraining.map((item) => Number(item.calories) || 0)
  const maxHRData = sortedTraining.map((item) => Number(item.maxHeartRate) || 0)
  const avgHRData = sortedTraining.map((item) => Number(item.avgHeartRate) || 0)
  const sessionLabels = sortedTraining.map((item) => String(item.sessionNumber || '0'))

  // 根据图表类型选择数据和配置
  const getChartConfig = () => {
    switch (chartType) {
      case 'calories':
        return {
          data: caloriesData,
          boundaries: [100, 600],
          title: 'Calories per Session',
          yAxisSuffix: ' kcal',
        }
      case 'maxHR':
        return {
          data: maxHRData,
          boundaries: [60, 220],
          title: 'Max Heart Rate per Session',
          yAxisSuffix: ' bpm',
        }
      case 'avgHR':
        return {
          data: avgHRData,
          boundaries: [60, 200],
          title: 'Avg Heart Rate per Session',
          yAxisSuffix: ' bpm',
        }
    }
  }

  const config = getChartConfig()
  const currentData = config.data

  // 添加边界点来控制 Y 轴，但不在 X 轴显示
  const allData =
    sortedTraining.length > 0 ? [...currentData, config.boundaries[0], config.boundaries[1]] : [0]
  const allLabels = sortedTraining.length > 0 ? [...sessionLabels, '', ''] : ['']

  const chartData = {
    labels: allLabels,
    datasets: [
      {
        data: allData,
        color: (opacity = 1) => `rgba(107, 55, 137, ${opacity})`, // MUAY_PURPLE
        strokeWidth: 2,
        withDots: true,
      },
    ],
  }

  const screenWidth = Dimensions.get('window').width
  // 计算图表宽度，如果数据点多则使用更宽的宽度支持横向滚动
  const chartWidth = Math.max(screenWidth - 70, currentData.length * 80)

  return (
    <View style={{ width: '100%', marginVertical: 8 }}>
      <Box
        style={{
          backgroundColor: 'white',
          width: '100%',
          borderRadius: 8,
          padding: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        {/* 曲线图 */}
        {sortedTraining.length > 0 ? (
          <View style={{ marginBottom: 16, marginTop: 16 }}>
            {/* 图表切换按钮 */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 8,
                marginBottom: 12,
              }}
            >
              <TouchableOpacity
                onPress={() => setChartType('calories')}
                style={{
                  paddingVertical: 6,
                  paddingHorizontal: 12,
                  borderRadius: 16,
                  backgroundColor: chartType === 'calories' ? MUAY_PURPLE : 'transparent',
                  borderWidth: 1,
                  borderColor: MUAY_PURPLE,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '600',
                    color: chartType === 'calories' ? '#fff' : MUAY_PURPLE,
                  }}
                >
                  Calories
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setChartType('maxHR')}
                style={{
                  paddingVertical: 6,
                  paddingHorizontal: 12,
                  borderRadius: 16,
                  backgroundColor: chartType === 'maxHR' ? MUAY_PURPLE : 'transparent',
                  borderWidth: 1,
                  borderColor: MUAY_PURPLE,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '600',
                    color: chartType === 'maxHR' ? '#fff' : MUAY_PURPLE,
                  }}
                >
                  Max HR
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setChartType('avgHR')}
                style={{
                  paddingVertical: 6,
                  paddingHorizontal: 12,
                  borderRadius: 16,
                  backgroundColor: chartType === 'avgHR' ? MUAY_PURPLE : 'transparent',
                  borderWidth: 1,
                  borderColor: MUAY_PURPLE,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '600',
                    color: chartType === 'avgHR' ? '#fff' : MUAY_PURPLE,
                  }}
                >
                  Avg HR
                </Text>
              </TouchableOpacity>
            </View>

            <Text
              style={{
                fontSize: 16,
                fontWeight: 'bold',
                color: MUAY_PURPLE,
                marginBottom: 8,
                textAlign: 'center',
              }}
            >
              {config.title}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
              <TouchableOpacity onPress={() => setIsChartModalVisible(true)} activeOpacity={0.8}>
                <LineChart
                  data={chartData}
                  width={chartWidth}
                  height={200}
                  yAxisLabel=""
                  yAxisSuffix=""
                  yAxisInterval={1}
                  fromZero={false}
                  segments={5}
                  formatXLabel={(value) => {
                    // 只显示非空的标签
                    return value || ''
                  }}
                  chartConfig={{
                    backgroundColor: '#fff',
                    backgroundGradientFrom: '#fff',
                    backgroundGradientTo: '#fff',
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(107, 55, 137, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    style: {
                      borderRadius: 8,
                    },
                    propsForDots: {
                      r: '4',
                      strokeWidth: '2',
                      stroke: MUAY_PURPLE,
                    },
                    propsForBackgroundLines: {
                      strokeDasharray: '',
                      stroke: '#e0e0e0',
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
                          left: x - 15,
                          top: y - 20,
                          fontSize: 10,
                          fontWeight: 'bold',
                          color: MUAY_PURPLE,
                          backgroundColor: 'rgba(255, 255, 255, 0.8)',
                          paddingHorizontal: 4,
                          paddingVertical: 2,
                          borderRadius: 4,
                          textAlign: 'right',
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
              </TouchableOpacity>
            </ScrollView>
          </View>
        ) : (
          <Text style={{ textAlign: 'center', color: '#999', marginBottom: 16 }}>
            No session data available
          </Text>
        )}

        {/* 统计数据 - 缩小版 */}
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            gap: 8,
            paddingHorizontal: 8,
            paddingBottom: 16,
          }}
        >
          <View style={{ width: '48%' }}>
            <OverViewItem
              title="Session Taken"
              description={`${sessionTaken}/20`}
              icon="checkmark-circle"
              compact={true}
            />
          </View>
          <View style={{ width: '48%' }}>
            <OverViewItem
              title="Total Calories"
              description={`${totalCalories} kcal`}
              icon="flame"
              compact={true}
            />
          </View>
          <View style={{ width: '48%' }}>
            <OverViewItem
              title="Total Duration"
              description={`${totalDuration} min`}
              icon="time"
              compact={true}
            />
          </View>
          <View style={{ width: '48%' }}>
            <OverViewItem
              title="Next Session"
              description={'2025-08-12'}
              icon="calendar-outline"
              compact={true}
            />
          </View>
        </View>
      </Box>

      {/* 图表放大弹窗 */}
      <ChartModal
        visible={isChartModalVisible}
        onClose={() => setIsChartModalVisible(false)}
        chartData={chartData}
        currentData={currentData}
        chartTitle={config.title}
      />
    </View>
  )
}

export default Overview
