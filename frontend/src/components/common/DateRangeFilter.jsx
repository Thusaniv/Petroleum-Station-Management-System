import React from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Calendar, X } from "lucide-react";

export function DateRangeFilter({ startDate, endDate, onStartDateChange, onEndDateChange, onClear }) {
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleClear = () => {
    onStartDateChange('');
    onEndDateChange('');
    if (onClear) onClear();
  };

  return (
    <div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div className="grid gap-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={formatDateForInput(startDate)}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={formatDateForInput(endDate)}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleClear}
              className="flex items-center gap-2"
              size="sm"
            >
              <X className="h-4 w-4" />
              Clear
            </Button>
          </div>
        </div>

        {(startDate || endDate) && (
          <div className="mt-4 text-sm text-muted-foreground">
            Filtering: {startDate ? new Date(startDate).toLocaleDateString() : 'Start'} to {endDate ? new Date(endDate).toLocaleDateString() : 'End'}
          </div>
        )}
        </div>
     
  );
}
