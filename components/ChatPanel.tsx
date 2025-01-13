"use client";

import { useEffect, useRef, useState } from "react";
import { Card, Button, Textarea } from "@nextui-org/react";
import { IconMicrophoneFilled } from "@tabler/icons-react";

import MessageItem from "./MessageItem";
import ModelSwitcher from "./ModelSwitcher";

import { useChatStore } from "@/store/useChatStore";

export default function ChatPanel() {
  const [input, setInput] = useState("");
  const [voiceOn, setVoiceOn] = useState(false);
  const [isUserScrolled, setIsUserScrolled] = useState(false);
  const [isProgrammaticScroll, setIsProgrammaticScroll] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToTarget = () => {
    if (scrollRef.current) {
      setIsProgrammaticScroll(true);
      scrollRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      // Reset the flag after the scroll animation completes
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsProgrammaticScroll(false);
        });
      });
    }
  };

  useEffect(() => {
    if (!isUserScrolled) {
      scrollToTarget();
    }
  }, [input, isUserScrolled]);

  const {
    sessions,
    currentSessionId,
    addMessage,
    addMessageContent,
    clearSessionMessages,
    selectedModel,
  } = useChatStore();

  const currentSession = sessions.find((s) => s.id === currentSessionId);

  if (!currentSession) {
    return <div className="flex-1 p-4">No session selected.</div>;
  }

  const handleSend = async () => {
    if (!input.trim()) return;

    const userContent = input.trim();

    setInput("");
    addMessage(currentSession.id, "user", userContent);
    if (!isUserScrolled) {
      scrollToTarget();
    }

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: selectedModel,
          messages: currentSession.messages.concat({
            role: "user",
            content: userContent,
          }),
        }),
      });

      if (!response.body) return;
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      addMessage(currentSession.id, "assistant", "");

      while (!done) {
        const { value, done: readerDone } = await reader.read();

        done = readerDone;
        if (!value) continue;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          const trimmed = line.trim();

          if (!trimmed.startsWith("data:")) continue;
          const jsonStr = trimmed.replace("data:", "").trim();

          if (jsonStr === "[DONE]") {
            done = true;
            break;
          }
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;

            if (content) {
              addMessageContent(currentSession.id, content);
              if (!isUserScrolled) {
                scrollToTarget();
              }
            }
          } catch (err) {
            console.error("Error parsing JSON stream chunk:", err);
          }
        }
      }
    } catch (err) {
      console.error("Error while sending message:", err);
    }
  };

  const handleClear = () => {
    clearSessionMessages(currentSession.id);
  };

  return (
    <div className="flex-1 flex flex-col justify-center px-1">
      <Card
        className="w-full my-2 h-[70vh] flex-3 overflow-y-auto no-scrollbar"
        onScroll={(e) => {
          if (!isProgrammaticScroll) {
            const target = e.target as HTMLElement;
            const { scrollTop, scrollHeight, clientHeight } = target;

            if (scrollTop + clientHeight < scrollHeight - 10) {
              setIsUserScrolled(true);
            } else {
              setIsUserScrolled(false);
            }
          }
        }}
      >
        {currentSession.messages.map((msg, idx) => (
          <MessageItem key={idx} content={msg.content} role={msg.role} />
        ))}
        <div ref={scrollRef} />
      </Card>

      <Card className="p-4 flex-1">
        <Textarea
          className="mb-4"
          maxRows={6}
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              !e.shiftKey &&
              !e.nativeEvent.isComposing
            ) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <div className="flex justify-end gap-2 items-center">
          <ModelSwitcher />
          <Button
            isIconOnly
            color={voiceOn ? "success" : "default"}
            onPress={() => setVoiceOn(!voiceOn)}
          >
            <IconMicrophoneFilled />
          </Button>
          <Button onPress={handleSend}>Send</Button>
          <Button color="danger" onPress={handleClear}>
            Clear
          </Button>
        </div>
      </Card>
    </div>
  );
}
