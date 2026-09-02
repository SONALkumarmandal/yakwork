BEGIN;

CREATE TABLE alembic_version (
    version_num VARCHAR(32) NOT NULL, 
    CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num)
);

CREATE TABLE cached_repos (
    id UUID NOT NULL, 
    full_name VARCHAR NOT NULL, 
    stars INTEGER NOT NULL, 
    primary_language VARCHAR, 
    topics JSONB NOT NULL, 
    has_contributing_md BOOLEAN NOT NULL, 
    last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    PRIMARY KEY (id)
);

CREATE UNIQUE INDEX ix_cached_repos_full_name ON cached_repos (full_name);

CREATE TABLE users (
    id UUID NOT NULL, 
    github_id VARCHAR, 
    username VARCHAR, 
    avatar_url VARCHAR, 
    github_access_token VARCHAR, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    PRIMARY KEY (id)
);

CREATE UNIQUE INDEX ix_users_github_id ON users (github_id);

CREATE TABLE cached_issues (
    id UUID NOT NULL, 
    repo_id UUID NOT NULL, 
    github_issue_id VARCHAR NOT NULL, 
    title VARCHAR NOT NULL, 
    body TEXT, 
    labels JSONB NOT NULL, 
    url VARCHAR NOT NULL, 
    github_created_at TIMESTAMP WITH TIME ZONE NOT NULL, 
    fetched_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    PRIMARY KEY (id), 
    FOREIGN KEY(repo_id) REFERENCES cached_repos (id)
);

CREATE UNIQUE INDEX ix_cached_issues_github_issue_id ON cached_issues (github_issue_id);

CREATE TABLE user_preferences (
    id UUID NOT NULL, 
    user_id UUID NOT NULL, 
    languages JSONB NOT NULL, 
    topics JSONB NOT NULL, 
    difficulty VARCHAR NOT NULL, 
    contribution_types JSONB NOT NULL, 
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    PRIMARY KEY (id), 
    FOREIGN KEY(user_id) REFERENCES users (id)
);

CREATE TABLE saved_issues (
    id UUID NOT NULL, 
    user_id UUID NOT NULL, 
    issue_id UUID NOT NULL, 
    status VARCHAR NOT NULL, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    PRIMARY KEY (id), 
    FOREIGN KEY(issue_id) REFERENCES cached_issues (id), 
    FOREIGN KEY(user_id) REFERENCES users (id)
);

INSERT INTO alembic_version (version_num) VALUES ('c6bce05be2ff');

COMMIT;
