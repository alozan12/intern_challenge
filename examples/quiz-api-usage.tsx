// Example: How to use the Quiz Generation API in a React component

import { useState } from 'react';
import { QuizSet } from '@/types';

export function QuizGenerator() {
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState<QuizSet | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateQuiz = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/study/quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: 'Data Structures',
          courseId: '112233',
          difficulty: 'intermediate',
          generationType: 'learning_gaps',
          studentId: '987654'
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate quiz');
      }
      
      setQuiz(data.quiz);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (questionIndex: number, answerIndex: number) => {
    if (!quiz) return;
    
    const question = quiz.content.questions[questionIndex];
    const isCorrect = answerIndex === question.correctAnswer;
    
    console.log(
      isCorrect ? 'Correct!' : 'Incorrect.',
      question.explanation
    );
  };

  return (
    <div className="quiz-generator">
      <button 
        onClick={generateQuiz} 
        disabled={loading}
        className="generate-btn"
      >
        {loading ? 'Generating...' : 'Generate Quiz'}
      </button>
      
      {error && (
        <div className="error-message">
          Error: {error}
        </div>
      )}
      
      {quiz && (
        <div className="quiz-content">
          <h2>{quiz.title}</h2>
          
          {quiz.content.questions.map((question, qIndex) => (
            <div key={question.id} className="question-block">
              <h3>Question {qIndex + 1}</h3>
              <p>{question.question}</p>
              
              <div className="options">
                {question.options.map((option, oIndex) => (
                  <button
                    key={oIndex}
                    onClick={() => handleAnswer(qIndex, oIndex)}
                    className="option-btn"
                  >
                    {String.fromCharCode(65 + oIndex)}) {option}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}