"use client";

import { useState, useEffect } from "react";
import { Suggestion, SuggestionType } from "../types/suggestions";

interface ApiSuggestion {
  name: string;
  description: string;
  category: SuggestionType;
}

export function useSuggestions(inputValue: string) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(
    null
  );
  const [suggestionsData, setSuggestionsData] = useState<ApiSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setPortalContainer(document.body);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const response = await fetch("/api/suggestions");
        const data = await response.json();
        setSuggestionsData(data);
      } catch (error) {
        console.error("Failed to fetch suggestions:", error);
      }
    };

    fetchSuggestions();
  }, []);

  const formatSuggestion = (item: ApiSuggestion): Suggestion => ({
    label: item.name,
    value: item.name,
    type: item.category,
    description: item.description,
  });

  useEffect(() => {
    if (!suggestionsData.length || !isOpen) {
      setSuggestions([]);
      return;
    }

    const trimmedInput = inputValue.trim();

    if (!trimmedInput) {
      setSuggestions(
        suggestionsData
          .filter((item) => item.category === "option")
          .map(formatSuggestion)
      );
      return;
    }

    const words = trimmedInput.split(/\s+/);
    const lastWord = words[words.length - 1]?.toLowerCase() || "";
    const lastTwoWords = `${words[words.length - 2]?.toLowerCase()} ${words[
      words.length - 1
    ]?.toLowerCase()}`;

    const nonOptionData = suggestionsData.filter(
      (item) => item.category !== "option"
    );

    // Simple demo for quick location keywords
    const LOCATION_KEYWORDS = [
      "at",
      "à",
      "in",
      "au",
      "à la",
      "à l'",
      "in the",
      "at the",
      "dans l'",
      "dans la",
      "dans le",
    ];
    console.log({ lastWord, lastTwoWords });
    if (LOCATION_KEYWORDS.includes(lastWord)) {
      setSuggestions(
        nonOptionData
          .filter((item) => item.category === "location")
          .map((item) => ({
            ...formatSuggestion(item),
            value: `${lastWord} ${item.name}`,
          }))
      );
      return;
    } else if (LOCATION_KEYWORDS.includes(lastTwoWords)) {
      setSuggestions(
        nonOptionData
          .filter((item) => item.category === "location")
          .map((item) => ({
            ...formatSuggestion(item),
            value: `${lastTwoWords} ${item.name}`,
          }))
      );
      return;
    }
    console.log(suggestions);

    const matchingSuggestions = nonOptionData
      .filter(
        (item) =>
          item.name.toLowerCase().includes(lastWord) ||
          item.description.toLowerCase().includes(lastWord)
      )
      .map(formatSuggestion)
      .slice(0, 5);

    setSuggestions(matchingSuggestions);
  }, [inputValue, suggestionsData, isOpen]);

  return {
    suggestions,
    portalContainer,
    clearSuggestions: () => setIsOpen(false),
    showSuggestions: () => setIsOpen(true),
  };
}
