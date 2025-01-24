"use client";

import type { ThemeProviderProps } from "next-themes";

import * as React from "react";
import { NextUIProvider } from "@nextui-org/system";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";

import { useChatStore } from "@/store/useChatStore";

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NonNullable<
      Parameters<ReturnType<typeof useRouter>["push"]>[1]
    >;
  }
}

export function Providers({ children, themeProps }: ProvidersProps) {
  const router = useRouter();
  const initializeModels = useChatStore((state) => state.initializeModels);

  React.useEffect(() => {
    // 初始化模型数据
    initializeModels();

    // 设置每1小时刷新一次
    const interval = setInterval(
      () => {
        useChatStore.getState().refreshModels("Gemini");
        useChatStore.getState().refreshModels("Deepseek");
      },
      60 * 60 * 1000,
    );

    return () => clearInterval(interval);
  }, [initializeModels]);

  return (
    <NextUIProvider navigate={router.push}>
      <NextThemesProvider {...themeProps}>{children}</NextThemesProvider>
    </NextUIProvider>
  );
}
