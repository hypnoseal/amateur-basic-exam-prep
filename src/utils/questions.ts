// Centralized utility for loading and processing question files
import type { ComponentType } from 'react';

// Define interfaces for question data
export interface Answer {
  text: string;
  correct: boolean;
  explanation?: string;
}

export interface QuestionFrontmatter {
  id: string;
  question: string;
  answers: Answer[];
}

export interface QuestionFile {
  frontmatter: QuestionFrontmatter;
  Content: ComponentType;
}

export interface Question {
  id: string;
  question: string;
  answers: Answer[];
}

export interface QuestionWithContent extends Question {
  Content: ComponentType;
}

// Get all question files at build time
export const questionFiles: Record<string, QuestionFile> = import.meta.glob('../questions/*.mdx', { eager: true }) as Record<string, QuestionFile>;

// Get all questions with their data
export function getAllQuestions(): Question[] {
  return Object.values(questionFiles).map(file => {
    return { 
      id: file.frontmatter.id, 
      question: file.frontmatter.question, 
      answers: file.frontmatter.answers 
    };
  });
}

// Get a specific question by ID
export function getQuestionById(id: string): QuestionWithContent | null {
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
