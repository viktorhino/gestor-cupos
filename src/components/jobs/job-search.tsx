"use client";

import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

interface JobSearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export function JobSearch({ searchTerm, onSearchChange }: JobSearchProps) {
  return (
    <div className="flex gap-2 items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar por cliente, referencia o número de trabajo..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <Button variant="outline" size="icon" className="w-10 h-10">
        <Filter className="h-4 w-4" />
      </Button>
    </div>
  );
}
