package database

import (
	"database/sql"
	"okr_go/models"

	_ "github.com/mattn/go-sqlite3"
)

type Repository struct {
	db *sql.DB
}

func NewRepository(dbPath string) (*Repository, error) {
	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		return nil, err
	}

	repo := &Repository{db: db}
	if err := repo.initTables(); err != nil {
		return nil, err
	}

	return repo, nil
}

func (r *Repository) initTables() error {
	queries := []string{
		`CREATE TABLE IF NOT EXISTS objectives (
			id TEXT PRIMARY KEY,
			title TEXT NOT NULL,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP
		)`,
		`CREATE TABLE IF NOT EXISTS tasks (
			id TEXT PRIMARY KEY,
			content TEXT NOT NULL,
			status TEXT NOT NULL DEFAULT 'todo',
			obj_id TEXT NOT NULL,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY(obj_id) REFERENCES objectives(id)
		)`,
		`CREATE TABLE IF NOT EXISTS user_inputs (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			weekly_goals TEXT,
			overall_goals TEXT,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP
		)`,
	}

	for _, query := range queries {
		if _, err := r.db.Exec(query); err != nil {
			return err
		}
	}

	return nil
}

func (r *Repository) SaveOKRPlan(plan models.OKRPlan) error {
	tx, err := r.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// Clear existing data
	if _, err := tx.Exec("DELETE FROM tasks"); err != nil {
		return err
	}
	if _, err := tx.Exec("DELETE FROM objectives"); err != nil {
		return err
	}

	// Save objectives and tasks
	for _, obj := range plan.Objectives {
		if _, err := tx.Exec("INSERT INTO objectives (id, title) VALUES (?, ?)", obj.ID, obj.Title); err != nil {
			return err
		}

		for _, task := range obj.Tasks {
			if _, err := tx.Exec("INSERT INTO tasks (id, content, status, obj_id) VALUES (?, ?, ?, ?)",
				task.ID, task.Content, task.Status, obj.ID); err != nil {
				return err
			}
		}
	}

	return tx.Commit()
}

func (r *Repository) GetOKRPlan() (models.OKRPlan, error) {
	var plan models.OKRPlan

	// Get objectives
	objRows, err := r.db.Query("SELECT id, title FROM objectives ORDER BY created_at")
	if err != nil {
		return plan, err
	}
	defer objRows.Close()

	var objectives []models.Objective
	for objRows.Next() {
		var obj models.Objective
		if err := objRows.Scan(&obj.ID, &obj.Title); err != nil {
			return plan, err
		}

		// Get tasks for this objective
		taskRows, err := r.db.Query("SELECT id, content, status FROM tasks WHERE obj_id = ? ORDER BY created_at", obj.ID)
		if err != nil {
			return plan, err
		}

		var tasks []models.Task
		for taskRows.Next() {
			var task models.Task
			if err := taskRows.Scan(&task.ID, &task.Content, &task.Status); err != nil {
				taskRows.Close()
				return plan, err
			}
			task.ObjID = obj.ID
			tasks = append(tasks, task)
		}
		taskRows.Close()

		obj.Tasks = tasks
		objectives = append(objectives, obj)
	}

	plan.Objectives = objectives
	return plan, nil
}

func (r *Repository) UpdateTask(task models.Task) error {
	_, err := r.db.Exec("UPDATE tasks SET content = ?, status = ? WHERE id = ?",
		task.Content, task.Status, task.ID)
	return err
}

func (r *Repository) SaveUserInput(input models.UserInput) error {
	_, err := r.db.Exec("INSERT INTO user_inputs (weekly_goals, overall_goals) VALUES (?, ?)",
		input.WeeklyGoals, input.OverallGoals)
	return err
}

func (r *Repository) GetLatestUserInput() (models.UserInput, error) {
	var input models.UserInput
	err := r.db.QueryRow("SELECT weekly_goals, overall_goals, created_at FROM user_inputs ORDER BY created_at DESC LIMIT 1").
		Scan(&input.WeeklyGoals, &input.OverallGoals, &input.CreatedAt)
	return input, err
}

func (r *Repository) Close() error {
	return r.db.Close()
}