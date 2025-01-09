"use client";

import MarkdownPreview from "@uiw/react-markdown-preview";
import { useTheme } from "next-themes";

type ChatMessageProps = {
  role: string;
  content: string;
};

export default function MessageItem({ role, content }: ChatMessageProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  let bubbleBg;
  let textColor;

  if (role === "user") {
    bubbleBg = isDark ? "user-dark" : "user-light";
    textColor = isDark ? "text-white" : "text-black";
  } else {
    bubbleBg = isDark ? "ai-dark" : "ai-light";
    textColor = isDark ? "text-white" : "text-black";
  }

  return (
    <div className={`mb-2 ${role === "user" ? "text-right" : "text-left"}`}>
      <span
        className={`inline-block m-2 px-2 py-2 rounded bg-${bubbleBg} ${textColor}`}
      >
        <MarkdownPreview
          className="bg-transparent rounded p-2"
          source={content}
        />
      </span>
    </div>
  );
}
