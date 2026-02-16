import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import FadeView from '../components/FadeView';
import BreathingCircle from '../components/BreathingCircle';
import { colors } from '../utils/theme';
import { useSession } from '../context/SessionContext';
import { markDayComplete, saveSession } from '../utils/storage';

interface Props {
  onFinish: () => void;
}

export default function CloseScreen({ onFinish }: Props) {
  const { currentDay, selectedZone, sensation, emotion, emotionText } = useSession();

  useEffect(() => {
    (async () => {
      await markDayComplete(currentDay);
      await saveSession({
        date: new Date().toISOString(),
        day: currentDay,
        bodyZone: selectedZone,
        sensation,
        emotion,
        emotionText,
      });
    })();
  }, []);

  return (
    <LinearGradient colors={[colors.bgDark, colors.bgDeep]} style={styles.gradient}>
      <View style={styles.container}>
        <FadeView style={styles.textWrap} delay={500}>
          <Text style={styles.body}>
            Notice your breath again.{'\n\n'}Feel your feet on the ground.
          </Text>
        </FadeView>

        <FadeView delay={2000}>
          <BreathingCircle size={120} color={colors.teal} />
        </FadeView>

        <FadeView style={styles.textWrap} delay={3000}>
          <Text style={styles.complete}>Session complete</Text>
          <Text style={styles.day}>Day {currentDay} of 7 ✓</Text>
        </FadeView>

        <FadeView delay={4000}>
          <TouchableOpacity style={styles.doneBtn} onPress={onFinish} activeOpacity={0.8}>
            <Text style={styles.doneText}>Done</Text>
          </TouchableOpacity>
        </FadeView>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, gap: 40 },
  textWrap: { alignItems: 'center' },
  body: { fontSize: 20, color: colors.whiteSoft, fontWeight: '300', textAlign: 'center', lineHeight: 32 },
  complete: { fontSize: 22, color: colors.lavender, fontWeight: '300', letterSpacing: 1 },
  day: { fontSize: 14, color: colors.whiteSubtle, marginTop: 8, letterSpacing: 2 },
  doneBtn: {
    paddingHorizontal: 45,
    paddingVertical: 14,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: colors.teal,
    backgroundColor: 'rgba(79, 209, 197, 0.1)',
  },
  doneText: { fontSize: 16, color: colors.teal, fontWeight: '400', letterSpacing: 2 },
});
