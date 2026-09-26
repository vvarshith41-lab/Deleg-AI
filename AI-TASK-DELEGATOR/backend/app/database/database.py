"""Database Access Layer for AI Task Delegator.
Person 4: Backend & Continual Learning.

Currently implements a JSON-file-backed persistence layer.
Structured with a repository pattern so it can be swapped to SQLite or PostgreSQL later
without modifying route handlers.
"""

import json
import os
from pathlib import Path
from typing import Any, Dict, List, Optional


class JSONDatabase:
    """Simple JSON file database driver with repository interface."""

    def __init__(self, data_dir: Optional[Path] = None):
        if data_dir is None:
            # Locate data folder relative to project root
            base_dir = Path(__file__).resolve().parent.parent.parent.parent
            self.data_dir = base_dir / "data"
        else:
            self.data_dir = data_dir

        self.data_dir.mkdir(parents=True, exist_ok=True)

    def _get_file_path(self, collection: str) -> Path:
        return self.data_dir / f"{collection}.json"

    def get_all(self, collection: str) -> List[Dict[str, Any]]:
        """Retrieve all records from a collection."""
        file_path = self._get_file_path(collection)
        if not file_path.exists():
            return []
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            return []

    def get_by_id(self, collection: str, item_id: int) -> Optional[Dict[str, Any]]:
        """Find a single record by its id field."""
        items = self.get_all(collection)
        for item in items:
            if item.get("id") == item_id:
                return item
        return None

    def insert(self, collection: str, item: Dict[str, Any]) -> Dict[str, Any]:
        """Insert a new record. Generates an auto-increment id if missing."""
        items = self.get_all(collection)
        if "id" not in item or item["id"] is None:
            max_id = max([it.get("id", 0) for it in items], default=0)
            item["id"] = max_id + 1
        items.append(item)
        self._write(collection, items)
        return item

    def update(self, collection: str, item_id: int, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update an existing record by id."""
        items = self.get_all(collection)
        updated_item = None
        for i, item in enumerate(items):
            if item.get("id") == item_id:
                items[i].update(updates)
                updated_item = items[i]
                break
        if updated_item is not None:
            self._write(collection, items)
        return updated_item

    def delete(self, collection: str, item_id: int) -> bool:
        """Delete a record by id."""
        items = self.get_all(collection)
        initial_len = len(items)
        items = [it for it in items if it.get("id") != item_id]
        if len(items) < initial_len:
            self._write(collection, items)
            return True
        return False

    def _write(self, collection: str, data: List[Dict[str, Any]]) -> None:
        file_path = self._get_file_path(collection)
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)


# Global database instance
db = JSONDatabase()
