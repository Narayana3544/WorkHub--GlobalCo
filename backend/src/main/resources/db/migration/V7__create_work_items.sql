CREATE TABLE work_items (
    id          VARCHAR(36)  NOT NULL PRIMARY KEY,
    title       VARCHAR(255) NOT NULL,
    description TEXT,
    type_id     BIGINT       NOT NULL,
    status_id   BIGINT       NOT NULL,
    priority_id BIGINT       NOT NULL,
    story_points INT,
    assignee_id VARCHAR(36),
    reporter_id VARCHAR(36)  NOT NULL,
    project_id  VARCHAR(36)  NOT NULL,
    org_id      VARCHAR(36)  NOT NULL,
    due_date    DATE,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_work_items_type     FOREIGN KEY (type_id)     REFERENCES master_data(id),
    CONSTRAINT fk_work_items_status   FOREIGN KEY (status_id)   REFERENCES master_data(id),
    CONSTRAINT fk_work_items_priority FOREIGN KEY (priority_id) REFERENCES master_data(id),
    CONSTRAINT fk_work_items_assignee FOREIGN KEY (assignee_id) REFERENCES users(id),
    CONSTRAINT fk_work_items_reporter FOREIGN KEY (reporter_id) REFERENCES users(id),
    CONSTRAINT fk_work_items_project  FOREIGN KEY (project_id)  REFERENCES projects(id),
    CONSTRAINT fk_work_items_org      FOREIGN KEY (org_id)      REFERENCES organizations(id)
);

CREATE INDEX idx_work_items_project_id ON work_items(project_id);
CREATE INDEX idx_work_items_assignee_id ON work_items(assignee_id);
CREATE INDEX idx_work_items_org_id ON work_items(org_id);
CREATE INDEX idx_work_items_status_id ON work_items(status_id);
CREATE INDEX idx_work_items_type_id ON work_items(type_id);
