/**
 * API Service Client for AI Task Delegator.
 * Person 1: Frontend.
 *
 * Interfaces with FastAPI backend.
 * Uses VITE_API_URL environment variable with fallback to http://localhost:8000.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Fallback mock data when backend is not running
const FALLBACK_EMPLOYEES = [
  {
    id: 1,
    name: "Rahul",
    skills: { Marketing: 90, "Graphic Design": 85, Communication: 80 },
    performance: 88,
    available: true
  },
  {
    id: 2,
    name: "Priya",
    skills: { Python: 95, "Backend Development": 92, "Database Design": 88 },
    performance: 94,
    available: true
  },
  {
    id: 3,
    name: "Alex",
    skills: { "Frontend Development": 90, React: 92, "UI/UX Design": 86 },
    performance: 85,
    available: false
  },
  {
    id: 4,
    name: "Sneha",
    skills: { "Customer Support": 94, Communication: 92, "Client Management": 89 },
    performance: 91,
    available: true
  },
  {
    id: 5,
    name: "David",
    skills: { Finance: 92, Accounting: 88, Excel: 95 },
    performance: 87,
    available: true
  }
];

const FALLBACK_TASKS = [
  {
    id: 1,
    title: "Create Instagram Ad Campaign",
    description: "Create an Instagram advertisement for our new product launch.",
    category: "Marketing",
    required_skills: ["Marketing", "Graphic Design", "Communication"],
    priority: "High",
    difficulty: 3,
    deadline: "2026-10-05",
    status: "Assigned",
    assigned_to: 1
  },
  {
    id: 2,
    title: "Build REST API for Payments",
    description: "Implement Stripe checkout webhook endpoint and store logs.",
    category: "Engineering",
    required_skills: ["Python", "Backend Development", "API Integration"],
    priority: "Critical",
    difficulty: 4,
    deadline: "2026-10-02",
    status: "Assigned",
    assigned_to: 2
  },
  {
    id: 3,
    title: "Q3 Financial Reconciliation",
    description: "Review and reconcile third quarter balance sheet and reports.",
    category: "Finance",
    required_skills: ["Finance", "Accounting", "Excel"],
    priority: "Medium",
    difficulty: 3,
    deadline: "2026-10-10",
    status: "Pending",
    assigned_to: null
  }
];

/** Helper request function with fallback protection */
async function request(endpoint, options = {}, fallbackValue = null) {
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      ...options
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || `Request failed with status ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn(`[API] ${endpoint} request failed: ${err.message}. Using fallback.`);
    if (fallbackValue !== null) {
      return fallbackValue;
    }
    throw err;
  }
}

/** Check backend health */
export async function getHealth() {
  return request('/health', { method: 'GET' }, { status: 'offline' });
}

/** Fetch all employees */
export async function getEmployees() {
  return request('/employees', { method: 'GET' }, FALLBACK_EMPLOYEES);
}

/** Create a new employee */
export async function createEmployee(employeeData) {
  return request('/employees', {
    method: 'POST',
    body: JSON.stringify(employeeData)
  });
}

/** Fetch all tasks */
export async function getTasks() {
  return request('/tasks', { method: 'GET' }, FALLBACK_TASKS);
}

/** Create a new task */
export async function createTask(taskData) {
  return request('/tasks', {
    method: 'POST',
    body: JSON.stringify(taskData)
  });
}

/** Analyze raw task description to extract skills, category, priority */
export async function analyzeTask(taskDescription) {
  return request('/analyze-task', {
    method: 'POST',
    body: JSON.stringify({ task_description: taskDescription })
  }, {
    category: "Marketing",
    required_skills: ["Marketing", "Graphic Design", "Communication"],
    priority: "Medium",
    difficulty: 3,
    summary: taskDescription
  });
}

/** Get recommendation for task based on skills or description */
export async function getRecommendation(taskData) {
  return request('/recommend', {
    method: 'POST',
    body: JSON.stringify(taskData)
  }, {
    employee: "Rahul",
    employee_id: 1,
    score: 92,
    reasons: [
      "Strong Marketing skill (90%)",
      "Strong Graphic Design skill (85%)",
      "Currently available"
    ],
    alternatives: []
  });
}

/** Assign an employee to a task */
export async function assignTask(taskId, employeeId) {
  return request('/assign', {
    method: 'POST',
    body: JSON.stringify({ task_id: taskId, employee_id: employeeId })
  });
}

/** Submit post-task feedback to incrementally update employee skills */
export async function submitFeedback(feedbackData) {
  return request('/feedback', {
    method: 'POST',
    body: JSON.stringify(feedbackData)
  });
}

/** Get operational analytics */
export async function getAnalytics() {
  return request('/analytics', { method: 'GET' }, {
    total_employees: 5,
    active_employees: 4,
    pending_tasks: 1,
    assigned_tasks: 2,
    completed_tasks: 1,
    average_team_performance: 89.0,
    recent_tasks: FALLBACK_TASKS
  });
}
