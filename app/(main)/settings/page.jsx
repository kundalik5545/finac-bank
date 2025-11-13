import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/db/db.config";
import { SettingsClient } from "./_components/SettingsClient";

const SettingsPage = async () => {
  let userPreferences = null;

  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (session?.user) {
      userPreferences = await prisma.userPreference.findUnique({
        where: {
          userId: session.user.id,
        },
      });

      // Create default preferences if they don't exist
      if (!userPreferences) {
        userPreferences = await prisma.userPreference.create({
          data: {
            userId: session.user.id,
            currency: "INR",
            emailNotifications: true,
            budgetAlerts: true,
            telegramNotifications: false,
            budgetAlertThreshold: 80,
          },
        });
      }
    }
  } catch (error) {
    console.error("Error fetching user preferences:", error);
  }

  return <SettingsClient initialPreferences={userPreferences} />;
};

export default SettingsPage;
