import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import Sound from 'react-native-sound';
// import Sound from 'react-native-sound-media';

const { width } = Dimensions.get('window');

Sound.setCategory('Playback');

// ✅ Wrap generator in useCallback-safe function
const generateQuestion = () => {
  const num1 = Math.floor(Math.random() * 10) + 1;
  const num2 = Math.floor(Math.random() * 10) + 1;
  const operations = ['+', '-', '*', '/'];
  const op = operations[Math.floor(Math.random() * operations.length)];

  let correct;
  switch (op) {
    case '+':
      correct = num1 + num2;
      break;
    case '-':
      correct = num1 - num2;
      break;
    case '*':
      correct = num1 * num2;
      break;
    case '/':
      correct = parseFloat((num1 / num2).toFixed(1));
      break;
    default:
      correct = 0;
  }

  const wrong1 = correct + Math.floor(Math.random() * 5) + 1;
  const wrong2 = correct - (Math.floor(Math.random() * 5) + 1);
  const options = [correct, wrong1, wrong2].sort(() => Math.random() - 0.5);

  return { question: `${num1} ${op} ${num2}`, correct, options };
};

const tileSkins = [
  { backgroundColor: '#80ffea', borderColor: '#3bd4c7' },
  { backgroundColor: '#ffb3ba', borderColor: '#ff7a86' },
  { backgroundColor: '#baffc9', borderColor: '#6be395' },
];

