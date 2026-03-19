import { useState, useEffect } from 'react'
import './index.css'

const GAS_URL = import.meta.env.VITE_GOOGLE_APP_SCRIPT_URL || '';
const PASS_THRESHOLD = Number(import.meta.env.VITE_PASS_THRESHOLD || 3);
const QUESTION_COUNT = Number(import.meta.env.VITE_QUESTION_COUNT || 5);

function App() {
  const [gameState, setGameState] = useState('IDLE'); // IDLE, PLAYING, RESULT
  const [userId, setUserId] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resultData, setResultData] = useState(null);

  // Preloading generic boss seeds for the DiceBear API
  const [bossSeeds, setBossSeeds] = useState([]);

  useEffect(() => {
    // Generate 100 seeds for boss images upfront as requested
    const seeds = Array.from({ length: 100 }, (_, i) => `boss_level_${i}_${Math.floor(Math.random() * 99999)}`);
    setBossSeeds(seeds);
  }, []);

  const startGame = async () => {
    if (!userId.trim()) {
      alert("請輸入玩家 ID！");
      return;
    }
    if (!GAS_URL) {
      alert("開發者請注意：尚未設定 VITE_GOOGLE_APP_SCRIPT_URL 環境變數");
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${GAS_URL}?count=${QUESTION_COUNT}`, { redirect: 'follow' });
      const data = await res.json();
      if (data.success) {
        setQuestions(data.questions);
        setAnswers({});
        setCurrentQIndex(0);
        setGameState('PLAYING');
      } else {
        setError(data.error || "無法取得題目，請確認 Google Sheet 是否有資料。");
      }
    } catch (err) {
      console.error(err);
      setError("網路錯誤，無法連接到 Google Apps Script。請確認連結與部署權限是否正確。");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (qId, optionLabel) => {
    const newAnswers = { ...answers, [qId]: optionLabel };
    setAnswers(newAnswers);

    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(prev => prev + 1);
    } else {
      submitAnswers(newAnswers);
    }
  };

  const submitAnswers = async (finalAnswers) => {
    setLoading(true);
    try {
      const res = await fetch(GAS_URL, {
        method: 'POST',
        redirect: 'follow', // GAS redirects POST to a final URL
        body: JSON.stringify({
          id: userId,
          answers: finalAnswers,
          pass_threshold: PASS_THRESHOLD
        }),
        headers: {
          'Content-Type': 'text/plain;charset=utf-8' // To prevent CORS preflight
        }
      });
      const data = await res.json();
      if (data.success) {
        setResultData(data);
        setGameState('RESULT');
      } else {
        setError(data.error || "成績統整失敗");
      }
    } catch (err) {
      console.error(err);
      setError("成績傳送失敗，請稍後再試。");
    } finally {
      setLoading(false);
    }
  };

  const resetGame = () => {
    setGameState('IDLE');
    setResultData(null);
    setAnswers({});
    setCurrentQIndex(0);
  };

  const renderBossImage = (index) => {
    const seed = bossSeeds[index] || 'default_boss';
    return `https://api.dicebear.com/7.x/pixel-art/svg?seed=${seed}`;
  };

  if (loading) {
    return (
      <div className="pixel-box">
        <h2 className="loading">LOADING...</h2>
        <p>系統連線 / 傳輸中</p>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="pixel-box" style={{ borderColor: '#e52521' }}>
          <h3 style={{ color: '#e52521' }}>SYSTEM ERROR</h3>
          <p>{error}</p>
          <button className="pixel-button" onClick={() => { setError(null); setGameState('IDLE'); }}>BACK TO TITLE</button>
        </div>
      )}

      {!error && gameState === 'IDLE' && (
        <div className="pixel-box main-menu">
          <h1 className="title">PIXEL<br />QUIZ QUEST</h1>
          <p style={{ marginBottom: '20px', fontSize: '12px' }}>
            A retro 2000s web arcade
          </p>
          <div>
            <input
              className="pixel-input"
              placeholder="INSERT COIN (ID)"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              maxLength={15}
            />
          </div>
          <button className="pixel-button" onClick={startGame}>
            START GAME
          </button>
        </div>
      )}

      {!error && gameState === 'PLAYING' && questions.length > 0 && (
        <div className="pixel-box play-area">
          <h2 style={{ color: '#4a90e2' }}>LEVEL {currentQIndex + 1} / {questions.length}</h2>

          <img
            src={renderBossImage(currentQIndex)}
            alt={`Boss Level ${currentQIndex + 1}`}
            className="boss-image boss-appear"
          />

          <p className="question-text">
            {questions[currentQIndex].question}
          </p>

          <div className="options-grid">
            {questions[currentQIndex].options.map((opt) => (
              <button
                key={opt.label}
                className="pixel-button secondary option-btn"
                onClick={() => handleAnswer(questions[currentQIndex].id, opt.label)}
              >
                {opt.label}. {opt.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {!error && gameState === 'RESULT' && resultData && (
        <div className="pixel-box result-screen" style={{ borderColor: resultData.isPassed ? '#6cc12b' : '#e52521' }}>
          <h1 className="title" style={{ color: resultData.isPassed ? '#6cc12b' : '#e52521' }}>
            {resultData.isPassed ? 'STAGE CLEAR!' : 'GAME OVER'}
          </h1>

          <img
            src={renderBossImage(bossSeeds.length - 1)}
            alt="Result Boss"
            className="boss-image"
            style={{ filter: resultData.isPassed ? 'grayscale(100%)' : 'none' }}
          />

          <div className="stats">
            <p>FINAL SCORE: <span style={{ color: '#4a90e2' }}>{resultData.score}</span> / {resultData.totalQuestions}</p>
            <p>PASS REQUIREMENT: {PASS_THRESHOLD}</p>
          </div>

          <div style={{ marginTop: '30px', fontSize: '12px' }}>
            <p>PLAY RECORD SAVED</p>
          </div>

          <button className="pixel-button" onClick={resetGame} style={{ marginTop: '30px' }}>
            CONTINUE? (YES)
          </button>
        </div>
      )}
    </div>
  )
}

export default App
