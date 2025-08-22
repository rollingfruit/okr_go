package services

import (
	"okr_go/database"
	"okr_go/models"
)

type TaskService struct {
	repo      *database.Repository
	aiService *AIService
}

func NewTaskService(repo *database.Repository) *TaskService {
	return &TaskService{
		repo:      repo,
		aiService: NewAIService(),
	}
}

func (ts *TaskService) ProcessOKR(weeklyGoals, overallGoals string) (models.OKRPlan, error) {
	// Save user input
	userInput := models.UserInput{
		WeeklyGoals:  weeklyGoals,
		OverallGoals: overallGoals,
	}
	if err := ts.repo.SaveUserInput(userInput); err != nil {
		// Log error but don't fail the process
	}

	// Generate OKR plan using AI
	plan, err := ts.aiService.ProcessOKR(weeklyGoals, overallGoals)
	if err != nil {
		return models.OKRPlan{}, err
	}

	// Save the plan to database
	if err := ts.repo.SaveOKRPlan(plan); err != nil {
		return models.OKRPlan{}, err
	}

	return plan, nil
}

func (ts *TaskService) GetCurrentPlan() (models.OKRPlan, error) {
	return ts.repo.GetOKRPlan()
}

func (ts *TaskService) UpdateTask(task models.Task) error {
	return ts.repo.UpdateTask(task)
}

func (ts *TaskService) GetLatestUserInput() (models.UserInput, error) {
	return ts.repo.GetLatestUserInput()
}