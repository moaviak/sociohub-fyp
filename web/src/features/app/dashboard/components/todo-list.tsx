import { Button } from "@/components/ui/button";
import { useGetUserTasksQuery } from "../../todo-list/api";
import { TaskRow } from "../../todo-list/components/task-row";
import { useEffect, useState } from "react";
import { Task } from "@/types";

export const TodoList = () => {
  const { data, isLoading } = useGetUserTasksQuery({ limit: 4 });
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
    <div className="w-full flex flex-col gap-y-4 p-4 bg-white drop-shadow-lg rounded-lg min-h-[384px]">
      <div className="flex justify-between items-center">
        <div>
          <p className="b3-regular text-neutral-600">Task Manager</p>
          <h5 className="h6-semibold">To-Do List</h5>
        </div>

        <Button
          size={"sm"}
          onClick={handleAddNewTask}
          disabled={isAddingNewTask}
        >
          Add task
        </Button>
      </div>
      <div className="flex-1 flex flex-col gap-2">
        {isLoading ? (
          <>
            <TaskRow.Skeleton variant="compact" />
            <TaskRow.Skeleton variant="compact" />
            <TaskRow.Skeleton variant="compact" />
            <TaskRow.Skeleton variant="compact" />
          </>
        ) : tasks.length > 0 ? (
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
                variant="compact"
              />
            )}
            {tasks.map((task) => (
              <TaskRow key={task.id} task={task} variant="compact" />
            ))}
          </>
        ) : (
          <div className="flex items-center justify-center">No tasks</div>
        )}
      </div>
    </div>
  );
};
