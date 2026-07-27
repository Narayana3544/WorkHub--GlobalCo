CREATE TABLE users (
    id            VARCHAR(36)  NOT NULL PRIMARY KEY,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name     VARCHAR(255) NOT NULL,
    role          VARCHAR(20)  NOT NULL DEFAULT 'EMPLOYEE',
    status        VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    org_id        VARCHAR(36)  NOT NULL,
    created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_users_org FOREIGN KEY (org_id) REFERENCES organizations(id),
    CONSTRAINT chk_users_role CHECK (role IN ('EMPLOYEE', 'MANAGER', 'ADMIN')),
    CONSTRAINT chk_users_status CHECK (status IN ('ACTIVE', 'INACTIVE'))
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_org_id ON users(org_id);
