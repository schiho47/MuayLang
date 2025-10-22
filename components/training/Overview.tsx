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

  const isPersonalTraining = training.filter((item) => +item.sessionNumber > 0)

  const isExtraTraining = training.filter((item) => item.sessionNumber === 'Extra')
  const sessionTaken = isPersonalTraining.length
  const extraSessionTaken = isExtraTraining.length
  const totalCalories = isPersonalTraining.reduce((acc, item) => +acc + +item.calories, 0)
  const totalDuration = isPersonalTraining.reduce((acc, item) => +acc + +item.duration, 0)

  const [isChartModalVisible, setIsChartModalVisible] = useState(false)
  const [chartType, setChartType] = useState<ChartType>('calories')

  // 合併所有訓練（PT + Extra）並按日期排序
  const allTrainingSorted = [...training].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  )

  // 為 Extra Session 添加編號
  let extraCounter = 1
  const trainingsWithLabels = allTrainingSorted.map((item) => {
    if (+item.sessionNumber > 0) {
      return { ...item, label: String(item.sessionNumber), isExtra: false }
    } else {
      return { ...item, label: `E${extraCounter++}`, isExtra: true }
    }
  })

  // 準備不同類型的圖表資料
  const caloriesData = trainingsWithLabels.map((item) => Number(item.calories) || 0)
  const maxHRData = trainingsWithLabels.map((item) => Number(item.maxHeartRate) || 0)
  const avgHRData = trainingsWithLabels.map((item) => Number(item.avgHeartRate) || 0)
  const sessionLabels = trainingsWithLabels.map((item) => item.label)

  // 根據圖表類型選擇資料和配置
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

  // 添加邊界點來控制 Y 軸，但不在 X 軸顯示
  const allData =
    trainingsWithLabels.length > 0
      ? [...currentData, config.boundaries[0], config.boundaries[1]]
      : [0]
  const allLabels = trainingsWithLabels.length > 0 ? [...sessionLabels, '', ''] : ['']

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
  // 計算圖表寬度，如果資料點多則使用更寬的寬度支援橫向滾動
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
        {/* 曲線圖 */}
        {trainingsWithLabels.length > 0 ? (
          <View style={{ marginBottom: 16, marginTop: 16 }}>
            {/* 圖表切換按鈕 */}
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
                marginBottom: 4,
                textAlign: 'center',
              }}
            >
              {config.title}
            </Text>

            {/* 圖例 */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 16,
                marginBottom: 12,
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
                <Text style={{ fontSize: 11, color: '#666' }}>PT Session</Text>
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
                <Text style={{ fontSize: 11, color: '#666' }}>Extra Session</Text>
              </View>
            </View>

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
                    // 只顯示非空的標籤
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
                    // 隱藏邊界點
                    if (dataPointIndex >= currentData.length) {
                      return 'transparent'
                    }
                    // PT Session 紫色，Extra Session 橙色
                    const item = trainingsWithLabels[dataPointIndex]
                    return item?.isExtra ? '#f97316' : MUAY_PURPLE
                  }}
                  renderDotContent={({ x, y, index }) => {
                    // 只顯示實際資料點的數值，不顯示邊界點
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
                          left: x - 15,
                          top: y - 20,
                          fontSize: 10,
                          fontWeight: 'bold',
                          color: dotColor,
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

        {/* 統計資料 - 縮小版 */}
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
              title="Extra Session"
              description={`${extraSessionTaken}`}
              icon="add-circle-outline"
              compact={true}
            />
          </View>
        </View>
      </Box>

      {/* 圖表放大彈窗 */}
      <ChartModal
        visible={isChartModalVisible}
        onClose={() => setIsChartModalVisible(false)}
        chartData={chartData}
        currentData={currentData}
        chartTitle={config.title}
        trainingsWithLabels={trainingsWithLabels}
      />
    </View>
  )
}

export default Overview
