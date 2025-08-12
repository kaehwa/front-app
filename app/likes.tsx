import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, FlatList, Image, ActivityIndicator, RefreshControl, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
 
/**
 * Likes (/likes)
 * - 레퍼런스(두번째 스샷)처럼 Dark Header + 3열 썸네일 그리드
 * - 상단 세그먼트: 플로리스트 / 리뷰
 * - 편집(선택/해제) 모드 토글 가능 (길게 누르거나 우측 상단 "편집")
 * - 데이터 저장: AsyncStorage (likes:florists / likes:reviews)
 *
 * ✅ NativeWind(className) + StyleSheet 이중 적용 (웹에서도 최소 레이아웃 유지)
 */

type Florist = {
  id: string;
  name: string;
  avatar: string; // 이미지 URL 또는 require 리소스 경로 문자열
  tags?: string[];
  distanceKm?: number;
};

type Review = {
  id: string;
  title: string;
  snippet?: string;
  thumbnail: string; // 이미지 URL
};

const KEY_FLORISTS = "likes:florists";
const KEY_REVIEWS = "likes:reviews";

type TabKey = "florists" | "reviews";

// --- Storage helpers -------------------------------------------------------
async function getJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch (e) {
    return fallback;
  }
}

async function setJson<T>(key: string, data: T) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch {}
}

const img = (uri: string) => ({ uri });
const EMPTY_ILLUST =
  "https://raw.githubusercontent.com/rohitguptab/empty-state-illustrations/main/line/line-16.png";

