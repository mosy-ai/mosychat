import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { IconX, IconLoader } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

interface TagInputProps {
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  placeholder?: string;
  disabled?: boolean;
  isLoadingTags?: boolean;
  tagLoadError?: string | null;
}

export function TagInput({
  value,
  onChange,
  suggestions,
  placeholder = "Type tags...",
  disabled = false,
  isLoadingTags = false,
  tagLoadError = null,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Parse current tags from value
  const currentTags = useMemo(() => 
    value
      .split(",")
      .map(tag => tag.trim())
      .filter(Boolean),
    [value]
  );

  // Filter suggestions based on input value
  const filteredSuggestions = useMemo(() => {
    if (!inputValue.trim()) return suggestions.slice(0, 5);
    
    const query = inputValue.toLowerCase().trim();
    return suggestions
      .filter(suggestion => 
        suggestion.toLowerCase().includes(query) &&
        !currentTags.some(tag => tag.toLowerCase() === suggestion.toLowerCase())
      )
      .slice(0, 8);
  }, [suggestions, inputValue, currentTags]);



  // Debounced suggestions update
  const updateSuggestions = useCallback(
    debounce((input: string) => {
      if (input.trim() && filteredSuggestions.length > 0) {
        setShowSuggestions(true);
        setSelectedSuggestionIndex(-1);
      } else {
        setShowSuggestions(false);
      }
    }, 150),
    [filteredSuggestions]
  );

  useEffect(() => {
    updateSuggestions(inputValue);
  }, [inputValue, updateSuggestions]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Check if user typed space or comma
    if (newValue.endsWith(" ") || newValue.endsWith(",")) {
      const tag = newValue.slice(0, -1).trim();
      if (tag) {
        addTag(tag);
        setInputValue("");
      }
    }
  };

  // Add a new tag
  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (!trimmedTag || currentTags.includes(trimmedTag)) return;

    const newTags = [...currentTags, trimmedTag];
    onChange(newTags.join(", "));
  };

  // Remove a tag
  const removeTag = (tagToRemove: string) => {
    const newTags = currentTags.filter(tag => tag !== tagToRemove);
    onChange(newTags.join(", "));
  };

  // Handle key navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (selectedSuggestionIndex >= 0 && filteredSuggestions.length > 0) {
        addTag(filteredSuggestions[selectedSuggestionIndex]);
        setInputValue("");
        setShowSuggestions(false);
      } else if (inputValue.trim()) {
        addTag(inputValue);
        setInputValue("");
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => 
        prev < filteredSuggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    addTag(suggestion);
    setInputValue("");
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[40px] bg-background">
        {/* Display existing tags as badges */}
        {currentTags.map((tag, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="flex items-center gap-1 px-2 py-1 text-sm"
          >
            {tag}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 hover:bg-transparent"
              onClick={() => removeTag(tag)}
              disabled={disabled}
            >
              <IconX className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
        
        {/* Input field */}
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={currentTags.length === 0 ? placeholder : ""}
                  className="flex-1 min-w-[120px] border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
        disabled={disabled}
        />
      </div>

      {/* Loading indicator */}
      {isLoadingTags && (
        <div className="absolute top-full left-0 right-0 mt-1 p-2 bg-background border rounded-md shadow-lg">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <IconLoader className="h-4 w-4 animate-spin" />
            Loading tags...
          </div>
        </div>
      )}

      {/* Error message */}
      {tagLoadError && (
        <div className="absolute top-full left-0 right-0 mt-1 p-2 bg-destructive/10 border border-destructive/20 rounded-md">
          <div className="text-sm text-destructive">
            {tagLoadError}
          </div>
        </div>
      )}

      {/* Suggestions dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-48 overflow-y-auto"
        >
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={suggestion}
              type="button"
              className={`w-full px-3 py-2 text-left hover:bg-accent ${
                index === selectedSuggestionIndex ? "bg-accent" : ""
              }`}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
} 