CREATE TABLE performance_reviews (
    id          VARCHAR(36)  NOT NULL PRIMARY KEY,
    employee_id VARCHAR(36)  NOT NULL,
    reviewer_id VARCHAR(36)  NOT NULL,
    period_id   BIGINT       NOT NULL,
    rating      INT          NOT NULL,
    notes       TEXT,
    org_id      VARCHAR(36)  NOT NULL,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_perf_reviews_employee FOREIGN KEY (employee_id) REFERENCES users(id),
    CONSTRAINT fk_perf_reviews_reviewer FOREIGN KEY (reviewer_id) REFERENCES users(id),
    CONSTRAINT fk_perf_reviews_period   FOREIGN KEY (period_id)   REFERENCES master_data(id),
    CONSTRAINT fk_perf_reviews_org      FOREIGN KEY (org_id)      REFERENCES organizations(id),
    CONSTRAINT chk_perf_reviews_rating  CHECK (rating BETWEEN 1 AND 5)
);

CREATE INDEX idx_perf_reviews_employee_id ON performance_reviews(employee_id);
CREATE INDEX idx_perf_reviews_org_id ON performance_reviews(org_id);
