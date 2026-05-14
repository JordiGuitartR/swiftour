import GlowText from '@/components/ui/GlowText';
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

const ALL_INTERESTS = [
  'Context',
  'Natura',
  'Gastronomia',
  'Història',
  'Allotjament',
  'Oci',
];

const SECTION_ICONS: Record<string, string> = {
  'Natura': '🌿',
  'Gastronomia': '🍽',
  'Història': '🏛',
  'Allotjament': '🏨',
  'Oci': '🛍',
};

// ─── Tipus ────────────────────────────────────────────────────────────────────

interface Prediction {
  place_id: string;
  description: string;
  main_text: string;
  secondary_text: string;
}

interface PlaceRecommendation {
  nom: string;
  rating: number | null;
  descripcio: string;
  photo_urls: string[];
}

interface GuideData {
  descripcio?: string;
  context?: string;
  clima?: string;
  seccions?: Record<string, PlaceRecommendation[]>;
}

interface GuideResult {
  guide: GuideData;
  place_name: string;
  photo_urls: string[];
  usedInterests: string[];
}

// ─── Components auxiliars ─────────────────────────────────────────────────────

function StarRating({ rating }: { rating: number | null }) {
  if (!rating) return null;
  const full = Math.round(rating);
  return (
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Text key={i} style={[styles.star, i <= full ? styles.starFull : styles.starEmpty]}>
          ★
        </Text>
      ))}
      <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
    </View>
  );
}

function PhotoSlider({ photos }: { photos: string[] }) {
  const [index, setIndex] = useState(0);
  if (!photos || photos.length === 0) return null;
  return (
    <View style={styles.sliderContainer}>
      <Image source={{ uri: photos[index] }} style={styles.sliderPhoto} resizeMode="cover" />
      {photos.length > 1 && (
        <>
          <TouchableOpacity
            style={styles.arrowLeft}
            onPress={() => setIndex((i) => Math.max(0, i - 1))}
          >
            <Text style={styles.arrowText}>‹</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.arrowRight}
            onPress={() => setIndex((i) => Math.min(photos.length - 1, i + 1))}
          >
            <Text style={styles.arrowText}>›</Text>
          </TouchableOpacity>
          <View style={styles.photoDots}>
            {photos.map((_, i) => (
              <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
            ))}
          </View>
        </>
      )}
    </View>
  );
}

// ─── Pantalla principal ───────────────────────────────────────────────────────

