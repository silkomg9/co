# Firebase Data Model

## users

users/{uid}

Fields:
- email
- displayName
- createdAt

## projects

projects/{projectId}

Fields:
- ownerId
- title
- status
- createdAt

## analyses

projects/{id}/analyses/{analysisId}

Stores:
- summary
- evaluationCriteria
- insights
- evidence

## plans

projects/{id}/plans/{planId}

Stores:
- businessName
- purpose
- schedule
- budget
