"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";

import { ModelType } from "@/consts/constant";
import { ChatMessageTool } from "@/types/llm/chat";
import { DeepSeekApi } from "@/app/client/platforms/deepseek";
import { GeminiProApi } from "@/app/client/platforms/gemini";

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
    sessionId: string,
    updater: (session: Session) => void,
  ) => void;
  addMessageContent: (sessionId: string, contentChunk: string) => void;
  deleteSession: (sessionId: string) => void;
  clearSessionMessages: (sessionId: string) => void;
  initializeModels: () => Promise<void>;
  refreshModels: (providerId: string) => Promise<void>;
  switchProviderAndModel: (provider: string, model: string) => void;
  updateSessionTitle: (sessionId: string, newTitle: string) => void;
}

const initialMessage: Message = {
  id: uuidv4(),
  role: "system",
  content: "You are ChatGPT.",
  date: new Date().toLocaleString(),
};

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
      selectedModel: "deepseek-chat",

      // 创建新 Session
      createSession: () => {
        const newSession: Session = {
          id: uuidv4(),
          title: "New Chat",
          provider: "Deepseek",
          model: get().selectedModel, // 默认使用当前选中模型
          messages: [initialMessage],
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
                messages: [
                  ...session.messages,
                  createMessage({ role, content }),
                ],
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
      // 初始化模型数据
      initializeModels: async () => {
        // await get().refreshModels("Deepseek");
        await get().refreshModels("Gemini");
        // 可以添加其他provider的初始化
      },
      // 刷新指定provider的模型列表
      refreshModels: async (providerId) => {
        try {
          let models: string[] = [];

          if (providerId === "Deepseek") {
            const api = new DeepSeekApi();
            const result = await api.models();

            models = result.map((m) => m.name);
          }
          if (providerId === "Gemini") {
            const api = new GeminiProApi();
            const result = await api.models();

            models = result.map((m) => m.name);
          }
          if (models.length < 1) {
            console.warn(`[Store] No models found for ${providerId}`);

            return;
          }
          set((state) => ({
            providers: state.providers.map((p) =>
              p.id === providerId ? { ...p, models } : p,
            ),
          }));
        } catch (error) {
          console.error(
            `[Store] Failed to refresh ${providerId} models:`,
            error,
          );
        }
      },
      switchProviderAndModel: (provider, model) => {
        const { providers, sessions } = get();
        const providerConfig = providers.find((p) => p.id === provider);

        if (!providerConfig || !providerConfig.models.includes(model)) {
          return;
        }

        const currentSession = sessions.find(
          (s) => s.id === get().currentSessionId,
        );

        // 如果当前会话存在，则更新 provider 和 model
        if (currentSession) {
          currentSession.provider = provider;
          currentSession.model = model;

          // 更新状态
          set({ sessions: [...sessions] });
        }
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
        sessionId: string,
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
