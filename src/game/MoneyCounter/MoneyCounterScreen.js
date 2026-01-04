// // MoneyCounterScreen.js
// import React, { useState, useRef, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   Image,
//   ScrollView,
//   TouchableOpacity,
//   Dimensions,
//   Animated,
//   PanResponder,
// } from 'react-native';
// import Sound from 'react-native-sound';
// // import Sound from 'react-native-sound-media';

// import ConfettiCannon from 'react-native-confetti-cannon';
// import LinearGradient from 'react-native-linear-gradient';

// const { width, height } = Dimensions.get('window');

// /* ----------------- Currency Pools ----------------- */
// const INR_POOL = [
//   {
//     id: '₹1',
//     value: 1,
//     image: require('../../../assets/money/indian/1inr.jpg'),
//   },
//   {
//     id: '₹2',
//     value: 2,
//     image: require('../../../assets/money/indian/2inr.jpg'),
//   },
//   {
//     id: '₹5',
//     value: 5,
//     image: require('../../../assets/money/indian/5inr.jpg'),
//   },
//   {
//     id: '₹10',
//     value: 10,
//     image: require('../../../assets/money/indian/10inr.jpg'),
//   },
//   {
//     id: '₹50',
//     value: 50,
//     image: require('../../../assets/money/indian/50inr.webp'),
//   },
//   {
//     id: '₹100',
//     value: 100,
//     image: require('../../../assets/money/indian/100inr.jpg'),
//   },
//   {
//     id: '₹500',
//     value: 500,
//     image: require('../../../assets/money/indian/500inr.jpg'),
//   },
//   {
//     id: '₹1000',
//     value: 1000,
//     image: require('../../../assets/money/indian/1000inr.jpg'),
//   },
//   {
//     id: '₹2000',
//     value: 2000,
//     image: require('../../../assets/money/indian/2000inr.jpg'),
//   },
// ];

// const USD_POOL = [
//   { id: '$1', value: 1, image: require('../../../assets/money/us/1dolor.jpg') },
//   { id: '$2', value: 2, image: require('../../../assets/money/us/2dolor.jpg') },
//   {
//     id: '$10',
//     value: 10,
//     image: require('../../../assets/money/us/10dolor.jpg'),
//   },
//   {
//     id: '$20',
//     value: 20,
//     image: require('../../../assets/money/us/20dolor.jpg'),
//   },
//   {
//     id: '$50',
//     value: 50,
//     image: require('../../../assets/money/us/50dolor.jpg'),
//   },
//   {
//     id: '$100',
//     value: 100,
//     image: require('../../../assets/money/us/100dolor.jpg'),
//   },
//   {
//     id: '$500',
//     value: 500,
//     image: require('../../../assets/money/us/500dolor.jpg'),
//   },
//   {
//     id: '$1000',
//     value: 1000,
//     image: require('../../../assets/money/us/1000dolor.jpg'),
//   },
//   {
//     id: '$10000',
//     value: 10000,
//     image: require('../../../assets/money/us/10000dolor.jpg'),
//   },
// ];

// /* ----------------- Sound Hook ----------------- */
// Sound.setCategory('Ambient', true);
// const useSfx = () => {
//   const coinRef = useRef(null);
//   const buzzerRef = useRef(null);

//   useEffect(() => {
//     coinRef.current = new Sound('coin.mp3', Sound.MAIN_BUNDLE);
//     buzzerRef.current = new Sound('buzzer.mp3', Sound.MAIN_BUNDLE);
//     return () => {
//       coinRef.current?.release();
//       buzzerRef.current?.release();
//     };
//   }, []);

//   return {
//     playCoin: () => coinRef.current?.stop(() => coinRef.current?.play()),
//     playBuzzer: () => buzzerRef.current?.stop(() => buzzerRef.current?.play()),
//   };
// };

// /* ----------------- Draggable Note ----------------- */
// function DraggableNote({ note, onDrop, dropZoneY }) {
//   const pan = useRef(new Animated.ValueXY()).current;

//   const tiltX = pan.y.interpolate({
//     inputRange: [-120, 0, 120],
//     outputRange: ['8deg', '0deg', '-8deg'],
//     extrapolate: 'clamp',
//   });
//   const tiltY = pan.x.interpolate({
//     inputRange: [-120, 0, 120],
//     outputRange: ['-10deg', '0deg', '10deg'],
//     extrapolate: 'clamp',
//   });

