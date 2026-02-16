import React, { useRef, useCallback } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import Body, { ExtendedBodyPart, Slug } from 'react-native-body-highlighter';
import { colors } from '../utils/theme';

export interface BodyZone {
  id: string;
  label: string;
  path: string; // kept for interface compat
  center: { x: number; y: number };
}

// Map our zone IDs to the library's slug system
const SLUG_TO_ZONE: Record<string, { id: string; label: string }> = {
  head: { id: 'head', label: 'Head' },
  neck: { id: 'neck', label: 'Neck' },
  chest: { id: 'chest', label: 'Chest' },
  abs: { id: 'abdomen', label: 'Abdomen' },
  obliques: { id: 'abdomen', label: 'Abdomen' },
  deltoids: { id: 'shoulders', label: 'Shoulders' },
  trapezius: { id: 'upper_back', label: 'Upper Back' },
  biceps: { id: 'left_arm', label: 'Arm' },
  triceps: { id: 'right_arm', label: 'Arm' },
  forearm: { id: 'forearm', label: 'Forearm' },
  hands: { id: 'hands', label: 'Hands' },
  quadriceps: { id: 'upper_leg', label: 'Upper Leg' },
  adductors: { id: 'inner_thigh', label: 'Inner Thigh' },
  knees: { id: 'knees', label: 'Knees' },
  tibialis: { id: 'lower_leg', label: 'Lower Leg' },
  calves: { id: 'calves', label: 'Calves' },
  ankles: { id: 'ankles', label: 'Ankles' },
  feet: { id: 'feet', label: 'Feet' },
  gluteal: { id: 'hips', label: 'Hips' },
  'lower-back': { id: 'lower_back', label: 'Lower Back' },
};

// All zones we expose
export const BODY_ZONES: BodyZone[] = [
  { id: 'head', label: 'Head', path: '', center: { x: 100, y: 32 } },
  { id: 'neck', label: 'Neck', path: '', center: { x: 100, y: 66 } },
  { id: 'shoulders', label: 'Shoulders', path: '', center: { x: 60, y: 88 } },
  { id: 'chest', label: 'Chest', path: '', center: { x: 100, y: 120 } },
  { id: 'abdomen', label: 'Abdomen', path: '', center: { x: 100, y: 170 } },
  { id: 'left_arm', label: 'Left Arm', path: '', center: { x: 38, y: 150 } },
  { id: 'right_arm', label: 'Right Arm', path: '', center: { x: 162, y: 150 } },
  { id: 'forearm', label: 'Forearm', path: '', center: { x: 38, y: 200 } },
  { id: 'hands', label: 'Hands', path: '', center: { x: 30, y: 240 } },
  { id: 'hips', label: 'Hips', path: '', center: { x: 100, y: 210 } },
  { id: 'upper_leg', label: 'Upper Leg', path: '', center: { x: 80, y: 280 } },
  { id: 'knees', label: 'Knees', path: '', center: { x: 80, y: 340 } },
  { id: 'lower_leg', label: 'Lower Leg', path: '', center: { x: 80, y: 380 } },
  { id: 'feet', label: 'Feet', path: '', center: { x: 80, y: 420 } },
];

interface Props {
  tappable?: boolean;
  selectedZone?: string | null;
  onZoneTap?: (zone: BodyZone) => void;
  breathing?: boolean;
}

function GlowOverlay({ zone }: { zone: BodyZone }) {
  const pulseOpacity = useRef(new Animated.Value(0.3)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseOpacity, {
          toValue: 0.8,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseOpacity, {
          toValue: 0.3,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute' as const,
        left: '50%',
        top: '50%',
        width: 60,
        height: 60,
        borderRadius: 30,
        marginLeft: -30,
        marginTop: -30,
        backgroundColor: colors.purpleGlow,
        opacity: pulseOpacity,
      }}
    />
  );
}

export default function BodySilhouette({ tappable = false, selectedZone, onZoneTap, breathing = false }: Props) {
  const breathScale = useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (breathing) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(breathScale, {
            toValue: 1.02,
            duration: 4000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(breathScale, {
            toValue: 1,
            duration: 4000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [breathing]);

  // Build data array — always include head to override its light color
  const data: ExtendedBodyPart[] = [
    { slug: 'head' as Slug, intensity: 1 },
  ];
  if (selectedZone) {
    for (const [slug, mapping] of Object.entries(SLUG_TO_ZONE)) {
      if (mapping.id === selectedZone) {
        data.push({ slug: slug as Slug, intensity: 2 });
      }
    }
  }

  const handleBodyPartPress = useCallback((bodyPart: ExtendedBodyPart) => {
    if (!tappable || !onZoneTap) return;
    const slug = bodyPart.slug;
    if (slug) {
      const mapping = SLUG_TO_ZONE[slug];
      if (mapping) {
        const zone = BODY_ZONES.find(z => z.id === mapping.id);
        if (zone) onZoneTap(zone);
      }
    }
  }, [tappable, onZoneTap]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.svgWrap, breathing ? { transform: [{ scale: breathScale }] } : undefined]}>
        <Body
          data={data}
          onBodyPartPress={tappable ? handleBodyPartPress : undefined}
          colors={['#3f3f3f', colors.purpleGlow]}
          scale={1.5}
          border="#b8b0d830"
          side="front"
          gender="female"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  svgWrap: {
    position: 'relative',
  },
});
