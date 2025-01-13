import { ChatOptions, LLMApi, LLMUsage, LLMModel } from "@/types/llm";

class DeepSeekLLM extends LLMApi {
  private apiKey: string;

  constructor(apiKey: string) {
    super();
    this.apiKey = apiKey;
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

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.apiKey}`,
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
      const response = await fetch(
        "https://api.deepseek.com/chat/completions",
        {
          method: "POST",
          headers: headers,
          body: JSON.stringify(body),
          signal: signal,
        },
      );

      if (config.stream) {
        const reader = response.body?.getReader();

        if (response.ok && reader) {
          const decoder = new TextDecoder();
          let accumulated = "";

          while (true) {
            const { value, done } = await reader.read();

            if (done) break;
            const chunk = decoder.decode(value);

            accumulated += chunk;
            onUpdate?.(accumulated, chunk);
          }
        }
      } else {
        const data = await response.json();

        onFinish?.(data.choices[0].message.content, response);
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

  async models(): Promise<LLMModel[]> {
    // 实现 DeepSeek 的 models 方法，根据其 API 文档
    // 假设返回一个固定模型列表，实际应发送请求获取
    return [
      {
        name: "deepseek-chat",
        provider: {
          id: "deepseek",
          providerName: "DeepSeek",
          providerType: "llm",
          sorted: 2,
        },
        available: true,
        sorted: 2,
      },
    ];
  }
}
