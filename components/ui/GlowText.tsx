// components/ui/GlowText.tsx
import { Colors } from '@/constants/theme';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import GradientText from './GradientText';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

interface GlowTextProps {
    text: string;
    duration?: number;
    style: any;
}

export default function GlowText({ text, duration = 1500, style }: GlowTextProps) {
    const W = 110;
    const H = 32;
    const R = 20;
    const perimeter = 2 * (W - 2 * R) + 2 * (H - 2 * R) + 2 * Math.PI * R;
    const lightLen = perimeter * 0.5; // haz más largo = más presencia

    const progress = useRef(new Animated.Value(0)).current;
    

    useEffect(() => {
        Animated.loop(
            Animated.timing(progress, {
                toValue: 1,
                duration,
                easing: Easing.linear,
                useNativeDriver: false,
            })
        ).start();
        return () => progress.stopAnimation();
    }, [duration]);

    const strokeDashoffset = progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -perimeter],
    });

    return (
        <View style={{ width: W, height: H }}>

            {/* Borde base tenue */}
            <Svg style={{ position: 'absolute' }} width={W} height={H}>
                <Rect
                    x={1} y={1}
                    width={W - 2} height={H - 2}
                    rx={R} ry={R}
                    fill="transparent"
                    stroke= {Colors.dark.secondColor}
                    strokeWidth={1}
                    strokeOpacity={1}
                />
            </Svg>

            {/* Halo exterior difuso (glow effect) */}


            {/* Haz de luz principal con gradiente cola→punta blanca */}
            <Svg style={{ position: 'absolute' }} width={W} height={H}>
                <Defs>
                    <LinearGradient id="glowBlue" x1="0" y1="0" x2="1" y2="0">
                        <Stop offset="0" stopColor={Colors.dark.secondColor} stopOpacity="0" />
                        <Stop offset="0.5" stopColor='white' stopOpacity="0.8" />
                        <Stop offset="0.85" stopColor="rgb(255, 255, 255)" stopOpacity="1" />
                        <Stop offset="1" stopColor={Colors.dark.secondColor} stopOpacity="1" />
                    </LinearGradient>
                </Defs>
                <AnimatedRect
                    x={1} y={1}
                    width={W - 2} height={H - 2}
                    rx={R} ry={R}
                    fill="none"
                    stroke="url(#glowBlue)"
                    strokeWidth={1}
                    strokeDasharray={`${lightLen} ${perimeter - lightLen}`}
                    strokeDashoffset={strokeDashoffset}
                />
            </Svg>

            {/* Texto */}
            <View style={{
                position: 'absolute',
                width: W, height: H,
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <GradientText text={text} style={style} />
            </View>
        </View>
    );
}