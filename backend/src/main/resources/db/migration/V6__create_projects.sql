CREATE TABLE projects (
    id          VARCHAR(36)  NOT NULL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    project_key VARCHAR(10)  NOT NULL,
    description TEXT,
    org_id      VARCHAR(36)  NOT NULL,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_projects_org FOREIGN KEY (org_id) REFERENCES organizations(id),
    CONSTRAINT uq_projects_key_org UNIQUE (project_key, org_id)
);

CREATE INDEX idx_projects_org_id ON projects(org_id);
