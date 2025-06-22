/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { useEffect, useRef, useState, memo } from "react";
import vegaEmbed from "vega-embed";
import { useLiveAPIContext } from "../../../src/contexts/LiveAPIContext";
import {
  FunctionDeclaration,
  LiveServerToolCall,
  Modality,
  Type,
} from "@google/genai";

const repCountDeclaration: FunctionDeclaration = {
  name: "count_rep",
  description: "Increments the rep counter by one.",
  parameters: {
    type: Type.OBJECT,
    properties: {},
  },
};

function AltairComponent({ onRepCount }: { onRepCount: () => void }) {
  console.log("AltairComponent rendered");
  const [jsonString, setJSONString] = useState<string>("");
  const { client, setConfig, setModel } = useLiveAPIContext();

  useEffect(() => {
    console.log("AltairComponent: useEffect for setting model and config running");
    setModel("models/gemini-2.5-flash-preview-native-audio-dialog");
    setConfig({
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: "Puck" } },
      },      
      systemInstruction: {
        parts: [
          {
            text: `You are an AI fitness coach specialized in real-time exercise form correction. Your primary role is to analyze a JSON stream of pose data and provide feedback.

You will receive a continuous stream of JSON objects containing key body angles, like this:
{ "leftElbow": 170, "rightElbow": 165, "leftKnee": 95, ... }

1. ANALYZE these angles to understand the user's exercise form.
2. PROVIDE immediate, specific, and concise verbal feedback on their posture and movement.
3. SUGGEST precise corrections (e.g., "Lower your hips," or "Straighten your left arm.").
4. PREVENT injuries by identifying dangerous form mistakes based on the angle data.
5. COUNT reps always, unless the form was horrible. Use count_rep function call.

Occasionally, you will receive an image for visual context, but your primary analysis should be on the JSON angle data.
If the user's camera or mic is not working, say so directly.
Always be encouraging while being precise. Use clear, actionable language. Be very natural and concise.

When it looks like the user is giving up, give them motivation.`,
          },
        ],
      },
      tools: [
        // there is a free-tier quota for search
        // { googleSearch: {} },
        { functionDeclarations: [repCountDeclaration] },
      ],
    });
  }, [setConfig, setModel]);

  useEffect(() => {
    console.log("AltairComponent: useEffect for toolcall listener running");
    const onToolCall = (toolCall: LiveServerToolCall) => {
      console.log("AltairComponent: 'toolcall' event received", toolCall);
      if (!toolCall.functionCalls) {
        return;
      }

      const repFc = toolCall.functionCalls.find(
        (fc) => fc.name === repCountDeclaration.name
      );
      if (repFc) {
        console.log("AltairComponent: rep_count function call found. Calling onRepCount.");
        onRepCount();
      }

      // send data for the response of your tool call
      // in this case Im just saying it was successful
      if (toolCall.functionCalls.length) {
        console.log("AltairComponent: Sending tool response for", toolCall.functionCalls.length, "function calls.");
        setTimeout(
          () => {
            console.log("AltairComponent: setTimeout callback fired. Sending tool response now.");
            client.sendToolResponse({
              functionResponses: toolCall.functionCalls?.map((fc) => ({
                response: { output: { success: true } },
                id: fc.id,
                name: fc.name,
              })),
            });
          },
          50
        );
      }
    };
    client.on("toolcall", onToolCall);
    return () => {
      console.log("AltairComponent: Cleaning up toolcall listener");
      client.off("toolcall", onToolCall);
    };
  }, [client, onRepCount]);

  const altairContainer = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (altairContainer.current && jsonString) {
      console.log("AltairComponent: vegaEmbed with jsonString", jsonString);
      vegaEmbed(altairContainer.current, JSON.parse(jsonString));
    }
  }, [altairContainer, jsonString]);
  return <div className="vega-embed" ref={altairContainer} />;
}

export const Altair = memo(AltairComponent);
