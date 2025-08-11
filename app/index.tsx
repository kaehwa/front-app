import { useMemo, useState } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  FlatList,
  Dimensions,
  ImageSourcePropType,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

/** 버튼 (예시 이미지처럼 라운드+연회색 배경+살짝 그림자) */
function NextButton({
  disabled,
  onPress,
}: {
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      disabled={!!disabled}
      onPress={onPress}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={({ pressed }) => [
        styles.btn,
        disabled ? styles.btnDisabled : styles.btnEnabled,
        pressed && styles.btnPressed,
      ]}
    >
      <Text style={[styles.btnText, disabled && styles.btnTextDisabled]}>다음</Text>
    </Pressable>
  );
}

type Item = { id: string; title: string; src: ImageSourcePropType };
const MAX_SELECT = 5;

const CANDIDATES: Item[] = [
  { id: "1", title: "바스켓 화이트&핑크", src: require("../assets/flowers/1.png") },
  { id: "2", title: "코랄 부케",        src: require("../assets/flowers/2.png") },
  { id: "3", title: "파스텔 믹스",       src: require("../assets/flowers/3.png") },
  { id: "4", title: "옐로우 콘트라스트", src: require("../assets/flowers/4.png") },
  { id: "5", title: "비비드 믹스",       src: require("../assets/flowers/5.png") },
  { id: "6", title: "튤립 파스텔",       src: require("../assets/flowers/6.png") },
  { id: "7", title: "핑크&라일락",       src: require("../assets/flowers/7.png") },
  { id: "8", title: "화이트 클래식",     src: require("../assets/flowers/8.png") },
];

export default function SelectBouquet() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const canProceed = selected.size === MAX_SELECT;

  // 3열 그리드 사이즈
  const screenW = Dimensions.get("window").width;
  const gutter = 16;  // 좌우 패딩
  const gap = 10;     // 카드 간격
  const columns = 3;
  const itemW = Math.floor((screenW - gutter * 2 - gap * (columns - 1)) / columns);
  const itemH = Math.floor(itemW * 1.25);

  const header = useMemo(
    () => `000님, 좋아하는 꽃다발을 ${MAX_SELECT}개를 선택하세요.`,
    []
  );

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else {
        if (next.size >= MAX_SELECT) return next;
        next.add(id);
      }
      return next;
    });
  };

  const onNext = () => {
    const ids = [...selected].join(",");
    router.push({ pathname: "/result", params: { ids } });
  };

  const renderItem = ({ item }: { item: Item }) => {
    const isSelected = selected.has(item.id);
    return (
      <Pressable
        onPress={() => toggle(item.id)}
        style={[styles.card, { width: itemW, height: itemH }]}
        android_ripple={{ color: "#00000022" }}
        accessibilityRole="button"
        accessibilityState={{ selected: isSelected }}
      >
        <Image source={item.src} style={styles.cardImage} resizeMode="cover" />

        {/* 선택 시: 이미지 위 어두운 오버레이 */}
        {isSelected && <View style={styles.overlay} />}

        {/* 선택 체크(중앙 연두색 원 + 체크) */}
        {isSelected && (
          <View style={styles.checkWrap}>
            <Ionicons name="checkmark" size={30} color="#fff" />
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      {/* 상단 타이포 (중앙) */}
      <View style={styles.headerWrap}>
        <Text style={styles.title}>{header}</Text>
        <Text style={styles.subtitle}>선택한 취향을 바탕으로 맞춤 추천을 보여드릴게요.</Text>
        <NextButton onPress={onNext} disabled={!canProceed} />
      </View>

      {/* 그리드: 공간 부족 시 세로 스크롤 */}
      <FlatList
        data={CANDIDATES}
        keyExtractor={(i) => i.id}
        numColumns={columns}
        contentContainerStyle={{ paddingHorizontal: gutter, paddingTop: 8, paddingBottom: 24 }}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        initialNumToRender={9}
        windowSize={7}
        maxToRenderPerBatch={9}
        removeClippedSubviews
        ListFooterComponent={<View style={{ height: 4 }} />}
      />

      {!canProceed && (
        <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
          <Text style={styles.helper}>총 {MAX_SELECT}개를 선택하면 다음으로 넘어갈 수 있어요. ({selected.size}/{MAX_SELECT})</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  headerWrap: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12, alignItems: "center" },

  // ● 제목/부제 폰트: LG Smart UI
  //   - 제목: 굵게, 크게
  //   - 부제: Regular(없으면 Bold 유지) + 조금 작게
  title: {
    fontFamily: "SKTSanstitle-ExtraBold",
    fontSize: 28,        // 원하는 만큼 키워도 됨 (예: 30~32)
    lineHeight: 34,
    color: "#111",
    textAlign: "center",
  },
  subtitle: {
    fontFamily: "SKTSanstext-SemiBold", // 파일 없으면 "LGSmartUI-Bold"로 바꿔 쓰세요
    fontSize: 16,
    lineHeight: 22,
    color: "#4B5563",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 8,
  },

  // 카드
  card: {
    marginBottom: 10,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#fff",
    position: "relative",
  },
  cardImage: { width: "100%", height: "100%" },

  // 선택 오버레이 & 체크
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.40)",
  },
  checkWrap: {
    position: "absolute",
    left: "50%",
    top: "50%",
    width: 56,
    height: 56,
    marginLeft: -28,
    marginTop: -28,
    borderRadius: 28,
    backgroundColor: "#75E07A",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },

  // 버튼
  btn: {
    alignSelf: "center",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 2, height: 3 },
    shadowRadius: 6,
    elevation: 4,
    marginTop: 10,
  },
  btnEnabled: {},
  btnDisabled: {
    backgroundColor: "#ECEFF1",
    borderColor: "#E5E7EB",
    shadowOpacity: 0.06,
    elevation: 0,
  },
  btnPressed: { transform: [{ scale: 0.98 }], shadowOpacity: 0.08, elevation: 2 },
  btnText: { color: "#111827", fontSize: 16, fontWeight: "600" },
  btnTextDisabled: { color: "#9CA3AF" },

  helper: { color: "#6B7280", fontSize: 12, textAlign: "center" },
});
