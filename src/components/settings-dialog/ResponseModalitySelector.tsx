import { useCallback, useState } from "react";
import { useLiveAPIContext } from "../../../src/contexts/LiveAPIContext";
import { Modality } from "@google/genai";
import cn from "classnames";

const responseOptions = [
  { value: "audio", label: "Audio" },
  { value: "text", label: "Text" },
];

export default function ResponseModalitySelector() {
  const { config, setConfig } = useLiveAPIContext();

  const [selectedModality, setSelectedModality] = useState("audio");

  const updateConfig = useCallback(
    (modality: "audio" | "text") => {
      setConfig({
        ...config,
        responseModalities: [
          modality === "audio" ? Modality.AUDIO : Modality.TEXT,
        ],
      });
      setSelectedModality(modality);
    },
    [config, setConfig]
  );

  return (
    <div className="response-modality-selector-container">
      <h2 className="selector-title">Response Modality</h2>
      <div className="options-grid">
        {responseOptions.map((option) => (
          <button
            key={option.value}
            className={cn("option-button", {
              selected: selectedModality === option.value,
            })}
            onClick={() => updateConfig(option.value as "audio" | "text")}
          >
            <span className="option-label">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
