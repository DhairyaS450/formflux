import {
  ChangeEvent,
  FormEventHandler,
  useCallback,
  useMemo,
  useState,
} from "react";
import "./settings-dialog.scss";
import { useLiveAPIContext } from "../../../src/contexts/LiveAPIContext";
import VoiceSelector from "./VoiceSelector";
import ResponseModalitySelector from "./ResponseModalitySelector";
import { FunctionDeclaration, LiveConnectConfig, Tool } from "@google/genai";

type FunctionDeclarationsTool = Tool & {
  functionDeclarations: FunctionDeclaration[];
};

export type SettingsDialogProps = {
  open: boolean;
  onClose: () => void;
};

export default function SettingsDialog({ open, onClose }: SettingsDialogProps) {
  const { config, setConfig, connected } = useLiveAPIContext();
  const functionDeclarations: FunctionDeclaration[] = useMemo(() => {
    if (!Array.isArray(config.tools)) {
      return [];
    }
    return (config.tools as Tool[])
      .filter(
        (t: Tool): t is FunctionDeclarationsTool =>
          "functionDeclarations" in t &&
          Array.isArray((t as FunctionDeclarationsTool).functionDeclarations)
      )
      .map((t) => t.functionDeclarations)
      .filter((fc) => !!fc)
      .flat();
  }, [config]);

  // system instructions can come in many types
  const systemInstruction = useMemo(() => {
    if (!config.systemInstruction) {
      return "";
    }
    if (typeof config.systemInstruction === "string") {
      return config.systemInstruction;
    }
    if (Array.isArray(config.systemInstruction)) {
      return config.systemInstruction
        .map((p) => (typeof p === "string" ? p : p.text))
        .join("\n");
    }
    if (
      typeof config.systemInstruction === "object" &&
      "parts" in config.systemInstruction
    ) {
      return (
        config.systemInstruction.parts?.map((p) => p.text).join("\n") || ""
      );
    }
    return "";
  }, [config]);

  const updateConfig: FormEventHandler<HTMLTextAreaElement> = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      const newConfig: LiveConnectConfig = {
        ...config,
        systemInstruction: event.target.value,
      };
      setConfig(newConfig);
    },
    [config, setConfig]
  );

  const updateFunctionDescription = useCallback(
    (editedFdName: string, newDescription: string) => {
      const newConfig: LiveConnectConfig = {
        ...config,
        tools:
          config.tools?.map((tool) => {
            const fdTool = tool as FunctionDeclarationsTool;
            if (!Array.isArray(fdTool.functionDeclarations)) {
              return tool;
            }
            return {
              ...tool,
              functionDeclarations: fdTool.functionDeclarations.map((fd) =>
                fd.name === editedFdName
                  ? { ...fd, description: newDescription }
                  : fd
              ),
            };
          }) || [],
      };
      setConfig(newConfig);
    },
    [config, setConfig]
  );

  if (!open) {
    return null;
  }

  return (
    <div className="settings-dialog-overlay" onClick={onClose}>
      <dialog
        className="dialog"
        open={open}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`dialog-container ${connected ? "disabled" : ""}`}>
          {connected && (
            <div className="connected-indicator">
              <p>
                These settings can only be applied before connecting and will
                override other settings.
              </p>
            </div>
          )}
          <div className="mode-selectors">
            <ResponseModalitySelector />
            <VoiceSelector />
          </div>

          <h3>System Instructions</h3>
          <textarea
            className="system"
            onChange={updateConfig}
            value={systemInstruction}
          />
          <h4>Function declarations</h4>
          <div className="function-declarations">
            <div className="fd-rows">
              {functionDeclarations.map((fd, fdKey) => (
                <div className="fd-row" key={`function-${fdKey}`}>
                  <span className="fd-row-name">{fd.name}</span>
                  <span className="fd-row-args">
                    {Object.keys(fd.parameters?.properties || {}).map(
                      (item, k) => (
                        <span key={k}>{item}</span>
                      )
                    )}
                  </span>
                  <input
                    key={`fd-${fd.description}`}
                    className="fd-row-description"
                    type="text"
                    defaultValue={fd.description}
                    onBlur={(e) =>
                      updateFunctionDescription(fd.name!, e.target.value)
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </dialog>
    </div>
  );
}
