import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import FadeView from '../components/FadeView';
import BreathingCircle from '../components/BreathingCircle';
import { colors } from '../utils/theme';
import { useSession } from '../context/SessionContext';

export default function SettleInScreen() {
  const { nextStep } = useSession();

  useEffect(() => {
    const timer = setTimeout(nextStep, 20000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient colors={[colors.bgDark, colors.bgDeep]} style={styles.gradient}>
      <View style={styles.container}>
        <FadeView style={styles.textWrap} delay={500}>
          <Text style={styles.title}>Settle In</Text>
        </FadeView>

        <FadeView style={styles.center} delay={1000}>
          <BreathingCircle size={200} />
        </FadeView>

        <FadeView style={styles.textWrap} delay={2000}>
          <Text style={styles.body}>Find a quiet place.{'\n'}Sit.{'\n\n'}Take a deep breath in…{'\n'}and let out a sigh.</Text>
        </FadeView>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  textWrap: { alignItems: 'center' },
  title: { fontSize: 14, color: colors.whiteSubtle, letterSpacing: 4, textTransform: 'uppercase', fontWeight: '500' },
  center: { marginVertical: 50 },
  body: { fontSize: 20, color: colors.whiteSoft, fontWeight: '300', textAlign: 'center', lineHeight: 32 },
});
