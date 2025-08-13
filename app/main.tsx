// app/main.tsx
import React, { useMemo, useRef, useState, useEffect } from "react";
import {
  View, Text, StyleSheet, SafeAreaView, Pressable, Dimensions,
  Image, FlatList, ScrollView, Animated, Easing, ImageSourcePropType,
} from "react-native";
import type { Href } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Link, useLocalSearchParams, router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import LowBars from './lowBars'

const { width } = Dimensions.get("window");

// ----- 데모 데이터 (다른 섹션에서 사용) -----
const FLORISTS = [
  { id: "f1", name: "로즈가든",   tag: "클래식 장미", img: { uri: "https://picsum.photos/seed/fl1/800/1200" } },
  { id: "f2", name: "라넌큘러스", tag: "볼륨감",      img: { uri: "https://picsum.photos/seed/fl2/800/1200" } },
  { id: "f3", name: "튤립살롱",   tag: "미니멀",      img: { uri: "https://picsum.photos/seed/fl3/800/1200" } },
  { id: "f4", name: "해바라기숍", tag: "비비드",      img: { uri: "https://picsum.photos/seed/fl4/800/1200" } },
];

const REVIEWS = [
  { id: "r1", title: "후기1", excerpt: "사진 한 장으로 시작된...", thumb: { uri: "https://picsum.photos/seed/rv1/1200/800" } },
  { id: "r2", title: "후기2", excerpt: "맞춤 부케 완성기",         thumb: { uri: "https://picsum.photos/seed/rv2/1200/800" } },
  { id: "r3", title: "후기3", excerpt: "기념일 서프라이즈",         thumb: { uri: "https://picsum.photos/seed/rv3/1200/800" } },
];

// ----- 공통 유틸 -----
const ONE = 24 * 60 * 60 * 1000;
function startOfDay(d: Date) { const x = new Date(d); x.setHours(0,0,0,0); return x; }

// 성(姓) 제거해서 이름만 반환
function givenNameFrom(fullName?: string) {
  if (!fullName) return "000";
  const s = fullName.trim();
  if (!s) return "000";
  const hasHangul = /[가-힣]/.test(s);

  if (hasHangul) {
    // 공백 없음: "홍길동" → "길동"
    if (!/\s/.test(s)) return s.length >= 2 ? s.slice(1) : s;
    // 공백 있음: "장 선아" / "최 민 서" → 앞 1~2글자 성 제거
    const rest = s.replace(/^\s*[가-힣]{1,2}\s*/, "");
    return rest || s;
  }
  // 로마자: "Minseo Jang" → "Minseo"
  return s.split(/\s+/)[0] || s;
}

// ===== D-day 이벤트 타입 & 로더 (DB 연동 지점) =====
type EventItem = {
  id: string;
  name: string;   // 기념일 이름 (DB)
  date: string;   // "YYYY-MM-DD"
};

async function fetchEventsWithin7Days(): Promise<EventItem[]> {
  // TODO: 실제 API로 교체
  // const res = await fetch(`${BACKEND_URL}/events?within=7d`, { headers: { Authorization: `Bearer ${token}` } });
  // const json = await res.json();
  // return json.events as EventItem[];

  // 임시 목업
  const today = new Date();
  const mk = (offset: number, name: string, id: string): EventItem => {
    const d = new Date(today); d.setDate(d.getDate() + offset);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return { id, name, date: `${yyyy}-${mm}-${dd}` };
  };
  return [mk(1, "결혼 기념일", "e1"), mk(3, "100일 기념", "e2"), mk(6, "생일", "e3")];
}

// ----- 자동 카루셀 (이제 D-day 전용) -----
const AUTO_SCROLL_MS = 3000;
const CAR_W = Math.min(width * 0.86, 380);
const CAR_H = Math.floor(CAR_W * 1.4); // 세로 길게

type DDayInfo = {
  title: string;            // “ 결혼 기념일 ” 까지
  dText: string;            // D-00 / D+00
  subtitle: string;         // 하단 문구
  iconSource: ImageSourcePropType;
  color: "pink" | "green";  // 배경색
  onPress?: () => void;
};

function DDaySlide({ info, boxSize }: { info: DDayInfo; boxSize: { w:number; h:number } }) {
  const pulse = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.08, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1.0, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [pulse]);

  const bg = info.color === "pink" ? "#FFF5F6" : "#F1FAF3";

  return (
    <Pressable onPress={info.onPress} style={[styles.ddSlide, { width: boxSize.w, height: boxSize.h, backgroundColor: bg }]}>
      <Text style={styles.ddTop}>
        {info.title} <Text style={styles.ddStrong}>{info.dText}</Text>일 남았어요 !
      </Text>

      <Animated.Image
        source={info.iconSource}
        resizeMode="contain"
        style={[styles.ddIcon, { width: boxSize.w * 1.2, height: boxSize.w * 1.2, transform: [{ scale: pulse }] }]}
      />

      <Text style={styles.ddBottom}>{info.subtitle}</Text>
    </Pressable>
  );
}