export default function HomeScreen() {
  const router = useRouter();

  // Input + autocomplete
  const [inputValue, setInputValue] = useState('');
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Filtres
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  // Resultat
  const [loading, setLoading] = useState(false);
  const [guideResult, setGuideResult] = useState<GuideResult | null>(null);
  const [mainPhotoIndex, setMainPhotoIndex] = useState(0);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  const scrollViewRef = useRef<ScrollView>(null);
  const animationRef = useRef<LottieView>(null);
  const directionRef = useRef(1);

  const isGuiaCompleta = ALL_INTERESTS.every((i) => selectedInterests.includes(i));

  const canSearch = inputValue.trim().length > 0 && selectedInterests.length > 0 && !loading;

  // Lottie ping-pong
  const handleAnimationFinish = () => {
    directionRef.current *= -1;
    if (animationRef.current) {
      if (directionRef.current === 1) animationRef.current.play(0, 180);
      else animationRef.current.play(180, 0);
    }
  };

  useEffect(() => {
    animationRef.current?.play(0, 180);
  }, []);

  // ── Autocomplete ────────────────────────────────────────────────────────────

  const fetchPredictions = (text: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (text.length < 2) {
      setPredictions([]);
      setShowDropdown(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/autocomplete?input=${encodeURIComponent(text)}`
        );
        const data = await res.json();
        const preds: Prediction[] = data.predictions || [];
        setPredictions(preds);
        setShowDropdown(preds.length > 0);
      } catch {
        setPredictions([]);
        setShowDropdown(false);
      }
    }, 300);
  };

  const handleInputChange = (text: string) => {
    setInputValue(text);
    setSelectedPlaceId(null);
    if (guideResult) setGuideResult(null);
    fetchPredictions(text);
  };

  const handleSelectPrediction = (pred: Prediction) => {
    setInputValue(pred.description);
    setSelectedPlaceId(pred.place_id);
    setPredictions([]);
    setShowDropdown(false);
  };

  // ── Filtres ─────────────────────────────────────────────────────────────────

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  // ── Toggle seccions ─────────────────────────────────────────────────────────

  const toggleSection = (interest: string) => {
    setCollapsedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(interest)) {
        newSet.delete(interest);
      } else {
        newSet.add(interest);
      }
      return newSet;
    });
  };

  // ── Cerca ───────────────────────────────────────────────────────────────────

  const handleSearch = async () => {
    if (!inputValue.trim() || selectedInterests.length === 0) return;

    setLoading(true);
    setGuideResult(null);
    setMainPhotoIndex(0);
    setShowDropdown(false);

    try {
      const hasContext = selectedInterests.includes('Context');
      const interestsWithoutContext = selectedInterests.filter((i) => i !== 'Context');

      const body: Record<string, unknown> = {
        filters: { interests: interestsWithoutContext, context: hasContext },
      };
      if (selectedPlaceId) {
        body.place_id = selectedPlaceId;
        body.place_input = '';
      } else {
        body.place_input = inputValue.trim();
      }

      const response = await fetch(`${API_BASE_URL}/guide`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.success) {
        setGuideResult({
          guide: data.guide,
          place_name: data.place_name,
          photo_urls: data.photo_urls || [],
          usedInterests: [...selectedInterests],
        });
        // Inicialitzar totes les seccions com a col·lapsades
        setCollapsedSections(new Set(Object.keys(data.guide.seccions || {})));
      } else {
        Alert.alert('Error', data.error || 'Hi ha hagut un error inesperat.', [
          { text: "D'acord" },
        ]);
      }
    } catch {
      Alert.alert('Error de connexió', "No s'ha pogut connectar amb el servidor.", [
        { text: "D'acord" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // ── Renderitzar guia ────────────────────────────────────────────────────────

  const renderGuide = () => {
    if (!guideResult) return null;
    const { guide, place_name, photo_urls, usedInterests } = guideResult;

    const wasGuiaCompleta = ALL_INTERESTS.every((i) => usedInterests.includes(i));
    const filtersLabel = wasGuiaCompleta ? 'GUIA COMPLETA' : usedInterests.join(' · ').toUpperCase();

    return (
      <View style={styles.guideContainer}>
        {/* Títol + badge */}
        <Text style={styles.guidePlaceName}>{place_name}</Text>
        <Text style={[styles.guideFiltersLabel, wasGuiaCompleta && styles.guiaCompletaLabel]}>
          {filtersLabel}
        </Text>

        {/* Slider principal */}
        {photo_urls.length > 0 && (
          <View style={styles.mainSliderContainer}>
            <Image
              source={{ uri: photo_urls[mainPhotoIndex] }}
              style={styles.mainPhoto}
              resizeMode="cover"
            />
            {photo_urls.length > 1 && (
              <>
                <TouchableOpacity
                  style={styles.arrowLeft}
                  onPress={() => setMainPhotoIndex((i) => Math.max(0, i - 1))}
                >
                  <Text style={styles.arrowText}>‹</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.arrowRight}
                  onPress={() =>
                    setMainPhotoIndex((i) => Math.min(photo_urls.length - 1, i + 1))
                  }
                >
                  <Text style={styles.arrowText}>›</Text>
                </TouchableOpacity>
                <View style={styles.photoDots}>
                  {photo_urls.map((_, i) => (
                    <View
                      key={i}
                      style={[styles.dot, i === mainPhotoIndex && styles.dotActive]}
                    />
                  ))}
                </View>
              </>
            )}
          </View>
        )}

        {/* Descripció i Context */}
        {usedInterests.includes('Context') && (
          <>
            {guide.descripcio ? (
              <View style={styles.guideSection}>
                <Text style={styles.guideSectionTitle}>📍 Descripció</Text>
                <Text style={styles.guideSectionText}>{guide.descripcio}</Text>
              </View>
            ) : null}

            {guide.context ? (
              <View style={styles.guideSection}>
                <Text style={styles.guideSectionTitle}>🏛 Context</Text>
                <Text style={styles.guideSectionText}>{guide.context}</Text>
              </View>
            ) : null}
          </>
        )}

        {/* Clima */}
        {guide.clima ? (
          <View style={styles.climaContainer}>
            <Text style={styles.climaText}>🌤 {guide.clima}</Text>
          </View>
        ) : null}

        
        {/* Seccions per interès */}
        {guide.seccions &&
          ALL_INTERESTS
            .filter((interest) => interest !== 'Context')
            .filter((interest) => guide.seccions?.[interest]?.length)
            .map((interest) => {
              const places = guide.seccions?.[interest] ?? [];
              const isCollapsed = collapsedSections.has(interest);

              return (
                <View key={interest} style={styles.seccioContainer}>
                  <TouchableOpacity
                    style={styles.seccioHeader}
                    onPress={() => toggleSection(interest)}
                  >
                    <Text style={styles.seccioIcon}>{SECTION_ICONS[interest] ?? '📌'}</Text>
                    <Text style={styles.seccioTitle}>{interest}</Text>
                    <Text style={styles.seccioArrow}>{isCollapsed ? '▼' : '▲'}</Text>
                  </TouchableOpacity>

                  {!isCollapsed && places.map((lloc, idx) => (
                    <View key={idx} style={styles.llocCard}>
                      <View style={styles.llocHeader}>
                        <Text style={styles.llocNom}>{lloc.nom}</Text>
                        <StarRating rating={lloc.rating} />
                      </View>

                      <PhotoSlider photos={lloc.photo_urls} />

                      {lloc.descripcio ? (
                        <Text style={styles.llocDescripcio}>{lloc.descripcio}</Text>
                      ) : null}
                    </View>
                  ))}
                </View>
              );
            })}
      </View>
    );
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <IconSymbol name="gearshape.circle.fill" size={30} color={Colors.dark.tabIconDefault} />
          <TouchableOpacity onPress={() => scrollViewRef.current?.scrollTo({ y: 0, animated: true })}>
            <GlowText text="SwifTour" duration={2500} style={styles.headerTitle} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('profile-modal')}>
            <IconSymbol name="person.circle.fill" size={30} color={Colors.dark.tabIconDefault} />
          </TouchableOpacity>
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          keyboardShouldPersistTaps="handled"
        >
          {/* Subtítol */}
          <View style={styles.titleContainer}>
            <IconSymbol
              style={styles.pinIcon}
              color={Colors.dark.secondColor}
              name="mappin.circle.fill"
              size={28}
            />
            <Text style={styles.subtitle}>Quin lloc vols descobrir?</Text>
          </View>

          {/* Input + dropdown autocomplete */}
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Nom del lloc o link de Google Maps..."
              placeholderTextColor="#a5a5a5"
              value={inputValue}
              onChangeText={handleInputChange}
              editable={!loading}
              returnKeyType="search"
              onSubmitEditing={handleSearch}
            />
            {showDropdown && (
              <View style={styles.dropdown}>
                {predictions.map((pred) => (
                  <TouchableOpacity
                    key={pred.place_id}
                    style={styles.dropdownItem}
                    onPress={() => handleSelectPrediction(pred)}
                  >
                    <Text style={styles.dropdownMain}>{pred.main_text}</Text>
                    {pred.secondary_text ? (
                      <Text style={styles.dropdownSec}>{pred.secondary_text}</Text>
                    ) : null}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Filtres d'interès */}
          <View style={styles.filters}>
            {ALL_INTERESTS.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.filterButton,
                  selectedInterests.includes(option) && styles.filterButtonActive,
                ]}
                onPress={() => toggleInterest(option)}
              >
                <Text style={styles.filterText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Botó */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.sendButton, !canSearch && styles.sendButtonDisabled]}
              onPress={handleSearch}
              disabled={!canSearch}
            >
              <Text
                style={[styles.sendButtonText, !canSearch && styles.sendButtonTextDisabled]}
              >
                Buscar →
              </Text>
            </TouchableOpacity>
          </View>

          {/* Loading fora del botó */}
          {loading && (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>GENERANT LA TEVA GUIA</Text>
              <Text style={styles.loadingText2}>Pot tardar una estona...</Text>
              <ActivityIndicator
                size="large"
                color={Colors.dark.tabIconDefault}
                style={{ marginTop: 10 }}
              />
            </View>
          )}

          {/* Animació inicial */}
          {!guideResult && !loading && (
            <View style={styles.lottieContainer}>
              <LottieView
                ref={animationRef}
                source={require('../../assets/images/travel loading.json')}
                loop={false}
                speed={2.5}
                onAnimationFinish={handleAnimationFinish}
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

          {/* Guia generada */}
          {renderGuide()}

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Estils ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#1d1d1d' },
  container: { flex: 1, backgroundColor: '#1d1d1d' },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 6,
    paddingBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#ffffff' },

  scrollView: { flex: 1, paddingHorizontal: 16, backgroundColor: Colors.middleSection },

  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
    marginTop: 30,
    marginBottom: 12,
    gap: 6,
  },
  pinIcon: { width: 28, height: 28, backgroundColor: 'white', borderRadius: 20 },
  subtitle: { fontSize: 15, fontWeight: '800', color: '#fff', letterSpacing: 0.6, textTransform: 'uppercase', },

  // Input + dropdown
  inputWrapper: { marginHorizontal: 4, marginBottom: 4, zIndex: 10 },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: '#606060',
    borderRadius: 22,
    paddingHorizontal: 18,
    fontSize: 14,
    color: '#ffffff',
    backgroundColor: '#252525',
  },
  dropdown: {
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 12,
    marginTop: 4,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  dropdownMain: { fontSize: 14, color: '#ffffff', fontWeight: '600' },
  dropdownSec: { fontSize: 12, color: '#888888', marginTop: 1 },

  // Filtres
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 14,
    marginBottom: 14,
    paddingHorizontal: 4,

  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#333333',
  },
  filterButtonActive: { backgroundColor: Colors.dark.secondColor },

  filterText: { fontSize: 11, color: '#ffffff', fontWeight: '700', letterSpacing: 0.4 },

  // Botó
  buttonRow: { alignItems: 'center', marginBottom: 4 },
  sendButton: {
    width: 120,
    height: 32,
    borderRadius: 20,
    backgroundColor: Colors.dark.tabIconDefault,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  sendButtonDisabled: { backgroundColor: '#2a2a2a' },
  sendButtonText: { fontSize: 14, color: Colors.middleSection, fontWeight: '800', letterSpacing: 0.5 },
  sendButtonTextDisabled: { color: Colors.middleSection },

  // Loading
  loadingContainer: { alignItems: 'center', paddingVertical: 28 },
  loadingText: { color: '#929292', fontSize: 14, fontWeight: '700', letterSpacing: 0.8, marginBottom: 10, },
  loadingText2: { color: '#929292', fontSize: 14, fontWeight: '400', letterSpacing: 0.8, marginBottom: 10 },


  // Lottie
  lottieContainer: {
    width: 175,
    height: 175,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  lottieTop: { position: 'absolute', width: 220, height: 220 },
  lottieBottom: { position: 'absolute', width: 180, height: 180, opacity: 0.9 },

  // Guia
  guideContainer: {
    marginTop: 20,
    marginHorizontal: 0,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#2e2e2e',
    overflow: 'hidden',
    paddingBottom: 16,
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
    fontWeight: '700',
    paddingHorizontal: 18,
    paddingBottom: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  guiaCompletaLabel: { color: '#FFD700' },

  mainSliderContainer: { width: '100%', height: 220, position: 'relative', marginBottom: 4 },
  mainPhoto: { width: '100%', height: 220 },

  arrowLeft: {
    position: 'absolute',
    left: 8,
    top: '35%',
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingBottom: 3,
  },
  arrowRight: {
    position: 'absolute',
    right: 8,
    top: '35%',
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingBottom: 3,
  },
  arrowText: { color: '#fff', fontSize: 24, fontWeight: '700' },

  photoDots: {
    position: 'absolute',
    bottom: 8,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.35)' },
  dotActive: { backgroundColor: '#ffffff' },

  guideSection: { paddingHorizontal: 18, paddingTop: 16, paddingBottom: 4 },
  guideSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.dark.tabIconDefault,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  guideSectionText: { fontSize: 14, color: '#d0d0d0', lineHeight: 21 },

  climaContainer: {
    marginHorizontal: 18,
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#242424',
    borderRadius: 10,
  },
  climaText: { fontSize: 13, color: '#b0b0b0' },

  seccioContainer: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.tint,
    paddingTop: 16,
  },
  seccioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    marginBottom: 0,
  },
  seccioIcon: { fontSize: 18 },
  seccioTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    flex: 1,
  },
  seccioArrow: {
    fontSize: 16,
    color: Colors.dark.tabIconDefault,
    fontWeight: '700',
  },

  llocCard: {
    marginHorizontal: 12,
    
    marginTop: 14,
    borderRadius: 14,
    backgroundColor: '#222222',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2e2e2e',
  },
  llocHeader: { paddingHorizontal: 14, paddingTop: 12, paddingBottom: 6, gap: 4 },
  llocNom: { fontSize: 15, fontWeight: '700', color: '#ffffff' },
  starsRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 2 },
  star: { fontSize: 13 },
  starFull: { color: '#FFD700' },
  starEmpty: { color: '#3a3a3a' },
  ratingText: { fontSize: 12, color: '#888888', marginLeft: 4 },

  sliderContainer: { width: '100%', height: 160, position: 'relative' },
  sliderPhoto: { width: '100%', height: 160 },

  llocDescripcio: {
    fontSize: 13,
    color: '#c0c0c0',
    lineHeight: 20,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 12,
  },
});
