import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import FadeView from '../components/FadeView';
import BreathingCircle from '../components/BreathingCircle';
import { colors } from '../utils/theme';
import { CHALLENGE_DAYS } from '../utils/challengeData';
import { getCurrentDay, getCompletedDays } from '../utils/storage';
import { useSession } from '../context/SessionContext';

interface Props {
  onBegin: () => void;
}

export default function HomeScreen({ onBegin }: Props) {
  const { currentDay, setCurrentDay } = useSession();
  const [completedDays, setCompletedDays] = useState<number[]>([]);

  useEffect(() => {
    (async () => {
      const day = await getCurrentDay();
      const completed = await getCompletedDays();
      setCurrentDay(day);
      setCompletedDays(completed);
    })();
  }, []);

  const todayData = CHALLENGE_DAYS[currentDay - 1] || CHALLENGE_DAYS[0];

  return (
    <LinearGradient colors={[colors.bgDark, colors.bgDeep, colors.bgMid]} style={styles.gradient}>
      <SafeAreaView style={styles.container}>
        <FadeView style={styles.top}>
          <Text style={styles.appTitle}>Into the Body</Text>
          <Text style={styles.appSubtitle}>a somatic practice</Text>
        </FadeView>

        <FadeView style={styles.center} delay={400}>
          <BreathingCircle size={160} />
        </FadeView>

        <FadeView style={styles.daySection} delay={700}>
          <Text style={styles.dayLabel}>Day {currentDay} of 7</Text>
          <Text style={styles.theme}>"{todayData.theme}"</Text>
          <Text style={styles.subtitle}>{todayData.subtitle}</Text>
        </FadeView>

        <FadeView style={styles.progressRow} delay={900}>
          {CHALLENGE_DAYS.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                completedDays.includes(i + 1) && styles.dotDone,
                i + 1 === currentDay && styles.dotCurrent,
              ]}
            />
          ))}
        </FadeView>

        <FadeView style={styles.bottom} delay={1100}>
          <TouchableOpacity style={styles.beginBtn} onPress={onBegin} activeOpacity={0.8}>
            <Text style={styles.beginText}>Begin</Text>
          </TouchableOpacity>
        </FadeView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1, alignItems: 'center', justifyContent: 'space-between', paddingVertical: 20 },
  top: { alignItems: 'center', marginTop: 20 },
  appTitle: { fontSize: 32, color: colors.white, fontWeight: '300', letterSpacing: 2 },
  appSubtitle: { fontSize: 14, color: colors.whiteSubtle, fontWeight: '300', marginTop: 6, letterSpacing: 3 },
  center: { alignItems: 'center' },
  daySection: { alignItems: 'center', paddingHorizontal: 40 },
  dayLabel: { fontSize: 13, color: colors.whiteSubtle, letterSpacing: 4, textTransform: 'uppercase', fontWeight: '500' },
  theme: { fontSize: 24, color: colors.lavender, fontWeight: '300', marginTop: 12, textAlign: 'center' },
  subtitle: { fontSize: 15, color: colors.whiteSoft, fontWeight: '300', marginTop: 8, textAlign: 'center', lineHeight: 22 },
  progressRow: { flexDirection: 'row', gap: 10 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.15)' },
  dotDone: { backgroundColor: colors.purpleSoft },
  dotCurrent: { borderWidth: 1.5, borderColor: colors.lavender },
  bottom: { marginBottom: 20 },
  beginBtn: {
    paddingHorizontal: 50,
    paddingVertical: 16,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: colors.purpleSoft,
    backgroundColor: 'rgba(108, 99, 255, 0.12)',
  },
  beginText: { fontSize: 18, color: colors.white, fontWeight: '400', letterSpacing: 2 },
});
