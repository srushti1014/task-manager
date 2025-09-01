"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Taskcard from "@/components/Taskcard";
import { Task } from "@/lib/types";
import Loader from "@/components/Loader";

export default function CollabsPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCollabs() {
      try {
        const res = await axios.get("/api/collab");
        setTasks(res.data.data || []);
        console.log("collab: ", res.data.data)
      } catch (err) {
        console.error("Error fetching collab tasks:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCollabs();
  }, []);

  if (loading) return <Loader />
  if (!tasks.length) return <p>No collaboration tasks yet.</p>;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 p-6">
      {tasks.map((task) => (
        <Taskcard
          key={task.id}
          task={task}
          onEdit={() => {}}
          onStatusChange={() => {}}
          onDelete={() => {}}
        />
      ))}
    </div>
  );
}
