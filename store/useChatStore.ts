"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";

export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface Session {
  id: string;
  title: string;
  model: string;
  messages: Message[];
}

interface ChatState {
  sessions: Session[];
  currentSessionId: string | null;
  models: string[]; // 可选模型列表
  selectedModel: string; // 当前选中模型

  createSession: () => void;
  setCurrentSessionId: (sessionId: string) => void;
  addMessage: (
    sessionId: string,
    role: Message["role"],
    content: string,
  ) => void;
  addMessageContent: (sessionId: string, contentChunk: string) => void;
  deleteSession: (sessionId: string) => void;
  clearSessionMessages: (sessionId: string) => void;
  switchModel: (model: string) => void;
  updateSessionTitle: (sessionId: string, newTitle: string) => void;
}

const initialMessage: Message = { role: "system", content: "You are ChatGPT." };

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      sessions: [],
      currentSessionId: null,

      // 这里可以自定义模型列表
      models: ["gpt-3.5-turbo", "gpt-4"],
      selectedModel: "gpt-3.5-turbo",

      // 创建新 Session
      createSession: () => {
        const newSession: Session = {
          id: uuidv4(),
          title: "New Chat",
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

      // 切换全局模型（同时也可以根据需求去更新当前 Session 的 model）
      switchModel: (model) => {
        set(() => ({
          selectedModel: model,
        }));
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
    }),
    {
      name: "chat-storage", // 存储到 localStorage 的 key
    },
  ),
);
