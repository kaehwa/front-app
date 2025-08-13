import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';

type Plan = {
  id: string;
  title: string;
  subTitle1: string;
  subTitle2: string;
  price: string;
  description: string[];
};

const plans: Plan[] = [
  {
    id: '몽우리',
    title: '몽우리',
    subTitle1: '1년에 한번 살까 말까 하는 당신을 위해',
    subTitle2: '년 2회 이용가능',
    price: '10,000',
    description: [
      '제외 꽃다발 : 프리지아',
      '꽃다발 크기 : 20 * 20 * 10',
      '품질 보장 : 1회 재출고 가능',
      '플로리스트 기여금 : 10%',
    ],
  },
  {
    id: '꽃받침',
    title: '꽃받침',
    subTitle1: '기념일이 자주 있는 당신을 위해',
    subTitle2: '년 6회 이용가능',
    price: '50,000',
    description: [
      '제외 꽃다발 : 장미',
      '꽃다발 크기 : 20 * 30 * 10',
      '품질 보장 : 1회 재출고 가능',
      '플로리스트 기여금 : 15%',
    ],
  },
  {
    id: '개화',
    title: '개화',
    subTitle1: '나는 매달 꽃을 받아 보고 싶은 당신을 위해',
    subTitle2: '년 12회 이용가능',
    price: '200,000',
    description: [
      '제외 꽃다발 : 양귀비',
      '꽃다발 크기 : 40 * 30 * 10',
      '품질 보장 : 5회 재출고 가능',
      '플로리스트 기여금 : 20%',
    ],
  },
];

export default function PlanSelector() {
  const [selectedPlan, setSelectedPlan] = useState<string>('slim');

  const onSelectPlan = (id: string) => {
    setSelectedPlan(id);
  };

  const onApply = () => {
    const plan = plans.find((p) => p.id === selectedPlan);
    console.log("onApply Pressed")
    alert(`선택된 요금제 : ${plan.title}, 가격 : ${plan.price}`)
    // Alert.alert('선택된 요금제', plan ? `${plan.title} - ${plan.price}` : '없음');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingVertical: 20 }}>
        {plans.map((plan) => {
          const isSelected = selectedPlan === plan.id;
          return (
            <TouchableOpacity
              key={plan.id}
              style={[styles.planBox, isSelected && styles.planBoxSelected]}
              activeOpacity={0.8}
              onPress={() => onSelectPlan(plan.id)}
            >
              <View style={styles.planHeader}>
                <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                  {isSelected && <View style={styles.radioDot} />}
                </View>
                <View>
                  <Text style={[styles.planTitle, isSelected && styles.planTitleSelected]}>{plan.title}</Text>
                  <View style={styles.subTitleRow}>
                    <Text style={[styles.subTitle1, isSelected && styles.subTitleSelected]}>{plan.subTitle1}</Text>
                    <Text style={[styles.subTitle2, isSelected && styles.subTitleSelected]}> | {plan.subTitle2}</Text>
                  </View>
                  <Text style={[styles.price, isSelected && styles.priceSelected]}>{plan.price}</Text>
                </View>
              </View>

              {/* 선택된 경우에만 상세 설명 보이기 */}
              {isSelected && plan.description.length > 0 && (
                <View style={styles.descriptionContainer}>
                  {plan.description.map((line, idx) => (
                    <Text key={idx} style={styles.descriptionText}>
                      • {line}
                    </Text>
                  ))}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <TouchableOpacity style={styles.applyButton} onPress={onApply}>
        <Text style={styles.applyButtonText}>선택하기</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  planBox: {
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  planBoxSelected: {
    borderColor: '#E04040', // 빨간색 테두리
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#B0B0B0',
    marginRight: 12,
    marginTop: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleSelected: {
    borderColor: '#E04040',
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E04040',
  },
  planTitle: {
    color: '#CCCCCC',
    fontSize: 18,
    fontWeight: '700',
  },
  planTitleSelected: {
    color: '#FFFFFF',
  },
  subTitleRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  subTitle1: {
    color: '#A0A0A0',
    fontSize: 14,
  },
  subTitle2: {
    color: '#5076D8',
    fontSize: 14,
  },
  subTitleSelected: {
    color: '#5076D8',
  },
  price: {
    marginTop: 6,
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 20,
  },
  priceSelected: {
    color: '#FFFFFF',
  },
  descriptionContainer: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#333333',
    paddingTop: 12,
  },
  descriptionText: {
    color: '#A04040',
    fontSize: 13,
    marginBottom: 4,
    lineHeight: 18,
  },
  applyButton: {
    backgroundColor: '#E04040',
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 'auto',
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 18,
  },
});
