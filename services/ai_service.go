package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"okr_go/models"
	"os"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/joho/godotenv"
)

type AIService struct {
	apiKey  string
	baseURL string
	model   string
	client  *http.Client
}

type OpenAIRequest struct {
	Model       string    `json:"model"`
	Messages    []Message `json:"messages"`
	Temperature float64   `json:"temperature"`
	MaxTokens   int       `json:"max_tokens"`
}

type Message struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type OpenAIResponse struct {
	Choices []Choice `json:"choices"`
	Error   *APIError `json:"error,omitempty"`
}

type Choice struct {
	Message Message `json:"message"`
}

type APIError struct {
	Message string `json:"message"`
	Type    string `json:"type"`
}

func NewAIService() *AIService {
	// 加载 .env 文件
	if err := godotenv.Load(); err != nil {
		log.Printf("Warning: Could not load .env file: %v", err)
	}

	apiKey := os.Getenv("OPENAI_API_KEY")
	baseURL := os.Getenv("OPENAI_BASE_URL")
	model := os.Getenv("OPENAI_MODEL")

	// 设置默认值
	if baseURL == "" {
		baseURL = "https://api.openai.com/v1"
	}
	if model == "" {
		model = "gpt-3.5-turbo"
	}

	// 显示环境变量信息（用于调试）
	fmt.Println("=== AI Service Configuration ===")
	if apiKey != "" {
		maskedKey := apiKey[:10] + "..." + apiKey[len(apiKey)-4:]
		fmt.Printf("🔑 OpenAI API Key: %s\n", maskedKey)
	} else {
		fmt.Println("❌ OpenAI API Key: NOT SET")
	}
	fmt.Printf("🌐 Base URL: %s\n", baseURL)
	fmt.Printf("🤖 Model: %s\n", model)
	fmt.Println("================================")

	// 检查API Key是否有效
	if apiKey == "" || apiKey == "your-api-key-here" || apiKey == "your-openai-api-key-here" {
		log.Printf("ERROR: Invalid OpenAI API Key. Please check your .env file.")
		return &AIService{
			apiKey:  "INVALID",
			baseURL: baseURL,
			model:   model,
			client: &http.Client{
				Timeout: 60 * time.Second,
			},
		}
	}

	return &AIService{
		apiKey:  apiKey,
		baseURL: baseURL,
		model:   model,
		client: &http.Client{
			Timeout: 60 * time.Second,
		},
	}
}

func (ai *AIService) ProcessOKR(weeklyGoals, overallGoals string) (models.OKRPlan, error) {
	prompt := ai.buildPrompt(weeklyGoals, overallGoals)
	
	response, err := ai.callOpenAIAPI(prompt)
	if err != nil {
		return models.OKRPlan{}, err
	}

	plan, err := ai.parseResponse(response)
	if err != nil {
		return models.OKRPlan{}, err
	}

	return plan, nil
}

func (ai *AIService) buildPrompt(weeklyGoals, overallGoals string) string {
	return fmt.Sprintf(`你是一个专业的 OKR (Objectives and Key Results) 规划师。请根据用户输入的目标，将其拆分为结构化的 OKR 计划。

用户输入：
本周目标：%s
总体目标：%s

请按照以下要求拆分：
1. 将目标分解为 2-4 个高阶目标 (Objectives)
2. 每个高阶目标下包含 3-6 个具体可执行的任务 (Tasks)
3. 任务要具体、可衡量、有明确的完成标准
4. 考虑任务之间的依赖关系和优先级

请严格按照以下 JSON 格式返回，不要包含任何其他文字：

{
  "objectives": [
    {
      "id": "obj_1",
      "title": "目标标题",
      "tasks": [
        {
          "id": "task_1_1",
          "content": "具体任务描述",
          "status": "todo",
          "obj_id": "obj_1"
        }
      ]
    }
  ]
}`, weeklyGoals, overallGoals)
}

func (ai *AIService) callOpenAIAPI(prompt string) (string, error) {
	reqBody := OpenAIRequest{
		Model: ai.model,
		Messages: []Message{
			{
				Role:    "user",
				Content: prompt,
			},
		},
		Temperature: 0.7,
		MaxTokens:   2000,
	}

	jsonData, err := json.Marshal(reqBody)
	if err != nil {
		return "", err
	}

	req, err := http.NewRequest("POST", ai.baseURL+"/chat/completions", bytes.NewBuffer(jsonData))
	if err != nil {
		return "", err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+ai.apiKey)

	resp, err := ai.client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	var openAIResp OpenAIResponse
	if err := json.Unmarshal(body, &openAIResp); err != nil {
		return "", err
	}

	if openAIResp.Error != nil {
		return "", fmt.Errorf("OpenAI API error: %s", openAIResp.Error.Message)
	}

	if len(openAIResp.Choices) == 0 {
		return "", fmt.Errorf("no response from OpenAI API")
	}

	return openAIResp.Choices[0].Message.Content, nil
}

func (ai *AIService) parseResponse(response string) (models.OKRPlan, error) {
	// 清理响应，移除可能的代码块标记
	response = strings.TrimSpace(response)
	response = strings.TrimPrefix(response, "```json")
	response = strings.TrimPrefix(response, "```")
	response = strings.TrimSuffix(response, "```")
	response = strings.TrimSpace(response)

	var plan models.OKRPlan
	if err := json.Unmarshal([]byte(response), &plan); err != nil {
		return models.OKRPlan{}, fmt.Errorf("failed to parse AI response: %v", err)
	}

	// 确保所有 ID 都是唯一的
	for i := range plan.Objectives {
		if plan.Objectives[i].ID == "" {
			plan.Objectives[i].ID = "obj_" + uuid.New().String()[:8]
		}
		for j := range plan.Objectives[i].Tasks {
			if plan.Objectives[i].Tasks[j].ID == "" {
				plan.Objectives[i].Tasks[j].ID = "task_" + uuid.New().String()[:8]
			}
			plan.Objectives[i].Tasks[j].ObjID = plan.Objectives[i].ID
		}
	}

	return plan, nil
}