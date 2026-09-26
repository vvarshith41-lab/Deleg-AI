"""Employee Routes for AI Task Delegator.
Person 4: Backend.
"""

from fastapi import APIRouter, HTTPException, status
from typing import List
from backend.app.database.database import db
from backend.app.models.employee import Employee, EmployeeCreate

router = APIRouter(prefix="", tags=["Employees"])


@router.get("/employees", response_model=List[Employee])
def get_employees():
    """Retrieve all employees registered in the system."""
    employees = db.get_all("employees")
    return employees


@router.post("/employees", response_model=Employee, status_code=status.HTTP_201_CREATED)
def create_employee(employee_in: EmployeeCreate):
    """Add a new employee to the team."""
    employee_dict = employee_in.model_dump()
    created = db.insert("employees", employee_dict)
    return created


@router.get("/employees/{employee_id}", response_model=Employee)
def get_employee_by_id(employee_id: int):
    """Retrieve details of a single employee by their ID."""
    employee = db.get_by_id("employees", employee_id)
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee with ID {employee_id} not found"
        )
    return employee
