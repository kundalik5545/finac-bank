"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export function ColorPicker({ value, onChange, label = "Color" }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-md border-2 border-gray-300 dark:border-gray-600 cursor-pointer"
          style={{
            backgroundColor: value || "#000000",
          }}
        />
        <Input
          type="color"
          value={value || "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="w-24 h-10 cursor-pointer"
        />
        <Input
          type="text"
          value={value || ""}
          onChange={(e) => {
            const val = e.target.value;
            if (val === "" || /^#[0-9A-Fa-f]{6}$/.test(val)) {
              onChange(val);
            }
          }}
          placeholder="#000000"
          className="flex-1"
          maxLength={7}
        />
      </div>
    </div>
  );
}

