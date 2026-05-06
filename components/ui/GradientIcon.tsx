import { Colors } from '@/constants/theme';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { View } from 'react-native';
import { IconSymbol } from './icon-symbol';

interface GradientIconProps {
    name: any;
    style: any;
    size?: number;
}

export default function GradientIcon({ name, style, size }: GradientIconProps) {
  return (
    <MaskedView
      style={style}  // ← mida explícita al MaskedView
      maskElement={
        <View style={{ backgroundColor: 'transparent', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <IconSymbol
            name={name}
            size={size}
            color="white"  // ← color opac obligatori perquè funcioni la màscara
          />
        </View>
      }
    >
      <LinearGradient
        colors={['#ffffff', Colors.dark.tint]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.75 }}
        style={{ flex: 1 }}  // ← flex: 1 perquè ompli el MaskedView
      />
    </MaskedView>
  );
}