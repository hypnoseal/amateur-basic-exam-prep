import { getAllQuestions } from './questions';
import { parseQuestionId } from './questionIdParser';

/**
 * Interface for question IDs grouped by category
 */
export interface QuestionIdsByCategory {
  all: string[];
  byCategory: Record<string, string[]>;
  bySubcategory: Record<string, string[]>;
}

/**
 * Gets all question IDs grouped by category and subcategory
 * @returns Object containing all IDs and IDs grouped by category and subcategory
 */
export function getQuestionIdsByCategory(): QuestionIdsByCategory {
  const questions = getAllQuestions();
  const allIds: string[] = [];
  const byCategory: Record<string, string[]> = {};
  const bySubcategory: Record<string, string[]> = {};

  questions.forEach(question => {
    const id = question.id;
    allIds.push(id);

    const parsedId = parseQuestionId(id);
    if (parsedId) {
      // Group by category
      const categoryCode = parsedId.categoryCode;
      if (!byCategory[categoryCode]) {
        byCategory[categoryCode] = [];
      }
      byCategory[categoryCode].push(id);

      // Group by subcategory (using fullCode which is category-subcategory)
      const fullCode = parsedId.fullCode;
      if (!bySubcategory[fullCode]) {
        bySubcategory[fullCode] = [];
      }
      bySubcategory[fullCode].push(id);
    }
  });

  return {
    all: allIds,
    byCategory,
    bySubcategory
  };
}

/**
 * Gets a random question ID from a specific category
 * @param categoryCode The category code to get a question from
 * @returns A random question ID from the specified category, or null if no questions found
 */
export function getRandomQuestionIdFromCategory(categoryCode: string): string | null {
  const { byCategory } = getQuestionIdsByCategory();
  const categoryIds = byCategory[categoryCode];

  if (!categoryIds || categoryIds.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * categoryIds.length);
  return categoryIds[randomIndex];
}

/**
 * Gets a random question ID from a specific subcategory
 * @param categoryCode The category code
 * @param subcategoryCode The subcategory code
 * @returns A random question ID from the specified subcategory, or null if no questions found
 */
export function getRandomQuestionIdFromSubcategory(
  categoryCode: string,
  subcategoryCode: string
): string | null {
  const { bySubcategory } = getQuestionIdsByCategory();
  const fullCode = `${categoryCode}-${subcategoryCode}`;
  const subcategoryIds = bySubcategory[fullCode];

  if (!subcategoryIds || subcategoryIds.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * subcategoryIds.length);
  return subcategoryIds[randomIndex];
}