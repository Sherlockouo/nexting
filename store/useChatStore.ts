"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";

import { ModelType } from "@/consts/constant";
import { ChatMessageTool } from "@/types/llm/chat";

export interface Message {
  id: string;
  role: "system" | "user" | "assistant";
  content: string;
  streaming?: boolean;
  model?: ModelType;
  date: string;
  isError?: boolean;

  tools?: ChatMessageTool[];
}

export interface Provider {
  id: string;
  name: string;
  models: string[];
}

export interface Session {
  id: string;
  title: string;
  provider: string;
  model: string;
  messages: Message[];
}

export function createMessage(override: Partial<Message>): Message {
  return {
    id: uuidv4(),
    date: new Date().toLocaleString(),
    role: "user",
    content: "",
    ...override,
  };
}

interface ChatState {
  sessions: Session[];
  currentSessionId: string | null;
  providers: Provider[];
  selectedProvider: string;
  selectedModel: string;

  createSession: () => void;
  setCurrentSessionId: (sessionId: string) => void;
  addMessage: (
    sessionId: string,
    role: Message["role"],
    content: string,
  ) => void;
  onNewMessage: (botMessage: Message, session: Session) => void;
  updateTargetSession: (
    sessionId: Session,
    updater: (session: Session) => void,
  ) => void;
  addMessageContent: (sessionId: string, contentChunk: string) => void;
  deleteSession: (sessionId: string) => void;
  clearSessionMessages: (sessionId: string) => void;
  switchProviderAndModel: (provider: string, model: string) => void;
  updateSessionTitle: (sessionId: string, newTitle: string) => void;
}

const initialMessage: Message = { role: "system", content: "You are ChatGPT." };

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      sessions: [],
      currentSessionId: null,

      providers: [
        { id: "Deepseek", name: "DeepSeek", models: ["deepseek-chat"] },
        { id: "Gemini", name: "Gemini", models: ["gemini-1.5-pro-latest"] },
      ],
      selectedProvider: "Deepseek",
      selectedModel: "gpt-3.5-turbo",

      // 创建新 Session
      createSession: () => {
        const newSession: Session = {
          id: uuidv4(),
          title: "New Chat",
          provider: "Deepseek",
          model: get().selectedModel, // 默认使用当前选中模型
          messages: [
            { role: "system", content: "You are ChatGPT." }, // system 提示
          ],
        };

        set((state) => ({
          sessions: [...state.sessions, newSession],
          currentSessionId: newSession.id,
        }));
      },

      // 切换当前 Session
      setCurrentSessionId: (sessionId) => {
        set(() => ({ currentSessionId: sessionId }));
      },

      // 往指定 Session 添加一条消息
      addMessage: (sessionId, role, content) => {
        set((state) => {
          const sessions = state.sessions.map((session) => {
            if (session.id === sessionId) {
              return {
                ...session,
                messages: [...session.messages, { role, content }],
              };
            }

            return session;
          });

          return { sessions };
        });
      },
      addMessageContent: (sessionId, contentChunk) =>
        set((state) => ({
          sessions: state.sessions.map((session) => {
            if (session.id === sessionId) {
              const lastMsgIndex = session.messages.length - 1;
              const lastMsg = session.messages[lastMsgIndex];

              if (lastMsg && lastMsg.role === "assistant") {
                const updatedMsg = {
                  ...lastMsg,
                  content: lastMsg.content + contentChunk,
                };
                const updatedMsgs = [...session.messages];

                updatedMsgs[lastMsgIndex] = updatedMsg;

                return { ...session, messages: updatedMsgs };
              }
            }

            return session;
          }),
        })),
      switchProviderAndModel: (provider, model) => {
        const { providers } = get();
        const providerConfig = providers.find((p) => p.id === provider);

        if (!providerConfig || !providerConfig.models.includes(model)) {
          return;
        }

        const initialMsg = initialMessage;
        const newSession: Session = {
          id: uuidv4(),
          title: `${providerConfig.name} - ${model} Chat`,
          provider,
          model,
          messages: [initialMsg],
        };

        set((state) => ({
          sessions: [...state.sessions, newSession],
          currentSessionId: newSession.id,
        }));
      },
      // 清空某个 Session 的消息（也可删除整个 Session）
      clearSessionMessages: (sessionId) => {
        set((state) => {
          const sessions = state.sessions.map((session) => {
            if (session.id === sessionId) {
              return {
                ...session,
                messages: [initialMessage],
              };
            }

            return session;
          });

          return { sessions };
        });
      },
      deleteSession: (sessionId: string) => {
        set((state) => ({
          sessions: state.sessions.filter(
            (session) => session.id !== sessionId,
          ),
          currentSessionId:
            state.currentSessionId === sessionId
              ? null
              : state.currentSessionId,
        }));
      },
      updateSessionTitle: (sessionId, newTitle) => {
        set((state) => {
          const sessions = state.sessions.map((session) => {
            if (session.id === sessionId) {
              return {
                ...session,
                title: newTitle,
              };
            }

            return session;
          });

          return { sessions };
        });
      },
      onNewMessage: (botMessage: Message, session: Session) => {
        set((state) => {
          const sessions = state.sessions.map((s) => {
            if (s.id === session.id) {
              return {
                ...s,
                messages: [...s.messages, botMessage],
              };
            }

            return s;
          });

          return { sessions };
        });
      },
      updateTargetSession: (
        sessionId: Session,
        updater: (session: Session) => void,
      ) => {
        set((state) => {
          const sessions = state.sessions.map((s) => {
            if (s.id === sessionId) {
              const updatedSession = { ...s };

              updater(updatedSession);

              return updatedSession;
            }

            return s;
          });

          return { sessions };
        });
      },
    }),

    {
      name: "chat-storage", // 存储到 localStorage 的 key
    },
  ),
);
