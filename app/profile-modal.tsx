import GlowText from '@/components/ui/GlowText';
import GradientIcon from '@/components/ui/GradientIcon';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileModal() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    Alert.alert(
      'Tancar sessió',
      'Estàs segur que vols tancar sessió?',
      [
        {
          text: 'Cancel·la',
          onPress: () => { },
          style: 'cancel',
        },
        {
          text: 'Tancar sessió',
          onPress: async () => {
            try {
              await logout();
              router.replace('/auth/login');
            } catch (error) {
              Alert.alert('Error', 'No s\'ha pogut tancar sessió');
            }
          },
          style: 'destructive',
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <IconSymbol name="chevron.left" size={24} color={Colors.dark.tabIconDefault} />
          </TouchableOpacity>
          <GlowText text="Perfil" duration={2500} style={styles.title} />
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.content}>
          <GradientIcon style={styles.icon} name="person.circle.fill" size={150} />

          <Text style={styles.label}>Nom</Text>
          <View style={styles.userCard}>

            
            <Text style={styles.email}>{'Víctor Ballesteros'}</Text>

          </View>
          <Text style={styles.label}>Correu electrònic</Text>
          <View style={styles.userCard}>

            
            <Text style={styles.email}>{user?.email}</Text>

          </View>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Text style={styles.logoutButtonText}>Tancar sessió</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  icon: {
    height: 150, width: 150, marginBottom: 20, marginTop: 20
  },
  container: {
    flex: 1,
    backgroundColor: '#1d1d1d',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#1d1d1d',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 6,
    paddingBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    backgroundColor: Colors.middleSection,
    alignItems: 'center',
  },
  userCard: {
    width: '100%',
    backgroundColor: '#252525',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#606060',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888888',
    marginBottom: 8,
    alignSelf: 'flex-start',
    marginLeft: 10,
  },
  email: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  logoutButton: {
    backgroundColor: Colors.dark.tabIconDefault,
    paddingVertical: 12,
    width: '70%',
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutButtonText: {
    color: Colors.middleSection,
    fontSize: 16,
    fontWeight: '600',

  },
});
