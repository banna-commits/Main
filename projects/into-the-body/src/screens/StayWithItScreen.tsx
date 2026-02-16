import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import FadeView from '../components/FadeView';
import TimerRing from '../components/TimerRing';
import { colors } from '../utils/theme';
import { useSession } from '../context/SessionContext';
import { BODY_ZONES } from '../components/BodySilhouette';

export default function StayWithItScreen() {
  const { nextStep, selectedZone } = useSession();
  const zoneName = BODY_ZONES.find((z) => z.id === selectedZone)?.label || 'that area';

  return (
    <LinearGradient colors={[colors.bgDark, colors.bgDeep]} style={styles.gradient}>
      <View style={styles.container}>
        <FadeView style={styles.textWrap} delay={300}>
          <Text style={styles.title}>Stay With It</Text>
        </FadeView>

        <FadeView style={styles.center} delay={800}>
          <TimerRing size={160} duration={10000} onComplete={nextStep} />
          <View style={styles.glowDot} />
        </FadeView>

        <FadeView style={styles.textWrap} delay={1200}>
          <Text style={styles.body}>
            Just breathe and stay{'\n'}with your {zoneName.toLowerCase()}…{'\n\n'}notice if anything changes.
          </Text>
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
  center: { marginVertical: 50, alignItems: 'center', justifyContent: 'center' },
  glowDot: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.purpleGlow,
    shadowColor: colors.purpleSoft,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 25,
  },
  body: { fontSize: 18, color: colors.whiteSoft, fontWeight: '300', textAlign: 'center', lineHeight: 28 },
});
