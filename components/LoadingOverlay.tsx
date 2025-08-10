import React from 'react'
import { View, StyleSheet, Dimensions, TouchableWithoutFeedback } from 'react-native'
import { ActivityIndicator } from 'react-native-paper'

const { width, height } = Dimensions.get('window')

type Props = {
  visible: boolean
  children: React.ReactNode
}

const LoadingOverlay = ({ visible, children }: Props) => {
  return (
    <View style={{ flex: 1 }}>
      {/* 主要畫面內容 */}
      {children}

      {/* Loading 遮罩 */}
      {visible && (
        <View style={styles.overlay}>
          {/* 捕捉觸控，防止點擊底下 */}
          <TouchableWithoutFeedback>
            <View style={styles.blockTouch}>
              <ActivityIndicator size="large" color="#fff" />
            </View>
          </TouchableWithoutFeedback>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width,
    height,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  blockTouch: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
})

export default LoadingOverlay
