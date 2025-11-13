"use client";

import { useState, useRef, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { X, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";

export function IconSelector({ value, onChange, label = "Icon" }) {
  const [inputValue, setInputValue] = useState(value || "");
  const inputRef = useRef(null);

  useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue || null);
  };

  const handleClear = () => {
    setInputValue("");
    onChange(null);
    inputRef.current?.focus();
  };

  // Check if the value is an emoji or icon
  const isValidIcon = (val) => {
    if (!val) return false;
    // Check for emoji pattern (most emojis)
    const emojiPattern =
      /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA00}-\u{1FAFF}]/u;
    // Also allow single character icons/symbols
    return emojiPattern.test(val) || val.length <= 2;
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-3">
        {/* Icon Preview */}
        {inputValue && (
          <div className="flex items-center justify-center w-12 h-12 border-2 border-gray-300 dark:border-gray-600 rounded-md text-2xl bg-gray-50 dark:bg-gray-900">
            {inputValue}
          </div>
        )}

        {/* Input Field */}
        <div className="flex-1 relative">
          <Input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Press Win + . to insert emoji or paste icon"
            className="pr-10 text-lg"
            maxLength={10}
          />
          {inputValue && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-destructive/10"
              title="Clear icon"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </Button>
          )}
        </div>
      </div>

      {/* Helper Text */}
      <p className="text-xs text-muted-foreground flex items-center gap-1">
        <Smile className="h-3 w-3" />
        <span>
          Use{" "}
          <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-gray-100 dark:bg-gray-800 rounded">
            Win + .
          </kbd>{" "}
          to open emoji picker, or paste any icon/emoji from online
        </span>
      </p>

      {/* Validation Message */}
      {inputValue && !isValidIcon(inputValue) && (
        <p className="text-xs text-amber-600 dark:text-amber-400">
          Note: This may not display correctly. Use a single emoji or icon
          character.
        </p>
      )}
    </div>
  );
}

// Helper function to render emoji from string
export function renderIcon(iconName, className = "text-xl") {
  if (!iconName) {
    return null;
  }
  // If it's already an emoji, return it
  // Check for emoji pattern (most emojis)
  if (
    /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA00}-\u{1FAFF}]/u.test(
      iconName
    )
  ) {
    return <span className={className}>{iconName}</span>;
  }
  // Also allow other single character icons
  if (iconName.length <= 2) {
    return <span className={className}>{iconName}</span>;
  }
  return null;
}
