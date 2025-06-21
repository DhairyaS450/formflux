'use client';

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

// React imports for context creation and usage
import { createContext, FC, ReactNode, useContext } from "react";
// Custom hook for Live API functionality
import { useLiveAPI, UseLiveAPIResults } from "@/hooks/use-live-api";
// Type definitions for API configuration
import { LiveClientOptions } from "@/types";

// Create the Live API context with undefined default value
const LiveAPIContext = createContext<UseLiveAPIResults | undefined>(undefined);

// Props interface for the Live API provider
export type LiveAPIProviderProps = {
  children: ReactNode; // Child components to wrap
  options: LiveClientOptions; // Configuration options for the Live API client
};

/**
 * Live API Provider component
 * Wraps the application with Live API functionality and provides
 * real-time AI streaming capabilities to child components
 */
export const LiveAPIProvider: FC<LiveAPIProviderProps> = ({
  options,
  children,
}) => {
  // Initialize the Live API hook with provided options
  const liveAPI = useLiveAPI(options);

  return (
    <LiveAPIContext.Provider value={liveAPI}>
      {children}
    </LiveAPIContext.Provider>
  );
};

/**
 * Custom hook to access the Live API context
 * Provides access to AI streaming functionality including:
 * - Connection management
 * - Real-time input/output
 * - Client state
 * 
 * @throws Error if used outside of LiveAPIProvider
 */
export const useLiveAPIContext = () => {
  const context = useContext(LiveAPIContext);
  if (!context) {
    throw new Error("useLiveAPIContext must be used within a LiveAPIProvider");
  }
  return context;
};
