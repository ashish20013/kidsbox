import React, {
  useMemo,
  useState,
  useRef,
  useEffect,
  useCallback,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ImageBackground,
  StatusBar,
  Animated,
  Share,
  Modal,
  TouchableOpacity,
  Dimensions,
  Image,
  Linking,
  Easing,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
// import LinearGradient from '../react-native-linear-gradient';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

// ✅ Common Legal Links
const LEGAL_LINKS = [
  { label: 'About Us', url: 'https://ashish20013.github.io/images/about.html' },
  {
    label: 'Privacy Policy',
    url: 'https://ashish20013.github.io/images/privacy-policy.html',
  },
  {
    label: 'Terms & Conditions',
    url: 'https://ashish20013.github.io/images/terms-of-use.html',
  },
  {
    label: 'Cookie Policy',
    url: 'https://ashish20013.github.io/images/cookie-policy.html',
  },
  {
    label: 'Parental Guidance',
    url: 'https://ashish20013.github.io/images/parental-guidance.html',
  },
  {
    label: 'Disclaimer',
    url: 'https://ashish20013.github.io/images/disclaimer.html',
  },
  {
    label: 'Contact Us',
    url: 'https://ashish20013.github.io/images/contact.html',
  },
];

// ✅ Game data
const GAMES = [
  {
    id: 'money',
    name: 'Money Counter Game',
    subtitle: 'Learn to count 💵',
    screen: 'MoneyCounter',
    image: require('../../assets/games/moneycounter.png'),
  },
  {
    id: 'math',
    name: 'Math Games',
    subtitle: 'Puzzle • Quiz • Fun',
    screen: 'MathGameHub',
    image: require('../../assets/games/math.png'),
  },
  {
    id: 'memory',
    name: 'Memory Match Game',
    subtitle: 'Classic • All Ages',
    screen: 'MemoryMatch',
    image: require('../../assets/games/memory.png'),
  },
  {
    id: 'tap',
    name: 'Color Tap Game',
    subtitle: 'Reflex • Focus • Fun',
    screen: 'TapTheColor',
    image: require('../../assets/games/tap.png'),
  },
];

// ================= Header Component =================

const Header = ({ onMenuPress }) => {
  const laserAnim = useRef(new Animated.Value(-200)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(laserAnim, {
          toValue: 200,
          duration: 1600,
          useNativeDriver: true,
        }),
        Animated.timing(laserAnim, {
          toValue: -200,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [laserAnim]);

  return (
    <View style={styles.headerInner}>
      <Image
        source={require('../../assets/games/logo.png')}
        style={styles.gameIcon}
      />

      <View style={styles.titleWrapper}>
        <Text style={styles.title}>KidsBox</Text>

        {/* Moving laser line */}
        <Animated.View
          style={[styles.laserLine, { transform: [{ translateX: laserAnim }] }]}
        >
          <LinearGradient
            colors={['transparent', '#00eaff', '#ff00c8', 'transparent']}
            style={styles.laserGradient}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
          />
        </Animated.View>
      </View>

      <Pressable onPress={onMenuPress} style={styles.menuBtn}>
        <View style={styles.bar} />
        <View style={styles.bar} />
        <View style={styles.bar} />
      </Pressable>
    </View>
  );
};

// ================= Menu Component =================
const HeaderMenu = ({ visible, onClose, onShare, onSettings }) => {
  const openLink = url => {
    onClose();
    Linking.openURL(url);
  };

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.menuBackdrop} onPress={onClose} />
      <View style={styles.menuSheet}>
        <TouchableOpacity style={styles.menuItem} onPress={onShare}>
          <Text style={styles.menuText}>📤 Share App</Text>
        </TouchableOpacity>

        {LEGAL_LINKS.map(link => (
          <TouchableOpacity
            key={link.label}
            style={styles.menuItem}
            onPress={() => openLink(link.url)}
          >
            <Text style={styles.menuText}>{link.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </Modal>
  );
};

// ================= GameCard Component =================
const GameCard = React.memo(({ item, onPress, index }) => {
  const baseScale = useRef(new Animated.Value(1)).current;
  const pressScale = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(30)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(-1)).current;

  const getGlowColors = id => {
    switch (id) {
      case 'money':
        return [
          '#FF0000',
          '#FF7F00',
          '#FFFF00',
          '#00FF00',
          '#00FFFF',
          '#0000FF',
          '#8B00FF',
        ];
      case 'math':
        return ['#8B00FF', '#FF0000', '#FF7F00', '#FF0000', '#00FFFF'];
      case 'memory':
        return ['#00FF7F', '#0000FF', '#00FF7F'];
      case 'tap':
        return [
          '#FF0000',
          '#FF7F00',
          '#FFFF00',
          '#00FF00',
          '#00FFFF',
          '#0000FF',
          '#8B00FF',
        ];
      default:
        return ['#5862e3', '#00f0ff'];
    }
  };

  useEffect(() => {
    const delay = index * 150;

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 600,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        tension: 70,
        friction: 8,
        delay,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(baseScale, {
          toValue: 1.05,
          duration: 4000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(baseScale, {
          toValue: 0.95,
          duration: 4000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
    ).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(pressScale, {
      toValue: 1.05,
      useNativeDriver: true,
    }).start();
  };
  const handlePressOut = () => {
    Animated.spring(pressScale, { toValue: 1, useNativeDriver: true }).start();
  };

  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: [-width, width],
  });
  const finalScale = Animated.multiply(baseScale, pressScale);

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        { transform: [{ scale: finalScale }, { translateY }], opacity },
      ]}
    >
      <AnimatedLinearGradient
        colors={getGlowColors(item.id)}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.glowBorder}
      >
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={styles.cardInner}
        >
          <ImageBackground
            source={item.image}
            style={styles.cardImage}
            imageStyle={{ borderRadius: 16, resizeMode: 'cover' }}
          >
            <View style={styles.textWrapper}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
            </View>
            <Animated.View
              style={[
                styles.shimmer,
                { transform: [{ translateX: shimmerTranslate }] },
              ]}
            />
          </ImageBackground>
        </Pressable>
      </AnimatedLinearGradient>
    </Animated.View>
  );
});

// ================= HomeScreen =================
export default function HomeScreen() {
  const navigation = useNavigation();
  const [menuVisible, setMenuVisible] = useState(false);
  const data = useMemo(() => GAMES, []);

  const onShare = async () => {
    setMenuVisible(false);
    try {
      await Share.share({
        message:
          "I'm playing KidsBox! Try it: https://play.google.com/store/apps/details?id=com.kidsbox",
      });
    } catch {}
  };

  const onSettings = () => {
    setMenuVisible(false);
    Linking.openURL('https://ashish20013.github.io/images/contact.html');
  };

  const renderItem = useCallback(
    ({ item, index }) => (
      <GameCard
        item={item}
        index={index}
        onPress={() => navigation.navigate(item.screen)}
      />
    ),
    [],
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <LinearGradient
        colors={['#000', '#0f2027', '#2c5364']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Fixed Header */}
      <View style={styles.fixedHeader}>
        <Header onMenuPress={() => setMenuVisible(true)} />
      </View>

      {/* Game List */}
      <FlatList
        data={data}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />

      {/* Menu */}
      <HeaderMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onShare={onShare}
        onSettings={onSettings}
      />

      {/* Fixed Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          © 2025 KidsBox Developed by Ashish Yadav. All Rights Reserved.
        </Text>
      </View>
    </SafeAreaView>
  );
}

// ================= Styles =================
const styles = StyleSheet.create({
  bar: {
    backgroundColor: '#00eaff',
    borderRadius: 2,
    height: 3,
    marginVertical: 2,
    width: 25,
  },
  bar: { backgroundColor: '#FFD700', borderRadius: 1.5, height: 3 },
  cardImage: { height: 200, justifyContent: 'flex-end', width: '100%' },

  cardInner: {
    backgroundColor: 'rgba(20,20,30,0.9)',
    borderRadius: 16,
    elevation: 12,
    overflow: 'hidden',
    width: width - 24,
  },
  cardSubtitle: { color: '#fff', fontSize: 12, marginTop: 2 },
  cardTitle: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: '800',
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  cardWrapper: { alignItems: 'center', marginBottom: 0, marginTop: 20 },
  container: { backgroundColor: 'transparent', flex: 1 },
  fixedHeader: {
    backgroundColor: '#8A2BE2',
    borderRadius: 16,
    elevation: 8,
    left: 10,
    overflow: 'hidden',
    position: 'absolute',
    right: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    top: 45,
    zIndex: 100,
  },
  footer: {
    alignItems: 'center',
    backgroundColor: '#909090ff',
    bottom: 0,
    elevation: 8,
    paddingVertical: 1,
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    width: '100%',
    zIndex: 1000,
  },
  footerText: {
    color: '#706e6eff',
    fontSize: 8,
    fontWeight: '600',
    textAlign: 'center',
  },

  gameIcon: { height: 38, resizeMode: 'contain', width: 38 },
  gameIcon: {
    height: 45,
    resizeMode: 'contain',
    width: 45,
  },
  glowBorder: {
    borderRadius: 18,
    padding: 3,
    shadowColor: '#fff',
    shadowOpacity: 0.6,
    shadowRadius: 20,
  },
  headerInner: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: 0,
  },
  laserGradient: {
    borderRadius: 2,
    flex: 1,
  },
  laserLine: {
    height: 3,
    opacity: 0.9,
    position: 'absolute',
    top: '50%',
    width: 200,
  },
  listContent: { paddingBottom: 60, paddingHorizontal: 12, paddingTop: 50 },
  menuBackdrop: { backgroundColor: 'rgba(0,0,0,0.4)', flex: 1 },
  menuBtn: {
    padding: 10,
  },
  menuBtn: { height: 22, justifyContent: 'space-between', width: 30 },
  menuItem: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  menuSheet: {
    backgroundColor: '#1a1d2b',
    borderColor: '#2a2f55',
    borderRadius: 12,
    borderWidth: 1,
    elevation: 10,
    paddingVertical: 6,
    position: 'absolute',
    right: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    top: 70,
    width: 220,
  },
  menuText: { color: '#fff', fontWeight: '600' },
  textWrapper: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  title: {
    color: '#00eaff',
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 2,
    textShadowColor: '#00ffff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  titleWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
});