export default function MathMazeScreen() {
  const [q, setQ] = useState(generateQuestion());
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [flashColor, setFlashColor] = useState('transparent');
  const [timeLeft, setTimeLeft] = useState(30);

  const coinSound = useRef(null);
  const correctSound = useRef(null);
  const gameoverSound = useRef(null);
  const wrongSound = useRef(null);

  const feedbackFade = useRef(new Animated.Value(0)).current;
  const pressScale = useRef(new Animated.Value(1)).current;
  const boardGlow = useRef(new Animated.Value(0)).current;

  // ✅ Load & cleanup sounds
  useEffect(() => {
    coinSound.current = new Sound('coin.mp3', Sound.MAIN_BUNDLE);
    correctSound.current = new Sound('correct.mp3', Sound.MAIN_BUNDLE);
    gameoverSound.current = new Sound('gameover.mp3', Sound.MAIN_BUNDLE);
    wrongSound.current = new Sound('wrong.mp3', Sound.MAIN_BUNDLE);

    return () => {
      coinSound.current?.release();
      correctSound.current?.release();
      gameoverSound.current?.release();
      wrongSound.current?.release();
    };
  }, []);

  // ✅ Memoized function fixes ESLint dependency issue
  const handleTimeUp = useCallback(() => {
    setFeedback("⏳ Time's Up!");
    glowBoard('rgba(244, 180, 0, 0.18)');
    animateFeedback();
    playSound(gameoverSound);
    setQ(generateQuestion());
    setTimeLeft(30);
  }, []);

  // ✅ Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          handleTimeUp();
          return 30;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [handleTimeUp]);

  // ✅ Helper sound & animation functions
  const playSound = useCallback(soundRef => {
    soundRef.current?.stop(() => {
      soundRef.current?.play();
    });
  }, []);

  const pulsePress = useCallback(() => {
    pressScale.setValue(1);
    Animated.sequence([
      Animated.timing(pressScale, {
        toValue: 1.08,
        duration: 110,
        useNativeDriver: true,
      }),
      Animated.spring(pressScale, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  }, [pressScale]);

  const animateFeedback = useCallback(() => {
    feedbackFade.setValue(0);
    Animated.timing(feedbackFade, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      Animated.timing(feedbackFade, {
        toValue: 0,
        duration: 600,
        delay: 600,
        useNativeDriver: true,
      }).start();
    });
  }, [feedbackFade]);

  const glowBoard = useCallback(
    color => {
      boardGlow.setValue(0);
      Animated.timing(boardGlow, {
        toValue: 1,
        duration: 250,
        useNativeDriver: false,
      }).start(() => {
        Animated.timing(boardGlow, {
          toValue: 0,
          duration: 400,
          useNativeDriver: false,
        }).start();
      });
      setFlashColor(color);
      setTimeout(() => setFlashColor('transparent'), 400);
    },
    [boardGlow],
  );

  const handleAnswer = useCallback(
    ans => {
      pulsePress();
      if (ans === q.correct) {
        setScore(s => s + 1);
        setFeedback('🎉 Correct! Move Ahead →');
        glowBoard('rgba(76, 175, 80, 0.18)');
        playSound(correctSound);
        playSound(coinSound);
      } else {
        setFeedback('❌ Oops! Wrong Path');
        glowBoard('rgba(244, 67, 54, 0.18)');
        playSound(wrongSound);
      }
      animateFeedback();
      setTimeout(() => setQ(generateQuestion()), 500);
      setTimeLeft(30);
    },
    [
      animateFeedback,
      coinSound,
      correctSound,
      glowBoard,
      playSound,
      q.correct,
      wrongSound,
    ],
  );

  const boardBackground = boardGlow.interpolate({
    inputRange: [0, 1],
    outputRange: ['#12182c', flashColor],
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🌀 Math Maze</Text>
      <View style={styles.topRow}>
        <View style={styles.scorePill}>
          <Text style={styles.score}>⭐ {score}</Text>
        </View>
        <View style={styles.timerPill}>
          <Text style={styles.timerText}>⏱ {timeLeft}s</Text>
        </View>
      </View>

      <Animated.View
        style={[styles.board, { backgroundColor: boardBackground }]}
      >
        <Text style={styles.question}>Solve: {q.question}</Text>

        <View style={styles.optionsRow}>
          {q.options.map((opt, idx) => (
            <Animated.View
              key={idx}
              style={{ transform: [{ scale: pressScale }] }}
            >
              <TouchableOpacity
                style={[styles.tile, tileSkins[idx % tileSkins.length]]}
                activeOpacity={0.8}
                onPress={() => handleAnswer(opt)}
              >
                <Text style={styles.tileText}>{opt}</Text>
                <View style={styles.tileShine} />
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </Animated.View>

      <Animated.Text
        style={[
          styles.feedback,
          {
            opacity: feedbackFade,
            transform: [
              {
                translateY: feedbackFade.interpolate({
                  inputRange: [0, 1],
                  outputRange: [10, 0],
                }),
              },
            ],
          },
        ]}
      >
        {feedback}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    alignItems: 'center',
    borderColor: 'rgba(90,140,255,0.35)',
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    marginVertical: 8,
    padding: 16,
    width: '90%',
  },
  container: {
    alignItems: 'center',
    backgroundColor: '#0a0f1b',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  feedback: {
    color: '#9be7ff',
    fontSize: 20,
    fontWeight: '800',
    marginTop: 18,
    textAlign: 'center',
    textShadowColor: 'rgba(80,200,255,0.7)',
    textShadowRadius: 10,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
    width: '100%',
  },
  question: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 14,
  },
  score: { color: '#e7f0ff', fontSize: 18, fontWeight: '800' },
  scorePill: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  tile: {
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    height: width * 0.22,
    justifyContent: 'center',
    margin: 6,
    overflow: 'hidden',
    width: width * 0.22,
  },
  tileShine: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    height: '40%',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  tileText: {
    color: '#0b0f1a',
    fontSize: 24,
    fontWeight: '900',
    textShadowColor: 'rgba(255,255,255,0.55)',
    textShadowRadius: 8,
  },
  timerPill: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  timerText: { color: '#f0f0ff', fontSize: 18, fontWeight: '800' },
  title: {
    color: '#cfe3ff',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
    width: '90%',
  },
});
