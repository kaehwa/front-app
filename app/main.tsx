// app/main.tsx
import React, { useMemo, useRef, useState, useEffect } from "react";
import {
  View, Text, StyleSheet, SafeAreaView, Pressable, Dimensions,
  Image, FlatList, ScrollView, Animated,
} from "react-native";
import { Link, useLocalSearchParams, router } from "expo-router";
import type { Href } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import LowBars from './lowBars'

const { width } = Dimensions.get("window");

// ----- 데모 데이터 -----
const FLORISTS = [
  { id: "f1", name: "로즈가든", tag: "클래식 장미", img: { uri: "https://picsum.photos/seed/fl1/800/1200" } },
  { id: "f2", name: "라넌큘러스", tag: "볼륨감",    img: { uri: "https://picsum.photos/seed/fl2/800/1200" } },
  { id: "f3", name: "튤립살롱", tag: "미니멀",     img: { uri: "https://picsum.photos/seed/fl3/800/1200" } },
  { id: "f4", name: "해바라기숍", tag: "비비드",    img: { uri: "https://picsum.photos/seed/fl4/800/1200" } },
];

const REVIEWS = [
  { id: "r1", title: "후기1", excerpt: "사진 한 장으로 시작된...", thumb: { uri: "https://picsum.photos/seed/rv1/1200/800" } },
  { id: "r2", title: "후기2", excerpt: "맞춤 부케 완성기",         thumb: { uri: "https://picsum.photos/seed/rv2/1200/800" } },
  { id: "r3", title: "후기3", excerpt: "기념일 서프라이즈",         thumb: { uri: "https://picsum.photos/seed/rv3/1200/800" } },
];

// ----- 유틸: D-Day -----
function startOfDay(d: Date) { const x = new Date(d); x.setHours(0,0,0,0); return x; }
function ddayLabel(today: Date, target: Date) {
  const ONE = 24*60*60*1000;
  const diff = Math.floor((startOfDay(target).getTime() - startOfDay(today).getTime()) / ONE);
  return diff >= 0 ? { txt: `D - ${diff}`, past:false } : { txt: `D + ${Math.abs(diff)}`, past:true };
}

// ----- 자동 카루셀 (우하단 하트 제거) -----
const AUTO_SCROLL_MS = 3000;
const CAR_W = Math.min(width * 0.86, 380);
const CAR_H = Math.floor(CAR_W * 1.4); // 세로 길게

