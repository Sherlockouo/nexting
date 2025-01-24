"use client";

import { Select, SelectItem, SharedSelection } from "@nextui-org/react";
import { useEffect, useState } from "react";

import { useChatStore } from "@/store/useChatStore";

function ModelSwitcher() {
  const { providers, selectedProvider, selectedModel, switchProviderAndModel } =
    useChatStore();
  const [currentProvider, setCurrentProvider] = useState(selectedProvider);
  const [currentModel, setCurrentModel] = useState(selectedModel);

  // Filter models based on the selected provider
  const selectedProviderModels =
    providers.find((p) => p.id === currentProvider)?.models || [];

  // Set default model if currentModel is not in selectedProviderModels
  useEffect(() => {
    if (
      !selectedProviderModels.includes(currentModel) &&
      selectedProviderModels.length > 0
    ) {
      setCurrentModel(selectedProviderModels[0]);
    }
  }, [selectedProviderModels, currentModel]);

  // Handle provider selection
  const handleProviderChange = (keys: SharedSelection) => {
    const providerId = keys;

    if (providerId) {
      console.log("provider: ", providerId, providers);
      const selectedProvider = providers.find(
        (p) => p.id === providerId.anchorKey,
      );

      if (selectedProvider) {
        setCurrentProvider(selectedProvider.id);
        setCurrentModel(selectedProvider.models[0]); // Set the first model of the provider
        switchProviderAndModel(selectedProvider.id, selectedProvider.models[0]);
      }
    }
  };

  // Handle model selection
  const handleModelChange = (keys: SharedSelection) => {
    const model = keys;

    if (model.anchorKey) {
      setCurrentModel(model.anchorKey);
      switchProviderAndModel(currentProvider, model.anchorKey);
    }
  };

  return (
    <div className="flex w-full gap-2">
      <Select
        label="Provider"
        selectedKeys={new Set([currentProvider])}
        onSelectionChange={handleProviderChange}
      >
        {providers &&
          providers.map((provider) => (
            <SelectItem key={provider.id} value={provider.id}>
              {provider.name}
            </SelectItem>
          ))}
      </Select>

      <Select
        label="Model"
        selectedKeys={new Set([currentModel])}
        onSelectionChange={handleModelChange}
      >
        {selectedProviderModels &&
          selectedProviderModels.map((model) => (
            <SelectItem key={model} value={model}>
              {model}
            </SelectItem>
          ))}
      </Select>
    </div>
  );
}

export default ModelSwitcher;
