// Represents a single filter option
export interface FilterOption {
    display: string;
    synonyms: string[];
    additional_context: unknown | null;
    isUserAdded: boolean
  }
  
  // Represents a group of filters (e.g., Vaccine-Options)
  export type FilterGroup = Record<string, FilterOption>;
  
  // Represents a category of filters (e.g., Intervention, Outcome)
  export type FilterCategory = Record<string, FilterGroup>;
  
  // Represents the entire data object under "data"
  export interface FiltersData {
    others?: Record<string, string[] | number[]>; // For "others" category (arrays of strings/numbers)
    tag_filters: Record<string, FilterCategory>; // For "tag_filters" category
  }
  
  // Represents the full API response
  export interface FiltersApiResponse {
    success: boolean;
    data: FiltersData;
    message: string;
    status: string;
  }
  