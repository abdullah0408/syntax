import { Sandbox } from "@e2b/code-interpreter";
import { AgentResult, TextMessage } from "@inngest/agent-kit";

export async function getSandbox(sandboxId: string) {
  const sandbox = await Sandbox.connect(sandboxId);
  await sandbox.setTimeout(60_000 * 10);
  return sandbox;
}

export async function agentLastResponseContent(result: AgentResult) {
  const lastResponseIndex = result.output.findIndex(
    (message) => message.role === "assistant"
  );
  const lastResponse = result.output[lastResponseIndex] as
    | TextMessage
    | undefined;

  return lastResponse?.content
    ? typeof lastResponse.content === "string"
      ? lastResponse.content
      : lastResponse.content.map((c) => c.text).join("")
    : undefined;
}
