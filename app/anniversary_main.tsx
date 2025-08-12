import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  View, Text, SafeAreaView, StyleSheet, Pressable, FlatList,
  ImageBackground, Image, ActivityIndicator, Alert, Animated,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

// 👉 내 네트워크 환경에 맞게 교체(휴대폰 테스트면 PC의 LAN IP)
const BACKEND_URL = "http://<YOUR_BACKEND_HOST>:8080";

type Gender = "남" | "여" | null;
type Emotion = "축하" | "기쁨" | "위로" | "슬픔" | "허무" | null;

type FloristItem = {
  id: string;
  name: string;
  rating?: number;
  tags?: string[];
  image: { uri: string } | number;
};

const AGES = ["10대", "20대", "30대", "40대", "50대", "60대", "70대", "80대", "90대"];
const EMOTIONS: Exclude<Emotion, null>[] = ["축하", "기쁨", "위로", "슬픔", "허무"];

export default function AnniversaryForm() {
  const [firstName, setFirstName] = useState("000");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [gender, setGender] = useState<Gender>(null);
  const [age, setAge] = useState<string | null>(null);
  const [emotion, setEmotion] = useState<Emotion>(null);
  const [loading, setLoading] = useState(false);
  const [florists, setFlorists] = useState<FloristItem[]>([]);
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<FloristItem>>(null);

  useEffect(() => {
    (async () => {
      try {
        const full = (await SecureStore.getItemAsync("user_full_name")) || "000";
        const avatarUri = await SecureStore.getItemAsync("user_avatar");
        setFirstName(extractFirstName(full));
        if (avatarUri) setAvatar(avatarUri);
      } catch {}
    })();
  }, []);

  const canSubmit = useMemo(() => !!gender && !!age && !!emotion, [gender, age, emotion]);

  const onRequest = useCallback(async () => {
    if (!canSubmit || loading) return;
    setLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/recommend/florists`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipient_gender: gender, recipient_age: age, emotion }),
      });

      let mapped: FloristItem[] = [];
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data?.florists) ? data.florists : [];
        mapped = list.map((f: any, idx: number) => ({
          id: String(f.id ?? `f${idx}`),
          name: String(f.name ?? "이름 없는 플로리스트"),
          rating: Number(f.rating ?? 4.8),
          tags: Array.isArray(f.tags) ? f.tags : [],
          image: f.imageUrl ? { uri: f.imageUrl } : require("../assets/images/icon(2).png"),
        }));
      }

      // ✅ 빈 응답/오류 대비: 목데이터로 보이도록
      if (!mapped.length) {
        mapped = DEMO_FLORISTS;
      }

      setFlorists(mapped);
      // 결과 쪽으로 스크롤
      setTimeout(() => listRef.current?.scrollToIndex({ index: 0, animated: true }), 50);
    } catch (e) {
      // 네트워크 에러 시에도 목데이터
      setFlorists(DEMO_FLORISTS);
      Alert.alert("연결 문제", "임시 추천 목록을 보여드릴게요.");
    } finally {
      setLoading(false);
    }
  }, [age, gender, emotion, canSubmit, loading]);

  const ListHeader = (
    <View>
      {/* 상단 인사 영역 */}
      <View style={styles.headerWrap}>
        <Text style={styles.greeting}>{firstName} 님, 오늘도 환영합니다.</Text>
        <Text style={styles.sub1}>당신의 순간에 꽃을 더하길 바랍니다.</Text>
        <Text style={styles.sub2}>스쳐가는 오늘이 오래도록 향기롭기를</Text>
        {!!avatar && <Image source={{ uri: avatar }} style={styles.avatar} />}
      </View>

      {/* 선택 입력 */}
      <View style={{ paddingHorizontal: 20 }}>
        <Text style={styles.sectionTitle}>꽃을 선물할 분의 정보를 입력해 주세요.</Text>
        <Text style={styles.sectionSub}>정보에 알맞은 꽃을 추천 드릴게요.</Text>

        {/* 성별 */}
        <LabeledRow label="성별">
          <Chip icon="male" selected={gender === "남"} onPress={() => setGender("남")} text="남" />
          <Chip icon="female" selected={gender === "여"} onPress={() => setGender("여")} text="여" />
        </LabeledRow>

        {/* 나이 */}
        <LabeledRow label="나이">
          <View style={styles.ageGrid}>
            {AGES.map((a) => (
              <View key={a} style={styles.ageItem}>
                <Chip text={a} selected={age === a} onPress={() => setAge(a)} />
              </View>
            ))}
          </View>
        </LabeledRow>

        {/* 감정 */}
        <LabeledRow label="어떤 감정을 표현하고 싶으신가요?">
          {EMOTIONS.map((e) => (
            <Chip key={e} text={`# ${e}`} selected={emotion === e} onPress={() => setEmotion(e)} />
          ))}
        </LabeledRow>

        {loading && <ActivityIndicator style={{ marginTop: 16 }} />}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ref={listRef}
        data={florists}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={{ paddingBottom: insets.bottom + 90 }}
        renderItem={({ item }) => <FloristCardCompact item={item} />}
        showsVerticalScrollIndicator={false}
      />

      {/* Sticky CTA */}
      <View style={[styles.stickyBar, { paddingBottom: insets.bottom + 12 }]}>
        <Pressable
          onPress={onRequest}
          disabled={!canSubmit || loading}
          style={({ pressed }) => [
            { flex: 1, borderRadius: 24, overflow: "hidden", opacity: !canSubmit ? 0.5 : 1 },
            pressed && { opacity: 0.9 },
          ]}
        >
          <LinearGradient
            colors={["#043B0F", "#065C1E"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ paddingVertical: 16, alignItems: "center" }}
          >
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
              {loading ? "불러오는 중..." : "추천 플로리스트 보기"}
            </Text>
          </LinearGradient>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