function AutoFloristCarousel({
  events,
  iconSource,
}: {
  events: EventItem[];
  iconSource: ImageSourcePropType;
}) {
  if (!events || events.length === 0) return null;

  const listRef = useRef<FlatList>(null);
  const [idx, setIdx] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const t = setInterval(() => {
      const next = (idx + 1) % events.length;
      setIdx(next);
      listRef.current?.scrollToIndex({ index: next, animated: true });
    }, AUTO_SCROLL_MS);
    return () => clearInterval(t);
  }, [idx, events.length]);

  const renderItem = ({ item, index }: { item: EventItem; index: number }) => {
    // D-라벨 계산
    const today0 = startOfDay(new Date()).getTime();
    const event0 = startOfDay(new Date(item.date)).getTime();
    const diff = Math.floor((event0 - today0) / ONE);
    const dText = diff >= 0 ? `D-${diff}` : `D+${Math.abs(diff)}`;

    // 애니메이션 보간 (부드러운 스케일/투명도)
    const inputRange = [(index - 1) * CAR_W, index * CAR_W, (index + 1) * CAR_W];
    const scale = scrollX.interpolate({ inputRange, outputRange: [0.94, 1, 0.94], extrapolate: "clamp" });
    const opacity = scrollX.interpolate({ inputRange, outputRange: [0.7, 1, 0.7], extrapolate: "clamp" });

    return (
      <Animated.View style={[styles.carCardWrap, { width: CAR_W, height: CAR_H, transform: [{ scale }], opacity }]}>
        <DDaySlide
          info={{
            title: `“ ${item.name} ” 까지`,
            dText,
            subtitle: "꽃다발을 통해 따뜻한 마음을 전해보는 건 어떨까요 ?",
            iconSource,
            color: index % 2 === 0 ? "pink" : "green",
            onPress: () => router.push("/anniversary_intro"),
          }}
          boxSize={{ w: CAR_W, h: CAR_H }}
        />
      </Animated.View>
    );
  };

  return (
    <View style={styles.carWrap}>
      <Animated.FlatList
        ref={listRef}
        data={events}
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
        {events.map((_, i) => (
          <View key={i} style={[styles.dot, i === idx && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

// ----- 메인 -----
export default function Main() {
  const { name } = useLocalSearchParams<{ name?: string }>();
  const [greetName, setGreetName] = useState("000"); 
  const [avatarSrc, setAvatarSrc] = useState<ImageSourcePropType>({
    uri: "https://i.pravatar.cc/120?img=15", // 기본값(임시)
  });

  useEffect(() => {
  let mounted = true;

  (async () => {
    // name은 string | string[] | undefined 일 수 있음
    let src: string | undefined =
      typeof name === "string" ? name : Array.isArray(name) ? name[0] : undefined;

    if (!src) {
      try {
        const saved = await SecureStore.getItemAsync("user_full_name"); // string | null
        if (saved) src = saved; // null일 땐 무시
      } catch {}
    }

    if (mounted) setGreetName(givenNameFrom(src)); // givenNameFrom은 undefined 허용

    try {
      const savedAvatar = await SecureStore.getItemAsync("user_avatar"); // string | null
      if (mounted && savedAvatar) setAvatarSrc({ uri: savedAvatar });
    } catch {}
  })();

  return () => {
    mounted = false;
  };
}, [name]);

  // DB에서 이벤트 로드
  const [events, setEvents] = useState<EventItem[]>([]);
  useEffect(() => {
    (async () => {
      const all = await fetchEventsWithin7Days();
      const today0 = startOfDay(new Date()).getTime();
      const filtered = all.filter(ev => {
        const ev0 = startOfDay(new Date(ev.date)).getTime();
        const diff = Math.floor((ev0 - today0) / ONE);
        return diff >= 0 && diff <= 7;
      });
      setEvents(filtered);
    })();
  }, []);

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

  // 아이콘 소스 (※ 로컬 파일 쓰려면 require 경로만 바꾸면 됨)
  const ICON_SRC = require("../assets/images/bouquet.png") as ImageSourcePropType;
   
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={{ paddingBottom: 84 }} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* 인사말 */}
          <View style={styles.greetBox}>
            <Text style={styles.greetText}>
              <Text style={styles.greetBold}>{greetName}</Text>님, 안녕하세요!
            </Text>
            <Pressable onPress={() => router.push("/me")} hitSlop={8}>
              <Image source={avatarSrc} style={styles.avatarSquare} />
            </Pressable>
          </View>

          {/* 자동 슬라이드 카루셀 (이벤트 D-day 전용) */}
          <AutoFloristCarousel events={events} iconSource={ICON_SRC} />

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
            <Text style={styles.sectionTitle}>사진 한 장으로 시작된 나만의 꽃다발 이야기</Text>
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
  href: Href;
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
  container: { paddingTop: 10 },

  // 인사말
  greetBox: {
  marginHorizontal: 16,
  paddingVertical: 8,
  paddingHorizontal: 4,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
},
  greetText: { fontSize: 18, color: "#222" },
  greetBold: { fontWeight: "700" },

  avatarSquare: {
  width: 44,
  height: 44,
  borderRadius: 8,
  backgroundColor: "#EEE",
  borderWidth: 1,
  borderColor: "#E5E7EB",
},

  // --- Auto carousel ---
  carWrap: { marginTop: 14, alignItems: "center" },
  carCardWrap: { alignItems: "center", justifyContent: "center" },
  dots: { flexDirection: "row", gap: 6, marginTop: 10 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#D1D5DB" },
  dotActive: { backgroundColor: "#374151", width: 14, borderRadius: 7 },

  // --- D-day slide ---
  ddSlide: {
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 18,
    paddingHorizontal: 16,
  },
  ddTop: { fontSize: 18, fontWeight: "800", color: "#111", textAlign: "center" },
  ddStrong: { fontWeight: "900" },
  ddIcon: { marginVertical: 8 },
  ddBottom: { fontSize: 13, color: "#374151", textAlign: "center", marginBottom: 4 },

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
  floristImg: { width: "100%", height: "82%" },
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


