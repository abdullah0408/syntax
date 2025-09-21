import { inngest } from "./client";
import {
  gemini,
  createAgent,
  createTool,
  createNetwork,
  type Tool,
  Message,
  createState,
} from "@inngest/agent-kit";
import { Sandbox } from "@e2b/code-interpreter";
import { agentLastResponseContent, getSandbox } from "./utils";
import {
  ADDON_PROMPT,
  FRAGMENT_TITLE_PROMPT,
  PROMPT,
  RESPONSE_PROMPT,
} from "@/prompt";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

interface AgentState {
  summary: string;
  files: { [path: string]: string };
}

export const generateCode = inngest.createFunction(
  { id: "generate-code" },
  { event: "code/generate" },
  async ({ event, step }) => {
    const sandboxId = await step.run("get-sandbox-id", async () => {
      const sandbox = await Sandbox.create("syntax-nextjs-test-2");
      await sandbox.setTimeout(60_000 * 10);
      return sandbox.sandboxId;
    });

    const previousMessages = await step.run(
      "get-previous-messages",
      async () => {
        const messages = await prisma.message.findMany({
          where: { projectId: event.data.projectId },
          orderBy: { createdAt: "desc" },
          take: 7,
          select: {
            id: true,
            content: true,
            role: true,
          },
        });

        const orderedMessages = messages.reverse();

        const formattedMessages: Message[] = [
          ...orderedMessages.map(
            (msg) =>
              ({
                type: "text",
                role: msg.role === "ASSISTANT" ? "assistant" : "user",
                content: msg.content,
              } as Message)
          ),
        ];

        if (orderedMessages.length >= 2) {
          const secondLastMessage = orderedMessages[orderedMessages.length - 2];
          const fragment = await prisma.fragment.findUnique({
            where: { messageId: secondLastMessage.id },
            select: { files: true },
          });

          if (fragment?.files) {
            const lastIndex = formattedMessages.length - 1;
            const lastMessage = formattedMessages[lastIndex];
            if (
              lastMessage.type === "text" &&
              typeof lastMessage.content === "string"
            ) {
              lastMessage.content += `\n\n${JSON.stringify(
                fragment.files
              )}\n\n\n${ADDON_PROMPT}`;
            }
          }
        }

        return formattedMessages;
      }
    );

    const state = createState<AgentState>(
      {
        summary: "",
        files: {},
      },
      {
        messages: previousMessages,
      }
    );

    const codingAgent = createAgent<AgentState>({
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
          handler: async (
            { files },
            { step, network }: Tool.Options<AgentState>
          ) => {
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

    const network = createNetwork<AgentState>({
      name: "coding-agent-network",
      agents: [codingAgent],
      maxIter: 15,
      router: async ({ network }) => {
        const summary = network.state.data.summary;

        if (summary) return;

        return codingAgent;
      },
    });

    const result = await network.run(event.data.value, { state });

    const fragmentTitleGenerator = createAgent<AgentState>({
      name: "fragment-title-generator",
      system: FRAGMENT_TITLE_PROMPT,
      description: "A fragment title generator agent.",
      model: gemini({
        model: "gemini-2.5-pro",
        apiKey: process.env.GEMINI_API_KEY,
        baseUrl: process.env.GEMINI_API_BASE_URL,
      }),
    });

    const responseGenerator = createAgent<AgentState>({
      name: "response-generator",
      system: RESPONSE_PROMPT,
      description: "A response generator agent.",
      model: gemini({
        model: "gemini-2.5-pro",
        apiKey: process.env.GEMINI_API_KEY,
        baseUrl: process.env.GEMINI_API_BASE_URL,
      }),
    });

    const { output: fragmentTitleOutput } = await fragmentTitleGenerator.run(
      result.state.data.summary
    );
    const { output: responseOutput } = await responseGenerator.run(
      result.state.data.summary
    );

    const generateFragmentTitle = () => {
      if (fragmentTitleOutput[0].type !== "text") {
        return "Fragment";
      }

      if (Array.isArray(fragmentTitleOutput[0].content)) {
        return fragmentTitleOutput[0].content.map((txt) => txt).join("");
      } else {
        return fragmentTitleOutput[0].content;
      }
    };

    const generateResponse = () => {
      if (responseOutput[0].type !== "text") {
        return "Here you go...";
      }

      if (Array.isArray(responseOutput[0].content)) {
        return responseOutput[0].content.map((txt) => txt).join("");
      } else {
        return responseOutput[0].content;
      }
    };

    const isError =
      !result.state.data.summary ||
      Object.keys(result.state.data.files || {}).length === 0;

    const sandboxUrl = await step.run("get-sandbox-url", async () => {
      const sandbox = await getSandbox(sandboxId);
      const host = sandbox.getHost(3000);

      return `https://${host}`;
    });

    await step.run("save-result", async () => {
      if (isError) {
        return await prisma.message.create({
          data: {
            projectId: event.data.projectId,
            content: "Something went wrong, please try again.",
            role: "ASSISTANT",
            type: "ERROR",
          },
        });
      }

      return await prisma.message.create({
        data: {
          projectId: event.data.projectId,
          content: generateResponse(),
          role: "ASSISTANT",
          type: "RESULT",
          fragment: {
            create: {
              sandboxUrl,
              title: generateFragmentTitle(),
              files: result.state.data.files,
            },
          },
        },
      });
    });

    return {
      url: sandboxUrl,
      title: "Fragment",
      files: result.state.data.files,
      summary: result.state.data.summary,
    };
  }
);
