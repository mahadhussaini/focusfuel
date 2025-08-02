import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, Button, Badge } from '@/components/ui';
import { StatsCard } from '@/components/dashboard';
import { TaskList, TaskForm, ProjectManager } from '@/components/tasks';
import { useFocusFuelStore } from '@/store';

export interface TaskDashboardProps {
  className?: string;
}

const TaskDashboard: React.FC<TaskDashboardProps> = ({ className }) => {
  const [activeView, setActiveView] = useState<'overview' | 'tasks' | 'projects' | 'create'>('overview');
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  const store = useFocusFuelStore();

  const taskStats = useMemo(() => {
    const totalTasks = store.tasks.length;
    const completedTasks = store.tasks.filter(task => task.completed).length;
    const activeTasks = totalTasks - completedTasks;
    const overdueTasks = store.tasks.filter(task => 
      task.dueDate && new Date(task.dueDate) < new Date() && !task.completed
    ).length;
    const highPriorityTasks = store.tasks.filter(task => 
      task.priority === 'high' && !task.completed
    ).length;
    
    const totalEstimatedTime = store.tasks.reduce((sum, task) => sum + (task.estimatedTime || 0), 0);
    const completedTime = store.tasks.filter(task => task.completed).reduce((sum, task) => sum + (task.estimatedTime || 0), 0);
    
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    const timeProgress = totalEstimatedTime > 0 ? (completedTime / totalEstimatedTime) * 100 : 0;

    return {
      totalTasks,
      completedTasks,
      activeTasks,
      overdueTasks,
      highPriorityTasks,
      totalEstimatedTime,
      completedTime,
      completionRate,
      timeProgress
    };
  }, [store.tasks]);

  const recentTasks = useMemo(() => {
    return store.tasks
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [store.tasks]);

  const upcomingDeadlines = useMemo(() => {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return store.tasks
      .filter(task => 
        task.dueDate && 
        !task.completed && 
        new Date(task.dueDate) >= now && 
        new Date(task.dueDate) <= nextWeek
      )
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
      .slice(0, 5);
  }, [store.tasks]);

  const handleCreateTask = (taskId: string) => {
    setActiveView('tasks');
    setEditingTask(null);
  };

  const handleEditTask = (taskId: string) => {
    setEditingTask(taskId);
    setActiveView('create');
  };

  const handleCancelTaskForm = () => {
    setActiveView('tasks');
    setEditingTask(null);
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProjectName = (projectId: string) => {
    const project = store.projects.find(p => p.id === projectId);
    return project?.name || 'No Project';
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Task Dashboard</h1>
          <p className="text-gray-600">Manage your tasks and projects</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => setActiveView('projects')}
          >
            View Projects
          </Button>
          <Button
            onClick={() => setActiveView('create')}
          >
            Create Task
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Tasks"
          value={taskStats.totalTasks.toString()}
          subtitle="All tasks"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
          variant="default"
        />
        
        <StatsCard
          title="Active Tasks"
          value={taskStats.activeTasks.toString()}
          subtitle="In progress"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          variant="default"
        />
        
        <StatsCard
          title="Completed"
          value={`${taskStats.completionRate.toFixed(0)}%`}
          subtitle="Completion rate"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          variant="success"
        />
        
        <StatsCard
          title="Overdue"
          value={taskStats.overdueTasks.toString()}
          subtitle="Past due"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          variant={taskStats.overdueTasks > 0 ? 'destructive' : 'default'}
        />
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Task Progress" />
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Task Completion</span>
                  <span className="text-gray-900 font-medium">
                    {taskStats.completedTasks}/{taskStats.totalTasks}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${taskStats.completionRate}%` }}
                  />
                </div>
              </div>
              
              {taskStats.totalEstimatedTime > 0 && (
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Time Progress</span>
                    <span className="text-gray-900 font-medium">
                      {formatTime(taskStats.completedTime)}/{formatTime(taskStats.totalEstimatedTime)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-success-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${taskStats.timeProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Quick Actions" />
          <CardContent>
            <div className="space-y-3">
              <Button
                variant="outline"
                fullWidth
                onClick={() => setActiveView('create')}
              >
                Create New Task
              </Button>
              <Button
                variant="outline"
                fullWidth
                onClick={() => setActiveView('projects')}
              >
                Manage Projects
              </Button>
              <Button
                variant="outline"
                fullWidth
                onClick={() => setActiveView('tasks')}
              >
                View All Tasks
              </Button>
              <Button
                variant="outline"
                fullWidth
                onClick={() => {
                  // Export tasks functionality
                  console.log('Export tasks');
                }}
              >
                Export Tasks
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tasks and Upcoming Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Recent Tasks" />
          <CardContent>
            <div className="space-y-3">
              {recentTasks.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No tasks yet</p>
              ) : (
                recentTasks.map(task => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleEditTask(task.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={(e) => {
                          e.stopPropagation();
                          store.updateTask(task.id, { completed: !task.completed });
                        }}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <div>
                        <h4 className={`text-sm font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                          {task.title}
                        </h4>
                        <p className="text-xs text-gray-500">{getProjectName(task.projectId || '')}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Upcoming Deadlines" />
          <CardContent>
            <div className="space-y-3">
              {upcomingDeadlines.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No upcoming deadlines</p>
              ) : (
                upcomingDeadlines.map(task => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleEditTask(task.id)}
                  >
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{task.title}</h4>
                      <p className="text-xs text-gray-500">
                        Due {new Date(task.dueDate!).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="outline" className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderTasksView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-600">Manage and organize your tasks</p>
        </div>
        <Button onClick={() => setActiveView('create')}>
          Create Task
        </Button>
      </div>
      
      <TaskList
        filterByProject={selectedProject || undefined}
        showCompleted={true}
        sortBy="priority"
        sortOrder="desc"
      />
    </div>
  );

  const renderProjectsView = () => (
    <ProjectManager />
  );

  const renderCreateView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {editingTask ? 'Edit Task' : 'Create Task'}
          </h1>
          <p className="text-gray-600">
            {editingTask ? 'Update task details' : 'Add a new task to your list'}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleCancelTaskForm}
        >
          Cancel
        </Button>
      </div>
      
      <TaskForm
        taskId={editingTask || undefined}
        onSave={handleCreateTask}
        onCancel={handleCancelTaskForm}
      />
    </div>
  );

  const renderContent = () => {
    switch (activeView) {
      case 'overview':
        return renderOverview();
      case 'tasks':
        return renderTasksView();
      case 'projects':
        return renderProjectsView();
      case 'create':
        return renderCreateView();
      default:
        return renderOverview();
    }
  };

  return (
    <div className={className}>
      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', count: null },
            { id: 'tasks', label: 'Tasks', count: taskStats.totalTasks },
            { id: 'projects', label: 'Projects', count: store.projects.length },
            { id: 'create', label: 'Create', count: null }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id as any)}
              className={`
                py-2 px-1 border-b-2 font-medium text-sm
                ${activeView === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.label}
              {tab.count !== null && (
                <Badge variant="outline" className="ml-2">
                  {tab.count}
                </Badge>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      {renderContent()}
    </div>
  );
};

export default TaskDashboard; 