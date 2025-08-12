import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  Image,
  ScrollView,
} from "react-native";

import LowBars from "./lowBars";

export default function MyPage() {
  const balance = 12500; // 남은 금액
  const grade = "프리미엄";
  const membershipStart = "2025년 8월";
  const email = "example@naver.com";
  const phone = "010-1234-5678";

  function chgCharge () {
    console.log("chgCharge pressed")
    
  }
  function chgInfo () {
    console.log("chgInfo pressed")
  }
  function canSubscribe () {
    console.log("canSubscribe pressed")
  }
  
  
  return (
    <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
            {/* 상단 박스 */}
            <View style={styles.box}>
            {/* 헤더 */}
            <View style={styles.headerRow}>
                <Text style={styles.headerTitle}>계정</Text>
                <Pressable 
                    style={styles.iconButton}>
                <Image
                    source={require("./../assets/images/User_minjae.png")}
                    style={{ width: 40, height: 40}}
                />
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
                <Text style={styles.infoText}>
                선택 가능한 여러 옵션이 있습니다!
                </Text>
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

            {/* 버튼 영역 */}
            <View style={styles.buttonRow}>
                <Pressable 
                    onPress={() => chgCharge()}
                    style={styles.actionButton}>
                    <Text style={styles.actionText}>요금제 변경</Text>
                </Pressable>
                <Pressable 
                    onPress={() => chgInfo()}
                    style={styles.actionButton}>
                <Text style={styles.actionText}>정보 수정</Text>
                </Pressable>
            </View>
            </View>

            {/* 하단 박스 */}
            <View style={styles.box}>
            <Pressable 
                onPress={() => canSubscribe()}
                style={styles.cancelButton}>
                <Text style={styles.cancelText}>구독 취소</Text>
            </Pressable>
            </View>
        </ScrollView>

        <LowBars></LowBars>

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
});

