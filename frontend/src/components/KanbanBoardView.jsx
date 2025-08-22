import React from 'react';
import { Menu, Plus, Clock, CheckCircle, PlayCircle } from 'lucide-react';
import TaskCard from './TaskCard';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

// Droppable Column Component
function DroppableColumn({ column, tasks, okrPlan, onUpdateTask }) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  const Icon = column.icon;

  return (
    <div
      ref={setNodeRef}
      className={`${column.bgColor} ${column.borderColor} border-2 border-dashed rounded-lg p-4 flex flex-col transition-colors ${
        isOver ? 'border-solid border-blue-400 bg-blue-100' : ''
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Icon className={`w-5 h-5 ${column.color}`} />
          <h2 className="font-medium text-gray-900">{column.title}</h2>
          <span className={`px-2 py-1 text-xs rounded-full ${column.color} bg-white`}>
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Tasks Container with proper scrolling */}
      <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div className="flex-1 min-h-0">
          <div className="h-full overflow-y-auto overflow-x-hidden pr-2 space-y-3">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onUpdate={onUpdateTask}
                objectives={okrPlan.objectives}
              />
            ))}
            {tasks.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <div className="text-sm">暂无任务</div>
                <div className="text-xs mt-1">拖拽任务到这里</div>
              </div>
            )}
          </div>
        </div>
      </SortableContext>
    </div>
  );
}

function KanbanBoardView({ okrPlan, onUpdateTask, onOpenSidebar, error }) {
  const [activeTask, setActiveTask] = React.useState(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 移动8px后才开始拖拽，避免误触
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const getAllTasks = () => {
    if (!okrPlan?.objectives) return [];
    return okrPlan.objectives.flatMap(obj => obj.tasks);
  };

  const getTasksByStatus = (status) => {
    return getAllTasks().filter(task => task.status === status);
  };

  const handleDragStart = (event) => {
    const { active } = event;
    const task = getAllTasks().find(t => t.id === active.id);
    setActiveTask(task);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeTask = getAllTasks().find(t => t.id === active.id);
    if (!activeTask) return;

    const overColumn = over.id;
    const validStatuses = ['todo', 'in_progress', 'done'];
    
    if (validStatuses.includes(overColumn) && activeTask.status !== overColumn) {
      onUpdateTask({
        ...activeTask,
        status: overColumn
      });
    }
  };

  const columns = [
    {
      id: 'todo',
      title: '待办',
      icon: Clock,
      color: 'text-gray-500',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200'
    },
    {
      id: 'in_progress',
      title: '进行中',
      icon: PlayCircle,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      id: 'done',
      title: '已完成',
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    }
  ];

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="h-screen flex flex-col bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onOpenSidebar}
                className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">OKR 任务看板</h1>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>{getTasksByStatus('done').length} / {getAllTasks().length} 已完成</span>
            </div>
          </div>
        </header>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        {/* Kanban Board */}
        <div className="flex-1 p-6 overflow-hidden">
          <div className="h-full grid grid-cols-3 gap-6">
            {columns.map((column) => {
              const tasks = getTasksByStatus(column.id);
              return (
                <DroppableColumn
                  key={column.id}
                  column={column}
                  tasks={tasks}
                  okrPlan={okrPlan}
                  onUpdateTask={onUpdateTask}
                />
              );
            })}
          </div>
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeTask ? (
            <TaskCard
              task={activeTask}
              onUpdate={() => {}}
              objectives={okrPlan.objectives}
              isDragging
            />
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
}

export default KanbanBoardView;