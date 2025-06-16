import type {Category, QuestionGroup, Subcategory} from '../types/categories';
import type {Question} from './questions';

/**
 * Parses a question ID in the format L-CCC-SSS-###
 * Where:
 * L - License Level (B=Basic, A=Advanced)
 * CCC - Category Number (3 digits)
 * SSS - Subcategory Number (3 digits)
 * ### - Question Number (3 digits)
 */
export interface ParsedQuestionId {
  licenseLevel: 'B' | 'A';  // B=Basic, A=Advanced
  categoryCode: string;     // 3-digit category code
  subcategoryCode: string;  // 3-digit subcategory code
  questionNumber: string;   // 3-digit question number
  fullCode: string;         // Combined category-subcategory code (e.g., "001-001")
}

/**
 * Parses a question ID and extracts its components
 * @param id Question ID in the format L-CCC-SSS-###
 * @returns Parsed question ID components or null if invalid format
 */
export function parseQuestionId(id: string): ParsedQuestionId | null {
  // Regular expression to match the question ID format
  const regex = /^([BA])-(\d{3})-(\d{3})-(\d{3})$/;
  const match = id.match(regex);
  
  if (!match) {
    return null;
  }
  
  const [, licenseLevel, categoryCode, subcategoryCode, questionNumber] = match;
  
  return {
    licenseLevel: licenseLevel as 'B' | 'A',
    categoryCode,
    subcategoryCode,
    questionNumber,
    fullCode: `${categoryCode}-${subcategoryCode}`
  };
}

/**
 * Groups questions by category and subcategory
 * @param questions Array of questions
 * @param categories Array of categories from categories.json
 * @returns Array of question groups organized by category and subcategory
 */
export function groupQuestionsByCategory(
  questions: Question[],
  categories: Category[]
): QuestionGroup[] {
  const groups: QuestionGroup[] = [];
  const questionsByCode: Record<string, string[]> = {};
  
  // Parse each question ID and group by category-subcategory code
  questions.forEach(question => {
    const parsed = parseQuestionId(question.id);
    if (parsed) {
      const { fullCode } = parsed;
      if (!questionsByCode[fullCode]) {
        questionsByCode[fullCode] = [];
      }
      questionsByCode[fullCode].push(question.id);
    }
  });
  
  // Create question groups based on categories and subcategories
  categories.forEach(category => {
    category.subcategories.forEach(subcategory => {
      const fullCode = `${category.code}-${subcategory.code}`;
      const questionIds = questionsByCode[fullCode] || [];
      
      groups.push({
        categoryCode: category.code,
        subcategoryCode: subcategory.code,
        fullCode,
        questions: questionIds
      });
    });
  });
  
  return groups;
}

/**
 * Finds a category by its code
 * @param categories Array of categories
 * @param code Category code to find
 * @returns The category or undefined if not found
 */
export function findCategoryByCode(categories: Category[], code: string): Category | undefined {
  return categories.find(category => category.code === code);
}

/**
 * Finds a subcategory by its code within a category
 * @param category The category containing subcategories
 * @param code Subcategory code to find
 * @returns The subcategory or undefined if not found
 */
export function findSubcategoryByCode(category: Category, code: string): Subcategory | undefined {
  return category.subcategories.find(subcategory => subcategory.code === code);
}

/**
 * Creates a hierarchical menu structure from categories and question groups
 * @param categories Array of categories
 * @param questionGroups Array of question groups
 * @returns A nested menu structure for rendering
 */
export function createCategoryMenu(categories: Category[], questionGroups: QuestionGroup[]) {
  return categories.map(category => {
    const subcategories = category.subcategories.map(subcategory => {
      const fullCode = `${category.code}-${subcategory.code}`;
      const group = questionGroups.find(g => g.fullCode === fullCode);
      
      return {
        code: subcategory.code,
        title: subcategory.title,
        description: subcategory.description,
        questions: group ? group.questions : []
      };
    });
    
    return {
      code: category.code,
      title: category.title,
      subcategories
    };
  });
}
