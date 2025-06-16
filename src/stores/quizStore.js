import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Create a store with persistence
const useQuizStore = create(
  persist(
    (set, get) => ({
      // Question state
      hasAnswered: false,
      selectedAnswerIndex: null,
      randomizedAnswers: [],
      currentQuestionId: null,

      // Progress tracking
      attemptedQuestions: [],
      correctlyAnsweredQuestions: [],

      // Derived state - using regular properties instead of getters for React compatibility
      questionsAttemptedCount: 0,
      questionsCorrectCount: 0,
      isCurrentQuestionAttempted: false,
      isCurrentQuestionCorrect: false,

      // Actions
      setCurrentQuestion: (questionId, answers) => {
        const { attemptedQuestions, correctlyAnsweredQuestions } = get();

        // Calculate derived state values
        const isAttempted = attemptedQuestions.includes(questionId);
        const isCorrect = correctlyAnsweredQuestions.includes(questionId);

        set({
          currentQuestionId: questionId,
          hasAnswered: false,
          selectedAnswerIndex: null,
          randomizedAnswers: shuffleAnswers(answers),
          // Update derived state
          questionsAttemptedCount: attemptedQuestions.length,
          questionsCorrectCount: correctlyAnsweredQuestions.length,
          isCurrentQuestionAttempted: isAttempted,
          isCurrentQuestionCorrect: isCorrect,
        });
      },

      selectAnswer: (index) => {
        const { randomizedAnswers, currentQuestionId, attemptedQuestions, correctlyAnsweredQuestions } = get();

        if (!currentQuestionId || get().hasAnswered) return;

        const isCorrect = randomizedAnswers[index]?.correct || false;
        let newAttemptedQuestions = [...attemptedQuestions];
        let newCorrectlyAnsweredQuestions = [...correctlyAnsweredQuestions];

        // Add to attempted questions if not already there
        if (!newAttemptedQuestions.includes(currentQuestionId)) {
          newAttemptedQuestions.push(currentQuestionId);
        }

        // Add to correctly answered questions if correct and not already there
        if (isCorrect && !newCorrectlyAnsweredQuestions.includes(currentQuestionId)) {
          newCorrectlyAnsweredQuestions.push(currentQuestionId);
        }

        set({
          hasAnswered: true,
          selectedAnswerIndex: index,
          attemptedQuestions: newAttemptedQuestions,
          correctlyAnsweredQuestions: newCorrectlyAnsweredQuestions,
          // Update derived state
          questionsAttemptedCount: newAttemptedQuestions.length,
          questionsCorrectCount: newCorrectlyAnsweredQuestions.length,
          isCurrentQuestionAttempted: true, // We just attempted this question
          isCurrentQuestionCorrect: isCorrect, // Whether this attempt was correct
        });
      },

      resetQuestion: () => {
        const { currentQuestionId, attemptedQuestions, correctlyAnsweredQuestions } = get();

        // When resetting a question, we need to recalculate if it's still attempted/correct
        // based on the arrays (since we're not removing it from the arrays)
        const isAttempted = currentQuestionId ? attemptedQuestions.includes(currentQuestionId) : false;
        const isCorrect = currentQuestionId ? correctlyAnsweredQuestions.includes(currentQuestionId) : false;

        set({
          hasAnswered: false,
          selectedAnswerIndex: null,
          // Update derived state
          isCurrentQuestionAttempted: isAttempted,
          isCurrentQuestionCorrect: isCorrect,
        });
      },

      resetProgress: () => {
        set({
          attemptedQuestions: [],
          correctlyAnsweredQuestions: [],
          // Reset derived state
          questionsAttemptedCount: 0,
          questionsCorrectCount: 0,
          isCurrentQuestionAttempted: false,
          isCurrentQuestionCorrect: false,
        });
      },
    }),
    {
      name: 'quiz-storage', // name of the item in localStorage
      partialize: (state) => ({
        // Only persist these fields
        attemptedQuestions: state.attemptedQuestions,
        correctlyAnsweredQuestions: state.correctlyAnsweredQuestions,
      }),
    }
  )
);

// Helper function to shuffle answers
function shuffleAnswers(answers) {
  if (!answers || !Array.isArray(answers)) return [];

  // Create a copy of the answers array to avoid mutating the original
  const answersCopy = [...answers];

  // Fisher-Yates shuffle algorithm
  for (let i = answersCopy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [answersCopy[i], answersCopy[j]] = [answersCopy[j], answersCopy[i]];
  }

  return answersCopy;
}

export default useQuizStore;
