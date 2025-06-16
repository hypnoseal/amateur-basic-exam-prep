
export interface Subcategory {
    code: string;            // e.g., "001"
    title: string;           // e.g., "Radio Licences"
    description: string;     // Detailed description
}

export interface Category {
    code: string;            // e.g., "001"
    title: string;           // e.g., "Regulations and Policies"
    subcategories: Subcategory[];
}

export interface QuestionGroup {
    categoryCode: string;    // e.g., "001"
    subcategoryCode: string; // e.g., "001"
    fullCode: string;        // e.g., "001-001"
    questions: string[];     // Array of question IDs
}