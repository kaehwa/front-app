import React, { useEffect, useRef, useState } from "react";
import {
  View, Text, Pressable, Image, Animated, Easing, StyleSheet,
  ActivityIndicator, Alert, Dimensions, Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

// ⬇ Google OAuth
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { makeRedirectUri } from "expo-auth-session";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";
// ⬆

/** ====== 환경값 ====== */
const BACKEND_URL = "http://172.31.239.54:8080";

const IOS_CLIENT_ID =
  "2775008760-83po6j3tmnjor9ttbnc8meg0me21haik.apps.googleusercontent.com";
const WEB_CLIENT_ID =
  "2775008760-cu5dcieaua1pcl96ilfcg7p8egn4kqsg.apps.googleusercontent.com";
const ANDROID_CLIENT_ID =
  "2775008760-dj5uto76ve22ja4v68lvslrk3vkl3dbl.apps.googleusercontent.com";

const isExpoGo = Constants.appOwnership === "expo";
const redirectUri = isExpoGo
  ? "https://auth.expo.io/@passionseona/gaehwa"
  : makeRedirectUri({ scheme: "gaehwa" });

WebBrowser.maybeCompleteAuthSession();

/* ---------------- Google 버튼 ---------------- */
function GoogleButton({
  onPress, loading, disabled,
}: { onPress: () => void; loading?: boolean; disabled?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={loading || disabled}
      style={({ pressed }) => [
        styles.gBtn,
        pressed && { transform: [{ scale: 0.98 }], shadowOpacity: 0.08, elevation: 2 },
        (loading || disabled) && styles.gBtnDisabled,
      ]}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      {loading ? (
        <ActivityIndicator color="#4175DF" />
      ) : (
        <>
          <Ionicons name="logo-google" size={20} color="#4175DF" style={{ marginRight: 8 }} />
          <Text style={[styles.gBtnText, (loading || disabled) && { color: "#9CA3AF" }]}>
            Sign in with Google
          </Text>
        </>
      )}
    </Pressable>
  );
}

/* ---------------- 로그인 화면 ---------------- */
export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { width, height } = Dimensions.get("window");

  // 화면에 비례한 위치/크기 계산 (웹·모바일 동일한 레이아웃 유지)
  const topGap = Math.round(height * 0.08); // 상단 여백(화면 높이의 8%)
  const paddingTop = (insets.top || 0) + topGap;

  const ringSize   = clamp(Math.round(Math.min(width, height) * 0.42), 180, 260);
  const heroHeight = clamp(Math.round(height * 0.32), 260, 360);

  const hanjaSize   = Math.round(ringSize * 0.33);
  const hangulSize  = Math.round(ringSize * 0.12);
  const hangulRight = Math.round(ringSize * 0.16);
  const hangulTop   = Math.round(ringSize * 0.10);

  const [loading, setLoading] = useState(false);

  // 애니메이션
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleY = useRef(new Animated.Value(12)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;
  const ringScale = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(titleOpacity, { toValue: 1, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(titleY, { toValue: 0, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(ringOpacity, { toValue: 1, duration: 650, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.spring(ringScale, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  /** ====== Google Auth 요청 ====== */
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: WEB_CLIENT_ID,
    iosClientId: IOS_CLIENT_ID,
    androidClientId: ANDROID_CLIENT_ID || undefined,
    redirectUri,
    scopes: ["openid","profile","email"],
    responseType: "id_token",
  });

  /** ====== Auth 결과 핸들링 ====== */
  useEffect(() => {
    (async () => {
      if (response?.type !== "success") return;

      const idToken = response.authentication?.idToken;
      if (!idToken) {
        Alert.alert("로그인 실패", "id_token을 받지 못했습니다.");
        return;
      }

      try {
        setLoading(true);
        const res = await fetch(`${BACKEND_URL}/auth/google`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id_token: idToken }),
        });

        if (!res.ok) {
          const msg = await res.text();
          throw new Error(msg || "서버 응답 오류");
        }

        const { accessToken, refreshToken, user } = await res.json();
        if (accessToken)  await SecureStore.setItemAsync("accessToken", accessToken);
        if (refreshToken) await SecureStore.setItemAsync("refreshToken", refreshToken);
        await SecureStore.setItemAsync("userName", user?.name ?? "000");

        router.replace("/select");
      } catch (e: any) {
        Alert.alert("로그인 실패", e?.message ?? "알 수 없는 오류");
      } finally {
        setLoading(false);
      }
    })();
  }, [response]);

  const onGooglePress = () => {
    if (!request) return;
    promptAsync();
  };

  return (
    <View style={[styles.container, { paddingTop, paddingBottom: (insets.bottom || 0) + 28 }]}>
      {/* 상단 초록 선(항상 최상단에 보이도록) */}
      <View style={styles.topLine} />

      {/* 카피 */}
      <Animated.Text
        style={[
          styles.subtitle,
          { opacity: titleOpacity, transform: [{ translateY: titleY }], marginTop: 16 },
        ]}
      >
        특별한 사람에게 전하는 당신의 이야기,
      </Animated.Text>

      {/* 로고/아이콘 영역 */}
      <View style={[styles.hero, { height: heroHeight }]}>
        {/* 배경 링(뒤) */}
        <Animated.Image
          source={require("../assets/images/flower-ring.png")}
          style={[
            styles.ring,
            { width: ringSize, height: ringSize, opacity: ringOpacity, transform: [{ scale: ringScale }] },
          ]}
          resizeMode="contain"
        />
        {/* 앞쪽 텍스트(한자 + ‘개\n화’ 세로) */}
        <Animated.View style={{ opacity: titleOpacity, transform: [{ translateY: titleY }] }}>
          <Text
            style={{
              ...styles.hanja,
              fontSize: hanjaSize,
              lineHeight: hanjaSize + 6,
              // @ts-ignore - Android baseline 보정
              includeFontPadding: Platform.OS === "android" ? false : undefined,
            }}
          >
            開花
          </Text>
          <Text
            style={{
              ...styles.hangulVertical,
              fontSize: hangulSize,
              lineHeight: hangulSize + 2,
              right: -hangulRight,
              top: hangulTop,
              // @ts-ignore
              includeFontPadding: Platform.OS === "android" ? false : undefined,
            }}
          >{`개\n화`}</Text>
        </Animated.View>
      </View>

      <View style={{ flex: 1 }} />
      <GoogleButton onPress={onGooglePress} loading={loading} disabled={!request} />
    </View>
  );
}

/* ---------------- 스타일 ---------------- */
const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: "#fff", alignItems: "center",
    paddingHorizontal: 24,
  },
  topLine: {
    position: "absolute",
    top: 0, left: 0, right: 0,
    height: 3, backgroundColor: "#043B0F", zIndex: 10,
  },
  subtitle: {
    fontFamily: "LGSmartUI-Regular",
    fontSize: 16, lineHeight: 22, color: "#374151",
    textAlign: "center",
  },
  hero: {
    width: "100%", alignItems: "center", justifyContent: "center",
    marginTop: 8, marginBottom: 24,
  },
  ring: { position: "absolute" },

  // ▼ HY견명조 사용(없으면 LGSmartUI로 fallback)
  hanja: {
    fontFamily: "HYMyeongJo-Bold", // ← _layout에서 로드되어 있어야 함
    color: "#0F2A3B",
    textAlign: "center",
  },
  hangulVertical: {
    position: "absolute",
    fontFamily: "HYMyeongJo-Bold",
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

/* util */
function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}
