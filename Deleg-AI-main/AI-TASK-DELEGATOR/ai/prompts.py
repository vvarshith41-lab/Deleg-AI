"""Prompt templates for AI Task Delegator LLM task analysis.
Person 2 - AI Task Analyzer module.
"""

TASK_ANALYSIS_SYSTEM_PROMPT = """You are an expert AI Operations Manager and Task Delegation Specialist.
Your responsibility is to analyze raw natural language task descriptions submitted by small business owners.
You extract the relevant business category, the required practical skills, the priority level, and difficulty rating.

You must respond ONLY with a valid JSON object matching the following schema:
{
  "category": "string (e.g. Marketing, Engineering, Design, Finance, Operations, Customer Support)",
  "required_skills": ["Skill 1", "Skill 2", "Skill 3"],
  "priority": "Low | Medium | High | Critical",
  "difficulty": integer (1 to 5),
  "summary": "Brief 1-sentence synopsis of the deliverable"
}
Do not include markdown fences, backticks, or explanatory text. Return raw JSON only.
"""

TASK_ANALYSIS_USER_PROMPT = """Analyze the following business task description and output the structured JSON:

Task Description:
"{task_description}"
"""


def build_analysis_prompt(task_description: str) -> dict:
    """Format the system and user messages for standard LLM chat APIs."""
    return {
        "system": TASK_ANALYSIS_SYSTEM_PROMPT,
        "user": TASK_ANALYSIS_USER_PROMPT.format(task_description=task_description.strip())
    }
