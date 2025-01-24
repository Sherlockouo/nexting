import { fetchEventSource } from "@fortaine/fetch-event-source";

import { FatalError, RetriableError } from "@/types/errors";
import { ChatOptions, LLMApi, LLMModel, LLMUsage } from "@/types/llm";

interface DeepSeekModel {
  id: string;
  object: string;
  owned_by: string;
}

export class DeepSeekApi extends LLMApi {
  async models(): Promise<LLMModel[]> {
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
    };
    const response = await fetch("https://api.deepseek.com/models", {
      headers,
    });

    if (response.ok) {
      const res = await response.json();

      return res.data.map((model: DeepSeekModel) => ({
        name: model.id,
        provider: {
          id: "Deepseek",
          providerName: "Deepseek",
          providerType: "llm",
          sorted: 1,
        },
        available: true,
        sorted: 1,
      }));
    } else {
      const errorData = await response.text();
      const error = new Error(`Request failed: ${errorData}`);

      console.error("[DeepSeekApi] fetch models error", error);
    }

    return [
      {
        name: "deepseek-chat",
        provider: {
          id: "deepseek",
          providerName: "DeepSeek",
          providerType: "llm",
          sorted: 1,
        },
        available: true,
        sorted: 1,
      },
    ];
  }
  // private apiKey: string;

  constructor() {
    super();
    // this.apiKey = process.env.API_KEY || "";
  }

  async chat(options: ChatOptions): Promise<void> {
    const {
      messages,
      config,
      onUpdate,
      onFinish,
      onError,
      onController,
      onBeforeTool,
      onAfterTool,
    } = options;

    console.log("[DeepSeekApi] this.apiKey", config.model);

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
    };

    const body = {
      model: config.model,
      messages: messages.map((msg) => ({
        role: msg.role,
        content:
          typeof msg.content === "string"
            ? msg.content
            : JSON.stringify(msg.content),
      })),
      temperature: config.temperature ?? 0.7,
      stream: config.stream ?? false,
    };

    const signal = new AbortController().signal;

    if (onController) onController(new AbortController());

    try {
      if (config.stream) {
        fetchEventSource("https://api.deepseek.com/chat/completions", {
          method: "POST",
          headers: headers,
          body: JSON.stringify(body),
          signal: signal,
          async onopen(response) {
            console.log("[onopen] response", response);
            if (
              response.ok
              // &&
              // response.headers.get("content-type") === EventStreamContentType
            ) {
              return; // everything's good
            } else if (
              response.status >= 400 &&
              response.status < 500 &&
              response.status !== 429
            ) {
              // Client-side errors are usually non-retriable:
              throw new FatalError("Client-side error: " + response.statusText);
            } else {
              throw new RetriableError("Server-side error or rate-limited.");
            }
          },
          onmessage(event) {
            const data = event.data;

            onUpdate?.(data, data); // Accumulate as needed
          },
          onerror(err) {
            console.log("[onerr] response", err);
            onError?.(err as Error);
          },
          onclose() {
            console.log("[onclose] close!!!");
            onFinish?.("", new Response("", { status: 200 }));
          },
        });
      } else {
        const response = await fetch(
          "https://api.deepseek.com/chat/completions",
          {
            method: "POST",
            headers: headers,
            body: JSON.stringify(body),
            signal: signal,
          },
        );

        if (response.ok) {
          const data = await response.json();

          onFinish?.(data.choices[0].message.content, response);
        } else {
          const errorData = await response.text();
          const error = new Error(`Request failed: ${errorData}`);

          onError?.(error);
        }
      }
    } catch (err) {
      onError?.(err as Error);
    }
  }

  async usage(): Promise<LLMUsage> {
    // 实现 DeepSeek 的 usage 方法，根据其 API 文档
    // 假设返回固定值，实际应发送请求获取
    return { used: 0, total: 0 };
  }
}
