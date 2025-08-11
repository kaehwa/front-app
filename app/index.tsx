// app/index.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  Image,
  Animated,
  Easing,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

function GoogleButton({
  onPress,
  loading,
}: {
  onPress: () => void;
  loading?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      style={({ pressed }) => [
        styles.gBtn,
        pressed && { transform: [{ scale: 0.98 }], shadowOpacity: 0.08, elevation: 2 },
        loading && styles.gBtnDisabled,
      ]}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Ionicons name="logo-google" size={20} color="#4175DF" style={{ marginRight: 8 }} />
      <Text style={[styles.gBtnText, loading && { color: "#9CA3AF" }]}>Sign in with Google</Text>
    </Pressable>
  );
}

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  // 상단 노치 + 추가 여백으로 전체를 충분히 아래로 내림
  const topPad = (insets.top || 0) + 48;

  const [loading, setLoading] = useState(false);

  // 애니메이션 값: 1) 텍스트 먼저, 2) 뒤 배경 아이콘
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleY = useRef(new Animated.Value(12)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;
  const ringScale = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true,
        }),
        Animated.timing(titleY, {
          toValue: 0, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(ringOpacity, {
          toValue: 1, duration: 650, easing: Easing.out(Easing.cubic), useNativeDriver: true,
        }),
        Animated.spring(ringScale, {
          toValue: 1, friction: 6, tension: 80, useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const onGooglePress = async () => {
    try {
      setLoading(true);
      // TODO: 백엔드 연동
      router.replace("/select");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: topPad, paddingBottom: (insets.bottom || 0) + 28 }]}>
      {/* 상단 초록 가는 선 */}
      <View style={styles.topLine} />

      {/* 중앙 블록: 카피 + 로고영역 (아래로 충분히 내리기 위해 marginTop) */}
      <Animated.Text
        style={[
          styles.subtitle,
          { opacity: titleOpacity, transform: [{ translateY: titleY }], marginTop: 24 },
        ]}
      >
        특별한 사람에게 전하는 당신의 이야기,
      </Animated.Text>

      {/* 로고/아이콘 영역 */}
      <View style={styles.hero}>
        {/* 배경 링 아이콘(뒤, 중앙) */}
        <Animated.Image
          source={require("../assets/images/flower-ring.png")}
          style={[
            styles.ring,
            { opacity: ringOpacity, transform: [{ scale: ringScale }] },
          ]}
          resizeMode="contain"
        />

        {/* 한자 + 한글(세로) : 앞쪽 */}
        <Animated.View
          style={{ opacity: titleOpacity, transform: [{ translateY: titleY }] }}
        >
          {/* 한자 */}
          <Text style={styles.hanja}>開花</Text>

          {/* 한글 세로 표기: 줄바꿈으로 세로 배치 */}
          <Text style={styles.hangulVertical}>{`개\n화`}</Text>
        </Animated.View>
      </View>

      {/* 하단 버튼 (여백 확보 위해 위에 flexSpacer 배치) */}
      <View style={{ flex: 1 }} />
      <GoogleButton onPress={onGooglePress} loading={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: "#fff", alignItems: "center",
    paddingHorizontal: 24,
  },
  topLine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: "#043B0F",
  },
  subtitle: {
    fontFamily: "LGSmartUI-Regular",
    fontSize: 16, lineHeight: 22, color: "#374151",
    textAlign: "center",
  },
  hero: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    height: 300,               // 로고 블록 자체를 키워서 더 아래에 위치
    marginTop: 12,
    marginBottom: 24,
  },
  ring: {
    position: "absolute",
    width: 240,
    height: 240,
    opacity: 0,
  },
  hanja: {
    fontFamily: "LGSmartUI-Bold",
    fontSize: 78,
    lineHeight: 84,
    color: "#0F2A3B",
    textAlign: "center",
  },
  // 한글 세로표기: 한자 오른쪽 아래로 살짝 겹치게 배치하고 줄바꿈으로 세로
  hangulVertical: {
    position: "absolute",
    right: -36,       // 필요시 미세조정 (양수=오른쪽)
    top: 24,          // 필요시 미세조정 (양수=아래)
    fontFamily: "LGSmartUI-Bold",
    fontSize: 28,
    lineHeight: 30,   // 세로 간격
    color: "#0F2A3B",
    textAlign: "center",
  },
  gBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 18, paddingVertical: 10,
    borderRadius: 16, borderWidth: 1, borderColor: "#E5E7EB",
    shadowColor: "#000", shadowOpacity: 0.15, shadowOffset: { width: 2, height: 3 }, shadowRadius: 6,
    elevation: 4, alignSelf: "center", width: 300,
    marginBottom: 8,
  },
  gBtnDisabled: { shadowOpacity: 0.06, elevation: 0, backgroundColor: "#F7F7F7" },
  gBtnText: { fontFamily: "LGSmartUI-Bold", fontSize: 16, color: "#111827" },
});
