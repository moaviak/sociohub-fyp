import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TaskRow } from "./components/task-row";
import { useGetUserTasksQuery } from "./api";
import { useState, useEffect } from "react";
import { Task } from "@/types";

export const TodoList = () => {
  const { data, isLoading } = useGetUserTasksQuery();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAddingNewTask, setIsAddingNewTask] = useState(false);

  useEffect(() => {
    if (data && !("error" in data)) {
      setTasks(data as Task[]);
    }
  }, [data]);

  const handleAddNewTask = () => {
    setIsAddingNewTask(true);
  };

  const handleNewTaskCreate = (newTask: Task) => {
    setTasks((prev) => [newTask, ...prev]);
    setIsAddingNewTask(false);
  };

  return (
    <div className="flex flex-col px-4 py-2">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="h3-semibold">To-Do List</h3>
          <p className="b3-regular">Create and manage your to-do list.</p>
        </div>
        <div className="space-x-4">
          <Button onClick={handleAddNewTask} disabled={isAddingNewTask}>
            <Plus className="text-white w-4 h-4" />
            Add new task
          </Button>
        </div>
      </div>
      <div className="flex-1 flex flex-col p-4 gap-y-2">
        {isLoading ? (
          <>
            <TaskRow.Skeleton />
            <TaskRow.Skeleton />
            <TaskRow.Skeleton />
            <TaskRow.Skeleton />
            <TaskRow.Skeleton />
          </>
        ) : (
          <>
            {isAddingNewTask && (
              <TaskRow
                task={{
                  id: "",
                  description: "",
                  isCompleted: false,
                  isStarred: false,
                }}
                isNew
                onCreate={handleNewTaskCreate}
              />
            )}
            {tasks.map((task) => (
              <TaskRow key={task.id} task={task} />
            ))}
          </>
        )}
      </div>
    </div>
  );
};
