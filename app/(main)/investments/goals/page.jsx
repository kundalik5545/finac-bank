import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import React from "react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/db/db.config";
import { GoalsList } from "./_components/GoalsList";
import { getGoals } from "@/action/goal";

const GoalsPage = async () => {
  let goals = [];

  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (session?.user) {
      goals = await getGoals(session.user.id);
    }
  } catch (error) {
    console.error("Error fetching goals:", error);
  }

  return (
    <div className="goals-page container mx-auto md:max-w-5xl lg:max-w-7xl xl:max-w-full px-2 md:px-0">
      {/* Heading Section */}
      <section className="flex justify-between items-center pb-5">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">
            Financial Goals
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track your financial goals and monitor your progress.
          </p>
        </div>
        <Button>
          <Link
            href="/investments/goals/add"
            className="flex items-center justify-around"
          >
            <Plus size={16} /> Add Goal
          </Link>
        </Button>
      </section>

      {/* Goals List */}
      <section className="py-5">
        <GoalsList goals={goals} />
      </section>
    </div>
  );
};

export default GoalsPage;
