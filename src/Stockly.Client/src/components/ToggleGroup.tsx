import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { haptic } from "ios-haptics";

interface ToggleOption<T> {
  value: T;
  label: string;
  icon?: IconDefinition;
}

interface ToggleGroupProps<T> {
  options: ToggleOption<T>[];
  value: T;
  onChange: (value: T) => void;
  variant?: "primary" | "secondary";
}

export function ToggleGroup<T extends string>({
  options,
  value,
  onChange,
  variant = "primary",
}: ToggleGroupProps<T>) {
  const baseClasses = {
    primary: "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
    secondary:
      "flex items-center gap-3 px-4 py-3 rounded-lg border text-sm font-medium transition-colors",
  };

  const selectedClasses = {
    primary: "bg-earth text-white",
    secondary: "border-earth bg-earth/10 text-earth",
  };

  const unselectedClasses = {
    primary: "bg-cream border border-sage/30 text-bark hover:bg-sage-light/30",
    secondary: "border-stone-200 text-stone-600",
  };

  return (
    <div
      className={`flex ${variant === "primary" ? "gap-2" : "flex-col gap-2"}`}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => {
            haptic()
            onChange(option.value)
          }}
          className={`${baseClasses[variant]} ${
            value === option.value
              ? selectedClasses[variant]
              : unselectedClasses[variant]
          }`}
        >
          {option.icon && <FontAwesomeIcon icon={option.icon} />}
          {option.label}
        </button>
      ))}
    </div>
  );
}
