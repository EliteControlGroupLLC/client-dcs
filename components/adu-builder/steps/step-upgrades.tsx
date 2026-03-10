"use client";

import { useADU } from "@/lib/contexts/adu-context";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Check, Plus, Sparkles } from "lucide-react";
import { ADU_UPGRADES } from "@/lib/types/adu";
import { formatCurrency } from "@/lib/utils";

export function StepUpgrades() {
  const { config, updateConfig, nextStep, prevStep } = useADU();

  const toggleUpgrade = (upgradeId: string) => {
    const currentUpgrades = config.upgrades || [];
    const newUpgrades = currentUpgrades.includes(upgradeId)
      ? currentUpgrades.filter((u) => u !== upgradeId)
      : [...currentUpgrades, upgradeId];
    
    updateConfig({ upgrades: newUpgrades });
  };

  const isSelected = (upgradeId: string) => {
    return config.upgrades?.includes(upgradeId) || false;
  };

  const totalUpgradesCost = ADU_UPGRADES
    .filter((u) => isSelected(u.id))
    .reduce((sum, u) => sum + u.price, 0);

  return (
    <div>
      <h2 className="text-2xl font-bold text-secondary mb-2">Premium Upgrades</h2>
      <p className="text-muted-foreground mb-8">
        Enhance your ADU with premium upgrades for added value and comfort.
      </p>

      {/* Popular packages */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-primary to-primary-dark rounded-xl p-5 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5" />
            <h3 className="font-semibold">Smart Home Package</h3>
          </div>
          <p className="text-sm text-white/80 mb-4">
            Bundle and save! Get Solar + Smart Home + Security for $18,000 (Save $2,000)
          </p>
          <Button
            variant="outlineWhite"
            size="sm"
            onClick={() => {
              const bundleIds = ["solar", "smart-home", "security"];
              const currentUpgrades = config.upgrades || [];
              const allSelected = bundleIds.every((id) => currentUpgrades.includes(id));
              
              if (allSelected) {
                updateConfig({
                  upgrades: currentUpgrades.filter((u) => !bundleIds.includes(u)),
                });
              } else {
                updateConfig({
                  upgrades: [...new Set([...currentUpgrades, ...bundleIds])],
                });
              }
            }}
          >
            {["solar", "smart-home", "security"].every((id) => isSelected(id))
              ? "Remove Bundle"
              : "Add Bundle"}
          </Button>
        </div>
      </div>

      {/* Individual upgrades */}
      <div className="space-y-3 mb-8">
        {ADU_UPGRADES.map((upgrade) => (
          <button
            key={upgrade.id}
            onClick={() => toggleUpgrade(upgrade.id)}
            className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
              isSelected(upgrade.id)
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
              isSelected(upgrade.id) ? "bg-primary text-white" : "bg-muted text-muted-foreground"
            }`}>
              {isSelected(upgrade.id) ? (
                <Check className="h-5 w-5" />
              ) : (
                <Plus className="h-5 w-5" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-secondary">{upgrade.label}</h4>
              <p className="text-sm text-muted-foreground">{upgrade.description}</p>
            </div>
            
            <div className="text-right shrink-0">
              <span className="font-bold text-primary">+{formatCurrency(upgrade.price)}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Selected upgrades summary */}
      {totalUpgradesCost > 0 && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium text-secondary">Selected Upgrades</h4>
              <p className="text-sm text-muted-foreground">
                {config.upgrades?.length || 0} upgrade{(config.upgrades?.length || 0) !== 1 ? "s" : ""} selected
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-primary">+{formatCurrency(totalUpgradesCost)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Skip option */}
      <p className="text-sm text-muted-foreground text-center mb-8">
        Upgrades are optional. You can skip this step or add them later.
      </p>

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t border-border">
        <Button variant="ghost" onClick={prevStep}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button onClick={nextStep}>
          {totalUpgradesCost > 0 ? "Continue with Upgrades" : "Skip & Continue"}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
