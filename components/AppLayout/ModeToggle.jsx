"use client";
import React from "react";
import { Button } from "../ui/button";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

const ModeToggle = () => {
  const { theme, setTheme } = useTheme();
  return (
    <div>
      <Button
        size="icon"
        variant="ghost"
        onClick={() =>
          theme === "light" ? setTheme("dark") : setTheme("light")
        }
      >
        {theme === "light" ? <Moon /> : <Sun />}
      </Button>
    </div>
  );
};

export default ModeToggle;
