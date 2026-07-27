CREATE TABLE documents (
    id          VARCHAR(36)  NOT NULL PRIMARY KEY,
    file_name   VARCHAR(255) NOT NULL,
    file_url    VARCHAR(500) NOT NULL,
    mime_type   VARCHAR(100) NOT NULL,
    file_size   BIGINT       NOT NULL,
    uploaded_by VARCHAR(36)  NOT NULL,
    owner_type  VARCHAR(50)  NOT NULL,
    owner_id    VARCHAR(36)  NOT NULL,
    org_id      VARCHAR(36)  NOT NULL,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_documents_uploaded_by FOREIGN KEY (uploaded_by) REFERENCES users(id),
    CONSTRAINT fk_documents_org         FOREIGN KEY (org_id)      REFERENCES organizations(id)
);

CREATE INDEX idx_documents_owner ON documents(owner_type, owner_id);
CREATE INDEX idx_documents_org_id ON documents(org_id);
