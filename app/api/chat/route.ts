import { NextRequest, NextResponse } from "next/server";
import { fetchEventSource } from "@fortaine/fetch-event-source";

import { FatalError, RetriableError } from "@/types/errors";

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  if (!messages) {
    return NextResponse.json(
      { error: "Messages are required" },
      { status: 400 },
    );
  }

  const stream = new ReadableStream({
    start(controller) {
      let isControllerClosed = false; // Flag to track controller state

      fetchEventSource("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.API_KEY}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages,
          stream: true,
        }),
        fetch: fetch,
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
          console.log("event: ", event);
          if (event.data === "[DONE]") {
            if (!isControllerClosed) {
              controller.close();
              isControllerClosed = true;
            }

            return;
          }

          controller.enqueue(
            new TextEncoder().encode(`data: ${event.data}\n\n`),
          );
        },
        onerror(err) {
          console.error("Event Source Error:", err);
          if (!isControllerClosed) {
            controller.close();
            isControllerClosed = true;
          }
        },
      }).catch((err) => {
        console.error("Fetch Event Source Error:", err);
        if (!isControllerClosed) {
          controller.close();
          isControllerClosed = true;
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
