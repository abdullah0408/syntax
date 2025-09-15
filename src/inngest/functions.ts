import { inngest } from "./client";
import { gemini, createAgent } from "@inngest/agent-kit";
import { Sandbox } from "@e2b/code-interpreter";
import { getSandbox } from "./utils";
export const invoke = inngest.createFunction(
  { id: "invoke" },
  { event: "test/invoke" },
  async ({ event, step }) => {
    const sandboxId = await step.run("get-sandbox-id", async () => {
      const sandbox = await Sandbox.create("syntax-nextjs-test-2");
      return sandbox.sandboxId;
    });
    const summarizationAgent = createAgent({
      name: "summarization-agent",
      system:
        "You are an expert text summarization AI model. Your task is to generate concise and accurate summaries of the provided text while retaining the original meaning and key points. The summaries should be clear, coherent, and free of any grammatical errors. Always aim to produce summaries that are significantly shorter than the original text, ideally capturing the essence in just a few sentences.",
      model: gemini({
        model: "gemini-2.0-flash",
        apiKey: process.env.GEMINI_API_KEY,
        baseUrl: process.env.GEMINI_API_BASE_URL,
      }),
    });

    const output = await summarizationAgent.run(
      `Summarize the following text:\n\n${event.data.value}`
    );

    const sandboxUrl = await step.run("get-sandbox-url", async () => {
      const sandbox = await getSandbox(sandboxId);
      const host = sandbox.getHost(3000);

      return `https://${host}`;
    });

    return { message: output, sandboxUrl };
  }
);
