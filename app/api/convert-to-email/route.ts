import { model } from "@/helper/gemini";
import { prompt as promptHelper } from "@/helper/prompt";
import { NextRequest, NextResponse } from "next/server";

const headers = {
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache',
  'Connection': 'keep-alive'
};

const customError = (errorData : { message?: string, status: number }) => {
  return new NextResponse(`event: error\ndata: ${JSON.stringify(errorData)}\n\n, { headers }`);
}

export async function GET(req: NextRequest) {
  const inputText = req.nextUrl.searchParams.get("prompt");
  const language = req.nextUrl.searchParams.get("language");
  const formalTone = req.nextUrl.searchParams.get("formalTone");
  const autoGreeting = req.nextUrl.searchParams.get("autoGreeting");
  console.log("Received prompt:", inputText);
  if (!inputText || !language || !formalTone || !autoGreeting) {
    return customError({
      message: "Prompt is required",
      status: 400
    });
  }
  const prompt = promptHelper(inputText, language, formalTone, autoGreeting);
  try {
    const result = await model.generateContentStream(prompt);
      const stream = new ReadableStream({
        async start(controller) {
          for await (const chunk of result.stream) {
            const data = { text: chunk.text() };
            controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
          }
          const data = { done: true };
          controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
          controller.close();
        }
      });
    return new NextResponse(stream, { headers });
  } catch (error) {
    console.error("Error generating content:", error);
    return customError({
      message: "Failed to generate content",
      status: 500
    });
  }
}