//   const panResponder = useRef(
//     PanResponder.create({
//       onStartShouldSetPanResponder: () => true,
//       onPanResponderMove: (_, gesture) =>
//         pan.setValue({ x: gesture.dx, y: gesture.dy }),
//       onPanResponderRelease: (_, gesture) => {
//         if (gesture.moveY > dropZoneY.current) {
//           onDrop(note);
//         }
//         Animated.spring(pan, {
//           toValue: { x: 0, y: 0 },
//           useNativeDriver: false,
//           bounciness: 10,
//         }).start();
//       },
//     }),
//   ).current;

//   return (
//     <Animated.View
//       style={[
//         styles.note,
//         {
//           transform: [
//             ...pan.getTranslateTransform(),
//             { rotateX: tiltX },
//             { rotateY: tiltY },
//             { perspective: 800 },
//           ],
//         },
//       ]}
//       {...panResponder.panHandlers}
//     >
//       <View style={styles.noteGlow} />
//       <Image source={note.image} style={styles.imageBig} />
//       <Text style={styles.noteText}>{note.id}</Text>
//     </Animated.View>
//   );
// }

// /* ----------------- Main Screen ----------------- */
// export default function MoneyCounterScreen() {
//   const [screen, setScreen] = useState('home');
//   const [target, setTarget] = useState(0);
//   const [total, setTotal] = useState(0);
//   const [droppedNotes, setDroppedNotes] = useState([]);
//   const [timerRunning, setTimerRunning] = useState(false);
//   const [elapsedTime, setElapsedTime] = useState(0);
//   const [showConfetti, setShowConfetti] = useState(false);

//   const dropZoneY = useRef(0);
//   const scrollRef = useRef();
//   const { playCoin, playBuzzer } = useSfx();

//   useEffect(() => {
//     let interval;
//     if (timerRunning) {
//       interval = setInterval(() => setElapsedTime(t => t + 1), 1000);
//     }
//     return () => clearInterval(interval);
//   }, [timerRunning]);

//   const setupRound = type => {
//     setDroppedNotes([]);
//     setTotal(0);
//     setElapsedTime(0);
//     const baseTargets =
//       type === 'INR'
//         ? [10, 111, 151, 323, 854, 50, 100, 150, 500, 1000, 10000]
//         : [10, 20, 30, 111, 151, 323, 854, 50, 100, 150, 500, 1000];
//     setTarget(baseTargets[Math.floor(Math.random() * baseTargets.length)]);
//     setTimerRunning(true);
//   };

//   const startGame = type => {
//     setScreen(type);
//     setupRound(type);
//   };

//   const resetRound = () => setupRound(screen);

//   const backToHome = () => {
//     setTimerRunning(false);
//     setScreen('home');
//   };

//   const handleDrop = note => {
//     setDroppedNotes(prev => [...prev, note]);
//     setTotal(prev => {
//       const newTotal = prev + note.value;
//       playCoin();
//       if (newTotal === target) {
//         setShowConfetti(true);
//         setTimerRunning(false);
//         setTimeout(() => {
//           setShowConfetti(false);
//           resetRound();
//         }, 1500);
//       } else if (newTotal > target) {
//         playBuzzer();
//         resetRound();
//       }
//       return newTotal;
//     });
//   };

//   const smoothScrollBy = (dx = 150, duration = 500) => {
//     if (!scrollRef.current) {
//       return;
//     }
//     const startX = scrollRef.current._scrollPos || 0;
//     const startTime = Date.now();

//     const animate = () => {
//       const now = Date.now();
//       const elapsed = now - startTime;
//       const progress = Math.min(elapsed / duration, 1);
//       const ease = 0.5 - Math.cos(progress * Math.PI) / 2;
//       const x = startX + dx * ease;
//       scrollRef.current.scrollTo({ x, animated: false });
//       if (progress < 1) {
//         requestAnimationFrame(animate);
//       } else {
//         scrollRef.current._scrollPos = startX + dx;
//       }
//     };
//     animate();
//   };

//   const scrollLeft = () => smoothScrollBy(-150, 500);
//   const scrollRight = () => smoothScrollBy(150, 500);

