/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { toast } from "react-toastify";

interface CollaboratorFormProps {
  taskId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function CollaboratorForm({
  taskId,
  isOpen,
  onClose,
}: CollaboratorFormProps) {
  const [emails, setEmails] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchloading, setFetchLoading] = useState(false);
  const [collaborators, setCollaborators] = useState<any[]>([]);

  // fetch collaborators for this task
  useEffect(() => {
    fetchCollabprators();
  }, [isOpen, taskId]);

  const fetchCollabprators = async () => {
    if (!isOpen) return;
    setFetchLoading(true)
    try {
      const res = await axios.get(`/api/tasks/${taskId}/collab`);
      console.log(res);
      setCollaborators(res.data.data || []);
    } catch (err) {
      console.error("Error fetching collaborators:", err);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleInvite = async () => {
    setLoading(true);
    try {
      await axios.post(`/api/tasks/${taskId}/collab`, {
        emails: emails.split(",").map((e) => e.trim()),
        role: "VIEWER",
      });
      setEmails("");
      fetchCollabprators();
    } catch (err: any) {
      console.error("Error adding collaborators:", err);
      const message =
        err.response?.data?.message || "Failed to update collaborator";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (email: string, role: string) => {
    try {
      const res = await axios.put(`/api/tasks/${taskId}/collab`, {
        email,
        role,
      });
      if (res.data.success) {
        toast.success("Collaborator updated successfully");
        fetchCollabprators();
      } else {
        toast.error(res.data.message || "Failed to update collaborator");
      }
    } catch (err: any) {
      const message =
        err.response?.data?.message || "Failed to update collaborator";
      toast.error(message);
      console.error("Error updating role:", err);
    }
  };

  const handleRemove = async (email: string) => {
    try {
      const res = await axios.delete(`/api/tasks/${taskId}/collab`, {
        data: { email },
      });

      if (res.data.success) {
        toast.success("Collaborator removed successfully");
      } else {
        toast.error(res.data.message || "Failed to update collaborator");
      }
      fetchCollabprators();
    } catch (err: any) {
      console.error("Error removing collaborator:", err);
      const message =
        err.response?.data?.message || "Failed to update collaborator";
      toast.error(message);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Collaborators</DialogTitle>
        </DialogHeader>

        {/* Add new collaborators */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="emails" className="mb-2">
              Collaborator Emails (comma separated)
            </Label>
            <Input
              id="emails"
              placeholder="e.g. user1@example.com, user2@example.com"
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleInvite}
              disabled={loading}
              className="flex-1"
            >
              {loading ? "Inviting..." : "Invite"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>

        {/* List existing collaborators */}
        <div className="mt-6 space-y-2">
          <h3 className="text-sm font-semibold">Current Collaborators</h3>
          {collaborators.length === 0 && (
            <p className="text-muted-foreground text-sm">
              No collaborators yet.
            </p>
          )}
          {fetchloading ? (
            <>
              <div className="text-center">Loading....</div>
            </>
          ) : (
            <>
              {collaborators.map((c) => (
                <div
                  key={c.id}
                  className="flex justify-between items-center border p-2 rounded"
                >
                  <span>{c.user.email}</span>
                  <div className="flex flex-wrap items-center gap-3">
                    <Select
                      value={c.role}
                      onValueChange={(value) => handleRoleChange(c.user.email, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="VIEWER">Viewer</SelectItem>
                        <SelectItem value="OWNER">Owner</SelectItem>
                      </SelectContent>
                    </Select>

                    {c.role !== "OWNER" && (<Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemove(c.user.email)}
                    >
                      Remove
                    </Button>)}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
