"use client";

import { useState } from "react";
import { Button, Input } from "@nextui-org/react";
import { motion } from "framer-motion";
import { IconPencilMinus, IconTrash } from "@tabler/icons-react";

import { useChatStore } from "@/store/useChatStore";

export default function ChatSidebar() {
  const {
    sessions,
    currentSessionId,
    createSession,
    setCurrentSessionId,
    deleteSession,
    updateSessionTitle,
  } = useChatStore();

  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [tempTitle, setTempTitle] = useState<string>("");

  const handleSessionClick = (sessionId: string) => {
    if (editingSessionId && editingSessionId !== sessionId) {
      finishEdit(editingSessionId, tempTitle);
    }
    if (editingSessionId !== sessionId) {
      setCurrentSessionId(sessionId);
    }
  };

  const handleEditIconClick = (sessionId: string, oldTitle: string) => {
    setEditingSessionId(sessionId);
    setTempTitle(oldTitle);
  };

  const finishEdit = (sessionId: string, newTitle: string) => {
    const trimmedTitle = newTitle.trim();

    if (trimmedTitle) {
      updateSessionTitle(sessionId, trimmedTitle);
    }
    setEditingSessionId(null);
    setTempTitle("");
  };

  return (
    <div className="p-2 w-64 flex flex-col">
      <Button
        className="mb-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onPress={createSession}
      >
        New Chat
      </Button>

      <div className="flex-1 overflow-y-auto space-y-2 rounded-md">
        {sessions.map((session) => {
          const isActive = session.id === currentSessionId;
          const isEditing = session.id === editingSessionId;

          return (
            <motion.div
              key={session.id}
              className={`flex items-center p-2 rounded-md cursor-pointer ${isActive ? "bg-blue-500" : "bg-gray-200"}  scale-1.1 transition-colors duration-200 ease-in-out`}
              whileHover={{ scale: 0.99 }}
              onClick={() => handleSessionClick(session.id)}
            >
              {isEditing ? (
                <Input
                  className="flex-1 border border-gray-300 p-1 mr-2 rounded focus:outline-none bg-white text-gray-900 shadow-md"
                  value={tempTitle}
                  onBlur={() => finishEdit(session.id, tempTitle)}
                  onChange={(e) => setTempTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      finishEdit(session.id, tempTitle);
                    } else if (e.key === "Escape") {
                      setEditingSessionId(null);
                      setTempTitle("");
                    }
                  }}
                />
              ) : (
                <span className="flex-1 whitespace-nowrap overflow-hidden overflow-ellipsis text-gray-800">
                  {session.title || "Unnamed Chat"}
                </span>
              )}
              <div className="flex gap-2 items-center">
                <Button
                  isIconOnly
                  className="ml-2 p-1"
                  onPress={() => {
                    handleEditIconClick(session.id, session.title || "");
                  }}
                >
                  <IconPencilMinus />
                </Button>
                <Button
                  isIconOnly
                  color="danger"
                  onPress={() => {
                    deleteSession(session.id);
                  }}
                >
                  <IconTrash />
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
