import { useCallback, useEffect, useState } from "react";
import { useLiveAPIContext } from "../../../src/contexts/LiveAPIContext";
import cn from "classnames";

const voiceOptions = [
  { value: "Puck", label: "Puck", icon: "/voices/Puck.png" },
  { value: "Charon", label: "Charon", icon: "/voices/Charon.png" },
  { value: "Kore", label: "Kore", icon: "/voices/Kore.png" },
  { value: "Fenrir", label: "Fenrir", icon: "/voices/Fenrir.png" },
  { value: "Aoede", label: "Aoede", icon: "/voices/Aoede.png" },
];

export default function VoiceSelector() {
  const { config, setConfig } = useLiveAPIContext();

  const [selectedVoice, setSelectedVoice] = useState("Puck");

  useEffect(() => {
    const voiceName =
      config.speechConfig?.voiceConfig?.prebuiltVoiceConfig?.voiceName || "Puck";
    setSelectedVoice(voiceName);
  }, [config]);

  const updateConfig = useCallback(
    (voiceName: string) => {
      setConfig({
        ...config,
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: voiceName,
            },
          },
        },
      });
      setSelectedVoice(voiceName);
    },
    [config, setConfig]
  );

  return (
    <div className="voice-selector-container">
      <h2 className="selector-title">Voice</h2>
      <div className="options-grid">
        {voiceOptions.map((option) => (
          <button
            key={option.value}
            className={cn("option-button", {
              selected: selectedVoice === option.value,
            })}
            onClick={() => updateConfig(option.value)}
          >
            <img src={option.icon} alt={option.label} className="option-icon" />
            <span className="option-label">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
