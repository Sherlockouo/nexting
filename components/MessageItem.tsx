"use client";

import MarkdownPreview from "@uiw/react-markdown-preview";
import { useTheme } from "next-themes";
import { useState } from "react";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
  useDisclosure,
} from "@nextui-org/react";
import { IconPencilBolt } from "@tabler/icons-react";

import { cn } from "@/lib/utils"; // 推荐使用 cn 合并类名
import { Message, useChatStore } from "@/store/useChatStore";

export interface MessageItemProps {
  sessionId: string;
  message: Message;
  messageIdx: number;
  showEtid: boolean;
}

export default function MessageItem({
  sessionId,
  message,
  messageIdx,
  showEtid,
}: MessageItemProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [newContent, setNewContent] = useState(message.content);

  const {
    updateTargetSession, // 确保这个方法已经定义
  } = useChatStore();
  const { content, role } = message;

  // 使用完整的 Tailwind 类名代替字符串拼接
  const bubbleClasses = cn(
    "inline-block m-2 px-4 py-3 rounded-2xl max-w-[80ch]",
    "transition-colors duration-200",
    role === "user"
      ? [
          isDark
            ? "bg-[hsl(210,30%,25%)] text-[hsl(220,15%,85%)]"
            : "bg-[hsl(210,60%,92%)] text-[hsl(220,15%,30%)]",
          role === "user" ? "ml-auto" : "",
        ]
      : [
          isDark
            ? "bg-[hsl(150,25%,25%)] text-[hsl(220,15%,85%)]"
            : "bg-[hsl(150,40%,92%)] text-[hsl(220,15%,30%)]",
          "shadow-sm dark:shadow-none",
        ],
  );

  return (
    <div className={cn("mb-3 flex items-center", "text-left")}>
      <div className={cn(bubbleClasses)}>
        <MarkdownPreview
          className="!bg-transparent !text-inherit [&_pre]:!bg-[hsl(220,15%,95%)] dark:[&_pre]:!bg-[hsl(220,15%,18%)]"
          source={content}
          wrapperElement={{ "data-color-mode": isDark ? "dark" : "light" }}
        />
      </div>
      {showEtid && (
        <div className="flex">
          <Button isIconOnly onPress={onOpen}>
            <IconPencilBolt />
          </Button>
        </div>
      )}

      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {message.id}
              </ModalHeader>
              <ModalBody>
                <Textarea
                  isClearable
                  className="w-full"
                  defaultValue=""
                  placeholder=""
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  // eslint-disable-next-line no-console
                  onClear={() => setNewContent("")}
                />
              </ModalBody>
              <ModalFooter>
                <Button
                  color="danger"
                  variant="light"
                  onPress={() => {
                    onClose();
                  }}
                >
                  Close
                </Button>
                <Button
                  color="primary"
                  onPress={() => {
                    updateTargetSession(sessionId, (session) => {
                      console.log(
                        session,
                        messageIdx,
                        session.messages[messageIdx].content,
                      );
                      session.messages[messageIdx].content = newContent;
                    });
                    onOpenChange();
                    onClose();
                  }}
                >
                  Action
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
