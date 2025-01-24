// app/chat/page.tsx
"use client";

import ChatSidebar from "@/components/ChatSidebar";
import ChatPanel from "@/components/ChatPanel";

export default function ChatPage() {
  return (
    <div className="flex h-full w-full">
      {/* 左侧边栏 */}
      <div className="flex-1 h-full w-full">
        <ChatSidebar />
      </div>
      {/* 右侧主内容区域 */}
      <div className="flex-9 flex flex-col w-full">
        <ChatPanel />
      </div>
    </div>
  );
}