//   if (screen === 'home') {
//     return (
//       <LinearGradient
//         colors={['#0f1220', '#1a1f3b', '#241b4d']}
//         style={styles.container}
//       >
//         <Text style={styles.gameTitle}>🕹️ Money Counter</Text>
//         <View style={styles.choiceColumn}>
//           <TouchableOpacity
//             style={styles.bigButton}
//             onPress={() => startGame('INR')}
//           >
//             <Image
//               source={require('../../../assets/money/indian/1000inr.jpg')}
//               style={styles.fullImage}
//             />
//             <Text style={styles.bigButtonText}>🇮🇳 INR Counter</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={styles.bigButton}
//             onPress={() => startGame('USD')}
//           >
//             <Image
//               source={require('../../../assets/money/us/100dolor.jpg')}
//               style={styles.fullImage}
//             />
//             <Text style={styles.bigButtonText}>💵 USD Counter</Text>
//           </TouchableOpacity>
//         </View>
//       </LinearGradient>
//     );
//   }

//   return (
//     <LinearGradient
//       colors={['#0f1220', '#1a1f3b', '#1b1a2b']}
//       style={styles.container}
//     >
//       <View style={styles.targetContainer}>
//         <Text style={styles.subtitle}>🎯 Target: {target}</Text>
//         <Text style={styles.subtitle}>🧮 Total: {total}</Text>
//         <Text style={styles.subtitle}>⏱️ Duration: {elapsedTime}s</Text>
//       </View>

//       <ScrollView
//         ref={scrollRef}
//         horizontal
//         showsHorizontalScrollIndicator={false}
//         style={styles.notesScroll}
//         contentContainerStyle={styles.notesScrollContent}
//         onScroll={e =>
//           (scrollRef.current._scrollPos = e.nativeEvent.contentOffset.x)
//         }
//         scrollEventThrottle={16}
//       >
//         {(screen === 'INR' ? INR_POOL : USD_POOL).map(note => (
//           <DraggableNote
//             key={note.id}
//             note={note}
//             onDrop={handleDrop}
//             dropZoneY={dropZoneY}
//           />
//         ))}
//       </ScrollView>

//       <View style={styles.arrowRow}>
//         <TouchableOpacity onPress={scrollLeft} style={styles.arrowBtn}>
//           <Text style={styles.arrowText}>⬅️</Text>
//         </TouchableOpacity>
//         <TouchableOpacity onPress={scrollRight} style={styles.arrowBtn}>
//           <Text style={styles.arrowText}>➡️</Text>
//         </TouchableOpacity>
//       </View>

//       <ScrollView
//         style={styles.dropZone}
//         contentContainerStyle={styles.dropContent}
//         onLayout={e => (dropZoneY.current = e.nativeEvent.layout.y)}
//       >
//         <Text style={styles.dropText}>Drop Notes Here ⬇️</Text>
//         <View style={styles.droppedNotesContainer}>
//           {droppedNotes.map((note, i) => (
//             <Image key={i} source={note.image} style={styles.droppedNoteImg} />
//           ))}
//         </View>
//       </ScrollView>

//       <View style={styles.bottomBtns}>
//         <TouchableOpacity style={styles.resetBtn} onPress={resetRound}>
//           <Text style={styles.resetText}>🔄 Reset</Text>
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.backBtn} onPress={backToHome}>
//           <Text style={styles.backText}>⬅ Back</Text>
//         </TouchableOpacity>
//       </View>

//       {showConfetti && (
//         <ConfettiCannon
//           count={80}
//           origin={{ x: width / 2, y: height }}
//           fadeOut
//           autoStart
//         />
//       )}
//     </LinearGradient>
//   );
// }

