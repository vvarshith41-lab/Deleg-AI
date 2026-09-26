from .schemas import TaskAnalysis


def analyze_task(task_description: str) -> TaskAnalysis:
    return demo_analysis(task_description)


def demo_analysis(task_description: str) -> TaskAnalysis:
    task = task_description.lower()

    if any(word in task for word in [
        "instagram",
        "advertisement",
        "marketing",
        "promotion",
        "poster"
    ]):
        return TaskAnalysis(
            category="Marketing",
            required_skills=[
                "Marketing",
                "Graphic Design",
                "Communication"
            ],
            priority="Medium",
            difficulty=3
        )

    if any(word in task for word in [
        "sales",
        "customer",
        "lead"
    ]):
        return TaskAnalysis(
            category="Sales",
            required_skills=[
                "Sales",
                "Communication"
            ],
            priority="Medium",
            difficulty=3
        )

    if any(word in task for word in [
        "code",
        "website",
        "software",
        "app",
        "program"
    ]):
        return TaskAnalysis(
            category="Programming",
            required_skills=[
                "Programming",
                "Problem Solving"
            ],
            priority="Medium",
            difficulty=4
        )

    if any(word in task for word in [
        "report",
        "data",
        "analysis",
        "excel"
    ]):
        return TaskAnalysis(
            category="Data Analysis",
            required_skills=[
                "Data Analysis",
                "Communication"
            ],
            priority="Medium",
            difficulty=3
        )

    return TaskAnalysis(
        category="General",
        required_skills=[
            "Communication",
            "Management"
        ],
        priority="Medium",
        difficulty=2
    )


if __name__ == "__main__":
    result = analyze_task(
        "Create an Instagram advertisement for our new product"
    )

    print(result.model_dump_json(indent=2))