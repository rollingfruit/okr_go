import React from 'react';
import { X, Target, Calendar, RotateCcw } from 'lucide-react';

function SidebarView({ isOpen, onClose, userInput, onBackToInput }) {
  if (!isOpen) return null;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-80 bg-white shadow-xl z-50 transform animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">目标回顾</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto h-full pb-20">
          {userInput ? (
            <>
              {/* Creation Date */}
              {userInput.created_at && (
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>创建于 {formatDate(userInput.created_at)}</span>
                </div>
              )}

              {/* Weekly Goals */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  <h3 className="font-medium text-gray-900">本周目标</h3>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {userInput.weekly_goals}
                  </p>
                </div>
              </div>

              {/* Overall Goals */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-purple-600" />
                  <h3 className="font-medium text-gray-900">总体目标</h3>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {userInput.overall_goals}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4">
                <button
                  onClick={onBackToInput}
                  className="w-full btn-secondary flex items-center justify-center space-x-2 py-3 rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>重新规划目标</span>
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">暂无目标信息</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default SidebarView;