import { fetchEventSource } from "@fortaine/fetch-event-source";

import { ChatOptions, LLMApi, LLMUsage, LLMModel } from "@/types/llm";
import { FatalError, RetriableError } from "@/types/errors";

export class GeminiProApi extends LLMApi {
  constructor() {
    super();
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

    console.log("[gemini] this.model", config.model);

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`,
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
        fetchEventSource("https://gemini.larc.top/v1/chat/completions", {
          method: "POST",
          headers: headers,
          body: JSON.stringify(body),
          signal: signal,
          async onopen(response) {
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
            onError?.(err as Error);
          },
          onclose() {
            onFinish?.("", new Response("", { status: 200 }));
          },
        });
      } else {
        const response = await fetch(
          "https://gemini.larc.top/v1/chat/completions",
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
    // 实现 Gemini 的 usage 方法，根据其 API 文档
    // 假设返回固定值，实际应发送请求获取
    return { used: 0, total: 0 };
  }

  async models(): Promise<LLMModel[]> {
    // 实现 Gemini 的 models 方法，根据其 API 文档
    // 假设返回一个固定模型列表，实际应发送请求获取
    return [
      {
        name: "gemini-1.5-pro-latest",
        provider: {
          id: "gemini",
          providerName: "Gemini",
          providerType: "llm",
          sorted: 1,
        },
        available: true,
        sorted: 1,
      },
    ];
  }
}
