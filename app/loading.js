import React from "react";

const loading = () => {
  return (
    <div className="container mx-auto flex flex-col items-center justify-center min-h-[60vh]">
      <div className="relative flex items-center justify-center mb-6">
        <span className="sr-only">Loading...</span>
        <div
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"
          aria-label="Loading spinner"
        ></div>
      </div>
      <span className="text-lg font-semibold text-muted-foreground">
        Loading...
      </span>
    </div>
  );
};

export default loading;