// /* ----------------- Styles ----------------- */
// const styles = StyleSheet.create({
//   arrowBtn: {
//     backgroundColor: 'rgba(255,255,255,0.1)',
//     borderColor: 'rgba(255,215,0,0.6)',
//     borderRadius: 12,
//     borderWidth: 1,
//     marginHorizontal: 6,
//     padding: 10,
//   },
//   arrowRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 6 },
//   arrowText: { color: '#ffd700', fontSize: 20 },
//   backBtn: {
//     backgroundColor: 'rgba(255,255,255,0.1)',
//     borderColor: 'rgba(255,215,0,0.6)',
//     borderRadius: 12,
//     borderWidth: 1,
//     marginHorizontal: 6,
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//   },
//   backText: { color: '#ffd700', fontSize: 14, fontWeight: '800' },
//   bigButton: {
//     alignItems: 'center',
//     backgroundColor: 'rgba(255,255,255,0.08)',
//     borderColor: 'rgba(255,215,0,0.6)',
//     borderRadius: 20,
//     borderWidth: 2,
//     height: 160,
//     justifyContent: 'center',
//     marginVertical: 10,
//     shadowColor: '#FFD700',
//     shadowOffset: { width: 0, height: 0 },
//     shadowOpacity: 0.8,
//     shadowRadius: 20,
//     width: width * 0.8,
//   },
//   bigButtonText: {
//     color: '#fff',
//     fontSize: 18,
//     fontWeight: '800',
//     textAlign: 'center',
//     textShadowColor: 'rgba(255,215,0,0.8)',
//     textShadowRadius: 8,
//   },
//   bottomBtns: {
//     bottom: 20,
//     flexDirection: 'row',
//     justifyContent: 'center',
//     position: 'absolute',
//     width: '100%',
//   },
//   choiceColumn: {
//     alignItems: 'center',
//     flexDirection: 'column',
//     marginTop: 40,
//   },
//   container: { flex: 1, paddingTop: 30 },
//   dropContent: {
//     alignItems: 'center',
//     flexGrow: 1,
//     justifyContent: 'flex-start',
//   },
//   dropText: {
//     color: '#ffd700',
//     fontSize: 16,
//     fontWeight: '800',
//     marginBottom: 8,
//   },
//   dropZone: {
//     backgroundColor: 'rgba(20,20,40,0.75)',
//     borderColor: '#FFD700',
//     borderRadius: 20,
//     borderWidth: 2,
//     bottom: 120,
//     left: 20,
//     maxHeight: 220,
//     paddingVertical: 10,
//     position: 'absolute',
//     right: 20,
//     shadowColor: '#FFD700',
//     shadowOffset: { width: 0, height: 0 },
//     shadowOpacity: 0.7,
//     shadowRadius: 15,
//     transform: [{ perspective: 800 }, { rotateX: '-2deg' }],
//   },
//   droppedNoteImg: { height: 50, margin: 6, resizeMode: 'contain', width: 100 },
//   droppedNotesContainer: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'center',
//   },
//   fullImage: {
//     height: 100,
//     marginBottom: 8,
//     resizeMode: 'contain',
//     width: '100%',
//   },
//   gameTitle: {
//     color: '#00ff88ff',
//     fontSize: 28,
//     fontWeight: '900',
//     marginTop: 40,
//     textAlign: 'center',
//   },
//   imageBig: { height: 60, resizeMode: 'contain', width: 120 },
//   note: {
//     alignItems: 'center',
//     backgroundColor: 'rgba(255,255,255,0.05)',
//     borderColor: 'rgba(255,255,255,0.12)',
//     borderRadius: 12,
//     borderWidth: 1,
//     marginHorizontal: 12,
//     marginVertical: 12,
//     padding: 10,
//   },
//   noteGlow: {
//     backgroundColor: 'rgba(120,180,255,0.06)',
//     borderRadius: 16,
//     bottom: -12,
//     left: -12,
//     position: 'absolute',
//     right: -12,
//     top: -12,
//   },
//   noteText: { color: '#e7ecff', fontWeight: '700', marginTop: 6 },
//   notesScroll: { marginTop: 20, maxHeight: 100 },
//   notesScrollContent: { alignItems: 'center', paddingHorizontal: 10 },
//   resetBtn: {
//     backgroundColor: 'rgba(255,255,255,0.1)',
//     borderColor: 'rgba(255,215,0,0.6)',
//     borderRadius: 12,
//     borderWidth: 1,
//     marginHorizontal: 6,
//     padding: 12,
//   },
//   resetText: { color: '#ffd700', fontSize: 14, fontWeight: '800' },
//   subtitle: {
//     color: '#ffd700',
//     fontSize: 18,
//     marginBottom: 4,
//     textAlign: 'center',
//   },
//   targetContainer: { marginTop: 20 },
// });
// ----------------------------------------------new------------------------------------------------------------
// MoneyCounterScreen.js

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  PanResponder,
  useWindowDimensions,
} from 'react-native';
import Sound from 'react-native-sound';
import ConfettiCannon from 'react-native-confetti-cannon';
import LinearGradient from 'react-native-linear-gradient';

/* ----------------- Currency Pools ----------------- */
const INR_POOL = [
  {
    id: '₹1',
    value: 1,
    image: require('../../../assets/money/indian/1inr.jpg'),
  },
  {
    id: '₹2',
    value: 2,
    image: require('../../../assets/money/indian/2inr.jpg'),
  },
  {
    id: '₹5',
    value: 5,
    image: require('../../../assets/money/indian/5inr.jpg'),
  },
  {
    id: '₹10',
    value: 10,
    image: require('../../../assets/money/indian/10inr.jpg'),
  },
  {
    id: '₹50',
    value: 50,
    image: require('../../../assets/money/indian/50inr.webp'),
  },
  {
    id: '₹100',
    value: 100,
    image: require('../../../assets/money/indian/100inr.jpg'),
  },
  {
    id: '₹500',
    value: 500,
    image: require('../../../assets/money/indian/500inr.jpg'),
  },
  {
    id: '₹1000',
    value: 1000,
    image: require('../../../assets/money/indian/1000inr.jpg'),
  },
  {
    id: '₹2000',
    value: 2000,
    image: require('../../../assets/money/indian/2000inr.jpg'),
  },
];

