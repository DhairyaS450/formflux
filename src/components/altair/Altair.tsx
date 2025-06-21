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
  const [jsonString, setJSONString] = useState<string>("");
  const { client, setConfig, setModel } = useLiveAPIContext();

  useEffect(() => {
    setModel("models/gemini-2.5-flash-preview-native-audio-dialog");
    setConfig({
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: "Aoede" } },
      },      
      // proactivity: {
      //   proactiveAudio: true
      // },
      systemInstruction: {
        parts: [
          {
            text: `You are an AI fitness coach specialized in real-time exercise form correction. Your primary role is to:

1. ANALYZE exercise form and technique from video/image input
2. PROVIDE immediate, specific feedback on posture and movement
3. SUGGEST precise corrections (e.g., "Move your hands 2 inches closer together" or "Lower your hips by 3 inches")
4. COUNT repetitions and track workout progress. Make sure you are actively counting and using the count_rep function for each rep. 
5. PREVENT injuries by identifying dangerous form mistakes

For exercises like push-ups, squats, deadlifts, etc., focus on:
- Joint alignment and positioning
- Range of motion
- Tempo and breathing
- Common form mistakes
- Safety considerations

Always be encouraging while being precise about corrections. Use clear, actionable language. Be very natural and concise.`,
          },
        ],
      },
      tools: [
        // there is a free-tier quota for search
        { googleSearch: {} },
        { functionDeclarations: [repCountDeclaration] },
      ],
    });
  }, [setConfig, setModel]);

  useEffect(() => {
    const onToolCall = (toolCall: LiveServerToolCall) => {
      if (!toolCall.functionCalls) {
        return;
      }

      const repFc = toolCall.functionCalls.find(
        (fc) => fc.name === repCountDeclaration.name
      );
      if (repFc) {
        onRepCount();
      }

      // send data for the response of your tool call
      // in this case Im just saying it was successful
      if (toolCall.functionCalls.length) {
        setTimeout(
          () =>
            client.sendToolResponse({
              functionResponses: toolCall.functionCalls?.map((fc) => ({
                response: { output: { success: true } },
                id: fc.id,
                name: fc.name,
              })),
            }),
          200
        );
      }
    };
    client.on("toolcall", onToolCall);
    return () => {
      client.off("toolcall", onToolCall);
    };
  }, [client, onRepCount]);

  const embedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (embedRef.current && jsonString) {
      console.log("jsonString", jsonString);
      vegaEmbed(embedRef.current, JSON.parse(jsonString));
    }
  }, [embedRef, jsonString]);
  return <div className="vega-embed" ref={embedRef} />;
}

export const Altair = memo(AltairComponent);
