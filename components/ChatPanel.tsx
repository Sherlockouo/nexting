"use client";

import { useEffect, useRef, useState } from "react";
import { Card, Button, Textarea } from "@nextui-org/react";
import { IconMicrophoneFilled } from "@tabler/icons-react";

import MessageItem from "./MessageItem";
import ModelSwitcher from "./ModelSwitcher";

import { createMessage, Message, useChatStore } from "@/store/useChatStore";
import { getClientApi } from "@/app/client/api"; // 根据你的文件结构调整导入路径
import { ChatControllerPool } from "@/app/client/controller";
import { ServiceProvider } from "@/consts/constant";
import { prettyObject } from "@/lib/format";

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

  const {
    sessions,
    currentSessionId,
    addMessage,
    addMessageContent,
    clearSessionMessages,
    onNewMessage, // 确保这个方法已经定义
    updateTargetSession, // 确保这个方法已经定义
  } = useChatStore();

  const currentSession = sessions.find((s) => s.id === currentSessionId);

  useEffect(() => {
    if (!isUserScrolled) {
      scrollToTarget();
    }
  }, []);

  if (!currentSession) {
    return <div className="flex-1 p-4">No session selected.</div>;
  }

  const handleSend = () => {
    if (!input.trim()) return;

    const userContent = input.trim();

    setInput("");

    // 获取当前会话的配置
    const modelConfig = {
      providerName: currentSession.provider,
      model: currentSession.model,
      temperature: 0.7, // 根据需要设置
      // 其他配置参数
    };

    console.log("sonfig", modelConfig);

    const api = getClientApi(modelConfig.providerName as ServiceProvider);

    // 准备 messages
    const sendMessages = currentSession.messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    let userMessage: Message = createMessage({
      role: "user",
      content: userContent,
    });

    const botMessage: Message = createMessage({
      role: "assistant",
      streaming: true,
      model: modelConfig.model,
    });

    addMessage(currentSession.id, "user", userContent);
    sendMessages.push(userMessage);
    // 添加 botMessage 到当前会话的消息中
    addMessage(currentSession.id, "assistant", botMessage.content);

    api.llm.chat({
      messages: sendMessages,
      config: { ...modelConfig, stream: true },
      onUpdate: (message) => {
        if (message) {
          const trimmed = message.trim();

          if (trimmed === "[DONE]") {
            return;
          }
          const msg = JSON.parse(message);

          const content_chunk = msg.choices?.[0]?.delta?.content;

          botMessage.content += content_chunk;
          addMessageContent(currentSession.id, content_chunk);
          if (!isUserScrolled) {
            scrollToTarget();
          }
        }
      },
      onFinish: (message) => {
        if (message) {
          botMessage.content = message;
          botMessage.date = new Date().toLocaleString();
          // 通知新消息
          onNewMessage(botMessage, currentSession);
        }
        // 移除控制器
        ChatControllerPool.remove(currentSession.id, botMessage.id);
      },
      onBeforeTool: (tool) => {
        // 处理工具调用前的逻辑
        (botMessage.tools = botMessage.tools || []).push(tool);
        // 更新会话消息
        updateTargetSession(currentSession, (session) => {
          session.messages = session.messages.concat();
        });
      },
      onAfterTool: (tool) => {
        // 处理工具调用后的逻辑
        if (botMessage.tools) {
          botMessage.tools.forEach((t, i, tools) => {
            if (tool.id === t.id) {
              tools[i] = { ...tool };
            }
          });
        }
        // 更新会话消息
        updateTargetSession(currentSession, (session) => {
          session.messages = session.messages.concat();
        });
      },
      onError: (error) => {
        const isAborted = error.message?.includes("aborted");

        botMessage.content +=
          "\n\n" + prettyObject({ error: true, message: error.message });
        botMessage.streaming = false;
        // 设置错误标志
        userMessage.isError = !isAborted;
        botMessage.isError = !isAborted;
        // 更新会话消息
        updateTargetSession(currentSession, (session) => {
          session.messages = session.messages.concat();
        });
        // 移除控制器
        ChatControllerPool.remove(currentSession.id, botMessage.id);
        console.error("[Chat] failed ", error);
      },
      onController: (controller) => {
        // 收集控制器
        ChatControllerPool.addController(
          currentSession.id,
          botMessage.id,
          controller,
        );
      },
    });
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
          <MessageItem key={idx} {...msg} />
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