function AutoFloristCarousel({ items }: { items: typeof FLORISTS }) {
  const listRef = useRef<FlatList>(null);
  const [idx, setIdx] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const t = setInterval(() => {
      const next = (idx + 1) % items.length;
      setIdx(next);
      listRef.current?.scrollToIndex({ index: next, animated: true });
    }, AUTO_SCROLL_MS);
    return () => clearInterval(t);
  }, [idx, items.length]);

  const renderItem = ({ item, index }: { item: (typeof FLORISTS)[number]; index: number }) => {
    const inputRange = [(index - 1) * CAR_W, index * CAR_W, (index + 1) * CAR_W];
    const scale = scrollX.interpolate({ inputRange, outputRange: [0.94, 1, 0.94], extrapolate: "clamp" });
    const opacity = scrollX.interpolate({ inputRange, outputRange: [0.7, 1, 0.7], extrapolate: "clamp" });

    return (
      <Animated.View style={[styles.carCardWrap, { width: CAR_W, height: CAR_H, transform: [{ scale }], opacity }]}>
        <Pressable
          onPress={() => router.push({ pathname: "/florist/[id]", params: { id: item.id } })}
          style={styles.carCard}
        >
          <Image source={item.img} style={styles.carImg} />
          <View style={styles.carOverlay}>
            <Text style={styles.carName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.carTag} numberOfLines={1}>{item.tag}</Text>
          </View>
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <View style={styles.carWrap}>
      <Animated.FlatList
        ref={listRef}
        data={items}
        keyExtractor={(it) => it.id}
        horizontal
        pagingEnabled
        snapToInterval={CAR_W}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: (width - CAR_W) / 2 }}
        renderItem={renderItem}
        onMomentumScrollEnd={(e) => {
          const newIdx = Math.round(e.nativeEvent.contentOffset.x / CAR_W);
          setIdx(newIdx);
        }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
      />
      <View style={styles.dots}>
        {items.map((_, i) => (
          <View key={i} style={[styles.dot, i === idx && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

export default function Main() {
  const { name, anniv } = useLocalSearchParams<{ name?: string; anniv?: string }>();
  const displayName = name ?? "000";
  const anniversaryDate = useMemo(() => {
    if (anniv) {
      const [y,m,d] = anniv.split("-").map(n=>parseInt(n,10));
      if (!Number.isNaN(y) && !Number.isNaN(m) && !Number.isNaN(d)) return new Date(y, m-1, d);
    }
    const base = new Date(); base.setMonth(base.getMonth()+1); return base;
  }, [anniv]);
  const { txt: dTxt, past } = ddayLabel(new Date(), anniversaryDate);

  // 찜(로컬 임시)
  const [likedFlorists, setLikedFlorists] = useState<Set<string>>(new Set());
  const [likedReviews, setLikedReviews] = useState<Set<string>>(new Set());
  const toggleLikeFlorist = (id: string) =>
    setLikedFlorists(prev => { const nx = new Set(prev); nx.has(id) ? nx.delete(id) : nx.add(id); return nx; });
  const toggleLikeReview  = (id: string) =>
    setLikedReviews(prev => { const nx = new Set(prev); nx.has(id) ? nx.delete(id) : nx.add(id); return nx; });

  // 카드 크기: 플로리스트(세로 긴), 후기(가로 긴)
  const F_W = Math.min(170, Math.floor(width * 0.42));
  const F_H = Math.floor(F_W * 1.7);
  const R_W = Math.min(260, Math.floor(width * 0.7));
  const R_H = Math.floor(R_W * 0.85);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={{ paddingBottom: 84 }} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* 인사말 */}
          <View style={styles.greetBox}>
            <Text style={styles.greetText}><Text style={styles.greetBold}>{displayName}</Text>님, 안녕하세요!</Text>
          </View>

          {/* D-Day (누르면 이동) */}
          <Link
            href={{ pathname: "/anniversary" as const, params: { anniv: anniversaryDate.toISOString().slice(0,10) } }}
            asChild
          >
            <Pressable style={({pressed})=>[styles.ddayBox, pressed && {opacity:0.85}]}>
              <Text style={styles.ddayText}>00 기념일까지 <Text style={styles.ddayStrong}>{dTxt}</Text> {past ? "지났습니다." : "남았습니다."}</Text>
              <Ionicons name="chevron-forward" size={18} />
            </Pressable>
          </Link>

          {/* 자동 슬라이드 카루셀 (광고형식) */}
          <AutoFloristCarousel items={FLORISTS} />

          {/* 섹션 1: 플로리스트 가로 스크롤 */}
          <View style={styles.sectionHeaderWrap}>
            <Text style={styles.sectionTitle}>이런 플로리스트를 찾고 있나요?</Text>
            <Text style={styles.sectionSub}>취향을 닮은 플로리스트를 찾아드려요</Text>
          </View>

          <FlatList
            data={FLORISTS}
            keyExtractor={(it)=>it.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
            ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => router.push({ pathname: "/florist/[id]", params: { id: item.id } })}
                style={[styles.floristCard, { width: F_W, height: F_H }]}
              >
                <Image source={item.img} style={styles.floristImg} />
                <View style={styles.floristInfo}>
                  <Text style={styles.floristName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.floristTag} numberOfLines={1}>{item.tag}</Text>
                </View>
                <Pressable onPress={() => toggleLikeFlorist(item.id)} style={styles.heartBtn} hitSlop={8}>
                  <Ionicons
                    name={likedFlorists.has(item.id) ? "heart" : "heart-outline"}
                    size={20}
                    color={likedFlorists.has(item.id) ? "#FF4D6D" : "#ffffff"}
                  />
                </Pressable>
              </Pressable>
            )}
          />

          {/* 구분선 */}
          <View style={styles.divider} />

          {/* 섹션 2: 후기 가로 스크롤 */}
          <View style={styles.sectionHeaderWrap}>
            <Text style={styles.reviewTitle}>사진 한 장으로 시작된 나만의 꽃다발 이야기</Text>
          </View>

          <FlatList
            data={REVIEWS}
            keyExtractor={(it)=>it.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
            ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => router.push({ pathname: "/review/[id]", params: { id: item.id } })}
                style={[styles.reviewCard, { width: R_W, height: R_H }]}
              >
                <Image source={item.thumb} style={styles.reviewImg} />
                <View style={styles.reviewInfo}>
                  <Text style={styles.reviewName} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.reviewExcerpt} numberOfLines={1}>{item.excerpt}</Text>
                </View>
                <Pressable onPress={() => toggleLikeReview(item.id)} style={styles.heartBtn} hitSlop={8}>
                  <Ionicons
                    name={likedReviews.has(item.id) ? "heart" : "heart-outline"}
                    size={20}
                    color={likedReviews.has(item.id) ? "#FF4D6D" : "#ffffff"}
                  />
                </Pressable>
              </Pressable>
            )}
          />
        </View>
      </ScrollView>

      {/* 하단 메뉴바 */}
      <LowBars></LowBars>
    </SafeAreaView>
  );
}

