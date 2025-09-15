import { inngest } from "./client";
import {
  gemini,
  createAgent,
  createTool,
  createNetwork,
} from "@inngest/agent-kit";
import { Sandbox } from "@e2b/code-interpreter";
import { agentLastResponseContent, getSandbox } from "./utils";
import { PROMPT } from "@/prompt";
import { z } from "zod";

export const generateCode = inngest.createFunction(
  { id: "generate-code" },
  { event: "code/generate" },
  async ({ event, step }) => {
    const sandboxId = await step.run("get-sandbox-id", async () => {
      const sandbox = await Sandbox.create("syntax-nextjs-test-2");
      return sandbox.sandboxId;
    });
    const codingAgent = createAgent({
      name: "coding-agent",
      system: PROMPT,
      description: "An AI expert coding agent that can write and edit code.",
      model: gemini({
        model: "gemini-2.5-pro",
        apiKey: process.env.GEMINI_API_KEY,
        baseUrl: process.env.GEMINI_API_BASE_URL,
      }),
      tools: [
        createTool({
          name: "terminal",
          description:
            "A terminal to run code, install packages, and perform operations in a development environment.",
          parameters: z.object({
            command: z.string(),
          }),
          handler: async ({ command }, { step }) => {
            return await step?.run("terminal", async () => {
              const buffer = { stdout: "", stderr: "" };

              try {
                const sandbox = await getSandbox(sandboxId);
                const result = await sandbox.commands.run(command, {
                  onStdout: (data: string) => {
                    buffer.stdout += data;
                  },
                  onStderr: (data: string) => {
                    buffer.stderr += data;
                  },
                });
                return result.stdout;
              } catch (error) {
                console.error(
                  `Command execution failed: ${error} \nstdout: ${buffer.stdout} \nstderr: ${buffer.stderr}`
                );
                return `Command execution failed: ${error} \nstdout: ${buffer.stdout} \nstderr: ${buffer.stderr}`;
              }
            });
          },
        }),
        createTool({
          name: "create-or-update-file",
          description:
            "Create or update a file in the development environment.",
          parameters: z.object({
            files: z.array(
              z.object({
                path: z.string(),
                content: z.string(),
              })
            ),
          }),
          handler: async ({ files }, { step, network }) => {
            const newFiles = await step?.run(
              "create-or-update-file",
              async () => {
                try {
                  const updatedFiles = network.state.data.files || {};
                  const sandbox = await getSandbox(sandboxId);

                  for (const file of files) {
                    await sandbox.files.write(file.path, file.content);
                    updatedFiles[file.path] = file.content;
                  }

                  return updatedFiles;
                } catch (error) {
                  console.error("Error creating or updating files:", error);
                  return "Error: " + error;
                }
              }
            );

            if (typeof newFiles === "object") {
              network.state.data.files = newFiles;
            }
          },
        }),
        createTool({
          name: "read-file",
          description: "Read a file from the development environment.",
          parameters: z.object({
            files: z.array(z.string()),
          }),
          handler: async ({ files }, { step }) => {
            return await step?.run("read-file", async () => {
              try {
                const sandbox = await getSandbox(sandboxId);
                const contents = [];
                for (const file of files) {
                  const content = await sandbox.files.read(file);
                  contents.push({ path: file, content });
                }

                return JSON.stringify(contents);
              } catch (error) {
                console.error("Error reading files:", error);
                return "Error: " + error;
              }
            });
          },
        }),
      ],
      lifecycle: {
        onResponse: async ({ result, network }) => {
          const agentLastResponse = await agentLastResponseContent(result);

          if (agentLastResponse && network) {
            if (agentLastResponse.includes("<task_summary>")) {
              network.state.data.summary = agentLastResponse;
            }
          }
          return result;
        },
      },
    });

    const network = createNetwork({
      name: "coding-agent-network",
      agents: [codingAgent],
      maxIter: 15,
      router: async ({ network }) => {
        const summary = network.state.data.summary;

        if (summary) return;

        return codingAgent;
      },
    });

    const result = await network.run(event.data.value);

    const sandboxUrl = await step.run("get-sandbox-url", async () => {
      const sandbox = await getSandbox(sandboxId);
      const host = sandbox.getHost(3000);

      return `https://${host}`;
    });

    return {
      url: sandboxUrl,
      title: "Fragment",
      files: result.state.data.files,
      summary: result.state.data.summary,
    };
  }
);
