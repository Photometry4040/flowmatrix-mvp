/* Design: Autocomplete input for ontology tags
 * Features: Intelligent tag suggestions based on existing tags
 */

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { X } from "lucide-react";
import { useState, useMemo } from "react";

interface TagAutocompleteProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  allTags: string[];
}

export default function TagAutocomplete({ 
  selectedTags, 
  onTagsChange, 
  allTags 
}: TagAutocompleteProps) {
  const [inputValue, setInputValue] = useState("");
  const [open, setOpen] = useState(false);

  const suggestions = useMemo(() => {
    if (!inputValue) return allTags.filter(tag => !selectedTags.includes(tag)).slice(0, 5);
    
    const filtered = allTags.filter(
      tag => 
        !selectedTags.includes(tag) && 
        tag.toLowerCase().includes(inputValue.toLowerCase())
    );
    
    return filtered.slice(0, 5);
  }, [inputValue, allTags, selectedTags]);

  const handleAddTag = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      onTagsChange([...selectedTags, tag]);
    }
    setInputValue("");
    setOpen(false);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onTagsChange(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      const newTag = inputValue.trim().startsWith("#") 
        ? inputValue.trim() 
        : `#${inputValue.trim()}`;
      handleAddTag(newTag);
    }
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Input
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setOpen(true);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => setOpen(true)}
            placeholder="태그 입력 (예: #기획, #디자인)"
            className="font-body"
          />
        </PopoverTrigger>
        {suggestions.length > 0 && (
          <PopoverContent 
            className="p-0 w-[var(--radix-popover-trigger-width)]" 
            align="start"
            side="bottom"
          >
            <Command>
              <CommandList>
                <CommandEmpty>제안 없음</CommandEmpty>
                <CommandGroup heading="추천 태그">
                  {suggestions.map((tag) => (
                    <CommandItem
                      key={tag}
                      onSelect={() => handleAddTag(tag)}
                      className="cursor-pointer"
                    >
                      <Badge variant="outline" className="font-mono text-primary border-primary">
                        {tag}
                      </Badge>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        )}
      </Popover>

      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <Badge 
              key={tag} 
              variant="outline" 
              className="font-mono text-primary border-primary gap-1 pr-1"
            >
              {tag}
              <button
                onClick={() => handleRemoveTag(tag)}
                className="ml-1 hover:bg-primary/20 rounded-sm p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
