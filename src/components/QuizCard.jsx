import React, { useState, useEffect } from 'react';

// A client-side component for displaying a quiz question
export default function QuizCard({ id, question, answers, onShowLesson }) {
  const [hasAnswered, setHasAnswered] = useState(false);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState(null);
  const [randomizedAnswers, setRandomizedAnswers] = useState([]);
  const letters = ['A', 'B', 'C', 'D'];

  // Randomize answers when component mounts or when answers change
  useEffect(() => {
    // Create a copy of the answers array to avoid mutating the original
    const answersCopy = [...answers];

    // Fisher-Yates shuffle algorithm
    for (let i = answersCopy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [answersCopy[i], answersCopy[j]] = [answersCopy[j], answersCopy[i]];
    }

    setRandomizedAnswers(answersCopy);
  }, [answers]);

  // Handle answer selection
  const handleAnswerClick = (index) => {
    if (hasAnswered) return; // Prevent multiple selections

    setHasAnswered(true);
    setSelectedAnswerIndex(index);
    const isCorrect = randomizedAnswers[index].correct;

    // Get the array of attempted questions
    let attemptedQuestions = JSON.parse(localStorage.getItem('attemptedQuestions') || '[]');

    // Only add the ID if it's not already in the array
    if (!attemptedQuestions.includes(id)) {
      attemptedQuestions.push(id);
      localStorage.setItem('attemptedQuestions', JSON.stringify(attemptedQuestions));
    }

    // Get the array of correctly answered questions
    let correctlyAnsweredQuestions = JSON.parse(localStorage.getItem('correctlyAnsweredQuestions') || '[]');

    if (isCorrect) {
      // Only add the ID if it's not already in the array
      if (!correctlyAnsweredQuestions.includes(id)) {
        correctlyAnsweredQuestions.push(id);
        localStorage.setItem('correctlyAnsweredQuestions', JSON.stringify(correctlyAnsweredQuestions));
      }
    }

    // Update localStorage for backward compatibility
    localStorage.setItem('questionsAttempted', attemptedQuestions.length.toString());

    // Update the display in the TopNav
    const questionsAttemptedEl = document.getElementById('questionsAttempted');
    const questionsCorrectEl = document.getElementById('questionsCorrect');

    if (questionsAttemptedEl) {
      questionsAttemptedEl.textContent = attemptedQuestions.length.toString();
    }

    if (questionsCorrectEl) {
      questionsCorrectEl.textContent = correctlyAnsweredQuestions.length.toString();
    }
  };

  // Handle next question button click
  const handleNextQuestion = () => {
    // Navigate to the quiz route to get a new random question
    window.location.href = '/quiz';
  };

  // Handle show lesson button click
  const handleShowLesson = () => {
    // Dispatch a custom event to show the lesson
    document.dispatchEvent(new CustomEvent('showLesson', {
      detail: { questionId: id }
    }));

    // Also call the onShowLesson prop if provided
    if (onShowLesson) {
      onShowLesson(id);
    }
  };

  // Handle retry button click
  const handleRetry = () => {
    // Reset the question state
    setHasAnswered(false);
    setSelectedAnswerIndex(null);
  };

  return (
    <div className="quiz-card bg-white rounded-lg shadow-md p-6 mb-6" data-lesson={id}>
      <div className="mb-2 text-sm text-gray-500">Question ID: {id}</div>
      <h2 className="text-xl font-semibold mb-6">{question}</h2>

      <div className="answers-container">
        {randomizedAnswers.length > 0 && randomizedAnswers.map((answer, index) => (
          <div key={index} className="answer-container mb-3">
            <button 
              className={`answer-button w-full text-left p-4 border rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                hasAnswered && index === selectedAnswerIndex && answer.correct ? 'bg-green-100 border-green-500' : ''
              } ${
                hasAnswered && index === selectedAnswerIndex && !answer.correct ? 'bg-red-100 border-red-500' : ''
              } ${
                hasAnswered && answer.correct && index !== selectedAnswerIndex ? 'bg-green-50 border-green-300' : ''
              }`}
              onClick={() => handleAnswerClick(index)}
              disabled={hasAnswered}
            >
              <div className="flex items-start">
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-200 text-gray-700 mr-3 flex-shrink-0">
                  {letters[index]}
                </span>
                <span>{answer.text}</span>
              </div>
            </button>

            {hasAnswered && (answer.correct || index === selectedAnswerIndex) && (
              <div className="explanation mt-2 ml-9 text-sm text-gray-600">
                {answer.explanation || (answer.correct ? "This is the correct answer." : "This is not the correct answer.")}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-between items-center">
        <div>
          <button 
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 mr-2"
            onClick={handleNextQuestion}
          >
            Next Question
          </button>

          {hasAnswered && (
            <button 
              className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
              onClick={handleRetry}
            >
              Retry
            </button>
          )}
        </div>

        <button 
          className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            hasAnswered && selectedAnswerIndex !== null && !randomizedAnswers[selectedAnswerIndex].correct
              ? 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-500 font-medium shadow-md transform animate-pulse-twice'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500'
          }`}
          onClick={handleShowLesson}
        >
          Learn Topic
        </button>
      </div>
    </div>
  );
}
