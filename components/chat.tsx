"use client";

import cn from "classnames";
import { toast } from "sonner";
import { useChat } from "@ai-sdk/react";
import { useState } from "react";
import { Messages } from "./messages";
import { modelID, models } from "@/lib/models";
import { Footnote } from "./footnote";
import {
  ArrowUpIcon,
  CheckedSquare,
  ChevronDownIcon,
  StopIcon,
  UncheckedSquare,
} from "./icons";
import { Input } from "./input";

export function Chat() {
  const [input, setInput] = useState<string>("");
  const [selectedModelId, setSelectedModelId] = useState<modelID>("sonnet-3.7");
  const [isReasoningEnabled, setIsReasoningEnabled] = useState<boolean>(true);

  const { messages, sendMessage, status, stop } = useChat({
    id: "primary",
    onError: () => {
      toast.error("An error occurred, please try again!");
    },
  });

  const isGeneratingResponse = ["streaming", "submitted"].includes(status);

  return (
    <div
      className={cn(
        "px-4 md:px-0 pb-4 pt-8 flex flex-col h-dvh items-center w-full max-w-3xl",
        {
          "justify-between": messages.length > 0,
          "justify-center gap-4": messages.length === 0,
        },
      )}
    >
      {messages.length > 0 ? (
        <Messages messages={messages} status={status} />
      ) : (
        <div className="flex flex-col gap-0.5 sm:text-2xl text-xl w-full">
          <div className="flex flex-row gap-2 items-center">
            <div>Welcome to the AI SDK Reasoning Preview.</div>
          </div>
          <div className="dark:text-zinc-500 text-zinc-400">
            What would you like me to think about today?
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4 w-full">
        <div className="flex relative flex-col gap-1 p-3 w-full rounded-2xl dark:bg-zinc-800 bg-zinc-100">
          <Input
            input={input}
            setInput={setInput}
            selectedModelId={selectedModelId}
            isGeneratingResponse={isGeneratingResponse}
            isReasoningEnabled={isReasoningEnabled}
            onSubmit={() => {
              if (input === "") {
                return;
              }
              sendMessage(
                { text: input },
                {
                  body: {
                    selectedModelId,
                    isReasoningEnabled,
                  },
                }
              );
              setInput("");
            }}
          />

          <div className="absolute bottom-2.5 left-2.5">
            <button
              disabled={selectedModelId !== "sonnet-3.7"}
              className={cn(
                "relative w-fit text-sm p-1.5 rounded-lg flex flex-row items-center gap-2 dark:hover:bg-zinc-600 hover:bg-zinc-200 cursor-pointer disabled:opacity-50",
                {
                  "dark:bg-zinc-600 bg-zinc-200": isReasoningEnabled,
                },
              )}
              onClick={() => {
                setIsReasoningEnabled(!isReasoningEnabled);
              }}
            >
              {isReasoningEnabled ? <CheckedSquare /> : <UncheckedSquare />}
              <div>Reasoning</div>
            </button>
          </div>

          <div className="absolute bottom-2.5 right-2.5 flex flex-row gap-2">
            <div className="relative w-fit text-sm p-1.5 rounded-lg flex flex-row items-center gap-0.5 dark:hover:bg-zinc-700 hover:bg-zinc-200 cursor-pointer">
              {/* <div>
                {selectedModel ? selectedModel.name : "Models Unavailable!"}
              </div> */}
              <div className="flex justify-center items-center px-1 text-zinc-500 dark:text-zinc-400">
                <span className="pr-1">{models[selectedModelId]}</span>
                <ChevronDownIcon />
              </div>

              <select
                className="absolute left-0 p-1 w-full opacity-0 cursor-pointer"
                value={selectedModelId}
                onChange={(event) => {
                  if (event.target.value !== "sonnet-3.7") {
                    setIsReasoningEnabled(true);
                  }
                  setSelectedModelId(event.target.value as modelID);
                }}
              >
                {Object.entries(models).map(([id, name]) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <button
              className={cn(
                "size-8 flex flex-row justify-center items-center dark:bg-zinc-100 bg-zinc-900 dark:text-zinc-900 text-zinc-100 p-1.5 rounded-full hover:bg-zinc-800 dark:hover:bg-zinc-300 hover:scale-105 active:scale-95 transition-all",
                {
                  "dark:bg-zinc-200 dark:text-zinc-500":
                    isGeneratingResponse || input === "",
                },
              )}
              onClick={() => {
                if (input === "") {
                  return;
                }

                if (isGeneratingResponse) {
                  stop();
                } else {
                  sendMessage(
                    { text: input },
                    {
                      body: {
                        selectedModelId,
                        isReasoningEnabled,
                      },
                    }
                  );
                }

                setInput("");
              }}
            >
              {isGeneratingResponse ? <StopIcon /> : <ArrowUpIcon />}
            </button>
          </div>
        </div>

        <Footnote />
      </div>
    </div>
  );
}
