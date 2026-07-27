CREATE TABLE leave_requests (
    id          VARCHAR(36)  NOT NULL PRIMARY KEY,
    user_id     VARCHAR(36)  NOT NULL,
    type_id     BIGINT       NOT NULL,
    start_date  DATE         NOT NULL,
    end_date    DATE         NOT NULL,
    status_id   BIGINT       NOT NULL,
    approver_id VARCHAR(36),
    reason      TEXT,
    org_id      VARCHAR(36)  NOT NULL,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_leave_requests_user     FOREIGN KEY (user_id)     REFERENCES users(id),
    CONSTRAINT fk_leave_requests_type     FOREIGN KEY (type_id)     REFERENCES master_data(id),
    CONSTRAINT fk_leave_requests_status   FOREIGN KEY (status_id)   REFERENCES master_data(id),
    CONSTRAINT fk_leave_requests_approver FOREIGN KEY (approver_id) REFERENCES users(id),
    CONSTRAINT fk_leave_requests_org      FOREIGN KEY (org_id)      REFERENCES organizations(id)
);

CREATE INDEX idx_leave_requests_user_id ON leave_requests(user_id);
CREATE INDEX idx_leave_requests_org_id ON leave_requests(org_id);
