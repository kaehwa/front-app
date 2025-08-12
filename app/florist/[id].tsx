// app/florist/[id].tsx
import React, { useRef } from "react";
import {
  View,
  Text,
  Image,
  ImageBackground,
  Pressable,
  FlatList,
  ScrollView,
  StyleSheet,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, router, useLocalSearchParams } from "expo-router";

const HERO = {
  uri: "https://images.unsplash.com/photo-1496065187959-7f07b8353b6e?q=80&w=1600",
};

const BOUQUETS = [
  { id: "b1", uri: "https://images.unsplash.com/photo-1546734008-c92f84f3bd09?q=80&w=800" },
  { id: "b2", uri: "https://images.unsplash.com/photo-1529676468690-ae6f0c0b2c58?q=80&w=800" },
  { id: "b3", uri: "https://images.unsplash.com/photo-1491002052546-bf38f186af56?q=80&w=800" },
  { id: "b4", uri: "https://images.unsplash.com/photo-1486299267070-83823f5448dd?q=80&w=800" },
  { id: "b5", uri: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?q=80&w=800" },
];

const REVIEWS = [
  { id: "r1", user: "민서", rating: 5, text: "사진보다 실물이 더 풍성했어요!" },
  { id: "r2", user: "다온", rating: 4, text: "상담 친절 + 색감 조합 최고 🙌" },
  { id: "r3", user: "유진", rating: 5, text: "기념일에 딱. 배송도 정확했습니다." },
];

function StarRating({ value }: { value: number }) {
  return (
    <Text style={{ fontWeight: "600" }}>
      <Text style={{ color: "#F59E0B" }}>{"★".repeat(value)}</Text>
      <Text style={{ color: "#D1D5DB" }}>{"☆".repeat(5 - value)}</Text>
    </Text>
  );
}

export default function FloristDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  // 약한 패럴랙스 효과
  const scrollY = useRef(new Animated.Value(0)).current;
  const heroTranslateY = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0, -30],
    extrapolate: "clamp",
  });
  const heroScale = scrollY.interpolate({
    inputRange: [-100, 0],
    outputRange: [1.08, 1],
    extrapolateRight: "clamp",
  });
  const titleOpacity = scrollY.interpolate({
    inputRange: [0, 140],
    outputRange: [1, 0.4],
    extrapolate: "clamp",
  });

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <Stack.Screen options={{ title: "플로리스트" }} />

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        contentContainerStyle={{ paddingBottom: 28 }}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
      >
        {/* HERO */}
        <Animated.View
          style={{
            transform: [{ translateY: heroTranslateY }, { scale: heroScale }],
          }}
        >
          <ImageBackground
            source={HERO}
            resizeMode="cover"
            style={{ width: "100%", aspectRatio: 16 / 9, justifyContent: "flex-end" }}
          >
            {/* 좌→우 그라데이션 (터치 방해 X) */}
            <LinearGradient
              pointerEvents="none"
              colors={["rgba(0,0,0,0.75)", "rgba(0,0,0,0.35)", "transparent"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />

            {/* 글래스 카드 */}
            <Animated.View
              style={{
                margin: 16,
                padding: 16,
                borderRadius: 16,
                backgroundColor: "rgba(255,255,255,0.12)",
                backdropFilter: "blur(8px)" as any, // iOS에서만; 안드로이드는 반투명으로만 동작
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.25)",
                gap: 10,
                opacity: titleOpacity,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Image
                  source={{ uri: "https://picsum.photos/seed/shop/200/200" }}
                  style={{ width: 44, height: 44, borderRadius: 10 }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: "white", fontSize: 24, fontWeight: "800" }}>한나 플로리스트</Text>
                  <Text style={{ color: "#E5E7EB" }} numberOfLines={1}>
                    색감 좋은 유럽풍 부케 전문
                  </Text>
                </View>
                {/* 영업 뱃지 */}
                <View
                  style={{
                    backgroundColor: "rgba(16,185,129,0.85)",
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 999,
                  }}
                >
                  <Text style={{ color: "white", fontWeight: "700", fontSize: 12 }}>영업중</Text>
                </View>
              </View>

              {/* 메타 정보 */}
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <StarRating value={5} />
                <Text style={{ color: "#E5E7EB" }}>·</Text>
                <Text style={{ color: "#E5E7EB" }}>서울 성동구 성수동</Text>
                <Text style={{ color: "#E5E7EB" }}>·</Text>
                <Text style={{ color: "#E5E7EB" }}>10:00–20:00</Text>
              </View>

              {/* 태그 */}
              <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
                {["유럽풍", "파스텔", "감성", "기념일"].map((t) => (
                  <View
                    key={t}
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      borderRadius: 999,
                      backgroundColor: "rgba(255,255,255,0.18)",
                      borderWidth: 1,
                      borderColor: "rgba(255,255,255,0.25)",
                    }}
                  >
                    <Text style={{ color: "white", fontSize: 12 }}>{t}</Text>
                  </View>
                ))}
              </View>

              {/* 액션 버튼 */}
              <View style={{ flexDirection: "row", gap: 12, marginTop: 2 }}>
                <Pressable
                  onPress={() => router.push({ pathname: "/chat", params: { id: String(id ?? "f1") } })}
                  style={({ pressed }) => [
                    styles.btnLight,
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  <Text style={{ color: "black", fontWeight: "700" }}>Contact</Text>
                </Pressable>
              </View>
            </Animated.View>
          </ImageBackground>
        </Animated.View>

        {/* 플로리스트 소개 */}
        <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
          <Text style={[styles.sectionTitle, { paddingHorizontal: 5 }]}>소개글</Text>
          <Text style={{ color: "#374151", lineHeight: 20 }}>
            " 저희는 유럽풍 꽃다발을 전문으로 하는 플로리스트입니다. 파스텔 톤의 감성적인 꽃다발을
            제작하며, 기념일에 딱 맞는 특별한 부케를 제공합니다. 고객의 취향에 맞춘 맞춤형 꽃다발도
            제작하니 언제든지 문의해주세요!"
          </Text>
        </View>

        {/* 등록한 꽃다발 */}
        <View style={{ marginTop: 30 }}>
          <Text style={styles.sectionTitle}>등록한 꽃다발</Text>
          <FlatList
            data={BOUQUETS}
            keyExtractor={(it) => it.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            nestedScrollEnabled
            contentContainerStyle={{ paddingHorizontal: 20 }}
            ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
            renderItem={({ item }) => (
              <Image
                source={{ uri: item.uri }}
                style={{ width: 160, height: 110, borderRadius: 12 }}
                resizeMode="cover"
              />
            )}
          />
        </View>

        {/* 후기 */}
        <View style={{ paddingHorizontal: 5, marginTop: 30 }}>
          <Text style={styles.sectionTitle}>후기</Text>
          {REVIEWS.map((rv) => (
            <View key={rv.id} style={styles.reviewCard}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                <Text style={{ fontWeight: "600" }}>{rv.user}</Text>
                <StarRating value={rv.rating} />
              </View>
              <Text style={{ color: "#374151" }}>{rv.text}</Text>
            </View>
          ))}
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    paddingHorizontal: 20,
    marginBottom: 8,
    fontSize: 16,
    fontWeight: "700",
  },
  btnLight: {
    backgroundColor: "white",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 3,
  },
  btnDark: {
    backgroundColor: "rgba(55,65,81,0.8)",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  reviewCard: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    backgroundColor: "white",
  },
});
