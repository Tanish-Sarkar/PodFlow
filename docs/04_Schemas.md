# PodFlow --- Data Schemas

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

## Evidence

``` text
id UUID
claim_id UUID
chunk_id UUID
quote text?
locator JSONB
created_at timestamp
```

## ShareLink

``` text
id UUID
artifact_id UUID
token_hash string
expires_at timestamp
revoked_at timestamp?
created_at timestamp
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
