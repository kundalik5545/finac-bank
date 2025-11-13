"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CheckCircle2, Clock } from "lucide-react";
import { useFormatCurrency } from "@/hooks/use-formatCurrency";
import { Badge } from "@/components/ui/badge";

export function RecurringTransactionsCalendar({
  recurringTransactions,
  onRefresh,
}) {
  const { formatCurrency } = useFormatCurrency("en-IN", "INR");
  const [currentDate, setCurrentDate] = useState(new Date());

  // Calculate which dates each recurring transaction should appear on
  const getOccurrencesForMonth = (rt, year, month) => {
    const occurrences = [];
    const startDate = new Date(rt.startDate);
    const endDate = rt.endDate ? new Date(rt.endDate) : null;

    // Check if recurring transaction is active for this month
    if (endDate && endDate < new Date(year, month, 1)) {
      return occurrences; // Already ended
    }

    if (startDate > new Date(year, month + 1, 0)) {
      return occurrences; // Not started yet
    }

    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);

    // Calculate first occurrence in this month
    let currentDate = new Date(startDate);
    
    if (currentDate < monthStart) {
      // Calculate next occurrence from start date based on frequency
      if (rt.frequency === "DAILY") {
        // For daily, start from the first day of the month
        currentDate = new Date(monthStart);
      } else if (rt.frequency === "WEEKLY") {
        // Find first week day in the month
        const dayOfWeek = startDate.getDay();
        const dayOfMonth = startDate.getDate();
        currentDate = new Date(monthStart);
        
        // Find first occurrence of this day of week in the month
        while (currentDate.getDay() !== dayOfWeek && currentDate <= monthEnd) {
          currentDate.setDate(currentDate.getDate() + 1);
        }
        
        // If we've passed the start date's day of month, move to next week
        if (currentDate.getDate() < dayOfMonth) {
          currentDate.setDate(currentDate.getDate() + 7);
        }
      } else if (rt.frequency === "MONTHLY") {
        // Same day of month
        const dayOfMonth = Math.min(startDate.getDate(), monthEnd.getDate());
        currentDate = new Date(year, month, dayOfMonth);
      } else if (rt.frequency === "YEARLY") {
        // Same month and day
        const dayOfMonth = Math.min(startDate.getDate(), monthEnd.getDate());
        currentDate = new Date(year, startDate.getMonth(), dayOfMonth);
        // If the month doesn't match, this yearly transaction doesn't occur this month
        if (currentDate.getMonth() !== month) {
          return occurrences;
        }
      }
    }

    // Generate all occurrences for this month
    while (currentDate <= monthEnd) {
      if (currentDate >= monthStart && (!endDate || currentDate <= endDate)) {
        // Check if there's a transaction for this date
        const transaction = rt.transactions?.find(
          (t) => new Date(t.date).toDateString() === currentDate.toDateString()
        );

        occurrences.push({
          date: new Date(currentDate),
          status: transaction?.status || "PENDING",
          transactionId: transaction?.id,
        });
      }

      // Move to next occurrence
      if (rt.frequency === "DAILY") {
        currentDate.setDate(currentDate.getDate() + 1);
      } else if (rt.frequency === "WEEKLY") {
        currentDate.setDate(currentDate.getDate() + 7);
      } else if (rt.frequency === "MONTHLY") {
        currentDate.setMonth(currentDate.getMonth() + 1);
      } else if (rt.frequency === "YEARLY") {
        currentDate.setFullYear(currentDate.getFullYear() + 1);
      }

      // Safety check to prevent infinite loop
      if (currentDate <= new Date(currentDate.getTime() - 1000)) {
        break;
      }
    }

    return occurrences;
  };

  // Get calendar data for current month
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month with their recurring transactions
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayTransactions = [];

      recurringTransactions.forEach((rt) => {
        if (!rt.isActive) return;
        
        const occurrences = getOccurrencesForMonth(rt, year, month);
        const occurrence = occurrences.find(
          (occ) => occ.date.toDateString() === date.toDateString()
        );

        if (occurrence) {
          dayTransactions.push({
            ...rt,
            occurrenceStatus: occurrence.status,
            transactionId: occurrence.transactionId,
          });
        }
      });

      days.push({
        date,
        day,
        transactions: dayTransactions,
      });
    }

    return {
      year,
      month,
      monthName: firstDay.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      days,
    };
  }, [currentDate, recurringTransactions]);

  const navigateMonth = (direction) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{calendarData.monthName}</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigateMonth(-1)}>
              <ChevronLeft size={16} />
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigateMonth(1)}>
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1">
          {/* Week day headers */}
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-sm font-medium text-muted-foreground p-2"
            >
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {calendarData.days.map((dayData, index) => {
            if (!dayData) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const isToday =
              dayData.date.toDateString() === new Date().toDateString();
            const isPast = dayData.date < new Date() && !isToday;

            return (
              <div
                key={dayData.date.toISOString()}
                className={`aspect-square border rounded-lg p-1 overflow-y-auto ${
                  isToday
                    ? "bg-blue-100 dark:bg-blue-900 border-blue-500"
                    : isPast
                    ? "bg-muted/30"
                    : "bg-background"
                }`}
              >
                <div
                  className={`text-xs font-medium mb-1 ${
                    isToday ? "text-blue-700 dark:text-blue-300" : ""
                  }`}
                >
                  {dayData.day}
                </div>
                <div className="space-y-1">
                  {dayData.transactions.map((rt) => {
                    const isCompleted = rt.occurrenceStatus === "COMPLETED";
                    const isPending = rt.occurrenceStatus === "PENDING";

                    return (
                      <div
                        key={`${rt.id}-${dayData.date.toISOString()}`}
                        className={`text-[10px] p-1 rounded ${
                          isCompleted
                            ? "bg-green-500 dark:bg-green-700 text-white"
                            : isPending
                            ? "bg-red-500 dark:bg-red-700 text-white"
                            : "bg-gray-500 dark:bg-gray-700 text-white"
                        }`}
                        title={`${rt.description || "Recurring Transaction"} - ${formatCurrency(Number(rt.amount))} - ${rt.occurrenceStatus}`}
                      >
                        <div className="truncate font-medium">
                          {rt.description || "Recurring"}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px]">
                            {formatCurrency(Number(rt.amount))}
                          </span>
                          {isCompleted ? (
                            <CheckCircle2 size={8} />
                          ) : (
                            <Clock size={8} />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500" />
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500" />
            <span>Pending</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

