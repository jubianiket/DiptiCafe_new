"use client"

import * as React from "react"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

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
  // The value displayed in the input field
  const [inputValue, setInputValue] = React.useState("");
  const [open, setOpen] = React.useState(false);
  
  const containerRef = React.useRef<HTMLDivElement>(null);

  // When the controlled `value` from the parent form changes,
  // update our displayed input value to show the corresponding label.
  React.useEffect(() => {
    const selectedLabel = value
      ? options.find(o => o.value.toLowerCase() === value.toLowerCase())?.label
      : "";
    setInputValue(selectedLabel || "");
  }, [value, options]);

  // When an item is selected from the list
  const handleSelect = (selectedValue: string) => {
    // Update the parent form
    onChange(selectedValue);

    // Update the displayed value in the input
    const selectedLabel = options.find(o => o.value.toLowerCase() === selectedValue.toLowerCase())?.label;
    setInputValue(selectedLabel || "");
    
    // Close the dropdown
    setOpen(false);
  };
  
  // When the text in the input changes
  const handleInputChange = (searchQuery: string) => {
    setInputValue(searchQuery);
    // If the user clears the input, clear the selection in the form
    if (searchQuery === '') {
        onChange('');
    }
    if (!open) {
      setOpen(true);
    }
  }

  // Close the dropdown if the user clicks outside of it
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
        // If the dropdown is closed without a selection,
        // revert the input to show the label of the last valid selection.
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

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
        <Command shouldFilter={false} className="overflow-visible bg-transparent">
             <CommandInput
                value={inputValue}
                onValueChange={handleInputChange}
                onFocus={() => setOpen(true)}
                placeholder={searchPlaceholder || "Search..."}
                className="w-full"
            />
            {open && (
                <div className="absolute top-full z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95">
                    <CommandList>
                        <CommandEmpty>{emptyPlaceholder || "No results found."}</CommandEmpty>
                        <CommandGroup>
                        {options
                          .filter(option => option.label.toLowerCase().includes(inputValue.toLowerCase()))
                          .map((option) => (
                            <CommandItem
                                key={option.value}
                                value={option.value}
                                onSelect={handleSelect}
                            >
                                <Check
                                    className={cn(
                                        "mr-2 h-4 w-4",
                                        value && value.toLowerCase() === option.value.toLowerCase() ? "opacity-100" : "opacity-0"
                                    )}
                                />
                                {option.label}
                            </CommandItem>
                        ))}
                        </CommandGroup>
                    </CommandList>
                </div>
            )}
        </Command>
    </div>
  )
}
