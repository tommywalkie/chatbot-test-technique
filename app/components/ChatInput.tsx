"use client";

import { useState, useRef, memo } from "react";
import { Suggestions } from "./Suggestions";
import { useSuggestions } from "../hooks/useSuggestions";
import { QuestionBuilder } from "./QuestionBuilder";
import { useClickOutside } from "../hooks/useClickOutside";
import { Suggestion } from "../types/suggestions";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isDisabled?: boolean;
}

const ChatInput = memo(function ChatInput({
  onSendMessage,
  isDisabled = false,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const { suggestions, portalContainer, clearSuggestions, showSuggestions } =
    useSuggestions(message);
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedOption, setSelectedOption] = useState<{
    name: string;
    description: string;
  } | null>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = () => {
    clearSuggestions();
  };

  useClickOutside(inputRef, handleClickOutside, [suggestionsRef]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  const handleSuggestionSelect = (suggestion: Suggestion) => {
    if (suggestion.type === "option") {
      setSelectedOption({
        name: suggestion.label,
        description: suggestion.description,
      });
      clearSuggestions();
    } else {
      const words = message.trim().split(/\s+/);
      const lastWord = words[words.length - 1];
      const newMessage = message.replace(lastWord, suggestion.value);
      setMessage(newMessage);
      clearSuggestions();
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isDisabled) {
      onSendMessage(message);
      setMessage("");
      clearSuggestions();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      if (message.trim() && !isDisabled) {
        onSendMessage(message);
        setMessage("");
        clearSuggestions();
      }
    }
  };

  const handleInputFocus = () => {
    showSuggestions();
  };

  return (
    <div className="w-full max-w-3xl relative">
      <form onSubmit={handleSubmit}>
        <div className="relative flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Tapez votre message..."
            disabled={isDisabled}
            aria-label="Message à envoyer"
            className="w-full p-4 pr-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-400 shadow-sm transition-all duration-200 text-black"
            onFocus={handleInputFocus}
          />
          <button
            type="submit"
            disabled={!message.trim() || isDisabled}
            aria-label="Envoyer le message"
            className="absolute right-3 p-2 text-white bg-indigo-600 rounded-full hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
              />
            </svg>
          </button>
        </div>
      </form>
      <Suggestions
        ref={suggestionsRef}
        suggestions={suggestions}
        inputRect={inputRef.current?.getBoundingClientRect() ?? null}
        portalContainer={portalContainer}
        onSelect={handleSuggestionSelect}
      />
      <QuestionBuilder
        isOpen={selectedOption !== null}
        onClose={() => setSelectedOption(null)}
        onSubmit={(question) => {
          setMessage(question);
          setSelectedOption(null);
          inputRef.current?.focus();
        }}
        option={selectedOption}
      />
    </div>
  );
});

ChatInput.displayName = "ChatInput";

export default ChatInput;
