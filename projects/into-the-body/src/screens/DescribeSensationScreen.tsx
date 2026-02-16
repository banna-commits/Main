import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import FadeView from '../components/FadeView';
import { colors } from '../utils/theme';
import { useSession } from '../context/SessionContext';

const SENSATIONS = ['tight', 'heavy', 'warm', 'tingling', 'numb', 'pulsing', 'sharp', 'soft'];

export default function DescribeSensationScreen() {
  const { sensation, setSensation, nextStep } = useSession();

  const handleSelect = (s: string) => {
    setSensation(s);
    setTimeout(nextStep, 500);
  };

  return (
    <LinearGradient colors={[colors.bgDark, colors.bgDeep]} style={styles.gradient}>
      <View style={styles.container}>
        <FadeView style={styles.textWrap} delay={300}>
          <Text style={styles.title}>Describe It</Text>
          <Text style={styles.body}>How would you describe{'\n'}this sensation?</Text>
        </FadeView>

        <FadeView style={styles.chips} delay={700}>
          {SENSATIONS.map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.chip, sensation === s && styles.chipActive]}
              onPress={() => handleSelect(s)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, sensation === s && styles.chipTextActive]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </FadeView>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30 },
  textWrap: { alignItems: 'center', marginBottom: 40 },
  title: { fontSize: 14, color: colors.whiteSubtle, letterSpacing: 4, textTransform: 'uppercase', fontWeight: '500' },
  body: { fontSize: 20, color: colors.whiteSoft, fontWeight: '300', textAlign: 'center', lineHeight: 30, marginTop: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 },
  chip: {
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(184, 181, 255, 0.3)',
    backgroundColor: 'rgba(108, 99, 255, 0.08)',
  },
  chipActive: {
    backgroundColor: 'rgba(108, 99, 255, 0.3)',
    borderColor: colors.purpleSoft,
  },
  chipText: { fontSize: 16, color: colors.whiteSoft, fontWeight: '300' },
  chipTextActive: { color: colors.white },
});
