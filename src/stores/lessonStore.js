import { create } from 'zustand';

const useLessonStore = create((set) => ({
  // State
  isVisible: false,
  content: null,
  questionId: null,

  // Actions
  showLesson: (questionId, content) => {
    set({
      isVisible: true,
      content,
      questionId,
    });
  },

  hideLesson: () => {
    set({
      isVisible: false,
    });
  },

  setContent: (content) => {
    set({
      content,
    });
  },
}));

export default useLessonStore;