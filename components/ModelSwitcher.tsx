"use client";

import { Select, SelectItem } from "@nextui-org/react";

import { useChatStore } from "@/store/useChatStore";

export default function ModelSwitcher() {
  const { models, selectedModel, switchModel } = useChatStore();

  return (
    <Select
      className="w-1/3"
      label="Select Model"
      placeholder="Select a model"
      // 由于 selectedKeys 接收的是 Iterable，如 Set / Array，这里要传入数组
      selectedKeys={selectedModel ? [selectedModel] : []}
      onSelectionChange={(keys) => {
        const model = Array.from(keys)[0] as string;

        switchModel(model);
      }}
    >
      {models.map((model) => (
        <SelectItem key={model}>{model}</SelectItem>
      ))}
    </Select>
  );
}
