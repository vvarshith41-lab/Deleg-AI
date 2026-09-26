from backend.app.routes.employees import router as employees_router
from backend.app.routes.tasks import router as tasks_router
from backend.app.routes.recommendations import router as recommendations_router
from backend.app.routes.feedback import router as feedback_router

__all__ = ["employees_router", "tasks_router", "recommendations_router", "feedback_router"]
