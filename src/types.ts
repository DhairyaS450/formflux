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

// Import Google GenAI types for AI functionality
import {
  GoogleGenAIOptions,
  LiveClientToolResponse,
  LiveServerMessage,
  Part,
} from "@google/genai";

/**
 * Configuration options for the Live API client
 * Extends Google GenAI options and requires an API key for authentication
 * Used to initialize the AI streaming client
 */
export type LiveClientOptions = GoogleGenAIOptions & { apiKey: string };

/**
 * Log entry for streaming operations
 * Tracks various types of events during AI streaming sessions
 */
export type StreamingLog = {
  date: Date; // Timestamp of the log entry
  type: string; // Type of log entry (e.g., 'input', 'output', 'error')
  count?: number; // Optional count for batch operations
  message: // The actual log message content
    | string // Simple string message
    | ClientContentLog // Client-specific content log
    | Omit<LiveServerMessage, "text" | "data"> // Server message without text/data
    | LiveClientToolResponse; // Tool response from AI
};

/**
 * Client-specific content log for tracking conversation turns
 * Used to monitor the flow of AI conversations and responses
 */
export type ClientContentLog = {
  turns: Part[]; // Array of conversation parts/turns
  turnComplete: boolean; // Whether the current turn is complete
};
