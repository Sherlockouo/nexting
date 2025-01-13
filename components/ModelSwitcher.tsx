"use client";

import { Select, SelectItem } from "@nextui-org/react";

// ModelSwitcher 组件
import { useChatStore } from "@/store/useChatStore";

function ModelSwitcher() {
  const { providers, switchProviderAndModel } = useChatStore();

  const providerModelCombinations = providers.flatMap((provider) =>
    provider.models.map((model) => ({
      provider: provider.id,
      model,
      label: `${provider.name} - ${model}`,
    })),
  );

  return (
    <Select
      defaultSelectedKeys={[providerModelCombinations[0].label]}
      label="model select"
      onChange={(e) => {
        const selectedLabel = e.target.value;
        const selectedCombo = providerModelCombinations.find(
          (c) => c.label === selectedLabel,
        );

        if (selectedCombo) {
          switchProviderAndModel(selectedCombo.provider, selectedCombo.model);
        }
      }}
    >
      {providerModelCombinations.map((combo) => (
        <SelectItem key={combo.label} value={combo.label}>
          {combo.label}
        </SelectItem>
      ))}
    </Select>
  );
}

export default ModelSwitcher;
