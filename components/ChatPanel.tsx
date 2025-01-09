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
  const [needScroll, setNeedScroll] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null); // 定义 ref

  // 滚动到目标元素的函数
  const scrollToTarget = () => {
    if (scrollRef.current && needScroll) {
      scrollRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  useEffect(() => {
    setNeedScroll(true);
  }, [input]);

  const {
    sessions,
    currentSessionId,
    addMessage,
    addMessageContent,
    clearSessionMessages,
    selectedModel,
  } = useChatStore();

  const currentSession = sessions.find((s) => s.id === currentSessionId);

  // 如果没有选中 Session，提示用户创建/选择
  if (!currentSession) {
    return <div className="flex-1 p-4">No session selected.</div>;
  }

  const handleSend = async () => {
    if (!input.trim()) return;

    const userContent = input.trim();

    setInput("");

    // 1. 先将用户消息添加到状态
    addMessage(currentSession.id, "user", userContent);

    // 2. 向后端接口发起请求，流式获取 AI 消息
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

      // 先添加一条空的 assistant 消息，用来接收后续流式内容
      addMessage(currentSession.id, "assistant", "");

      // 流式读取
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
              // 将流回来的内容添加到之前的最后一条 assistant 消息上
              // （这里可以重新写一个专门的 store 函数更好）
              addMessageContent(currentSession.id, content);
              scrollToTarget();
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
      {/* 消息列表 */}
      <Card
        className="w-full my-2 h-[70vh] flex-3 overflow-y-auto no-scrollbar"
        onScroll={() => {
          console.log("scrolling...");
          setNeedScroll(false);
        }}
      >
        {currentSession.messages.map((msg, idx) => {
          return (
            <MessageItem key={idx} content={msg.content} role={msg.role} />
          );
        })}
        <div ref={scrollRef} />
      </Card>

      {/* 输入框区 */}
      <Card className="p-4 flex-1">
        <Textarea
          className="mb-4"
          maxRows={6}
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault(); // 防止换行
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
