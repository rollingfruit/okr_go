package main

import (
	"context"
	"okr_go/database"
	"okr_go/models"
	"okr_go/services"
	"os"
	"path/filepath"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
	ctx         context.Context
	taskService *services.TaskService
	repo        *database.Repository
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context provided
// to this method is the context that's passed to the startup hook
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx

	// Initialize database
	userHomeDir, err := os.UserHomeDir()
	if err != nil {
		panic(err)
	}

	dbPath := filepath.Join(userHomeDir, ".okr_go", "data.db")
	
	// Create directory if it doesn't exist
	if err := os.MkdirAll(filepath.Dir(dbPath), 0755); err != nil {
		panic(err)
	}

	a.repo, err = database.NewRepository(dbPath)
	if err != nil {
		panic(err)
	}

	a.taskService = services.NewTaskService(a.repo)
}

// shutdown is called when the app is shutting down
func (a *App) shutdown(ctx context.Context) {
	if a.repo != nil {
		a.repo.Close()
	}
}

// ProcessOKR processes user input and generates OKR plan using AI
func (a *App) ProcessOKR(weeklyGoals, overallGoals string) (models.OKRPlan, error) {
	return a.taskService.ProcessOKR(weeklyGoals, overallGoals)
}

// GetInitialPlan loads existing OKR plan from database
func (a *App) GetInitialPlan() (models.OKRPlan, error) {
	return a.taskService.GetCurrentPlan()
}

// UpdateTask updates a single task
func (a *App) UpdateTask(task models.Task) error {
	return a.taskService.UpdateTask(task)
}

// GetLatestUserInput retrieves the latest user input for sidebar display
func (a *App) GetLatestUserInput() (models.UserInput, error) {
	return a.taskService.GetLatestUserInput()
}

// SetWindowOnTop sets or cancels the window always-on-top feature
func (a *App) SetWindowOnTop(enabled bool) {
	if enabled {
		runtime.WindowSetAlwaysOnTop(a.ctx, true)
	} else {
		runtime.WindowSetAlwaysOnTop(a.ctx, false)
	}
}