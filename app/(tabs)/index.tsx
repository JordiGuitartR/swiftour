import GlowText from '@/components/ui/GlowText';
import GradientIcon from '@/components/ui/GradientIcon';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_BASE_URL = 'https://fea92eac-fb8e-42e4-a490-639315c26be4-00-3n18xjgklul1c.riker.replit.dev';
// ─────────────────────────────────────────
// TIPUS
// ─────────────────────────────────────────
interface GuideData {
  descripcio?: string;
  context?: string;
  info_practica?: {
    adreca?: string;
    horaris?: string;
    telefon?: string;
    web?: string;
    valoracio?: string;
  };
  llocs_propers?: { nom: string; tipus: string }[];
  clima?: string;
  consell?: string;
}

interface GuideResult {
  guide: GuideData;
  place_name: string;
  photo_urls: string[];
}

export default function HomeScreen() {
  const router = useRouter();
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [guideResult, setGuideResult] = useState<GuideResult | null>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  // Filter states
  const [filterModalOpen, setFilterModalOpen] = useState<string | null>(null);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedRadius, setSelectedRadius] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedPeople, setSelectedPeople] = useState<string | null>(null);

  const [direction, setDirection] = useState(1);
  const animationRef = useRef<LottieView>(null);

  const allFiltersSelected =
    selectedInterests.length > 0 &&
    selectedRadius !== null &&
    selectedTime !== null &&
    selectedPeople !== null;

  const canSearch = inputValue.trim().length > 0 && allFiltersSelected && !loading;

  const handleFinish = () => {
    const newDirection = direction * -1;
    setDirection(newDirection);
    if (animationRef.current) {
      if (newDirection === 1) {
        animationRef.current.play(0, 180);
      } else {
        animationRef.current.play(180, 0);
      }
    }
  };

  useEffect(() => {
    animationRef.current?.play(0, 180);
  }, []);

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((item) => item !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleSearch = async () => {
    if (!inputValue.trim()) return;

    if (!allFiltersSelected) {
      const missing: string[] = [];
      if (selectedInterests.length === 0) missing.push('Interessos');
      if (!selectedRadius) missing.push('Zona');
      if (!selectedTime) missing.push('Temps');
      if (!selectedPeople) missing.push('Persones');
      Alert.alert(
        'Filtres incomplets',
        `Si us plau, selecciona: ${missing.join(', ')}`,
        [{ text: 'D\'acord' }]
      );
      return;
    }

    setLoading(true);
    setGuideResult(null);
    scrollViewRef.current?.scrollToEnd({ animated: true });

    try {
      const response = await fetch(`${API_BASE_URL}/guide`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          place_input: inputValue.trim(),
          filters: {
            interests: selectedInterests,
            radius: selectedRadius,
            time: selectedTime,
            people: selectedPeople,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        setGuideResult({
          guide: data.guide,
          place_name: data.place_name,
          photo_urls: data.photo_urls || [],
        });
        setCurrentPhotoIndex(0);
        setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
      } else {
        Alert.alert('Error', data.error || 'Hi ha hagut un error inesperat.', [{ text: 'D\'acord' }]);
      }
    } catch (error) {
      Alert.alert('Error de connexió', 'No s\'ha pogut connectar amb el servidor. Comprova la connexió.', [{ text: 'D\'acord' }]);
    } finally {
      setLoading(false);
    }
  };

  const filtersLabel = guideResult
    ? [selectedTime, selectedPeople, ...(selectedInterests.length > 0 ? selectedInterests : [])]
        .filter(Boolean)
        .join(' · ')
    : '';

  // ─────────────────────────────────────────
  // RENDER GUIA
  // ─────────────────────────────────────────
  const renderGuide = () => {
    if (!guideResult) return null;
    const { guide, place_name, photo_urls } = guideResult;

    return (
      <View style={styles.guideContainer}>
        {/* Capçalera */}
        <Text style={styles.guidePlaceName}>{place_name}</Text>
        {filtersLabel ? (
          <Text style={styles.guideFiltersLabel}>{filtersLabel}</Text>
        ) : null}

        {/* Slider fotos */}
        {photo_urls.length > 0 && (
          <View style={styles.photoContainer}>
            <Image
              source={{ uri: photo_urls[currentPhotoIndex] }}
              style={styles.photo}
              resizeMode="cover"
            />
            {photo_urls.length > 1 && (
              <View style={styles.photoDots}>
                {photo_urls.map((_, i) => (
                  <TouchableOpacity key={i} onPress={() => setCurrentPhotoIndex(i)}>
                    <View style={[styles.dot, i === currentPhotoIndex && styles.dotActive]} />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Descripció */}
        {guide.descripcio ? (
          <View style={styles.guideSection}>
            <Text style={styles.guideSectionTitle}>🏛 Descripció</Text>
            <Text style={styles.guideSectionText}>{guide.descripcio}</Text>
          </View>
        ) : null}


        {/* Clima */}
        {guide.clima ? (
          <View style={styles.guideSection}>
            <Text style={styles.guideSectionTitle}>🌤 Clima ara</Text>
            <Text style={styles.guideSectionText}>{guide.clima}</Text>
          </View>
        ) : null}

        {/* Info pràctica */}
        {guide.info_practica ? (
          <View style={styles.guideSection}>
            <Text style={styles.guideSectionTitle}>ℹ️ Info pràctica</Text>
            {guide.info_practica.horaris ? (
              <Text style={styles.guideInfoRow}>🕐 {guide.info_practica.horaris}</Text>
            ) : null}
            {guide.info_practica.adreca ? (
              <Text style={styles.guideInfoRow}>📌 {guide.info_practica.adreca}</Text>
            ) : null}
            {guide.info_practica.valoracio ? (
              <Text style={styles.guideInfoRow}>⭐ {guide.info_practica.valoracio}</Text>
            ) : null}
            {guide.info_practica.telefon ? (
              <Text style={styles.guideInfoRow}>📞 {guide.info_practica.telefon}</Text>
            ) : null}
            {guide.info_practica.web ? (
              <Text style={styles.guideInfoRow} numberOfLines={1}>🌐 {guide.info_practica.web}</Text>
            ) : null}
          </View>
        ) : null}

        {/* Llocs propers */}
        {guide.llocs_propers && guide.llocs_propers.length > 0 ? (
          <View style={styles.guideSection}>
            <Text style={styles.guideSectionTitle}>🗺 A prop</Text>
            {guide.llocs_propers.map((lloc, i) => (
              <View key={i} style={styles.nearbyItem}>
                <View style={styles.nearbyDot} />
                <Text style={styles.nearbyText}>
                  <Text style={styles.nearbyName}>{lloc.nom}</Text>
                  {lloc.tipus ? <Text style={styles.nearbyType}> · {lloc.tipus}</Text> : null}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* Consell */}
        {guide.consell ? (
          <View style={styles.consellContainer}>
            <Text style={styles.consellText}>💡 {guide.consell}</Text>
          </View>
        ) : null}
      </View>
    );
  };

  // ─────────────────────────────────────────
  // RENDER PRINCIPAL
  // ─────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <IconSymbol name="gearshape.circle.fill" size={30} color={Colors.dark.tabIconDefault} />
          <GlowText text="SwifTour" duration={2500} style={styles.title} />
          <TouchableOpacity onPress={() => router.push('profile-modal')}>
            <IconSymbol name="person.circle.fill" size={30} color={Colors.dark.tabIconDefault} />
          </TouchableOpacity>
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content} />

          {/* Títol i input */}
          <View style={styles.titleContainer}>
            <GradientIcon style={styles.icon} name="mappin.circle.fill" size={28} />
            <Text style={styles.title2}>Quin lloc vols descobrir?</Text>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Nom o link de Google Maps..."
              placeholderTextColor="#a5a5a5"
              value={inputValue}
              onChangeText={(text) => {
                setInputValue(text);
                if (guideResult) setGuideResult(null);
              }}
              editable={!loading}
              multiline
            />
          </View>

          {/* Filtres */}
          <View style={styles.filters}>
            <TouchableOpacity
              style={[styles.filterButton, selectedInterests.length > 0 && styles.filterButtonActive]}
              onPress={() => setFilterModalOpen('interests')}
            >
              <Text style={styles.textFilter}>Interessos</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterButton, selectedRadius && styles.filterButtonActive]}
              onPress={() => setFilterModalOpen('radius')}
            >
              <Text style={styles.textFilter}>Zona</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterButton, selectedTime && styles.filterButtonActive]}
              onPress={() => setFilterModalOpen('time')}
            >
              <Text style={styles.textFilter}>Temps</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterButton, selectedPeople && styles.filterButtonActive]}
              onPress={() => setFilterModalOpen('people')}
            >
              <Text style={styles.textFilter}>Persones</Text>
            </TouchableOpacity>
          </View>

          {/* Botó buscar */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.sendButton, !canSearch && styles.sendButtonDisabled]}
              onPress={handleSearch}
              disabled={!canSearch}
            >
              {loading ? (
                <ActivityIndicator size="small" color={Colors.middleSection} />
              ) : (
                <Text style={[styles.sendButtonText, !canSearch && styles.sendButtonTextDisabled]}>
                  Buscar →
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Lotties: només si no hi ha guia i no està carregant */}
          {!guideResult && !loading && (
            <View style={styles.lottieContainer}>
              <LottieView
                ref={animationRef}
                source={require('../../assets/images/travel loading.json')}
                loop={false}
                speed={2.5}
                onAnimationFinish={handleFinish}
                style={styles.lottieTop}
              />
              <LottieView
                source={require('../../assets/images/earth.json')}
                autoPlay
                loop
                style={styles.lottieBottom}
              />
            </View>
          )}

          {/* Indicador de càrrega */}
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.dark.tabIconDefault} />
              <Text style={styles.loadingText}>Generant la teva guia...</Text>
            </View>
          )}

          {/* Guia generada */}
          {renderGuide()}

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── MODALS ── */}

      <Modal visible={filterModalOpen === 'interests'} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Interessos</Text>
            {['Gastronomia', 'Natura i rutes', 'Història i cultura', 'Allotjament', 'Oci i compres'].map((option) => (
              <TouchableOpacity key={option} style={styles.radioOption} onPress={() => toggleInterest(option)}>
                <View style={[styles.checkBox, selectedInterests.includes(option) && styles.checkBoxSelected]}>
                  {selectedInterests.includes(option) && <Text style={styles.checkMark}>✓</Text>}
                </View>
                <Text style={styles.radioText}>{option}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.doneButton} onPress={() => setFilterModalOpen(null)}>
              <Text style={styles.doneButtonText}>Desa</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={filterModalOpen === 'radius'} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Zona</Text>
            {['500 m', '1 km', '2 km'].map((option) => (
              <TouchableOpacity key={option} style={styles.radioOption} onPress={() => { setSelectedRadius(option); setFilterModalOpen(null); }}>
                <View style={[styles.radioCircle, selectedRadius === option && styles.radioSelected]}>
                  {selectedRadius === option && <View style={styles.radioDot} />}
                </View>
                <Text style={styles.radioText}>{option}</Text>
              </TouchableOpacity>
            ))}
            
          </View>
        </View>
      </Modal>

      <Modal visible={filterModalOpen === 'time'} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Temps</Text>
            {['Indefinit', 'Unes hores', 'Mig dia', 'Tot el dia'].map((option) => (
              <TouchableOpacity key={option} style={styles.radioOption} onPress={() => { setSelectedTime(option); setFilterModalOpen(null); }}>
                <View style={[styles.radioCircle, selectedTime === option && styles.radioSelected]}>
                  {selectedTime === option && <View style={styles.radioDot} />}
                </View>
                <Text style={styles.radioText}>{option}</Text>
              </TouchableOpacity>
            ))}
            
          </View>
        </View>
      </Modal>

      <Modal visible={filterModalOpen === 'people'} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Persones</Text>
            {['Sol', 'Parella', 'Familia', 'Grup'].map((option) => (
              <TouchableOpacity key={option} style={styles.radioOption} onPress={() => { setSelectedPeople(option); setFilterModalOpen(null); }}>
                <View style={[styles.radioCircle, selectedPeople === option && styles.radioSelected]}>
                  {selectedPeople === option && <View style={styles.radioDot} />}
                </View>
                <Text style={styles.radioText}>{option}</Text>
              </TouchableOpacity>
            ))}
            
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────
const styles = StyleSheet.create({
  lottieContainer: {
    width: 225,
    height: 225,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  lottieTop: {
    position: 'absolute',
    width: 225,
    height: 225,
    opacity: 1,
  },
  lottieBottom: {
    position: 'absolute',
    width: 180,
    height: 180,
    opacity: 0.9,
  },
  icon: { width: 28, height: 28, marginBottom: 10 },
  content: {
    backgroundColor: Colors.middleSection,
    paddingTop: 16,
  },
  safeArea: { flex: 1, backgroundColor: '#1d1d1d' },
  container: { flex: 1, backgroundColor: '#1d1d1d' },
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
  title: { fontSize: 18, fontWeight: '700', color: '#ffffff' },
  title2: { fontSize: 18, fontWeight: '600', color: '#fff', marginBottom: 10 },
  titleContainer: {
    paddingTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 25,
    gap: 6,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.middleSection,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  loadingText: {
    color: '#a5a5a5',
    fontSize: 14,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.middleSection,
  },
  buttonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.middleSection,
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#606060',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 12,
    fontSize: 14,
    color: '#ffffff',
    backgroundColor: '#252525',
  },
  sendButton: {
    width: 110,
    height: 34,
    borderRadius: 20,
    backgroundColor: Colors.dark.tabIconDefault,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#2a2a2a',
  },
  sendButtonText: {
    fontSize: 13,
    color: Colors.middleSection,
    fontWeight: '600',
  },
  sendButtonTextDisabled: {
    color: '#444444',
  },
  filters: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    marginBottom: 10,
    paddingHorizontal: 6,
  },
  textFilter: { fontSize: 11, color: '#ffffff', fontWeight: '600' },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: Colors.dark.secondColor,
  },

  // ── Guia ──
  guideContainer: {
    marginTop: 20,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#2e2e2e',
    overflow: 'hidden',
    paddingBottom: 8,
  },
  guidePlaceName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 4,
  },
  guideFiltersLabel: {
    fontSize: 11,
    color: Colors.dark.secondColor,
    fontWeight: '600',
    paddingHorizontal: 18,
    paddingBottom: 12,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  photoContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
    marginBottom: 4,
  },
  photo: {
    width: '100%',
    height: 200,
  },
  photoDots: {
    position: 'absolute',
    bottom: 10,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  dotActive: {
    backgroundColor: '#ffffff',
  },
  guideSection: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 2,
  },
  guideSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.dark.tabIconDefault,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  guideSectionText: {
    fontSize: 14,
    color: '#d0d0d0',
    lineHeight: 21,
  },
  guideInfoRow: {
    fontSize: 13,
    color: '#b0b0b0',
    lineHeight: 22,
  },
  nearbyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    gap: 8,
  },
  nearbyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.dark.secondColor,
  },
  nearbyText: { flex: 1 },
  nearbyName: {
    fontSize: 13,
    color: '#e0e0e0',
    fontWeight: '600',
  },
  nearbyType: {
    fontSize: 12,
    color: '#888888',
  },
  consellContainer: {
    marginHorizontal: 18,
    marginTop: 16,
    marginBottom: 10,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#242424',
    borderLeftWidth: 3,
    borderLeftColor: Colors.dark.tabIconDefault,
  },
  consellText: {
    fontSize: 13,
    color: '#cccccc',
    lineHeight: 20,
    fontStyle: 'italic',
  },

  // ── Modals ──
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#242424',
    borderRadius: 20,
    borderColor: '#848484',
    borderWidth: 1,
    padding: 24,
    width: '85%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 20,
    textAlign: 'center',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.dark.secondColor,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: { backgroundColor: Colors.dark.secondColor },
  radioDot: { width: 12, height: 12, borderRadius: 6 },
  checkBox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.dark.secondColor,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkBoxSelected: { backgroundColor: Colors.dark.secondColor },
  checkMark: { color: '#ffffff', fontSize: 12, fontWeight: '700' },
  radioText: { fontSize: 14, color: '#ffffff', fontWeight: '500' },
  doneButton: {
    backgroundColor: Colors.dark.tabIconDefault,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 20,
    alignItems: 'center',
  },
  doneButtonText: { color: '#242424', fontSize: 14, fontWeight: '600' },
});