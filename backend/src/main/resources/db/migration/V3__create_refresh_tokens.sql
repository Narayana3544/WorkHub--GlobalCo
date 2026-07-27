CREATE TABLE refresh_tokens (
    id           VARCHAR(36)  NOT NULL PRIMARY KEY,
    hashed_token VARCHAR(255) NOT NULL UNIQUE,
    user_id      VARCHAR(36)  NOT NULL,
    expires_at   TIMESTAMP    NOT NULL,
    created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_refresh_tokens_hashed ON refresh_tokens(hashed_token);
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
