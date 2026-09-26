"""Main FastAPI Application Entrypoint.
AI Task Delegator — Adaptive Team Task Assignment System.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from backend.app.routes.employees import router as employees_router
from backend.app.routes.tasks import router as tasks_router
from backend.app.routes.recommendations import router as recommendations_router
from backend.app.routes.feedback import router as feedback_router

load_dotenv()

app = FastAPI(
    title="AI Task Delegator API",
    description="Adaptive team task assignment system with explainable matching and incremental continual learning.",
    version="1.0.0"
)

# Enable CORS for frontend Vite/React development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for local hackathon development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Modular Routers
app.include_router(employees_router)
app.include_router(tasks_router)
app.include_router(recommendations_router)
app.include_router(feedback_router)


@app.get("/health", tags=["Health"])
def health_check():
    """System health check endpoint."""
    return {"status": "ok"}


@app.get("/", tags=["Root"])
def root():
    """Root info endpoint."""
    return {
        "project": "AI Task Delegator",
        "description": "Adaptive Team Task Assignment System",
        "docs_url": "/docs",
        "health": "/health"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
