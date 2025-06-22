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

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GenAILiveClient } from "@/lib/genai-live-client";
import { LiveClientOptions } from "@/types";
import { AudioStreamer } from "@/lib/audio-streamer";
import { audioContext } from "@/lib/utils";
import VolMeterWorket from "@/lib/worklets/vol-meter";
import { LiveConnectConfig } from "@google/genai";

export type UseLiveAPIResults = {
  client: GenAILiveClient;
  setConfig: (config: LiveConnectConfig) => void;
  config: LiveConnectConfig;
  model: string;
  setModel: (model: string) => void;
  connected: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  volume: number;
};

export function useLiveAPI(options: LiveClientOptions): UseLiveAPIResults {
  console.log("useLiveAPI hook initialized");
  const client = useMemo(() => {
    console.log("useLiveAPI: Creating new GenAILiveClient");
    return new GenAILiveClient(options);
  }, [options]);
  const audioStreamerRef = useRef<AudioStreamer | null>(null);

  const [model, setModel] = useState<string>("models/gemini-2.5-flash-preview-native-audio-dialog");
  const [config, setConfig] = useState<LiveConnectConfig>({});
  const [connected, setConnected] = useState(false);
  const [volume, setVolume] = useState(0);

  // register audio for streaming server -> speakers
  useEffect(() => {
    console.log("useLiveAPI: Audio streamer setup effect running");
    if (!audioStreamerRef.current) {
      console.log("useLiveAPI: Initializing audio streamer");
      audioContext({ id: "audio-out" }).then((audioCtx: AudioContext) => {
        console.log("useLiveAPI: AudioContext obtained, creating AudioStreamer");
        audioStreamerRef.current = new AudioStreamer(audioCtx);
        audioStreamerRef.current
          .addWorklet("vumeter-out", VolMeterWorket, (ev: MessageEvent) => {
            setVolume(ev.data.volume);
          })
          .then(() => {
            console.log("useLiveAPI: Audio worklet added successfully");
            // Successfully added worklet
          });
      });
    }
  }, [audioStreamerRef]);

  useEffect(() => {
    console.log("useLiveAPI: Registering client event listeners");
    const onOpen = () => {
      console.log("useLiveAPI: 'open' event received, setting connected to true");
      setConnected(true);
    };

    const onClose = (event: CloseEvent) => {
      console.log("useLiveAPI: 'close' event received, setting connected to false. Reason:", event.reason, "Code:", event.code);
      setConnected(false);
    };

    const onError = (error: ErrorEvent) => {
      console.error("useLiveAPI: 'error' event received", error);
    };

    const stopAudioStreamer = () => {
      console.log("useLiveAPI: 'interrupted' event received, stopping audio streamer");
      audioStreamerRef.current?.stop();
    };

    const onAudio = (data: ArrayBuffer) =>
      audioStreamerRef.current?.addPCM16(new Uint8Array(data));

    client
      .on("error", onError)
      .on("open", onOpen)
      .on("close", onClose)
      .on("interrupted", stopAudioStreamer)
      .on("audio", onAudio);

    return () => {
      console.log("useLiveAPI: Cleaning up client event listeners and disconnecting");
      client
        .off("error", onError)
        .off("open", onOpen)
        .off("close", onClose)
        .off("interrupted", stopAudioStreamer)
        .off("audio", onAudio)
        .disconnect();
    };
  }, [client]);

  const connect = useCallback(async () => {
    console.log("useLiveAPI: connect function called");
    if (!config) {
      console.error("useLiveAPI: connect called but config is not set");
      throw new Error("config has not been set");
    }
    console.log("useLiveAPI: Disconnecting before reconnecting");
    client.disconnect();
    console.log("useLiveAPI: Connecting with model:", model, "and config:", config);
    await client.connect(model, config);
    console.log("useLiveAPI: client.connect promise resolved");
  }, [client, config, model]);

  const disconnect = useCallback(async () => {
    console.log("useLiveAPI: disconnect function called");
    client.disconnect();
    setConnected(false);
  }, [setConnected, client]);

  return {
    client,
    config,
    setConfig,
    model,
    setModel,
    connected,
    connect,
    disconnect,
    volume,
  };
}
