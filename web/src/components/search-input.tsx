import { Loader2, Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  placeholder?: string;
  className?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  isSearching?: boolean;
}

export const SearchInput = ({
  placeholder,
  className,
  value,
  onChange,
  onFocus,
  onBlur,
  isSearching,
}: SearchInputProps) => {
  return (
    <div className="relative min-w-fit">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-500" />
      <Input
        className={cn(
          "w-md outline outline-neutral-400 rounded-xl px-10",
          className
        )}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
      />
      {isSearching && (
        <Loader2 className="animate-spin w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-500" />
      )}
    </div>
  );
};
