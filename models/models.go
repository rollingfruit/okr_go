package models

// Task 代表一个可执行的子任务
type Task struct {
	ID      string `json:"id" db:"id"`
	Content string `json:"content" db:"content"`
	Status  string `json:"status" db:"status"` // "todo", "in_progress", "done"
	ObjID   string `json:"obj_id" db:"obj_id"`
}

// Objective 代表一个高阶目标
type Objective struct {
	ID    string `json:"id" db:"id"`
	Title string `json:"title" db:"title"`
	Tasks []Task `json:"tasks"`
}

// OKRPlan 是 AI 分析后生成的完整计划
type OKRPlan struct {
	Objectives []Objective `json:"objectives"`
}

// UserInput 用户输入的原始数据
type UserInput struct {
	WeeklyGoals   string `json:"weekly_goals"`
	OverallGoals  string `json:"overall_goals"`
	CreatedAt     string `json:"created_at"`
}