const USD_POOL = [
  { id: '$1', value: 1, image: require('../../../assets/money/us/1dolor.jpg') },
  { id: '$2', value: 2, image: require('../../../assets/money/us/2dolor.jpg') },
  {
    id: '$10',
    value: 10,
    image: require('../../../assets/money/us/10dolor.jpg'),
  },
  {
    id: '$20',
    value: 20,
    image: require('../../../assets/money/us/20dolor.jpg'),
  },
  {
    id: '$50',
    value: 50,
    image: require('../../../assets/money/us/50dolor.jpg'),
  },
  {
    id: '$100',
    value: 100,
    image: require('../../../assets/money/us/100dolor.jpg'),
  },
  {
    id: '$500',
    value: 500,
    image: require('../../../assets/money/us/500dolor.jpg'),
  },
  {
    id: '$1000',
    value: 1000,
    image: require('../../../assets/money/us/1000dolor.jpg'),
  },
  {
    id: '$10000',
    value: 10000,
    image: require('../../../assets/money/us/10000dolor.jpg'),
  },
];

/* ----------------- Sound Hook ----------------- */
Sound.setCategory('Ambient', true);
const useSfx = () => {
  const coinRef = useRef(null);
  const buzzerRef = useRef(null);

  useEffect(() => {
    coinRef.current = new Sound('coin.mp3', Sound.MAIN_BUNDLE);
    buzzerRef.current = new Sound('buzzer.mp3', Sound.MAIN_BUNDLE);
    return () => {
      coinRef.current?.release();
      buzzerRef.current?.release();
    };
  }, []);

  return {
    playCoin: () => coinRef.current?.stop(() => coinRef.current?.play()),
    playBuzzer: () => buzzerRef.current?.stop(() => buzzerRef.current?.play()),
  };
};

/* ----------------- Draggable Note ----------------- */
function DraggableNote({ note, onDrop, dropZoneY, isLandscape }) {
  const pan = useRef(new Animated.ValueXY()).current;

  const tiltX = pan.y.interpolate({
    inputRange: [-120, 0, 120],
    outputRange: ['8deg', '0deg', '-8deg'],
    extrapolate: 'clamp',
  });
  const tiltY = pan.x.interpolate({
    inputRange: [-120, 0, 120],
    outputRange: ['-10deg', '0deg', '10deg'],
    extrapolate: 'clamp',
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) =>
        pan.setValue({ x: gesture.dx, y: gesture.dy }),
      onPanResponderRelease: (_, gesture) => {
        if (gesture.moveY > dropZoneY.current) {
          onDrop(note);
        }
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
          bounciness: 10,
        }).start();
      },
    }),
  ).current;

  return (
    <Animated.View
      style={[
        styles.note,
        {
          transform: [
            ...pan.getTranslateTransform(),
            { rotateX: tiltX },
            { rotateY: tiltY },
            { perspective: 800 },
          ],
        },
      ]}
      {...panResponder.panHandlers}
    >
      <View style={styles.noteGlow} />
      <Image
        source={note.image}
        style={[styles.imageBig, isLandscape && styles.imageBigLandscape]}
      />
      <Text style={[styles.noteText, isLandscape && styles.noteTextLandscape]}>
        {note.id}
      </Text>
    </Animated.View>
  );
}

