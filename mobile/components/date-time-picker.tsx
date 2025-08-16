import React, { useState } from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import Picker from "@react-native-community/datetimepicker";
import { Calendar, Clock } from "lucide-react-native"; // Assuming you have lucide-react-native

interface DateTimePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  disabled?: (date: Date) => boolean;
  placeholder?: string;
  mode?: "date" | "time" | "datetime";
  minimumDate?: Date;
  maximumDate?: Date;
  className?: string;
}

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  value,
  onChange,
  disabled,
  placeholder = "Select date and time",
  mode = "datetime",
  minimumDate,
  maximumDate,
  className = "",
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date | undefined>(value);

  const formatDateTime = (date: Date) => {
    const dateOptions: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };

    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };

    const formattedDate = date.toLocaleDateString("en-US", dateOptions);
    const formattedTime = date.toLocaleTimeString("en-US", timeOptions);

    if (mode === "date") return formattedDate;
    if (mode === "time") return formattedTime;
    return `${formattedDate} at ${formattedTime}`;
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    const {
      type,
      nativeEvent: { timestamp, utcOffset },
    } = event;

    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }

    if (type === "set" && selectedDate) {
      // Check if date is disabled
      if (disabled && disabled(selectedDate)) {
        return;
      }

      if (mode === "datetime") {
        setTempDate(selectedDate);
        if (Platform.OS === "android") {
          // On Android, show time picker after date selection
          setShowTimePicker(true);
        } else {
          // On iOS, for datetime mode, we need to handle both date and time
          onChange(selectedDate);
        }
      } else {
        onChange(selectedDate);
      }
    } else if (type === "dismissed") {
      setShowDatePicker(false);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    const { type } = event;

    setShowTimePicker(false);

    if (type === "set" && selectedTime && tempDate) {
      // Combine the selected date with the selected time
      const combinedDateTime = new Date(tempDate);
      combinedDateTime.setHours(selectedTime.getHours());
      combinedDateTime.setMinutes(selectedTime.getMinutes());
      combinedDateTime.setSeconds(selectedTime.getSeconds());

      onChange(combinedDateTime);
    } else if (type === "dismissed") {
      setShowTimePicker(false);
    }
  };

  const showDateTimePicker = () => {
    if (mode === "time") {
      setShowTimePicker(true);
    } else {
      setShowDatePicker(true);
    }
  };

  return (
    <View className={className}>
      <TouchableOpacity
        onPress={showDateTimePicker}
        className="flex-row items-center justify-between p-3 border border-neutral-300 rounded-lg bg-white min-h-12"
      >
        <Text className={`flex-1 ${value ? "text-gray-900" : "text-gray-500"}`}>
          {value ? formatDateTime(value) : placeholder}
        </Text>
        <View className="flex-row items-center ml-2">
          {(mode === "date" || mode === "datetime") && (
            <Calendar size={20} color="#6B7280" />
          )}
          {(mode === "time" || mode === "datetime") && (
            <Clock
              size={20}
              color="#6B7280"
              className={mode === "datetime" ? "ml-1" : ""}
            />
          )}
        </View>
      </TouchableOpacity>

      {/* Date Picker */}
      {showDatePicker && (
        <Picker
          testID="dateTimePicker"
          value={tempDate || value || new Date()}
          mode="date"
          is24Hour={false}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleDateChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      )}

      {/* Time Picker */}
      {showTimePicker && (
        <Picker
          testID="dateTimePicker"
          value={tempDate || value || new Date()}
          mode="time"
          is24Hour={false}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleTimeChange}
        />
      )}

      {/* For iOS datetime mode, show both pickers */}
      {Platform.OS === "ios" && mode === "datetime" && showDatePicker && (
        <View className="mt-2">
          <Picker
            testID="timePicker"
            value={tempDate || value || new Date()}
            mode="time"
            is24Hour={false}
            display="spinner"
            onChange={(event, time) => {
              if (event.type === "set" && time && (tempDate || value)) {
                const baseDate = tempDate || value || new Date();
                const combinedDateTime = new Date(baseDate);
                combinedDateTime.setHours(time.getHours());
                combinedDateTime.setMinutes(time.getMinutes());
                combinedDateTime.setSeconds(time.getSeconds());
                onChange(combinedDateTime);
                setShowDatePicker(false);
              }
            }}
          />
        </View>
      )}
    </View>
  );
};
