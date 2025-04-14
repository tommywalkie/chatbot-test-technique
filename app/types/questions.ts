export interface QuestionField {
  key: string; // x ou y dans la description
  type: "item" | "location";
  value: string | null;
}

export interface QuestionTemplate {
  name: string;
  description: string;
  fields: QuestionField[];
}