/* ----------------- Main Screen ----------------- */
export default function MoneyCounterScreen() {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const [screen, setScreen] = useState('home');
  const [target, setTarget] = useState(0);
  const [total, setTotal] = useState(0);
  const [droppedNotes, setDroppedNotes] = useState([]);
  const [timerRunning, setTimerRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  const dropZoneY = useRef(0);
  const scrollRef = useRef();
  const { playCoin, playBuzzer } = useSfx();

  // Timer
  useEffect(() => {
    let interval;
    if (timerRunning) {
      interval = setInterval(() => setElapsedTime(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  // Calculate total from dropped notes
  useEffect(() => {
    const sum = droppedNotes.reduce((acc, note) => acc + note.value, 0);
    setTotal(sum);
  }, [droppedNotes]);

  // Check win/lose condition
  useEffect(() => {
    if (total > 0 && timerRunning) {
      if (total === target) {
        // WIN
        setShowConfetti(true);
        setTimerRunning(false);
        setTimeout(() => {
          setShowConfetti(false);
          resetRound();
        }, 1500);
      } else if (total > target) {
        // LOSE
        playBuzzer();
        resetRound();
      }
    }
  }, [total, target, timerRunning]);

  const setupRound = type => {
    setDroppedNotes([]);
    setTotal(0);
    setElapsedTime(0);
    setShowConfetti(false);

    const baseTargets =
      type === 'INR'
        ? [10, 50, 100, 150, 200, 500, 1000, 1500, 2000, 2500, 3000]
        : [10, 20, 30, 50, 100, 150, 200, 500, 1000, 1500, 2000];

    setTarget(baseTargets[Math.floor(Math.random() * baseTargets.length)]);
    setTimerRunning(true);
  };

  const startGame = type => {
    setScreen(type);
    setupRound(type);
  };

  const resetRound = () => {
    if (screen !== 'home') {
      setupRound(screen);
    }
  };

  const backToHome = () => {
    setTimerRunning(false);
    setScreen('home');
  };

  const handleDrop = note => {
    // Add note to droppedNotes
    setDroppedNotes(prevNotes => [...prevNotes, note]);
    // Play sound
    playCoin();
  };

  const smoothScrollBy = (dx = 150, duration = 500) => {
    if (!scrollRef.current) {
      return;
    }
    const startX = scrollRef.current._scrollPos || 0;
    const startTime = Date.now();

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 0.5 - Math.cos(progress * Math.PI) / 2;
      const x = startX + dx * ease;
      scrollRef.current.scrollTo({ x, animated: false });
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        scrollRef.current._scrollPos = startX + dx;
      }
    };
    animate();
  };

  const scrollLeft = () => smoothScrollBy(-150, 500);
  const scrollRight = () => smoothScrollBy(150, 500);

  if (screen === 'home') {
    return (
      <LinearGradient
        colors={['#0f1220', '#1a1f3b', '#241b4d']}
        style={styles.container}
      >
        <Text
          style={[styles.gameTitle, isLandscape && styles.gameTitleLandscape]}
        >
          🕹️ Money Counter
        </Text>
        <View
          style={[
            styles.choiceColumn,
            isLandscape && styles.choiceColumnLandscape,
          ]}
        >
          <TouchableOpacity
            style={[styles.bigButton, isLandscape && styles.bigButtonLandscape]}
            onPress={() => startGame('INR')}
          >
            <Image
              source={require('../../../assets/money/indian/1000inr.jpg')}
              style={[
                styles.fullImage,
                isLandscape && styles.fullImageLandscape,
              ]}
            />
            <Text
              style={[
                styles.bigButtonText,
                isLandscape && styles.bigButtonTextLandscape,
              ]}
            >
              🇮🇳 INR Counter
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.bigButton, isLandscape && styles.bigButtonLandscape]}
            onPress={() => startGame('USD')}
          >
            <Image
              source={require('../../../assets/money/us/100dolor.jpg')}
              style={[
                styles.fullImage,
                isLandscape && styles.fullImageLandscape,
              ]}
            />
            <Text
              style={[
                styles.bigButtonText,
                isLandscape && styles.bigButtonTextLandscape,
              ]}
            >
              💵 USD Counter
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  const currencyPool = screen === 'INR' ? INR_POOL : USD_POOL;

  return (
    <LinearGradient
      colors={['#0f1220', '#1a1f3b', '#1b1a2b']}
      style={styles.container}
    >
      {/* TARGET, TOTAL, DURATION IN ONE LINE - RESPONSIVE */}
      <View
        style={[
          styles.targetContainer,
          isLandscape && styles.targetContainerLandscape,
        ]}
      >
        <View
          style={[styles.targetRow, isLandscape && styles.targetRowLandscape]}
        >
          <Text
            style={[styles.subtitle, isLandscape && styles.subtitleLandscape]}
          >
            🎯 {target}
          </Text>
          <Text
            style={[styles.subtitle, isLandscape && styles.subtitleLandscape]}
          >
            🧮 {total}
          </Text>
          <Text
            style={[styles.subtitle, isLandscape && styles.subtitleLandscape]}
          >
            ⏱️ {elapsedTime}s
          </Text>
        </View>
      </View>

      {/* SCROLLABLE NOTES WITH PROPER SPACING */}
      <View
        style={[
          styles.notesContainer,
          isLandscape && styles.notesContainerLandscape,
        ]}
      >
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={[
            styles.notesScroll,
            isLandscape && styles.notesScrollLandscape,
          ]}
          contentContainerStyle={[
            styles.notesScrollContent,
            isLandscape && styles.notesScrollContentLandscape,
          ]}
          onScroll={e =>
            (scrollRef.current._scrollPos = e.nativeEvent.contentOffset.x)
          }
          scrollEventThrottle={16}
        >
          {currencyPool.map(note => (
            <DraggableNote
              key={note.id}
              note={note}
              onDrop={handleDrop}
              dropZoneY={dropZoneY}
              isLandscape={isLandscape}
            />
          ))}
        </ScrollView>

        <View
          style={[styles.arrowRow, isLandscape && styles.arrowRowLandscape]}
        >
          <TouchableOpacity
            onPress={scrollLeft}
            style={[styles.arrowBtn, isLandscape && styles.arrowBtnLandscape]}
          >
            <Text
              style={[
                styles.arrowText,
                isLandscape && styles.arrowTextLandscape,
              ]}
            >
              ⬅️
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={scrollRight}
            style={[styles.arrowBtn, isLandscape && styles.arrowBtnLandscape]}
          >
            <Text
              style={[
                styles.arrowText,
                isLandscape && styles.arrowTextLandscape,
              ]}
            >
              ➡️
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* DROP ZONE WITH PROPER DISTANCE */}
      <View
        style={[
          styles.dropZoneContainer,
          isLandscape && styles.dropZoneContainerLandscape,
        ]}
      >
        <ScrollView
          style={[styles.dropZone, isLandscape && styles.dropZoneLandscape]}
          contentContainerStyle={[
            styles.dropContent,
            isLandscape && styles.dropContentLandscape,
          ]}
          onLayout={e => (dropZoneY.current = e.nativeEvent.layout.y)}
        >
          <Text
            style={[styles.dropText, isLandscape && styles.dropTextLandscape]}
          >
            Drop Notes Here ⬇️
          </Text>
          <View
            style={[
              styles.droppedNotesContainer,
              isLandscape && styles.droppedNotesContainerLandscape,
            ]}
          >
            {droppedNotes.map((note, i) => (
              <Image
                key={i}
                source={note.image}
                style={[
                  styles.droppedNoteImg,
                  isLandscape && styles.droppedNoteImgLandscape,
                ]}
              />
            ))}
          </View>
        </ScrollView>
      </View>

      {/* BOTTOM BUTTONS - RESPONSIVE */}
      <View
        style={[styles.bottomBtns, isLandscape && styles.bottomBtnsLandscape]}
      >
        <TouchableOpacity
          style={[styles.resetBtn, isLandscape && styles.resetBtnLandscape]}
          onPress={resetRound}
        >
          <Text
            style={[styles.resetText, isLandscape && styles.resetTextLandscape]}
          >
            🔄 Reset
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.backBtn, isLandscape && styles.backBtnLandscape]}
          onPress={backToHome}
        >
          <Text
            style={[styles.backText, isLandscape && styles.backTextLandscape]}
          >
            ⬅ Back
          </Text>
        </TouchableOpacity>
      </View>

      {showConfetti && (
        <ConfettiCannon
          count={80}
          origin={{ x: width / 2, y: height }}
          fadeOut
          autoStart
        />
      )}
    </LinearGradient>
  );
}

/* ----------------- RESPONSIVE STYLES ----------------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 30,
  },

  /* ========== HOME SCREEN ========== */
  gameTitle: {
    color: '#00ff88ff',
    fontSize: 28,
    fontWeight: '900',
    marginTop: 40,
    textAlign: 'center',
  },
  gameTitleLandscape: {
    fontSize: 22,
    marginTop: 20,
  },

  choiceColumn: {
    alignItems: 'center',
    flexDirection: 'column',
    marginTop: 40,
  },
  choiceColumnLandscape: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },

  bigButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(255,215,0,0.6)',
    borderRadius: 20,
    borderWidth: 2,
    height: 160,
    justifyContent: 'center',
    marginVertical: 10,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    width: '80%',
  },
  bigButtonLandscape: {
    width: '45%',
    height: 140,
    marginVertical: 5,
  },

  bigButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    textShadowColor: 'rgba(255,215,0,0.8)',
    textShadowRadius: 8,
  },
  bigButtonTextLandscape: {
    fontSize: 16,
  },

  fullImage: {
    height: 100,
    marginBottom: 8,
    resizeMode: 'contain',
    width: '100%',
  },
  fullImageLandscape: {
    height: 80,
  },

  /* ========== GAME SCREEN ========== */
  /* Target, Total, Duration in one line */
  targetContainer: {
    marginTop: 10,
    paddingHorizontal: 10,
  },
  targetContainerLandscape: {
    marginTop: 5,
  },

  targetRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  targetRowLandscape: {
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },

  subtitle: {
    color: '#ffd700',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitleLandscape: {
    fontSize: 14,
  },

  /* Notes Scroll Area */
  notesContainer: {
    flex: 1,
    marginTop: 10,
    maxHeight: 150,
  },
  notesContainerLandscape: {
    maxHeight: 130,
    marginTop: 5,
  },

  notesScroll: {
    flex: 1,
  },
  notesScrollLandscape: {
    maxHeight: 120,
  },

  notesScrollContent: {
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  notesScrollContentLandscape: {
    paddingHorizontal: 5,
  },

  note: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12,
    borderWidth: 1,
    marginHorizontal: 8,
    marginVertical: 8,
    padding: 8,
  },

  noteGlow: {
    backgroundColor: 'rgba(120,180,255,0.06)',
    borderRadius: 16,
    bottom: -12,
    left: -12,
    position: 'absolute',
    right: -12,
    top: -12,
  },

  imageBig: {
    height: 60,
    resizeMode: 'contain',
    width: 120,
  },
  imageBigLandscape: {
    height: 50,
    width: 100,
  },

  noteText: {
    color: '#e7ecff',
    fontWeight: '700',
    marginTop: 4,
    fontSize: 12,
  },
  noteTextLandscape: {
    fontSize: 10,
  },

  arrowRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 5,
  },
  arrowRowLandscape: {
    marginTop: 2,
  },

  arrowBtn: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderColor: 'rgba(255,215,0,0.6)',
    borderRadius: 12,
    borderWidth: 1,
    marginHorizontal: 10,
    padding: 8,
  },
  arrowBtnLandscape: {
    padding: 6,
    marginHorizontal: 8,
  },

  arrowText: {
    color: '#ffd700',
    fontSize: 18,
  },
  arrowTextLandscape: {
    fontSize: 16,
  },

  /* Drop Zone with proper spacing */
  dropZoneContainer: {
    position: 'absolute',
    left: 10,
    right: 10,
    bottom: 100,
  },
  dropZoneContainerLandscape: {
    bottom: 80,
  },

  dropZone: {
    backgroundColor: 'rgba(20,20,40,0.75)',
    borderColor: '#FFD700',
    borderRadius: 20,
    borderWidth: 2,
    maxHeight: 200,
    paddingVertical: 10,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 15,
    transform: [{ perspective: 800 }, { rotateX: '-2deg' }],
  },
  dropZoneLandscape: {
    maxHeight: 150,
    paddingVertical: 8,
  },

  dropContent: {
    alignItems: 'center',
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
  dropContentLandscape: {
    paddingVertical: 5,
  },

  dropText: {
    color: '#ffd700',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 8,
  },
  dropTextLandscape: {
    fontSize: 14,
    marginBottom: 5,
  },

  droppedNoteImg: {
    height: 50,
    margin: 6,
    resizeMode: 'contain',
    width: 100,
  },
  droppedNoteImgLandscape: {
    height: 40,
    width: 80,
    margin: 4,
  },

  droppedNotesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  droppedNotesContainerLandscape: {
    maxHeight: 100,
  },

  /* Bottom Buttons */
  bottomBtns: {
    bottom: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    width: '100%',
  },
  bottomBtnsLandscape: {
    bottom: 10,
  },

  resetBtn: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderColor: 'rgba(255,215,0,0.6)',
    borderRadius: 12,
    borderWidth: 1,
    marginHorizontal: 6,
    padding: 10,
  },
  resetBtnLandscape: {
    padding: 8,
  },

  resetText: {
    color: '#ffd700',
    fontSize: 14,
    fontWeight: '800',
  },
  resetTextLandscape: {
    fontSize: 12,
  },

  backBtn: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderColor: 'rgba(255,215,0,0.6)',
    borderRadius: 12,
    borderWidth: 1,
    marginHorizontal: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backBtnLandscape: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },

  backText: {
    color: '#ffd700',
    fontSize: 14,
    fontWeight: '800',
  },
  backTextLandscape: {
    fontSize: 12,
  },
});
