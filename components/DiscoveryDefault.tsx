import { StyleSheet, Text } from "react-native";

import { ThemedView } from "./themed-view";
import { MUAY_PURPLE } from "@/constants/Colors";

const DiscovertDefault=()=>{
    return (
      <>
      <ThemedView style={styles.titleContainer}>
          <Text style={styles.thaiTitleShadow}>สวัสดี</Text>
          <Text style={styles.thaiTitle}>สวัสดี</Text>
        </ThemedView>
        <Text style={styles.subtitle}>
          Welcome to MuayLang
        </Text>          

      </>
    );
  }

export default DiscovertDefault;

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
    })