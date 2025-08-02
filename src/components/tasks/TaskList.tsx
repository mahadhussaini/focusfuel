import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, Button, Badge, Input } from '@/components/ui';
import { useFocusFuelStore } from '@/store';

export interface TaskListProps {
  showCompleted?: boolean;
  filterByProject?: string;
  sortBy?: 'priority' | 'dueDate' | 'createdAt' | 'title';
  sortOrder?: 'asc' | 'desc';
  className?: string;
}

const TaskList: React.FC<TaskListProps> = ({
  showCompleted = true,
  filterByProject,
  sortBy = 'priority',
  sortOrder = 'desc',
  className
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const store = useFocusFuelStore();

  const filteredAndSortedTasks = useMemo(() => {
    let tasks = store.tasks.filter(task => {
      // Filter by completion status
      if (!showCompleted && task.completed) return false;
      
      // Filter by project
      if (filterByProject && task.projectId !== filterByProject) return false;
      
      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          task.title.toLowerCase().includes(query) ||
          task.description?.toLowerCase().includes(query) ||
          task.tags.some(tag => tag.toLowerCase().includes(query))
        );
      }
      
      return true;
    });

    // Sort tasks
    tasks.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1, urgent: 4 };
          aValue = priorityOrder[a.priority] || 0;
          bValue = priorityOrder[b.priority] || 0;
          break;
        case 'dueDate':
          aValue = a.dueDate ? new Date(a.dueDate).getTime() : 0;
          bValue = b.dueDate ? new Date(b.dueDate).getTime() : 0;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return tasks;
  }, [store.tasks, showCompleted, filterByProject, searchQuery, sortBy, sortOrder]);

  const handleTaskToggle = (taskId: string) => {
    const task = store.tasks.find(t => t.id === taskId);
    if (task) {
      store.updateTask(taskId, { completed: !task.completed });
    }
  };

  const handleTaskSelect = (taskId: string) => {
    const newSelected = new Set(selectedTasks);
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId);
    } else {
      newSelected.add(taskId);
    }
    setSelectedTasks(newSelected);
  };

  const handleBulkAction = (action: 'complete' | 'delete' | 'archive') => {
    selectedTasks.forEach(taskId => {
      switch (action) {
        case 'complete':
          store.updateTask(taskId, { completed: true });
          break;
        case 'delete':
          store.deleteTask(taskId);
          break;
        case 'archive':
          store.updateTask(taskId, { archived: true });
          break;
      }
    });
    setSelectedTasks(new Set());
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

  const getStatusColor = (task: any) => {
    if (task.completed) return 'bg-green-100 text-green-800';
    if (task.dueDate && new Date(task.dueDate) < new Date()) return 'bg-red-100 text-red-800';
    if (task.dueDate && new Date(task.dueDate) < new Date(Date.now() + 24 * 60 * 60 * 1000)) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  const formatDueDate = (dueDate: string) => {
    const date = new Date(dueDate);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    if (diffDays <= 7) return `Due in ${diffDays} days`;
    return date.toLocaleDateString();
  };

  const getProjectName = (projectId: string) => {
    const project = store.projects.find(p => p.id === projectId);
    return project?.name || 'No Project';
  };

  const renderTaskItem = (task: any) => (
    <div
      key={task.id}
      className={`
        p-4 border rounded-lg transition-all duration-200 cursor-pointer
        ${task.completed ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200 hover:border-gray-300'}
        ${selectedTasks.has(task.id) ? 'ring-2 ring-primary-500' : ''}
      `}
      onClick={() => handleTaskSelect(task.id)}
    >
      <div className="flex items-start space-x-3">
        {/* Checkbox */}
        <input
          type="checkbox"
          checked={task.completed}
          onChange={(e) => {
            e.stopPropagation();
            handleTaskToggle(task.id);
          }}
          className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
        />

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className={`text-sm font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                {task.title}
              </h3>
              {task.description && (
                <p className={`text-sm mt-1 ${task.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                  {task.description}
                </p>
              )}
            </div>
            
            {/* Priority Badge */}
            <Badge variant="outline" className={getPriorityColor(task.priority)}>
              {task.priority}
            </Badge>
          </div>

          {/* Task Meta */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center space-x-2">
              {/* Project */}
              <Badge variant="outline" className="text-xs">
                {getProjectName(task.projectId)}
              </Badge>

              {/* Tags */}
              {task.tags.map((tag: string) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}

              {/* Due Date */}
              {task.dueDate && (
                <Badge variant="outline" className={getStatusColor(task)}>
                  {formatDueDate(task.dueDate)}
                </Badge>
              )}
            </div>

            {/* Task Actions */}
            <div className="flex items-center space-x-1">
              {task.estimatedTime && (
                <span className="text-xs text-gray-500">
                  {task.estimatedTime}min
                </span>
              )}
              {task.completedAt && (
                <span className="text-xs text-gray-500">
                  Completed {new Date(task.completedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredAndSortedTasks.map(renderTaskItem)}
    </div>
  );

  const renderListView = () => (
    <div className="space-y-2">
      {filteredAndSortedTasks.map(renderTaskItem)}
    </div>
  );

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Tasks</h3>
            <p className="text-sm text-gray-500">
              {filteredAndSortedTasks.length} task{filteredAndSortedTasks.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* View Mode Toggle */}
            <div className="flex border border-gray-300 rounded-lg">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 text-sm font-medium rounded-l-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                List
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1 text-sm font-medium rounded-r-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                Grid
              </button>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search and Filters */}
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          
          {selectedTasks.size > 0 && (
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkAction('complete')}
              >
                Complete ({selectedTasks.size})
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkAction('delete')}
              >
                Delete
              </Button>
            </div>
          )}
        </div>

        {/* Task List */}
        {filteredAndSortedTasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p>No tasks found</p>
            <p className="text-sm">Create a new task to get started</p>
          </div>
        ) : (
          viewMode === 'grid' ? renderGridView() : renderListView()
        )}
      </CardContent>
    </Card>
  );
};

export default TaskList; 