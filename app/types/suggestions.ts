export type SuggestionType = "option" | "location" | "item";

export interface Suggestion {
  label: string;
  value: string;
  type: SuggestionType;
  description: string;
}
