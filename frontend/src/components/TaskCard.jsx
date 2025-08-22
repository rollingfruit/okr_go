import React, { useState } from 'react';
import { Edit2, Save, X, GripVertical } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function TaskCard({ task, onUpdate, objectives, isDragging = false }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(task.content);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging || isSortableDragging ? 0.5 : 1,
  };

  const getObjectiveTitle = () => {
    const objective = objectives?.find(obj => obj.id === task.obj_id);
    return objective?.title || '';
  };

  const handleSave = () => {
    if (editContent.trim() && editContent !== task.content) {
      onUpdate({
        ...task,
        content: editContent.trim()
      });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditContent(task.content);
    setIsEditing(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const getStatusColor = () => {
    switch (task.status) {
      case 'todo':
        return 'border-l-gray-400';
      case 'in_progress':
        return 'border-l-blue-500';
      case 'done':
        return 'border-l-green-500';
      default:
        return 'border-l-gray-400';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`card p-4 border-l-4 ${getStatusColor()} hover:shadow-md transition-all duration-200 cursor-pointer group ${
        isDragging || isSortableDragging ? 'shadow-lg scale-105 rotate-2' : ''
      }`}
      {...attributes}
    >
      {/* Drag Handle */}
      <div
        {...listeners}
        className="flex items-start space-x-2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="w-4 h-4 text-gray-400" />
        <div className="text-xs text-gray-500 font-medium">
          {getObjectiveTitle()}
        </div>
      </div>

      {/* Task Content */}
      <div className="space-y-3">
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={handleKeyPress}
              className="textarea w-full text-sm resize-none"
              rows="3"
              autoFocus
              onFocus={(e) => e.target.select()}
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleCancel}
                className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
              <button
                onClick={handleSave}
                className="p-1 hover:bg-green-100 rounded text-green-600 hover:text-green-700"
                disabled={!editContent.trim() || editContent === task.content}
              >
                <Save className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="group/content">
            <p className="text-sm text-gray-800 leading-relaxed">
              {task.content}
            </p>
            <button
              onClick={() => setIsEditing(true)}
              className="opacity-0 group-hover/content:opacity-100 mt-2 p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600 transition-all"
            >
              <Edit2 className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Status Indicator */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${
            task.status === 'todo' ? 'bg-gray-400' :
            task.status === 'in_progress' ? 'bg-blue-500' :
            'bg-green-500'
          }`} />
          <span className="text-xs text-gray-500 capitalize">
            {task.status === 'todo' ? '待办' :
             task.status === 'in_progress' ? '进行中' :
             '已完成'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default TaskCard;