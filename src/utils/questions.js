// Centralized utility for loading and processing question files

// Get all question files at build time
export const questionFiles = import.meta.glob('../questions/*.mdx', { eager: true });

// Get all questions with their data
export function getAllQuestions() {
  return Object.values(questionFiles).map(file => {
    const typedFile = file;
    return { 
      id: typedFile.frontmatter.id, 
      question: typedFile.frontmatter.question, 
      answers: typedFile.frontmatter.answers 
    };
  });
}

// Get a specific question by ID
export function getQuestionById(id) {
  const questionFile = Object.values(questionFiles).find(file => {
    return file.frontmatter.id === id;
  });
  
  if (!questionFile) {
    return null;
  }
  
  return {
    id: questionFile.frontmatter.id,
    question: questionFile.frontmatter.question,
    answers: questionFile.frontmatter.answers,
    Content: questionFile.Content
  };
}