import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, Button, Badge, Progress, Modal } from '@/components/ui';
import { useFocusFuelStore } from '@/store';

export interface ProjectManagerProps {
  className?: string;
}

const ProjectManager: React.FC<ProjectManagerProps> = ({ className }) => {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);

  const store = useFocusFuelStore();

  const projectsWithStats = useMemo(() => {
    return store.projects.map(project => {
      const projectTasks = store.tasks.filter(task => task.projectId === project.id);
      const completedTasks = projectTasks.filter(task => task.completed);
      const totalTasks = projectTasks.length;
      const completionRate = totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 0;
      
      const totalEstimatedTime = projectTasks.reduce((sum, task) => sum + (task.estimatedTime || 0), 0);
      const completedTime = completedTasks.reduce((sum, task) => sum + (task.estimatedTime || 0), 0);
      const timeProgress = totalEstimatedTime > 0 ? (completedTime / totalEstimatedTime) * 100 : 0;

      const overdueTasks = projectTasks.filter(task => 
        task.dueDate && new Date(task.dueDate) < new Date() && !task.completed
      );

      const highPriorityTasks = projectTasks.filter(task => 
        task.priority === 'high' && !task.completed
      );

      return {
        ...project,
        stats: {
          totalTasks,
          completedTasks: completedTasks.length,
          completionRate,
          totalEstimatedTime,
          completedTime,
          timeProgress,
          overdueTasks: overdueTasks.length,
          highPriorityTasks: highPriorityTasks.length
        }
      };
    });
  }, [store.projects, store.tasks]);

  const handleCreateProject = (projectData: any) => {
    const newProject = {
      id: `project_${Date.now()}`,
      userId: store.user?.id || 'anonymous',
      name: projectData.name,
      description: projectData.description || '',
      color: projectData.color || '#0ea5e9',
      tasks: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      archived: false
    };
    store.addProject(newProject);
    setShowCreateModal(false);
  };

  const handleEditProject = (projectData: any) => {
    if (editingProject) {
      store.updateProject(editingProject.id, projectData);
      setShowEditModal(false);
      setEditingProject(null);
    }
  };

  const handleDeleteProject = (projectId: string) => {
    if (confirm('Are you sure you want to delete this project? This will also delete all associated tasks.')) {
      // Move tasks to "No Project" or delete them
      const projectTasks = store.tasks.filter(task => task.projectId === projectId);
      projectTasks.forEach(task => {
        store.updateTask(task.id, { projectId: '' });
      });
      store.deleteProject(projectId);
    }
  };

  const getProjectColor = (color: string) => {
    return {
      backgroundColor: color,
      color: '#ffffff'
    };
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const renderProjectCard = (project: any) => (
    <Card
      key={project.id}
      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
        selectedProject === project.id ? 'ring-2 ring-primary-500' : ''
      }`}
      onClick={() => setSelectedProject(project.id === selectedProject ? null : project.id)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: project.color }}
            />
            <div>
              <h3 className="font-semibold text-gray-900">{project.name}</h3>
              {project.description && (
                <p className="text-sm text-gray-600 mt-1">{project.description}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {project.stats.overdueTasks > 0 && (
              <Badge variant="destructive" className="text-xs">
                {project.stats.overdueTasks} overdue
              </Badge>
            )}
            {project.stats.highPriorityTasks > 0 && (
              <Badge variant="warning" className="text-xs">
                {project.stats.highPriorityTasks} high priority
              </Badge>
            )}
          </div>
        </div>

        {/* Progress Bars */}
        <div className="space-y-3">
          {/* Task Completion Progress */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Task Progress</span>
              <span className="text-gray-900 font-medium">
                {project.stats.completedTasks}/{project.stats.totalTasks}
              </span>
            </div>
            <Progress
              value={project.stats.completionRate}
              variant={project.stats.completionRate >= 80 ? 'success' : 'default'}
              className="h-2"
            />
          </div>

          {/* Time Progress */}
          {project.stats.totalEstimatedTime > 0 && (
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Time Progress</span>
                <span className="text-gray-900 font-medium">
                  {formatTime(project.stats.completedTime)}/{formatTime(project.stats.totalEstimatedTime)}
                </span>
              </div>
              <Progress
                value={project.stats.timeProgress}
                variant={project.stats.timeProgress >= 80 ? 'success' : 'default'}
                className="h-2"
              />
            </div>
          )}
        </div>

        {/* Project Actions */}
        {selectedProject === project.id && (
          <div className="flex items-center justify-end space-x-2 mt-4 pt-4 border-t border-gray-200">
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                setEditingProject(project);
                setShowEditModal(true);
              }}
            >
              Edit
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteProject(project.id);
              }}
            >
              Delete
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderCreateProjectModal = () => (
    <Modal
      isOpen={showCreateModal}
      onClose={() => setShowCreateModal(false)}
      title="Create New Project"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Project Name *
          </label>
          <input
            type="text"
            placeholder="Enter project name"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            id="projectName"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            placeholder="Enter project description"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            id="projectDescription"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Color
          </label>
          <div className="flex space-x-2">
            {['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'].map(color => (
              <button
                key={color}
                className="w-8 h-8 rounded-full border-2 border-gray-300 hover:border-gray-400"
                style={{ backgroundColor: color }}
                onClick={() => {
                  const colorInput = document.getElementById('projectColor') as HTMLInputElement;
                  if (colorInput) colorInput.value = color;
                }}
              />
            ))}
            <input
              type="color"
              id="projectColor"
              defaultValue="#0ea5e9"
              className="w-8 h-8 border border-gray-300 rounded"
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          <Button
            variant="outline"
            onClick={() => setShowCreateModal(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              const name = (document.getElementById('projectName') as HTMLInputElement)?.value;
              const description = (document.getElementById('projectDescription') as HTMLTextAreaElement)?.value;
              const color = (document.getElementById('projectColor') as HTMLInputElement)?.value;
              
              if (name) {
                handleCreateProject({ name, description, color });
              }
            }}
          >
            Create Project
          </Button>
        </div>
      </div>
    </Modal>
  );

  const renderEditProjectModal = () => (
    <Modal
      isOpen={showEditModal}
      onClose={() => {
        setShowEditModal(false);
        setEditingProject(null);
      }}
      title="Edit Project"
    >
      {editingProject && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Name *
            </label>
            <input
              type="text"
              defaultValue={editingProject.name}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              id="editProjectName"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              defaultValue={editingProject.description}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              id="editProjectDescription"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Color
            </label>
            <input
              type="color"
              defaultValue={editingProject.color}
              className="w-8 h-8 border border-gray-300 rounded"
              id="editProjectColor"
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowEditModal(false);
                setEditingProject(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                const name = (document.getElementById('editProjectName') as HTMLInputElement)?.value;
                const description = (document.getElementById('editProjectDescription') as HTMLTextAreaElement)?.value;
                const color = (document.getElementById('editProjectColor') as HTMLInputElement)?.value;
                
                if (name) {
                  handleEditProject({ name, description, color });
                }
              }}
            >
              Update Project
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
          <p className="text-gray-600">Organize your tasks into projects</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          Create Project
        </Button>
      </div>

      {/* Project Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Projects</p>
                <p className="text-2xl font-bold text-gray-900">{store.projects.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Tasks</p>
                <p className="text-2xl font-bold text-gray-900">
                  {store.tasks.filter(task => !task.completed).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed Tasks</p>
                <p className="text-2xl font-bold text-gray-900">
                  {store.tasks.filter(task => task.completed).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overdue Tasks</p>
                <p className="text-2xl font-bold text-red-600">
                  {store.tasks.filter(task => 
                    task.dueDate && new Date(task.dueDate) < new Date() && !task.completed
                  ).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Project Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projectsWithStats.map(renderProjectCard)}
      </div>

      {projectsWithStats.length === 0 && (
        <div className="text-center py-12">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
          <p className="text-gray-500 mb-4">Create your first project to organize your tasks</p>
          <Button onClick={() => setShowCreateModal(true)}>
            Create Your First Project
          </Button>
        </div>
      )}

      {renderCreateProjectModal()}
      {renderEditProjectModal()}
    </div>
  );
};

export default ProjectManager; 