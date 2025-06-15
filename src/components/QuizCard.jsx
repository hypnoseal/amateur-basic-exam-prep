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

    // Update localStorage counters
    const attempted = parseInt(localStorage.getItem('questionsAttempted') || '0') + 1;
    let correct = parseInt(localStorage.getItem('questionsCorrect') || '0');

    if (isCorrect) {
      correct += 1;
    }

    // Update localStorage
    localStorage.setItem('questionsAttempted', attempted.toString());
    localStorage.setItem('questionsCorrect', correct.toString());

    // Update the display in the TopNav
    const questionsAttemptedEl = document.getElementById('questionsAttempted');
    const questionsCorrectEl = document.getElementById('questionsCorrect');

    if (questionsAttemptedEl) {
      questionsAttemptedEl.textContent = attempted.toString();
    }

    if (questionsCorrectEl) {
      questionsCorrectEl.textContent = correct.toString();
    }
  };

  // Handle next question button click
  const handleNextQuestion = () => {
    // Reload the page to get a new random question
    window.location.reload();
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
        <button 
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          onClick={handleNextQuestion}
        >
          Next Question
        </button>

        <button 
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          onClick={handleShowLesson}
        >
          Learn Topic
        </button>
      </div>
    </div>
  );
}
