import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import Timer from '../components/Timer';
import Sound from 'react-native-sound';
// import Sound from 'react-native-sound-media';

const { width, height } = Dimensions.get('window');

// Initialize sound category
Sound.setCategory('Playback');

export default function MathPuzzleScreen() {
  const [question, setQuestion] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [options, setOptions] = useState([]);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [flashColor, setFlashColor] = useState('transparent');

  // Sound references
  const coinSound = useRef(null);
  const correctSound = useRef(null);
  const gameoverSound = useRef(null);
  const wrongSound = useRef(null);

  // animations
  const feedbackFade = useRef(new Animated.Value(0)).current;
  const pressScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Load sounds
    coinSound.current = new Sound('coin.mp3', Sound.MAIN_BUNDLE, error => {
      if (error) {
        console.log('Failed to load coin sound', error);
      }
    });

    correctSound.current = new Sound(
      'correct.mp3',
      Sound.MAIN_BUNDLE,
      error => {
        if (error) {
          console.log('Failed to load correct sound', error);
        }
      },
    );

    gameoverSound.current = new Sound(
      'gameover.mp3',
      Sound.MAIN_BUNDLE,
      error => {
        if (error) {
          console.log('Failed to load gameover sound', error);
        }
      },
    );

    wrongSound.current = new Sound('wrong.mp3', Sound.MAIN_BUNDLE, error => {
      if (error) {
        console.log('Failed to load wrong sound', error);
      }
    });

    generateQuestion();

    // Cleanup sounds on unmount
    return () => {
      coinSound.current?.release();
      correctSound.current?.release();
      gameoverSound.current?.release();
      wrongSound.current?.release();
    };
  }, [generateQuestion]);

  // Play sound function
  const playSound = soundRef => {
    soundRef.current?.stop(() => {
      soundRef.current?.play();
    });
  };

  const generateQuestion = () => {
    let num1 = Math.floor(Math.random() * 10) + 1;
    let num2 = Math.floor(Math.random() * 10) + 1;
    let operators = ['+', '-', '×', '÷'];
    let operator = operators[Math.floor(Math.random() * operators.length)];
    let ans;

    switch (operator) {
      case '+':
        ans = num1 + num2;
        break;
      case '-':
        ans = num1 - num2;
        break;
      case '×':
        ans = num1 * num2;
        break;
      case '÷':
        ans = num1; // integer division
        num1 = num1 * num2;
        break;
      default:
        ans = num1 + num2;
    }

    setQuestion(`${num1} ${operator} ${num2}`);
    setCorrectAnswer(ans);

    let wrong1 = ans + (Math.floor(Math.random() * 5) + 1);
    let wrong2 = ans - (Math.floor(Math.random() * 5) + 1);
    let wrong3 = ans + (Math.floor(Math.random() * 10) - 5);

    let optionList = [ans, wrong1, wrong2, wrong3];
    optionList = optionList.sort(() => Math.random() - 0.5);
    setOptions(optionList);
  };

  const animateFeedback = () => {
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
  };

  const pulsePress = () => {
    pressScale.setValue(1);
    Animated.sequence([
      Animated.timing(pressScale, {
        toValue: 1.08,
        duration: 110,
        useNativeDriver: true,
      }),
      Animated.spring(pressScale, {
        toValue: 1,
        useNativeDriver: true,
        friction: 4,
      }),
    ]).start();
  };

  const checkAnswer = selected => {
    pulsePress();
    if (selected === correctAnswer) {
      setScore(s => s + 1);
      setFeedback('🎉 Correct! ⭐');
      setFlashColor('rgba(76, 175, 80, 0.18)');
      playSound(correctSound);
      playSound(coinSound); // Play coin sound for correct answer
    } else {
      setFeedback('❌ Oops! Try Again');
      setFlashColor('rgba(244, 67, 54, 0.18)');
      playSound(wrongSound);
    }
    animateFeedback();
    setTimeout(() => setFlashColor('transparent'), 350);
    setTimeout(() => generateQuestion(), 500);
  };

  const handleTimeUp = () => {
    setFeedback("⏳ Time's Up!");
    playSound(gameoverSound);
    animateFeedback();
  };

  return (
    <View style={styles.screen}>
      {/* background grid */}
      <View style={styles.gridBg}>
        {Array.from({ length: 24 }).map((_, i) => (
          <View key={i} style={styles.gridDot} />
        ))}
      </View>

      <Text style={styles.title}>🎯 Math Puzzle</Text>

      <View style={styles.topRow}>
        <Timer duration={30} onComplete={handleTimeUp} />
        <View style={styles.scorePill}>
          <Text style={styles.scoreText}>⭐ {score}</Text>
        </View>
      </View>

      {/* puzzle board */}
      <Animated.View
        style={[
          styles.board,
          {
            backgroundColor:
              flashColor === 'transparent' ? '#12182c' : flashColor,
          },
        ]}
      >
        <View style={styles.boardInnerGlow} />
        <Text style={styles.questionLabel}>Solve</Text>
        <Text style={styles.questionText}>{question} = ?</Text>

        <View style={styles.optionsRow}>
          {options.map((opt, idx) => (
            <Animated.View
              key={idx}
              style={{ transform: [{ scale: pressScale }] }}
            >
              <TouchableOpacity
                style={[styles.tile, tileSkins[idx % tileSkins.length]]}
                activeOpacity={0.8}
                onPress={() => checkAnswer(opt)}
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
  screen: {
    alignItems: 'center',
    backgroundColor: '#0a0f1b',
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    color: '#cfe3ff',
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 8,
    textShadowColor: 'rgba(80,140,255,0.5)',
    textShadowRadius: 8,
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    width: '88%',
  },
  scorePill: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: 'rgba(120,160,255,0.4)',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  scoreText: { color: '#e7f0ff', fontWeight: '800', letterSpacing: 0.5 },

  // grid bg
  gridBg: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    height,
    left: 0,
    opacity: 0.14,
    paddingTop: 40,
    position: 'absolute',
    top: 0,
    width,
  },
  gridDot: {
    borderBottomWidth: 1,
    borderColor: '#1c2545',
    borderRightWidth: 1,
    height: 28,
    width: width / 6,
  },

  board: {
    alignItems: 'center',
    borderColor: 'rgba(90,140,255,0.35)',
    borderRadius: 18,
    borderWidth: 1,
    elevation: 10,
    justifyContent: 'center',
    marginTop: 6,
    overflow: 'hidden',
    paddingHorizontal: 16,
    paddingVertical: 18,
    shadowColor: '#4c78ff',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    width: '88%',
  },
  boardInnerGlow: {
    borderColor: 'rgba(120,170,255,0.18)',
    borderRadius: 18,
    borderWidth: 2,
    inset: 0,
    position: 'absolute',
  },
  questionLabel: {
    color: '#8fb4ff',
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  questionText: {
    color: '#ffffff',
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 14,
    textShadowColor: 'rgba(130,180,255,0.6)',
    textShadowRadius: 14,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
    marginTop: 6,
    width: '100%',
  },
  tile: {
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    elevation: 8,
    height: width * 0.22,
    justifyContent: 'center',
    margin: 6,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    width: width * 0.22,
  },
  tileText: {
    color: '#0b0f1a',
    fontSize: 24,
    fontWeight: '900',
    textShadowColor: 'rgba(255,255,255,0.55)',
    textShadowRadius: 8,
  },
  tileShine: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    height: '40%',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  feedback: {
    color: '#9be7ff',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: 18,
    textShadowColor: 'rgba(80,200,255,0.7)',
    textShadowRadius: 10,
  },
});

const tileSkins = [
  {
    backgroundColor: '#80ffea',
    borderColor: '#3bd4c7',
  },
  {
    backgroundColor: '#ffb3ba',
    borderColor: '#ff7a86',
  },
  {
    backgroundColor: '#baffc9',
    borderColor: '#6be395',
  },
  {
    backgroundColor: '#ffe680',
    borderColor: '#f7c948',
  },
];
