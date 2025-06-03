import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
  targetDate: Date;
  title?: string;
  onComplete?: () => void;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  targetDate,
  title = "Event will Publish in",
  onComplete,
}) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isExpired, setIsExpired] = useState(false);

  const calculateTimeLeft = (): TimeLeft => {
    const difference = targetDate.getTime() - new Date().getTime();

    if (difference > 0) {
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }

    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  };

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);

      if (
        newTimeLeft.days === 0 &&
        newTimeLeft.hours === 0 &&
        newTimeLeft.minutes === 0 &&
        newTimeLeft.seconds === 0
      ) {
        setIsExpired(true);
        onComplete?.();
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, onComplete]);

  const TimeUnit: React.FC<{ value: number; label: string }> = ({
    value,
    label,
  }) => (
    <div className="flex flex-col items-center">
      <div className="relative">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg transform transition-transform hover:scale-105">
          <span className="text-2xl font-bold text-white">
            {value.toString().padStart(2, "0")}
          </span>
        </div>
        <div className="absolute -inset-1 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl opacity-20 blur-sm"></div>
      </div>
      <span className="text-sm font-medium text-gray-600 mt-2 capitalize">
        {label}
      </span>
    </div>
  );

  if (isExpired) {
    return (
      <div className="max-w-md mx-auto p-8 bg-white rounded-3xl shadow-2xl border border-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Event is Live!
          </h2>
          <p className="text-gray-600">
            The event has been published and is now available.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-8 bg-white rounded-3xl shadow-2xl border border-gray-100">
      <div className="text-center mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
        <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mx-auto"></div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <TimeUnit value={timeLeft.days} label="days" />
        <TimeUnit value={timeLeft.hours} label="hours" />
        <TimeUnit value={timeLeft.minutes} label="mins" />
        <TimeUnit value={timeLeft.seconds} label="secs" />
      </div>

      <div className="text-center">
        <p className="text-gray-500 text-sm">
          Target: {targetDate.toLocaleDateString()} at{" "}
          {targetDate.toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};
