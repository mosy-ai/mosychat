import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IconExclamationCircle, IconLoader } from "@tabler/icons-react";
import { AgentResponse } from "@/lib/api-client";
import { MultiSelectDialogProps } from "./types";

export function MultiSelectDialog<T extends { id: string; name: string | null }>({
  agent, open, onOpenChange, onSuccess, fetchItems, onSave, title, description, itemTypeName
}: MultiSelectDialogProps<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      // Set initial selections from the agent prop
      const initialIds = agent[`${itemTypeName.toLowerCase()}_ids` as keyof AgentResponse] as string[] || [];
      setSelectedIds(new Set(initialIds));

      const loadItems = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const response = await fetchItems();
          setItems(response.data || []);
        } catch (err: any) {
          setError(`Failed to load ${itemTypeName}s.`);
        } finally {
          setIsLoading(false);
        }
      };
      loadItems();
    }
  }, [open, agent, fetchItems, itemTypeName]);

  const handleCheckboxChange = (id: string, checked: boolean) => {
    const newSelectedIds = new Set(selectedIds);
    if (checked) newSelectedIds.add(id);
    else newSelectedIds.delete(id);
    setSelectedIds(newSelectedIds);
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await onSave(agent.id, Array.from(selectedIds));
      onSuccess();
    } catch (err: any) {
      setError(err.message || `Failed to update ${itemTypeName}s.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="h-[320px] overflow-y-auto border rounded-md relative">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50">
              <IconLoader className="w-6 h-6 animate-spin" />
              <span className="ml-2">Loading {itemTypeName}s...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead></TableHead>
                  <TableHead>Name</TableHead>
                  
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.has(item.id)}
                        onCheckedChange={(c) => handleCheckboxChange(item.id, !!c)}
                      />
                    </TableCell>
                    <TableCell>{item.name}</TableCell>
                    
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
        <Button
          onClick={handleSave}
          disabled={isLoading || isSubmitting}
          className="w-full"
        >
          {isSubmitting ? "Saving..." : `Save ${itemTypeName}s`}
        </Button>
        {error && (
          <Alert variant="destructive">
            <IconExclamationCircle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </DialogContent>
    </Dialog>
  );
} 