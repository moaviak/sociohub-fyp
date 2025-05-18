import React, { useRef, useEffect, useState } from "react";

interface UseTimePickerProps {
  /**
   * The controlled value of the time picker in HH:mm format (24-hour).
   */
  value: string;
  /**
   * Callback function that is called when the time value changes.
   * Receives the new value in HH:mm format.
   */
  onChange: (time: string) => void;
  /**
   * The minimum selectable time in HH:mm format.
   * Maps to the native input's 'min' attribute.
   */
  min?: string;
  /**
   * The maximum selectable time in HH:mm format.
   * Maps to the native input's 'max' attribute.
   */
  max?: string;
  /**
   * Whether the time picker is disabled.
   * Maps to the native input's 'disabled' attribute.
   */
  disabled?: boolean;
}

/**
 * A headless hook for managing a time picker component.
 * Leverages a hidden native <input type="time"> for browser picker functionality.
 */
export function useTimePicker({
  value,
  onChange,
  min,
  max,
  disabled,
}: UseTimePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  // Internal state to reflect the input's value, useful for display formatting
  // but the source of truth is the controlled 'value' prop.
  const [, setDisplayTime] = useState(value);

  // Keep the internal state in sync with the controlled value
  useEffect(() => {
    setDisplayTime(value);
  }, [value]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    // The native input gives value in HH:mm format (24-hour)
    onChange(newValue);
  };

  const openPicker = () => {
    // Programmatically trigger the native time picker dialog
    if (inputRef.current) {
      inputRef.current.showPicker();
    }
  };

  // Provide props to apply to the hidden native input element
  const nativeInputProps = {
    type: "time" as const,
    ref: inputRef,
    value: value, // Native input works directly with HH:mm
    onChange: handleInputChange,
    min: min,
    max: max,
    disabled: disabled,
    // Hide the native input visually but keep it in the DOM for functionality
    style: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      opacity: 0,
      pointerEvents: "none", // Prevent clicks on the hidden input itself
    } as React.CSSProperties,
    "aria-hidden": true, // Hide from accessibility tree
    tabIndex: -1, // Make it non-focusable
  };

  return {
    /**
     * The current time value (same as the controlled 'value' prop, in HH:mm format).
     * Use this for the value of your visible input field.
     */
    time: value,
    /**
     * A ref to attach to the hidden native <input type="time"> element.
     */
    inputRef,
    /**
     * Event handler for the native input's change event.
     * It calls the 'onChange' prop with the new time value.
     */
    handleInputChange,
    /**
     * Function to programmatically open the native time picker dialog.
     * Attach this to the click handler of your visible input or icon button.
     */
    openPicker,
    /**
     * Props to apply to the hidden native <input type="time"> element.
     */
    nativeInputProps,
  };
}
