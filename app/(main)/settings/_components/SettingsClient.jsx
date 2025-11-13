"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

export function SettingsClient({ initialPreferences }) {
  const [preferences, setPreferences] = useState({
    emailNotifications: initialPreferences?.emailNotifications ?? true,
    budgetAlerts: initialPreferences?.budgetAlerts ?? true,
    telegramNotifications: initialPreferences?.telegramNotifications ?? false,
    telegramChatId: initialPreferences?.telegramChatId || "",
    budgetAlertThreshold: initialPreferences?.budgetAlertThreshold ?? 80,
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/user/preferences", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(preferences),
      });

      if (response.ok) {
        toast.success("Settings saved successfully");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to save settings");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto md:max-w-5xl lg:max-w-7xl xl:max-w-full px-2 md:px-0 py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your account preferences and notification settings
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Budget Alert Preferences</CardTitle>
            <CardDescription>
              Configure how you receive notifications when budgets are exceeded or approaching limits
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="emailNotifications"
                  checked={preferences.emailNotifications}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, emailNotifications: checked })
                  }
                />
                <Label htmlFor="emailNotifications" className="cursor-pointer">
                  Email Notifications
                </Label>
              </div>
              <p className="text-sm text-muted-foreground ml-6">
                Receive budget alerts via email when budgets are exceeded or approaching limits
              </p>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="budgetAlerts"
                  checked={preferences.budgetAlerts}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, budgetAlerts: checked })
                  }
                />
                <Label htmlFor="budgetAlerts" className="cursor-pointer">
                  Enable Budget Alerts
                </Label>
              </div>
              <p className="text-sm text-muted-foreground ml-6">
                Enable or disable all budget alerts (email and Telegram)
              </p>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="telegramNotifications"
                  checked={preferences.telegramNotifications}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, telegramNotifications: checked })
                  }
                />
                <Label htmlFor="telegramNotifications" className="cursor-pointer">
                  Telegram Notifications
                </Label>
              </div>
              <p className="text-sm text-muted-foreground ml-6">
                Receive budget alerts via Telegram (requires Telegram Chat ID)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="telegramChatId">Telegram Chat ID</Label>
              <Input
                id="telegramChatId"
                type="text"
                placeholder="Enter your Telegram Chat ID"
                value={preferences.telegramChatId}
                onChange={(e) =>
                  setPreferences({ ...preferences, telegramChatId: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                To get your Chat ID: Start a conversation with @userinfobot on Telegram, or use
                your bot's chat ID if you've connected a Telegram bot
              </p>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="budgetAlertThreshold">Budget Alert Threshold (%)</Label>
              <Input
                id="budgetAlertThreshold"
                type="number"
                min="0"
                max="100"
                value={preferences.budgetAlertThreshold}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    budgetAlertThreshold: parseInt(e.target.value) || 80,
                  })
                }
              />
              <p className="text-xs text-muted-foreground">
                Receive a warning alert when spending reaches this percentage of your budget
                (default: 80%)
              </p>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Preferences"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

