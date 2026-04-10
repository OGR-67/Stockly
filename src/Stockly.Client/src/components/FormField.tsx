import { useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FieldWrapper } from "./FieldWrapper";

interface FormFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
}

export function FormField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  className,
}: FormFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isDate = type === "date";

  return (
    <FieldWrapper label={label} className={className}>
      <div className="relative">
        <input
          ref={inputRef}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => {
            if (isDate && inputRef.current?.showPicker) {
              inputRef.current.showPicker();
            }
          }}
          className={`w-full border border-stone-300 rounded-lg px-3 py-2 text-sm outline-none ${
            isDate
              ? "[&::-webkit-calendar-picker-indicator]:hidden" // hide native calendar icon
              : ""
          }`}
          placeholder={placeholder}
        />
        {value && (
          <button
            onClick={() => onChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
            title="Effacer"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        )}
      </div>
    </FieldWrapper>
  );
}
