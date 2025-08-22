// Web version API - replaces Wails bindings for browser access

const API_BASE = window.location.origin + '/api';

// Mirror the Wails API functions
export const ProcessOKR = async (weeklyGoals, overallGoals) => {
  const response = await fetch(`${API_BASE}/process-okr`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      weeklyGoals,
      overallGoals,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
};

export const GetInitialPlan = async () => {
  const response = await fetch(`${API_BASE}/initial-plan`);
  
  if (!response.ok) {
    throw new Error('Failed to get initial plan');
  }

  return response.json();
};

export const UpdateTask = async (task) => {
  const response = await fetch(`${API_BASE}/update-task`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(task),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
};

export const GetLatestUserInput = async () => {
  const response = await fetch(`${API_BASE}/user-input`);
  
  if (!response.ok) {
    throw new Error('Failed to get user input');
  }

  return response.json();
};

// Check if we're running in Wails or Web mode
export const isWailsMode = () => {
  return typeof window.go !== 'undefined';
};

// Get the appropriate API based on environment
export const getAPI = () => {
  if (isWailsMode()) {
    // Use Wails bindings
    return window.go.main.App;
  } else {
    // Use web API
    return {
      ProcessOKR,
      GetInitialPlan,
      UpdateTask,
      GetLatestUserInput,
    };
  }
};