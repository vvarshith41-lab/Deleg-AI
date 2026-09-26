"""Seed script to initialize or reset sample data for the AI Task Delegator.
Person 4: Backend & Database.
"""

from backend.app.database.database import db

SAMPLE_EMPLOYEES = [
    {
        "id": 1,
        "name": "Rahul",
        "skills": {
            "Marketing": 90,
            "Graphic Design": 85,
            "Communication": 80,
            "Copywriting": 75
        },
        "performance": 88,
        "available": True
    },
    {
        "id": 2,
        "name": "Priya",
        "skills": {
            "Python": 95,
            "Backend Development": 92,
            "Database Design": 88,
            "API Integration": 90
        },
        "performance": 94,
        "available": True
    },
    {
        "id": 3,
        "name": "Alex",
        "skills": {
            "Frontend Development": 90,
            "React": 92,
            "UI/UX Design": 86,
            "Graphic Design": 70
        },
        "performance": 85,
        "available": False
    },
    {
        "id": 4,
        "name": "Sneha",
        "skills": {
            "Customer Support": 94,
            "Communication": 92,
            "Client Management": 89,
            "Sales": 78
        },
        "performance": 91,
        "available": True
    },
    {
        "id": 5,
        "name": "David",
        "skills": {
            "Finance": 92,
            "Accounting": 88,
            "Data Analysis": 82,
            "Excel": 95
        },
        "performance": 87,
        "available": True
    }
]

SAMPLE_TASKS = [
    {
        "id": 1,
        "title": "Create Instagram Ad Campaign",
        "description": "Create an Instagram advertisement for our new product launch.",
        "category": "Marketing",
        "required_skills": ["Marketing", "Graphic Design", "Communication"],
        "priority": "High",
        "difficulty": 3,
        "deadline": "2026-10-05",
        "status": "Assigned",
        "assigned_to": 1
    },
    {
        "id": 2,
        "title": "Build REST API for Payment Gateway",
        "description": "Implement Stripe checkout webhook endpoint and store transaction logs.",
        "category": "Engineering",
        "required_skills": ["Python", "Backend Development", "API Integration"],
        "priority": "Critical",
        "difficulty": 4,
        "deadline": "2026-10-02",
        "status": "Assigned",
        "assigned_to": 2
    },
    {
        "id": 3,
        "title": "Q3 Financial Reconciliation",
        "description": "Review and reconcile third quarter balance sheet and expense reports.",
        "category": "Finance",
        "required_skills": ["Finance", "Accounting", "Excel"],
        "priority": "Medium",
        "difficulty": 3,
        "deadline": "2026-10-10",
        "status": "Pending",
        "assigned_to": None
    }
]

SAMPLE_FEEDBACK = [
    {
        "id": 1,
        "task_id": 1,
        "employee_id": 1,
        "rating": 95,
        "comments": "Great work on the ad visuals and reached audience target!",
        "skills_evaluated": ["Marketing", "Graphic Design"],
        "timestamp": "2026-09-25T12:00:00Z"
    }
]


def seed_database():
    """Seed sample data into JSON storage if empty or on reset."""
    print("Seeding database...")
    db._write("employees", SAMPLE_EMPLOYEES)
    db._write("tasks", SAMPLE_TASKS)
    db._write("feedback", SAMPLE_FEEDBACK)
    print("Database seeded successfully.")


if __name__ == "__main__":
    seed_database()
