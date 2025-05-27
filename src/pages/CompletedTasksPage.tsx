import React, { useState, useEffect } from 'react';
import { Check, Loader2, ListFilter } from 'lucide-react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { Task } from '@/types';
import TaskItem from '@/components/TaskItem';
import Input from '@/components/ui/Input';
import {
  toggleTaskStatus,
  deleteTask,
  getUserTasks,
} from '@/services/taskService';

const CompletedTasksPage: React.FC = () => {
  const [user] = useAuthState(auth);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchTasks = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      const completedTasks = await getUserTasks(user.uid, 'Complete');
      setTasks(completedTasks);
      setFilteredTasks(completedTasks);
    } catch (err) {
      console.error('Error fetching completed tasks:', err);
      setError('Failed to load completed tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredTasks(tasks);
    } else {
      const lowercaseQuery = searchQuery.toLowerCase();
      const filtered = tasks.filter(
        (task) =>
          task.title.toLowerCase().includes(lowercaseQuery) ||
          task.description.toLowerCase().includes(lowercaseQuery)
      );
      setFilteredTasks(filtered);
    }
  }, [searchQuery, tasks]);

  const handleToggleStatus = async (taskId: string) => {
    if (!user) return;

    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    try {
      await toggleTaskStatus(taskId, task.status);
      fetchTasks(); // Refresh tasks
    } catch (err) {
      console.error('Error updating task status:', err);
      setError('Failed to update task status. Please try again.');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!user) return;

    try {
      await deleteTask(taskId);
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
    } catch (err) {
      console.error('Error deleting task:', err);
      setError('Failed to delete task. Please try again.');
    }
  };

  const handleEditTask = (task: Task) => {
    // No direct editing on completed page - we'll just toggle status to reopen
    handleToggleStatus(task.id);
  };

  if (loading && tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading your completed tasks...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Completed Tasks</h1>
        <p className="text-muted-foreground mt-1">
          View and manage your completed tasks
        </p>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      <div className="mb-6">
        <div className="relative">
          <Input
            placeholder="Search completed tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          <ListFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="bg-muted/40 rounded-lg border border-dashed p-8 text-center">
          <Check className="h-12 w-12 mx-auto text-success opacity-50 mb-4" />
          <h3 className="text-lg font-medium mb-2">No completed tasks</h3>
          <p className="text-muted-foreground">
            {searchQuery
              ? "No completed tasks match your search criteria."
              : "You haven't completed any tasks yet. Complete a task to see it here."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onComplete={handleToggleStatus}
              onDelete={handleDeleteTask}
              onEdit={handleEditTask}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CompletedTasksPage;