export default function LikesScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>("florists");
  const [florists, setFlorists] = useState<Florist[] | null>(null);
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});

  // 초기 로드 + 포커스 복귀 시 동기화
  const load = useCallback(async () => {
    const [f, r] = await Promise.all([
      getJson<Florist[]>(KEY_FLORISTS, []),
      getJson<Review[]>(KEY_REVIEWS, []),
    ]);
    setFlorists(f);
    setReviews(r);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const toggleFlorist = useCallback(
    async (item: Florist) => {
      const next = [...(florists ?? [])];
      const idx = next.findIndex((x) => x.id === item.id);
      if (idx >= 0) next.splice(idx, 1);
      else next.unshift(item);
      setFlorists(next);
      await setJson(KEY_FLORISTS, next);
    },
    [florists]
  );

  const toggleReview = useCallback(
    async (item: Review) => {
      const next = [...(reviews ?? [])];
      const idx = next.findIndex((x) => x.id === item.id);
      if (idx >= 0) next.splice(idx, 1);
      else next.unshift(item);
      setReviews(next);
      await setJson(KEY_REVIEWS, next);
    },
    [reviews]
  );

  // 편집 모드 선택 토글
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const clearSelected = () => setSelectedIds({});

  const removeSelected = async () => {
    if (tab === "florists") {
      const remain = (florists ?? []).filter((f) => !selectedIds[f.id]);
      setFlorists(remain);
      await setJson(KEY_FLORISTS, remain);
    } else {
      const remain = (reviews ?? []).filter((r) => !selectedIds[r.id]);
      setReviews(remain);
      await setJson(KEY_REVIEWS, remain);
    }
    clearSelected();
    setEditing(false);
  };

  // 비어있을 때
  const EmptyState = useMemo(
    () => (
      <View className="flex-1 items-center justify-center p-6 gap-4" style={S.emptyWrap}>
        <Image source={img(EMPTY_ILLUST)} className="w-56 h-56 opacity-80" style={{ width: 224, height: 224, opacity: 0.8 }} />
        <Text className="text-lg font-semibold text-neutral-100" style={S.emptyTitle}>아직 찜한 항목이 없어요</Text>
        <Text className="text-center text-neutral-400" style={S.emptyDesc}>플로리스트 카드나 리뷰 카드에서 하트(♡)를 눌러 보관해보세요.</Text>
        <Pressable onPress={() => router.replace("/main")} className="mt-2 px-4 py-2 bg-white rounded-2xl" style={S.ctaBtn}>
          <Text className="text-black font-semibold">둘러보러 가기</Text>
        </Pressable>
      </View>
    ),
    [router]
  );

  // --- 헤더 (Dark) ---------------------------------------------------------
  const count = (tab === "florists" ? florists?.length : reviews?.length) ?? 0;
  const Header = (
    <View className="bg-black" style={S.headerWrap}>
      <SafeAreaView>
        <View className="flex-row items-center justify-between px-4 py-3" style={S.headerRow}>
          <Pressable onPress={() => router.back()} className="p-2 -ml-2">
            <Ionicons name="chevron-back" size={22} color="#b43131ff" />
          </Pressable>
          <View className="flex-row items-center gap-2" style={S.titleRow}>
            <Text className="text-white text-xl font-bold" style={S.title}>찜 리스트</Text>
            <View className="px-2 py-0.5 bg-white/20 rounded-full" style={S.badge}>
              <Text className="text-white text-xs font-semibold">{count}</Text>
            </View>
          </View>
          <Pressable onPress={() => { setEditing((e) => !e); clearSelected(); }} className="px-2 py-1">
            <Text className="text-white font-semibold">{editing ? "완료" : "편집"}</Text>
          </Pressable>
        </View>
        {/* Segmented */}
        <View className="px-4 pb-3">
          <View className="flex-row bg-white/10 rounded-2xl p-1" style={S.segmentWrap}>
            {([
              { key: "florists", label: "플로리스트" },
              { key: "reviews", label: "리뷰" },
            ] as { key: TabKey; label: string }[]).map((t) => {
              const isActive = tab === t.key;
              return (
                <Pressable
                  key={t.key}
                  onPress={() => setTab(t.key)}
                  className="flex-1 items-center py-2 rounded-2xl"
                  style={[S.segment, isActive && S.segmentActive]}
                >
                  <Text style={[S.segmentLabel, isActive && S.segmentLabelActive]}>
                    {t.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );

  // --- 썸네일 그리드 (3열, 인스타 느낌) ------------------------------------
  type ThumbItem = { id: string; uri: string; kind: TabKey };
  const thumbs: ThumbItem[] = (tab === "florists" ? (florists ?? []).map((f) => ({ id: f.id, uri: f.avatar, kind: "florists" as const })) : (reviews ?? []).map((r) => ({ id: r.id, uri: r.thumbnail, kind: "reviews" as const })));

  const onPressThumb = (item: ThumbItem) => {
    if (editing) return toggleSelect(item.id);
    if (item.kind === "florists") router.push(`/florist/${item.id}`);
    else router.push({ pathname: "/florist/[id]", params: { id: "f1" } });
  };

  const onLongPressThumb = (item: ThumbItem) => {
    if (!editing) setEditing(true);
    toggleSelect(item.id);
  };

  const renderThumb = ({ item, index }: { item: ThumbItem; index: number }) => {
    const m = 1.5; // 간격
    const sizeStyle = { width: `33.333%`, padding: m } as any;
    const isSel = !!selectedIds[item.id];
    return (
      <View style={sizeStyle}>
        <Pressable
          onPress={() => onPressThumb(item)}
          onLongPress={() => onLongPressThumb(item)}
          className="rounded-xl overflow-hidden"
          style={S.thumbBox}
        >
          <Image source={img(item.uri)} style={S.thumbImg} />
          {editing && (
            <View style={S.checkOverlay}>
              <View style={[S.checkbox, isSel && S.checkboxOn]} />
            </View>
          )}
        </Pressable>
      </View>
    );
  };

  const Grid = (
    <FlatList
      key={"grid3"}
      data={thumbs}
      numColumns={3}
      keyExtractor={(it) => it.id}
      ListEmptyComponent={EmptyState}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      renderItem={renderThumb}
      style={{ backgroundColor: "#000" }}
      contentContainerStyle={{ paddingBottom: 40 }}
    />
  );
  
  // 편집 모드 하단 바
  const BottomBar = editing ? (
    <SafeAreaView style={S.bottomBarWrap}>
      <View style={S.bottomBarRow}>
        <Pressable onPress={clearSelected} style={S.bottomBtn}>
          <Text style={S.bottomBtnText}>선택 해제</Text>
        </Pressable>
        <Pressable onPress={removeSelected} style={[S.bottomBtn, S.bottomBtnDanger]}>
          <Text style={[S.bottomBtnText, { color: "#fff" }]}>삭제</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  ) : null;

  if (!florists || !reviews) {
    return (
      <View style={{ flex: 1, backgroundColor: "#000" }}>
        {Header}
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color="#fff" />
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      {Header}
      {Grid}
      {BottomBar}
    </View>
  );
}

export async function upsertLikedFlorist(item: Florist) {
  const list = await getJson<Florist[]>(KEY_FLORISTS, []);
  const idx = list.findIndex((x) => x.id === item.id);
  if (idx >= 0) list.splice(idx, 1);
  else list.unshift(item);
  await setJson(KEY_FLORISTS, list);
  return list;
}

export async function upsertLikedReview(item: Review) {
  const list = await getJson<Review[]>(KEY_REVIEWS, []);
  const idx = list.findIndex((x) => x.id === item.id);
  if (idx >= 0) list.splice(idx, 1);
  else list.unshift(item);
  await setJson(KEY_REVIEWS, list);
  return list;
}

// ---------------------------------------------------------------------------
// 스타일 (웹 환경에서도 안전하게 보이도록 최소 레이아웃 보장)
const S = StyleSheet.create({
  headerWrap: { backgroundColor: "#000000ff" },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: { color: "#f49a9aff", fontSize: 18, fontWeight: "800" },
  badge: { backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  segmentWrap: { backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 16, padding: 4, flexDirection: "row" },
  segment: { flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 14 },
  segmentActive: { backgroundColor: "#9FD49D" }, // 플로리스트 네모박스
  segmentLabel: { color: "#fff", fontWeight: "600" },
  segmentLabelActive: { color: "#000", fontWeight: "700" },
  thumbBox: { borderRadius: 12, overflow: "hidden", aspectRatio: 1, backgroundColor: "#111" },
  thumbImg: { width: "100%", height: "100%", resizeMode: "cover" },
  checkOverlay: { position: "absolute", top: 6, right: 6, width: 22, height: 22, borderRadius: 11, backgroundColor: "rgba(0,0,0,0.35)", alignItems: "center", justifyContent: "center" },
  checkbox: { width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: "#fff", backgroundColor: "transparent" },
  checkboxOn: { backgroundColor: "#16a34a", borderColor: "#16a34a" },
  bottomBarWrap: { backgroundColor: "#000" },
  bottomBarRow: { flexDirection: "row", gap: 12, paddingHorizontal: 16, paddingVertical: 10 },
  bottomBtn: { flex: 1, alignItems: "center", paddingVertical: 12, borderRadius: 14, backgroundColor: "#222" },
  bottomBtnDanger: { backgroundColor: "#ef4444" },
  bottomBtnText: { color: "#eee", fontWeight: "700" },
  emptyWrap: { padding: 24 },
  emptyTitle: { color: "#eee", fontSize: 16, fontWeight: "700" },
  emptyDesc: { color: "#bbb" },
  ctaBtn: { backgroundColor: "#fff", borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8 },
});
