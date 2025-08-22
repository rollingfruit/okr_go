import React, { useState } from 'react';
import { Target, Sparkles, ArrowRight } from 'lucide-react';

function InitialInputView({ onProcessOKR, loading, error }) {
  const [weeklyGoals, setWeeklyGoals] = useState('');
  const [overallGoals, setOverallGoals] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!weeklyGoals.trim() || !overallGoals.trim()) {
      return;
    }
    onProcessOKR(weeklyGoals, overallGoals);
  };

  const isValid = weeklyGoals.trim() && overallGoals.trim();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-full">
              <Target className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            OKR 任务看板
          </h1>
          <p className="text-xl text-gray-600">
            让 AI 帮你将目标拆分为可执行的任务
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card p-6 animate-slide-in">
            <div className="space-y-6">
              {/* Weekly Goals */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  本周目标
                </label>
                <textarea
                  className="textarea w-full min-h-[120px]"
                  placeholder="描述你本周要完成的具体目标..."
                  value={weeklyGoals}
                  onChange={(e) => setWeeklyGoals(e.target.value)}
                  disabled={loading}
                />
              </div>

              {/* Overall Goals */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  总体目标
                </label>
                <textarea
                  className="textarea w-full min-h-[120px]"
                  placeholder="描述你的长期目标和愿景..."
                  value={overallGoals}
                  onChange={(e) => setOverallGoals(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={!isValid || loading}
              className="btn-primary px-8 py-3 text-base font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:transform-none disabled:hover:shadow-lg"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>AI 正在分析...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5" />
                  <span>开始 AI 拆分</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              )}
            </button>
          </div>
        </form>

        {/* Features */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="p-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-1">智能拆分</h3>
            <p className="text-sm text-gray-600">AI 自动将大目标拆分为可执行的小任务</p>
          </div>
          <div className="p-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-1">可视化管理</h3>
            <p className="text-sm text-gray-600">看板式界面，直观展示任务进度</p>
          </div>
          <div className="p-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <ArrowRight className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-1">实时更新</h3>
            <p className="text-sm text-gray-600">随时编辑任务内容和状态</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InitialInputView;