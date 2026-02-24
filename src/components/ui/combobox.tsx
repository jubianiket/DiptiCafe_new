"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Command, CommandInput } from "@/components/ui/command"

interface ComboboxProps {
    options: { label: string; value: string }[]
    value?: string
    onChange: (value: string) => void
    placeholder?: string
    searchPlaceholder?: string
    emptyPlaceholder?: string
    className?: string;
}

export function Combobox({ options, value, onChange, searchPlaceholder, emptyPlaceholder, className }: ComboboxProps) {
  const [inputValue, setInputValue] = React.useState("");
  const [open, setOpen] = React.useState(false);
  
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const selectedLabel = value
      ? options.find(o => o.value.toLowerCase() === value.toLowerCase())?.label
      : "";
    setInputValue(selectedLabel || "");
  }, [value, options]);

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    const selectedLabel = options.find(o => o.value.toLowerCase() === selectedValue.toLowerCase())?.label;
    setInputValue(selectedLabel || "");
    setOpen(false);
  };
  
  const handleInputChange = (searchQuery: string) => {
    setInputValue(searchQuery);
    if (searchQuery === '') {
        onChange('');
    }
    if (!open) {
      setOpen(true);
    }
  }

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
        const selectedLabel = value
          ? options.find(o => o.value.toLowerCase() === value.toLowerCase())?.label
          : "";
        setInputValue(selectedLabel || "");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [containerRef, value, options]);

  const filteredOptions = React.useMemo(() => {
    if (!inputValue) {
        return [];
    }
    return options.filter(option => option.label.toLowerCase().includes(inputValue.toLowerCase()));
  }, [inputValue, options]);

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
        <Command shouldFilter={false} className="overflow-visible bg-transparent">
             <CommandInput
                value={inputValue}
                onValueChange={handleInputChange}
                onFocus={() => setOpen(true)}
                placeholder={searchPlaceholder || "Search..."}
                className="w-full"
                onKeyDown={(e) => {
                    e.stopPropagation();
                }}
            />
        </Command>
        {open && inputValue && (
            <div className="absolute top-full z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95">
                <div className="max-h-[300px] overflow-y-auto overflow-x-hidden p-1">
                    {filteredOptions.length === 0 ? (
                        <p className="py-6 text-center text-sm">{emptyPlaceholder || "No results found."}</p>
                    ) : (
                        filteredOptions.map((option) => (
                            <div
                                key={option.value}
                                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                                onClick={() => handleSelect(option.value)}
                            >
                                {option.label}
                            </div>
                        ))
                    )}
                </div>
            </div>
        )}
    </div>
  )
}
