import { Colors } from '@/constants/theme';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from 'react-native';

interface GradientTextProps {
  text: string;
  style: any;

}

export default function GradientText({ text, style } : GradientTextProps) {
  return (
    <MaskedView maskElement={
      <Text style={style}>
        {text}
      </Text>
    }>
      <LinearGradient
        colors={['#ffffff', Colors.dark.tint]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        {/* Text transparent per donar mida al gradient */}
        <Text style={[style, { opacity: 0 }]}>
          {text}
        </Text>
      </LinearGradient>
    </MaskedView>
  )
}
