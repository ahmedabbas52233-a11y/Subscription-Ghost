import React, { createContext, useContext, useState } from "react";

const AnalysisContext = createContext(null);

export function AnalysisProvider({ children }) {
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const resetAnalysis = () => setCurrentAnalysis(null);

  return (
    <AnalysisContext.Provider value={{ currentAnalysis, setCurrentAnalysis, resetAnalysis }}>
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysis() {
  const ctx = useContext(AnalysisContext);
  if (!ctx) throw new Error("useAnalysis must be used within AnalysisProvider");
  return ctx;
}
