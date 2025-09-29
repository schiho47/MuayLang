import React from 'react';
import { StyleSheet, View } from 'react-native';

interface SpacerProps {
  height?: number;
  width?: number;
}

export default function Spacer({ height = 16, width = 0 }: SpacerProps) {
  return <View style={[styles.spacer, { height, width }]} />;
}

const styles = StyleSheet.create({
  spacer: {
    // Empty styles, dimensions are set via props
  },
});
