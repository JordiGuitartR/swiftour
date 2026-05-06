import GradientText from '@/components/ui/GradientText';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');

  const { signIn, signUp } = useAuth();
  const router = useRouter();

  const handleEmailChange = (text: string) => {
    setEmail(text.trim());
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
  };

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 6;
  };

  const handleAuthenticate = async () => {
    // Validations
    if (!email) {
      Alert.alert('Error', 'Si us plau, escriu el teu correu electrònic');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Si us plau, escriu un correu vàlid');
      return;
    }

    if (!validatePassword(password)) {
      Alert.alert('Error', 'La contrasenya ha de tenir almenys 6 caràcters');
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      Alert.alert('Error', 'Les contrasenyes no coincideixen');
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
      // Navigation happens automatically through the root layout
      router.replace('/(tabs)');
    } catch (error: any) {
      let errorMessage = 'Error desconegut';

      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Aquest correu ja està registrat';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Contrasenya massa feble';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'Correu o contrasenya incorrectes';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Correu o contrasenya incorrectes';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Correu no vàlid';
      }

      Alert.alert('Error d\'autenticació', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setIsSignUp(!isSignUp);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <GradientText text="SwifTour" style={styles.logo}/>
          <Text style={styles.subtitle}>
            {isSignUp ? 'Crea el teu compte' : 'Inicia sessió'}
          </Text>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Correu electrònic</Text>
              <TextInput
                style={styles.input}
                placeholder="teu@correu.com"
                placeholderTextColor="#999"
                value={email}
                onChangeText={handleEmailChange}
                editable={!loading}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contrasenya</Text>
              <TextInput
                style={styles.input}
                placeholder="Almenys 6 caràcters"
                placeholderTextColor="#999"
                value={password}
                onChangeText={handlePasswordChange}
                editable={!loading}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            {isSignUp && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirma la contrasenya</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Repeteix la contrasenya"
                  placeholderTextColor="#999"
                  value={confirmPassword}
                  onChangeText={handleConfirmPasswordChange}
                  editable={!loading}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>
            )}

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleAuthenticate}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>
                  {isSignUp ? 'Registra\'t' : 'Inicia sessió'}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {isSignUp ? 'Ja tens compte? ' : 'Sense compte? '}
            </Text>
            <TouchableOpacity onPress={toggleMode} disabled={loading}>
              <Text
                style={[
                  styles.toggleText,
                  loading && styles.toggleTextDisabled,
                ]}
              >
                {isSignUp ? 'Inicia sessió' : 'Registra\'t'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  logo: {
    fontSize: 48,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 40,
    color: '#FFFFFF',
  },
  form: {
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#CCCCCC',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#404040',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#FFFFFF',
    backgroundColor: '#2a2a2a',
  },
  button: {
    backgroundColor: '#e8e8e8',
    paddingVertical: 12,
    width: '100%',
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 20
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: Colors.middleSection,
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666666',
  },
  toggleText: {
    fontSize: 14,
    color: Colors.dark.secondColor,
    fontWeight: '600',
  },
  toggleTextDisabled: {
    opacity: 0.6,
  },
});
