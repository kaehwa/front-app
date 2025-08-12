import React, { useEffect, useRef } from "react";
import { SafeAreaView, View, Text, StyleSheet, Animated, Easing } from "react-native";
import { router } from "expo-router";

export default function AnniversaryIntro() {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      Animated.delay(800),
      Animated.timing(opacity, { toValue: 0, duration: 450, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
    ]).start(() => router.replace("/anniversary_main"));
  }, [opacity, translateY]);

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.center, { opacity, transform: [{ translateY }] }]}>
        <Text style={styles.title}>000 님, 오늘도 환영합니다.</Text>
        <Text style={styles.sub1}>당신의 순간에 꽃을 더하길 바랍니다.</Text>
        <Text style={styles.sub2}>스쳐가는 오늘이 오래도록 향기롭기를</Text>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 20 },
  title: { fontSize: 24, fontWeight: "800", color: "#0F172A", textAlign: "center" },
  sub1: { marginTop: 10, color: "#374151", fontSize: 14, textAlign: "center" },
  sub2: { marginTop: 6, color: "#6B7280", fontSize: 13, textAlign: "center" },
});
