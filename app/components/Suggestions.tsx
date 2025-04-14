"use client";

import { createPortal } from "react-dom";
import { Suggestion } from "../types/suggestions";
import { IconMapPin, IconPackage, IconQuestionMark } from "@tabler/icons-react";
import { forwardRef } from "react";

interface SuggestionsProps {
  suggestions: Suggestion[];
  inputRect: DOMRect | null;
  portalContainer: HTMLElement | null;
  onSelect: (suggestion: Suggestion) => void;
}

const TypeIcon = ({ type }: { type: Suggestion["type"] }) => {
  switch (type) {
    case "location":
      return <IconMapPin className="w-4 h-4 text-blue-500" />;
    case "item":
      return <IconPackage className="w-4 h-4 text-green-500" />;
    case "option":
      return <IconQuestionMark className="w-4 h-4 text-purple-500" />;
  }
};

const TypeBadge = ({ type }: { type: Suggestion["type"] }) => {
  const colors = {
    location: "bg-blue-100",
    item: "bg-green-100",
    option: "bg-purple-100",
  };

  const textColors = {
    location: "text-blue-800",
    item: "text-green-800",
    option: "text-purple-800",
  };

  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full ${colors[type]} ${textColors[type]}`}
    >
      {type === "option" ? "question" : type}
    </span>
  );
};

export const Suggestions = forwardRef<HTMLDivElement, SuggestionsProps>(
  function Suggestions(
    { suggestions, inputRect, portalContainer, onSelect },
    ref
  ) {
    if (!suggestions.length || !inputRect || !portalContainer) return null;

    return createPortal(
      <div
        ref={ref}
        className="fixed bg-white rounded-lg border-2 border-indigo-500 shadow-2xl z-[9999] max-h-96 overflow-y-auto"
        style={{
          top: `${inputRect.top - 5}px`,
          transform: "translateY(-100%)",
          left: `${inputRect.left}px`,
          width: `${inputRect.width}px`,
        }}
      >
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            className="w-full text-left px-4 py-2 hover:bg-indigo-50 focus:bg-indigo-50 focus:outline-none cursor-pointer group"
            onClick={() => onSelect(suggestion)}
          >
            <div className="flex items-center gap-2">
              <TypeIcon type={suggestion.type} />
              <span className={`font-medium text-black`}>
                {suggestion.type === "option"
                  ? suggestion.description
                  : suggestion.label}
              </span>
              <TypeBadge type={suggestion.type} />
            </div>
            {suggestion.description && suggestion.type !== "option" && (
              <p className="text-sm text-black mt-1 pl-6">
                {suggestion.description}
              </p>
            )}
          </button>
        ))}
      </div>,
      portalContainer
    );
  }
);
