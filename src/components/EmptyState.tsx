"use client";

import { Card } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

export default function EmptyState() {
  return (
    <Card className="p-8 text-center">
      <div className="text-muted-foreground">
        <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-medium mb-2">No tasks found</h3>
        <p>Create your first task to get started</p>
      </div>
    </Card>
  );
}