import React, { useState, useEffect } from 'react';
import InitialInputView from './components/InitialInputView';
import KanbanBoardView from './components/KanbanBoardView';
import SidebarView from './components/SidebarView';
import { getAPI, isWailsMode } from './webjs/api';

function App() {
  const [currentView, setCurrentView] = useState('input'); // 'input' | 'kanban'
  const [okrPlan, setOkrPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userInput, setUserInput] = useState(null);
  const [mode, setMode] = useState(isWailsMode() ? 'Wails' : 'Web');

  // Get API instance
  const api = getAPI();

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const plan = await api.GetInitialPlan();
      if (plan && plan.objectives && plan.objectives.length > 0) {
        setOkrPlan(plan);
        setCurrentView('kanban');
      }
      
      try {
        const input = await api.GetLatestUserInput();
        setUserInput(input);
      } catch (err) {
        // User input might not exist yet
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  };

  const handleProcessOKR = async (weeklyGoals, overallGoals) => {
    setLoading(true);
    setError('');
    
    try {
      const plan = await api.ProcessOKR(weeklyGoals, overallGoals);
      setOkrPlan(plan);
      setCurrentView('kanban');
      
      // Update user input for sidebar
      setUserInput({
        weekly_goals: weeklyGoals,
        overall_goals: overallGoals,
        created_at: new Date().toISOString()
      });
    } catch (err) {
      setError(err.message || '处理 OKR 时发生错误');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTask = async (updatedTask) => {
    try {
      await api.UpdateTask(updatedTask);
      
      // Update local state
      setOkrPlan(prevPlan => ({
        ...prevPlan,
        objectives: prevPlan.objectives.map(obj => ({
          ...obj,
          tasks: obj.tasks.map(task => 
            task.id === updatedTask.id ? updatedTask : task
          )
        }))
      }));
    } catch (err) {
      setError('更新任务失败: ' + err.message);
    }
  };

  const handleBackToInput = () => {
    setCurrentView('input');
    setOkrPlan(null);
    setUserInput(null);
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Mode indicator */}
      <div className="fixed top-2 right-2 z-50 bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-mono">
        {mode} Mode
      </div>
      
      {/* Sidebar */}
      <SidebarView 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userInput={userInput}
        onBackToInput={handleBackToInput}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {currentView === 'input' && (
          <InitialInputView
            onProcessOKR={handleProcessOKR}
            loading={loading}
            error={error}
          />
        )}
        
        {currentView === 'kanban' && okrPlan && (
          <KanbanBoardView
            okrPlan={okrPlan}
            onUpdateTask={handleUpdateTask}
            onOpenSidebar={() => setSidebarOpen(true)}
            error={error}
          />
        )}
      </div>
    </div>
  );
}

export default App;