import { create } from 'zustand';

const useLessonStore = create((set) => ({
  // State
  isVisible: false,
  content: null,
  questionId: null,

  // Actions
  showLesson: (/** @type {string} */ questionId, /** @type {any} */ content) => {
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

  setContent: (/** @type {any} */ content) => {
    set({
      content,
    });
  },
}));

export default useLessonStore;
