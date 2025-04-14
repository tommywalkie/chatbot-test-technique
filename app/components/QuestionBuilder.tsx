"use client";

import { useState, useEffect } from "react";
import { QuestionTemplate, QuestionField } from "../types/questions";
import { IconX } from "@tabler/icons-react";

interface QuestionBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (question: string) => void;
  option: {
    name: string;
    description: string;
  } | null;
}

interface FieldOption {
  name: string;
  category?: string;
  type?: string;
}

export function QuestionBuilder({
  isOpen,
  onClose,
  onSubmit,
  option,
}: QuestionBuilderProps) {
  const [fields, setFields] = useState<QuestionField[]>([]);
  const [fieldOptions, setFieldOptions] = useState<
    Record<string, FieldOption[]>
  >({
    item: [],
    location: [],
  });

  useEffect(() => {
    const fetchFieldOptions = async () => {
      try {
        const response = await fetch("/api/suggestions");
        const data = await response.json();

        setFieldOptions({
          item: data.filter((item: any) => item.category === "item"),
          location: data.filter((item: any) => item.category === "location"),
        });
      } catch (error) {
        console.error("Failed to fetch field options:", error);
      }
    };

    if (isOpen) {
      fetchFieldOptions();
    }
  }, [isOpen]);

  // Initialiser les champs quand une option est sélectionnée
  useEffect(() => {
    if (option) {
      const template = parseQuestionTemplate(option);
      setFields(template.fields);
    }
  }, [option]);

  if (!isOpen || !option) return null;

  const handleFieldChange = (key: string, value: string) => {
    setFields((prev) =>
      prev.map((field) => (field.key === key ? { ...field, value } : field))
    );
  };

  const handleSubmit = () => {
    if (fields.every((f) => f.value)) {
      let finalQuestion = "Je souhaite ";

      // This also could be prepared from the backend
      switch (option.name) {
        case "stock":
          finalQuestion += `obtenir le stock de ${
            fields.find((f) => f.type === "item")?.value
          } `;
          finalQuestion += `à ${
            fields.find((f) => f.type === "location")?.value
          }`;
          break;
        case "lost":
          finalQuestion += `connaître les pertes de ${
            fields.find((f) => f.type === "item")?.value
          } `;
          finalQuestion += `à ${
            fields.find((f) => f.type === "location")?.value
          }`;
          break;
        case "report":
          finalQuestion += `un rapport sur ${
            fields.find((f) => f.type === "item")?.value
          } `;
          finalQuestion += `à ${
            fields.find((f) => f.type === "location")?.value
          }`;
          break;
        case "item_details":
          finalQuestion += `obtenir les détails de ${
            fields.find((f) => f.type === "item")?.value
          }`;
          break;
        case "loc_details":
          finalQuestion += `obtenir les détails de ${
            fields.find((f) => f.type === "location")?.value
          }`;
          break;
        default:
          finalQuestion +=
            option.name + " " + fields.map((f) => f.value).join(" ");
      }

      onSubmit(finalQuestion);
      onClose();
    }
  };

  const getOptionsForField = (field: QuestionField) => {
    return fieldOptions[field.type] || [];
  };

  const renderOptionLabel = (option: FieldOption, type: string) => {
    return option.name;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-black">{option.description}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <IconX className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {fields.map((field) => (
            <div key={field.key} className="flex flex-col gap-2">
              <label className="font-medium text-black">
                {field.type === "item" ? "Article" : "Lieu"}
              </label>
              <select
                value={field.value || ""}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                className="border rounded-lg p-2 text-black"
              >
                <option value="" className="text-black">
                  Sélectionnez...
                </option>
                {getOptionsForField(field).map((option) => (
                  <option
                    key={option.name}
                    value={option.name}
                    className="text-black"
                  >
                    {renderOptionLabel(option, field.type)}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={!fields.every((f) => f.value)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300"
          >
            Valider
          </button>
        </div>
      </div>
    </div>
  );
}

function parseQuestionTemplate(option: {
  name: string;
  description: string;
}): QuestionTemplate {
  const fields: QuestionField[] = [];

  // Pour loc_details, on ne veut qu'un champ location
  if (option.name === "loc_details") {
    fields.push({ key: "y", type: "location", value: null });
    return {
      name: option.name,
      description: option.description,
      fields,
    };
  }

  // Pour item_details, on ne veut qu'un champ item
  if (option.name === "item_details") {
    fields.push({ key: "x", type: "item", value: null });
    return {
      name: option.name,
      description: option.description,
      fields,
    };
  }

  // Pour les autres questions qui ont besoin des deux champs
  if (option.description.includes("item x")) {
    fields.push({ key: "x", type: "item", value: null });
  }
  if (option.description.includes("lieu y")) {
    fields.push({ key: "y", type: "location", value: null });
  }

  return {
    name: option.name,
    description: option.description,
    fields,
  };
}
