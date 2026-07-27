CREATE TABLE comments (
    id           VARCHAR(36)  NOT NULL PRIMARY KEY,
    content      TEXT         NOT NULL,
    author_id    VARCHAR(36)  NOT NULL,
    work_item_id VARCHAR(36)  NOT NULL,
    created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_comments_author    FOREIGN KEY (author_id)    REFERENCES users(id),
    CONSTRAINT fk_comments_work_item FOREIGN KEY (work_item_id) REFERENCES work_items(id) ON DELETE CASCADE
);

CREATE INDEX idx_comments_work_item_id ON comments(work_item_id);