// ----- 탭 아이템 -----
function TabItem({
  icon, label, href, active=false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  href: Href; // 페이지 파일이 없으면 임시로 Href 캐스팅 사용
  active?: boolean;
}) {
  return (
    <Link href={href} asChild>
      <Pressable style={styles.tabItem}>
        <Ionicons name={icon} size={22} color={active ? "#043B0F" : "#666"} />
        <Text style={[styles.tabLabel, active && { color: "#043B0F", fontWeight: "600" }]}>{label}</Text>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F7F7F7" },
  topBar: { height: 3, backgroundColor: "#043B0F" },
  container: { paddingTop: 10 },

  // 인사말 & D-day
  greetBox: { backgroundColor: "#fff", marginHorizontal: 16, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 16, elevation: 2 },
  greetText: { fontSize: 18, color: "#222" },
  greetBold: { fontWeight: "700" },
  ddayBox: {
    marginTop: 12, marginHorizontal: 16, backgroundColor: "#fff", borderRadius: 14,
    paddingVertical: 14, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between", elevation: 2,
  },
  ddayText: { fontSize: 16, color: "#333" },
  ddayStrong: { fontWeight: "700" },

  // --- Auto carousel ---
  carWrap: { marginTop: 14, alignItems: "center" },
  carCardWrap: { alignItems: "center", justifyContent: "center" },
  carCard: {
    width: "100%", height: "100%", backgroundColor: "#fff",
    borderRadius: 24, overflow: "hidden",
    shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 3,
  },
  carImg: { width: "100%", height: "100%" },
  carOverlay: {
    position: "absolute", left: 12, right: 12, bottom: 12,
    backgroundColor: "rgba(0,0,0,0.35)", borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12,
  },
  carName: { color: "#fff", fontSize: 18, fontWeight: "700" },
  carTag:  { color: "#fff", fontSize: 13, marginTop: 2 },
  dots: { flexDirection: "row", gap: 6, marginTop: 10 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#D1D5DB" },
  dotActive: { backgroundColor: "#374151", width: 14, borderRadius: 7 },

  // 섹션 타이틀
  sectionHeaderWrap: { paddingHorizontal: 16, paddingVertical: 14 },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: "#111" },
  sectionSub: { marginTop: 4, fontSize: 13, color: "#6B7280" },
  reviewTitle: {
    fontSize: 13, fontWeight: "700", color: "#374151",
    backgroundColor: "#fff", alignSelf: "center",
    paddingVertical: 6, paddingHorizontal: 10,
    borderRadius: 10, borderWidth: 1, borderColor: "#E5E7EB",
  },

  // 플로리스트 카드(세로 긴)
  floristCard: {
    backgroundColor: "#fff", borderRadius: 20, overflow: "hidden",
    shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 3,
  },
  floristImg: { width: "100%", height: "82%" }, // 이미지 영역 확대
  floristInfo: { flex: 1, paddingHorizontal: 10, paddingTop: 8 },
  floristName: { fontSize: 15, fontWeight: "700", color: "#111" },
  floristTag: { fontSize: 12, color: "#6B7280", marginTop: 2 },

  divider: { height: 2, marginVertical: 18, marginHorizontal: 16 },

  // 후기 카드(가로 긴)
  reviewCard: {
    backgroundColor: "#fff", borderRadius: 18, overflow: "hidden",
    shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 3,
  },
  reviewImg: { width: "100%", height: "78%" },
  reviewInfo: { flex: 1, paddingHorizontal: 12, paddingTop: 8 },
  reviewName: { fontSize: 15, fontWeight: "700", color: "#111" },
  reviewExcerpt: { fontSize: 12, color: "#6B7280", marginTop: 2 },

  // 공통: 하트 버튼
  heartBtn: {
    position: "absolute", right: 8, bottom: 8, width: 28, height: 28, borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.35)", alignItems: "center", justifyContent: "center",
  },

  // 탭바
  tabBarShadow: { backgroundColor: "transparent", shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: -2 }, elevation: 8 },
  tabBar: { height: 66, backgroundColor: "#fff", borderTopLeftRadius: 18, borderTopRightRadius: 18, flexDirection: "row", justifyContent: "space-around", alignItems: "center", paddingBottom: 6 },
  tabItem: { alignItems: "center", justifyContent: "center", gap: 2 },
  tabLabel: { fontSize: 11, color: "#666" },
});


