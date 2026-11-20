import uuid

from podflow.persistence.db.models.user import UserProfile
from podflow.persistence.db.models.workspace import Workspace, WorkspaceMember


def test_workspace_creation():
    workspace = Workspace(name="Test Workspace")
    assert workspace.name == "Test Workspace"
    assert workspace.id is None or isinstance(workspace.id, uuid.UUID) or callable(workspace.id)


def test_workspace_member_creation():
    user = UserProfile(auth_user_id=uuid.uuid4())
    workspace = Workspace(name="Test Workspace")

    member = WorkspaceMember(user=user, workspace=workspace, role="admin")

    assert member.role == "admin"
    assert member.user == user
    assert member.workspace == workspace
