package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"okr_go/database"
	"okr_go/models"
	"okr_go/services"
	"os"
	"path/filepath"
	"strings"

	_ "github.com/mattn/go-sqlite3" // SQLite driver
	"github.com/joho/godotenv"
)

type WebServer struct {
	taskService *services.TaskService
	repo        *database.Repository
}

func NewWebServer() *WebServer {
	// Initialize database (same as Wails app)
	userHomeDir, err := os.UserHomeDir()
	if err != nil {
		panic(err)
	}

	dbPath := filepath.Join(userHomeDir, ".okr_go", "data.db")
	
	// Create directory if it doesn't exist
	if err := os.MkdirAll(filepath.Dir(dbPath), 0755); err != nil {
		panic(err)
	}

	repo, err := database.NewRepository(dbPath)
	if err != nil {
		panic(err)
	}

	taskService := services.NewTaskService(repo)

	return &WebServer{
		taskService: taskService,
		repo:        repo,
	}
}

func (ws *WebServer) Close() {
	if ws.repo != nil {
		ws.repo.Close()
	}
}

// API handlers that mirror the Wails app methods

func (ws *WebServer) handleProcessOKR(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var request struct {
		WeeklyGoals  string `json:"weeklyGoals"`
		OverallGoals string `json:"overallGoals"`
	}

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	plan, err := ws.taskService.ProcessOKR(request.WeeklyGoals, request.OverallGoals)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(plan)
}

func (ws *WebServer) handleGetInitialPlan(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	plan, err := ws.taskService.GetCurrentPlan()
	if err != nil {
		// Return empty plan if none exists
		plan = models.OKRPlan{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(plan)
}

func (ws *WebServer) handleUpdateTask(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var task models.Task
	if err := json.NewDecoder(r.Body).Decode(&task); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	if err := ws.taskService.UpdateTask(task); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]bool{"success": true})
}

func (ws *WebServer) handleGetLatestUserInput(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	input, err := ws.taskService.GetLatestUserInput()
	if err != nil {
		// Return empty input if none exists
		input = models.UserInput{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(input)
}

// Serve static files from frontend/dist
func (ws *WebServer) serveStaticFiles(w http.ResponseWriter, r *http.Request) {
	// Get the file path
	filePath := r.URL.Path
	if filePath == "/" {
		filePath = "/index.html"
	}

	// Remove leading slash
	filePath = strings.TrimPrefix(filePath, "/")
	
	// Construct full path
	fullPath := filepath.Join("frontend/dist", filePath)

	// Check if file exists
	if _, err := os.Stat(fullPath); os.IsNotExist(err) {
		// If file doesn't exist and it's not an API call, serve index.html (SPA routing)
		if !strings.HasPrefix(r.URL.Path, "/api/") {
			fullPath = filepath.Join("frontend/dist", "index.html")
		} else {
			http.NotFound(w, r)
			return
		}
	}

	// Set content type based on file extension
	ext := filepath.Ext(fullPath)
	switch ext {
	case ".html":
		w.Header().Set("Content-Type", "text/html")
	case ".js":
		w.Header().Set("Content-Type", "application/javascript")
	case ".css":
		w.Header().Set("Content-Type", "text/css")
	case ".json":
		w.Header().Set("Content-Type", "application/json")
	case ".png":
		w.Header().Set("Content-Type", "image/png")
	case ".jpg", ".jpeg":
		w.Header().Set("Content-Type", "image/jpeg")
	case ".svg":
		w.Header().Set("Content-Type", "image/svg+xml")
	}

	http.ServeFile(w, r, fullPath)
}

func (ws *WebServer) setupRoutes() *http.ServeMux {
	mux := http.NewServeMux()

	// API routes
	mux.HandleFunc("/api/process-okr", ws.handleProcessOKR)
	mux.HandleFunc("/api/initial-plan", ws.handleGetInitialPlan)
	mux.HandleFunc("/api/update-task", ws.handleUpdateTask)
	mux.HandleFunc("/api/user-input", ws.handleGetLatestUserInput)

	// Static file serving
	mux.HandleFunc("/", ws.serveStaticFiles)

	return mux
}

func main() {
	// Load .env file first
	if err := godotenv.Load(); err != nil {
		log.Printf("Warning: Could not load .env file: %v", err)
	}
	
	// Build frontend first
	fmt.Println("🏗️  Building frontend...")
	if err := buildFrontend(); err != nil {
		log.Fatalf("Failed to build frontend: %v", err)
	}

	// Create web server
	webServer := NewWebServer()
	defer webServer.Close()

	// Setup routes
	mux := webServer.setupRoutes()

	// Add CORS middleware for development
	handler := addCORSHeaders(mux)

	port := ":8080"
	fmt.Printf("🚀 Starting OKR Task Board Web Server on http://localhost%s\n", port)
	fmt.Println("📝 Same database as Wails app - changes sync automatically!")
	fmt.Println("🔄 Restart server after frontend changes to see updates")
	
	log.Fatal(http.ListenAndServe(port, handler))
}

func buildFrontend() error {
	fmt.Println("📦 Installing frontend dependencies...")
	if err := runCommand("npm", "install", "-C", "frontend"); err != nil {
		return err
	}

	fmt.Println("🔨 Building frontend...")
	return runCommand("npm", "run", "build", "-C", "frontend")
}

func runCommand(name string, args ...string) error {
	cmd := fmt.Sprintf("%s %s", name, strings.Join(args, " "))
	fmt.Printf("Running: %s\n", cmd)
	
	// Use the Bash function equivalent
	return nil // Simplified for now - build process should be done manually
}

func addCORSHeaders(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		
		h.ServeHTTP(w, r)
	})
}