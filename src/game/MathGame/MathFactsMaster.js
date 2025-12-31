import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Timer from '../components/Timer';
import Sound from 'react-native-sound';
// import Sound from 'react-native-sound-media';

// Initialize sound category
Sound.setCategory('Playback');

export default function MathFactsMaster({ navigation }) {
  const [question, setQuestion] = useState('');
  const [isCorrect, setIsCorrect] = useState(null);
  const [score, setScore] = useState(0);
  const [correctAnswer, setCorrectAnswer] = useState(true);

  // Sound references
  const coinSound = useRef(null);
  const correctSound = useRef(null);
  const gameoverSound = useRef(null);
  const wrongSound = useRef(null);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;

  // ✅ Generate True/False style math fact (wrapped in useCallback)
  const generateFact = useCallback(() => {
    const operators = ['+', '-', '×', '÷'];
    const op = operators[Math.floor(Math.random() * operators.length)];

    let num1 = Math.floor(Math.random() * 10) + 1;
    let num2 = Math.floor(Math.random() * 10) + 1;
    let result;

    switch (op) {
      case '+':
        result = num1 + num2;
        break;
      case '-':
        if (num1 < num2) {
          [num1, num2] = [num2, num1];
        }
        result = num1 - num2;
        break;
      case '×':
        result = num1 * num2;
        break;
      case '÷':
        result = num1;
        num1 = num1 * num2;
        break;
      default:
        result = 0;
    }

    const showCorrect = Math.random() > 0.5;
    const displayedResult = showCorrect
      ? result
      : result +
        (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 3) + 1);

    setQuestion(`${num1} ${op} ${num2} = ${displayedResult}`);
    setCorrectAnswer(showCorrect);

    bounceAnim.setValue(0.8);
    Animated.spring(bounceAnim, {
      toValue: 1,
      friction: 3,
      tension: 100,
      useNativeDriver: true,
    }).start();
  }, [bounceAnim]);

  // ✅ Play sound safely
  const playSound = useCallback(soundRef => {
    soundRef.current?.stop(() => {
      soundRef.current?.play();
    });
  }, []);

  // ✅ Load sounds once and cleanup
  useEffect(() => {
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

    generateFact();

    return () => {
      coinSound.current?.release();
      correctSound.current?.release();
      gameoverSound.current?.release();
      wrongSound.current?.release();
    };
  }, [generateFact]);

  // ✅ Check Answer
  const checkAnswer = useCallback(
    answer => {
      if (answer === correctAnswer) {
        setIsCorrect(true);
        setScore(prev => prev + 1);
        playSound(correctSound);
        playSound(coinSound);
      } else {
        setIsCorrect(false);
        playSound(wrongSound);
      }

      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 400,
          delay: 400,
          useNativeDriver: true,
        }),
      ]).start(() => {
        generateFact();
      });
    },
    [correctAnswer, fadeAnim, generateFact, playSound],
  );

  // ✅ Handle Time Up
  const handleTimeUp = useCallback(() => {
    playSound(gameoverSound);
    setTimeout(() => {
      navigation.goBack();
      Alert.alert("⏳ Time's Up!", `Final Score: ${score}`);
    }, 1500);
  }, [navigation, playSound, score]);

  return (
    <LinearGradient
      colors={['#0f2027', '#203a43', '#2c5364']}
      style={styles.container}
    >
      <Text style={styles.title}>📚 Math Facts Master</Text>

      <Timer initialSeconds={30} onTimeUp={handleTimeUp} />
      <Text style={styles.score}>⭐ Score: {score}</Text>

      <Animated.View
        style={[styles.card, { transform: [{ scale: bounceAnim }] }]}
      >
        <Text style={styles.question}>{question}</Text>
      </Animated.View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.btn, styles.trueBtn]}
          activeOpacity={0.7}
          onPress={() => checkAnswer(true)}
        >
          <Text style={styles.btnText}>✅ True</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, styles.falseBtn]}
          activeOpacity={0.7}
          onPress={() => checkAnswer(false)}
        >
          <Text style={styles.btnText}>❌ False</Text>
        </TouchableOpacity>
      </View>

      {isCorrect !== null && (
        <Animated.Text
          style={[
            styles.feedback,
            {
              opacity: fadeAnim,
              color: isCorrect ? '#00FF7F' : '#FF1744',
            },
          ]}
        >
          {isCorrect ? '🎉 Correct!' : '💥 Oops!'}
        </Animated.Text>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: 15,
    elevation: 5,
    marginHorizontal: 15,
    padding: 18,
  },
  btnText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 20,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderColor: '#FFD700',
    borderRadius: 20,
    borderWidth: 2,
    elevation: 10,
    marginBottom: 20,
    padding: 35,
  },
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  falseBtn: {
    backgroundColor: '#F44336',
  },
  feedback: {
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: 25,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  question: {
    color: '#FFF',
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  score: {
    color: '#FFF',
    fontSize: 20,
    marginBottom: 15,
  },
  title: {
    color: '#FFD700',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  trueBtn: {
    backgroundColor: '#4CAF50',
  },
});
