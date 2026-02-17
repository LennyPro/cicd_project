from pydantic import BaseModel, ConfigDict


# validating requests
class TaskBase(BaseModel):
    title: str
    completed: bool = False


class TaskCreate(TaskBase):
    pass


# validating responses
class TaskResponse(TaskBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
