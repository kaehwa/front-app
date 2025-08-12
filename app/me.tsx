import React from "react";
import { View, Text, StyleSheet, Pressable, SafeAreaView, Image, ScrollView, FlatList } from "react-native";

import { useNavigation } from '@react-navigation/native';
import LowBars from "./lowBars";
import { router } from "expo-router";

// const chgInfo = async () => {
//     try {
 
//       router.replace("/select");
//     } finally {
     
//     }
//   };

export default function MyPage() {
    const balance = 12500; // 남은  금액
    const grade = "GOLD"; // 등급 변경 (프리미엄 → GOLD 등)
    const membershipStart = "2025년 8월";
    const email = "example@naver.com";
    const phone = "010-1234-5678";
    const userNm = "Kaewha"

    // 하단 최근 본 플로리스트 이미지 예시 데이터
    const recentFlorists = [
    require("./../assets/images/User_jin.png"),
    require("./../assets/images/User_jin.png"),
    require("./../assets/images/User_jin.png"),
    require("./../assets/images/User_jin.png"),
    require("./../assets/images/User_jin.png"),
    ];

    function chgCharge(){
        router.replace("/subscribe")
    }
    function chgInfo() {
        console.log("chgInfo pressed");
    }

    function canSubscribe() {
        console.log("canSubscribe pressed");
    }

    // 중단 작은 버튼 항목 눌렀을 때
    function onSmallButtonPress(name: string) {
        console.log(`${name} pressed`);
    }

    return (
        <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
            {/* 상단 박스 */}
            <View style={styles.box}>
            {/* 헤더 */}
            <View style={styles.headerRow}>
                <Text style={styles.headerTitle}>계정</Text>
                <Pressable style={styles.iconButton}>
                <Image
                    source={require("./../assets/images/User_minjae.png")}
                    style={{ width: 40, height: 40 }}
                />
                </Pressable>
            </View>

            {/* 상단 배너: 사용자 등급 및 마일리지 등 */}
            <View style={styles.membershipBanner}>
                <Text style={styles.membershipBannerText}>
                {userNm}은 {grade} 입니다.
                </Text>
                <Pressable style={styles.couponButton}>
                <Text style={styles.couponButtonText}>꽃 가꾸기</Text>
                </Pressable>
            </View>

            {/* 멤버십 시작일 */}
            <View style={styles.membershipBadge}>
                <Text style={styles.membershipBadgeText}>
                멤버십 시작: {membershipStart}
                </Text>
            </View>

            {/* 안내 문구 */}
            <View style={styles.infoBox}>
                <Text style={styles.infoText}>선택 가능한 여러 옵션이 있습니다!</Text>
                <Text style={styles.listItem}>• 멤버십 변경</Text>
                <Text style={styles.listItem}>• 결제 수단 관리</Text>
                <Text style={styles.listItem}>• 해지 등</Text>
            </View>
            </View>

            {/* 중단 박스 */}
            <View style={styles.box}>
            <Text style={styles.sectionTitle}>멤버십 & 결제 정보</Text>
            <View style={styles.infoRow}>
                <Text style={styles.label}>이메일</Text>
                <Text style={styles.value}>{email}</Text>
            </View>
            <View style={styles.infoRow}>
                <Text style={styles.label}>전화번호</Text>
                <Text style={styles.value}>{phone}</Text>
            </View>

            {/* 중단 5개 작은 버튼 항목 추가 */}
            <View style={styles.smallButtonRow}>
                {[
                { key: "주문·배송", count: 0 },
                { key: "리뷰", count: 5 },
                { key: "쿠폰", count: 1 },
                { key: "포인트", count: 0 },
                { key: "마일리지", count: 3590 },
                ].map(({ key, count }) => (
                <Pressable
                    key={key}
                    onPress={() => onSmallButtonPress(key)}
                    style={styles.smallButton}
                >
                    <Text style={styles.smallButtonTitle}>{key}</Text>
                    <Text style={styles.smallButtonCount}>{count}</Text>
                </Pressable>
                ))}
            </View>

            {/* 버튼 영역 */}
            <View style={styles.buttonRow}>
                
                <Pressable onPress={chgCharge} style={styles.actionButton}>
                    
                <Text style={styles.actionText}>구독 변경</Text>
                </Pressable>
                <Pressable onPress={chgInfo} style={styles.actionButton}>
                <Text style={styles.actionText}>정보 수정</Text>
                </Pressable>
            </View>
            </View>

            {/* 하단 박스 */}
            <View style={styles.box}>
            <Pressable onPress={canSubscribe} style={styles.cancelButton}>
                <Text style={styles.cancelText}>구독 취소</Text>
            </Pressable>
            </View>

            {/* 최근 본 플로리스트 - 가로 스크롤 이미지 리스트 */}
            <View style={[styles.box, { paddingBottom: 20 }]}>
            <Text style={styles.sectionTitle}>최근 본 플로리스트</Text>
            <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={recentFlorists}
                keyExtractor={(_, index) => index.toString()}
                renderItem={({ item }) => (
                <Image source={item} style={styles.floristImage} />
                )}
            />
            </View>
        </ScrollView>

        <LowBars />
        </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F2",
  },
  box: {
    backgroundColor: "#fff",
    padding: 20,
    marginBottom: 12,
    borderRadius: 8,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  iconButton: {
    padding: 6,
  },
  membershipBanner: {
    backgroundColor: "#D4AF37", // 골드 색상 느낌
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  membershipBannerText: {
    color: "#000",
    fontWeight: "700",
    fontSize: 16,
  },
  couponButton: {
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  couponButtonText: {
    color: "#D4AF37",
    fontWeight: "700",
    fontSize: 14,
  },
  membershipBadge: {
    backgroundColor: "#3B82F6",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 10,
  },
  membershipBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  infoBox: {
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
  },
  infoText: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 6,
  },
  listItem: {
    fontSize: 13,
    color: "#555",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  label: {
    fontSize: 14,
    color: "#666",
  },
  value: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111",
  },
  smallButtonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  smallButton: {
    flex: 1,
    alignItems: "center",
  },
  smallButtonTitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  smallButtonCount: {
    fontSize: 16,
    fontWeight: "700",
    color: "#E53935",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
  actionButton: {
    backgroundColor: "#043B0F",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  actionText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  cancelButton: {
    backgroundColor: "#E53935",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  floristImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 12,
  },
});