/* ======= UI helpers ======= */

function extractFirstName(full: string) {
  const hasSpace = full.includes(" ");
  if (hasSpace) return full.trim().split(" ")[0];
  if (full.length >= 2) return full.slice(1);
  return full;
}

function LabeledRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ marginTop: 20 }}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.chipsWrap}>{children}</View>
    </View>
  );
}

function Chip({
  text, selected, onPress, icon,
}: {
  text: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const press = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.97, duration: 80, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start(() => onPress?.());
  };
  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable onPress={press} android_ripple={{ color: "#00000010" }} style={[styles.chip, selected && styles.chipSelected]}>
        {icon && <Ionicons name={icon} size={16} style={{ marginRight: 6, opacity: 0.8 }} />}
        <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{text}</Text>
      </Pressable>
    </Animated.View>
  );
}

function FloristCardCompact({ item }: { item: FloristItem }) {
  return (
    <Link href={`/florist/${item.id}`} asChild>
      <Pressable style={styles.card}>
        <ImageBackground source={item.image} style={styles.cardBg} imageStyle={styles.cardBgImg}>
          <View style={styles.glass}>
            <Text numberOfLines={1} style={styles.cardTitle}>{item.name}</Text>
            <View style={styles.cardMetaRow}>
              <Text style={styles.cardMeta}>★ {item.rating?.toFixed(1) ?? "4.8"}</Text>
              {item.tags?.length ? (
                <Text numberOfLines={1} style={styles.cardTags}>{item.tags.slice(0, 3).join(" · ")}</Text>
              ) : null}
            </View>
            <Text style={styles.cardCta}>프로필 보기</Text>
          </View>
        </ImageBackground>
      </Pressable>
    </Link>
  );
}

/* ======= styles & demo ======= */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  headerWrap: { alignItems: "center", paddingTop: 8, paddingBottom: 6 },
  greeting: { fontSize: 24, fontWeight: "800", color: "#0F172A", textAlign: "center" },
  sub1: { marginTop: 8, color: "#374151", fontSize: 14, textAlign: "center" },
  sub2: { marginTop: 4, color: "#6B7280", fontSize: 13, textAlign: "center" },
  avatar: { position: "absolute", right: 20, top: 6, width: 34, height: 34, borderRadius: 8 },

  sectionTitle: { fontSize: 16, fontWeight: "800", color: "#111827", marginBottom: 4 },
  sectionSub: { fontSize: 13, fontWeight: "400", color: "#6B7280", marginBottom: 12 },

  rowLabel: { fontSize: 14, fontWeight: "700", color: "#374151", marginBottom: 8 },
  chipsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 10 },

  chip: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 14, height: 40,
    backgroundColor: "#F3F4F6",
    borderRadius: 14, borderWidth: 1, borderColor: "#E5E7EB",
  },
  chipSelected: {
    backgroundColor: "#043B0F12", borderColor: "#043B0F",
    shadowColor: "#043B0F", shadowOpacity: 0.08, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8, elevation: 3,
  },
  chipText: { color: "#1F2937", fontSize: 14, fontWeight: "700" },
  chipTextSelected: { color: "#043B0F" },

  ageGrid: { flexDirection: "row", flexWrap: "wrap", columnGap: 10, rowGap: 10 },
  ageItem: { width: "30.5%" },

  stickyBar: { position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: 20, backgroundColor: "#fff" },

  card: { height: 160, marginHorizontal: 16, marginVertical: 10, borderRadius: 18, overflow: "hidden", backgroundColor: "#eee" },
  cardBg: { flex: 1, justifyContent: "flex-end" },
  cardBgImg: { resizeMode: "cover" },
  glass: { backgroundColor: "rgba(255,255,255,0.75)", paddingHorizontal: 14, paddingVertical: 10 },
  cardTitle: { fontSize: 18, fontWeight: "800", color: "#111827" },
  cardMetaRow: { marginTop: 4, flexDirection: "row", justifyContent: "space-between" },
  cardMeta: { fontSize: 13, fontWeight: "700", color: "#111827" },
  cardTags: { fontSize: 12, color: "#374151", marginLeft: 8, flex: 1, textAlign: "right" },
  cardCta: { marginTop: 6, fontSize: 12, color: "#043B0F", fontWeight: "700" },
});

const DEMO_FLORISTS: FloristItem[] = [
  {
    id: "d1",
    name: "로즈가든 스튜디오",
    rating: 4.9,
    tags: ["클래식", "장미", "기념일"],
    image: { uri: "https://picsum.photos/seed/r1/1200/800" },
  },
  {
    id: "d2",
    name: "바닐라블룸",
    rating: 4.8,
    tags: ["파스텔", "생신", "위로"],
    image: { uri: "https://picsum.photos/seed/r2/1200/800" },
  },
  {
    id: "d3",
    name: "그린앤화이트",
    rating: 4.8,
    tags: ["화이트톤", "웨딩", "감성"],
    image: { uri: "https://picsum.photos/seed/r3/1200/800" },
  },
];
