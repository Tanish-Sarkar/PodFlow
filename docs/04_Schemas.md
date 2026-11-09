# PodFlow --- Data Schemas

> **Status:** Candidate persistence model. Supplemented for current V2 scope; final SQLAlchemy/Pydantic schemas and migrations remain implementation work.

## UserProfile

``` text
id UUID
auth_user_id UUID
display_name string?
avatar_url string?
created_at timestamp
updated_at timestamp
```

## Source

``` text
id UUID
owner_id UUID
type enum(youtube,url,pdf,document)
uri string?
storage_object_id string?
title string?
author string?
metadata JSONB
status enum(pending,processing,ready,failed)
error_code string?
created_at timestamp
updated_at timestamp
```

## Document

``` text
id UUID
source_id UUID
owner_id UUID
title string?
content_hash string
text text
metadata JSONB
created_at timestamp
```

## Chunk

``` text
id UUID
document_id UUID
owner_id UUID
ordinal integer
text text
locator JSONB
embedding vector
token_count integer?
metadata JSONB
```

## WorkflowDefinition

``` text
id UUID
owner_id UUID?
name string
version integer
definition JSONB
is_template boolean
created_at timestamp
updated_at timestamp
```

## WorkflowRun

``` text
id UUID
owner_id UUID
workflow_definition_id UUID
status enum(queued,running,waiting_review,completed,failed,cancelled)
input JSONB
state JSONB
error JSONB?
started_at timestamp?
completed_at timestamp?
created_at timestamp
```

## KnowledgeArtifact

``` text
id UUID
owner_id UUID
title string
thesis text
status enum(draft,review,final,archived)
current_version_id UUID?
created_at timestamp
updated_at timestamp
```

## ArtifactVersion

``` text
id UUID
artifact_id UUID
version integer
content JSONB
created_by enum(system,user)
created_at timestamp
```

## Claim

``` text
id UUID
artifact_version_id UUID
text text
ordinal integer
metadata JSONB
created_at timestamp
```

## Evidence

``` text
id UUID
claim_id UUID
chunk_id UUID
quote text?
locator JSONB
created_at timestamp
```

## Presentation

``` text
id UUID
artifact_version_id UUID
status enum(queued,processing,ready,failed)
content JSONB
template_version string
created_at timestamp
```

Presentation `content` is validated structured data for predefined UI
components, never stored executable page code.

## ShareLink

``` text
id UUID
presentation_id UUID
token_hash string
expires_at timestamp
revoked_at timestamp?
created_at timestamp
```

Share links reference a presentation (or an explicit future public-view
target) and must be checked for expiry and revocation on every request.

## ChatSession and ChatMessage

``` text
ChatSession: id UUID, owner_id UUID, title string?, created_at, updated_at
ChatMessage: id UUID, chat_session_id UUID, role enum(user,assistant),
             content JSONB, attachment_snapshot JSONB, model_metadata JSONB,
             created_at
```

`attachment_snapshot` records the exact artifact/source versions allowed
for the answer, including citations.

## Export

``` text
id UUID
artifact_version_id UUID
owner_id UUID
format enum(markdown,json,docx,pdf)
status enum(queued,processing,ready,failed)
storage_object_id string?
created_at timestamp
```

## RecipientList and Campaign

``` text
RecipientList: id UUID, owner_id UUID, name string, source_file_id UUID?, created_at
Recipient: id UUID, recipient_list_id UUID, email string, name string?, status enum(valid,invalid,duplicate)
Campaign: id UUID, owner_id UUID, artifact_version_id UUID, recipient_list_id UUID,
          status enum(draft,ready,sending,sent,failed), created_at
```

## IntegrationConnection

``` text
id UUID
owner_id UUID
provider enum(gmail,notion,drive,...)
provider_account_id string
scopes JSONB
encrypted_credentials_reference string?
created_at timestamp
updated_at timestamp
```

## Rules

-   Pydantic models for API/LLM validation.
-   SQLAlchemy models for persistence.
-   Do not expose ORM objects directly through the API.
-   Use UUIDs, foreign keys, constraints, indexes and UTC timestamps.
-   Every schema change is a migration.
-   Owner-scoped authorization is mandatory.
