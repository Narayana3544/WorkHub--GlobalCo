-- Work Item Types
INSERT INTO master_data (category, code, label, display_order) VALUES ('WORK_ITEM_TYPE', 'TASK', 'Task', 1);
INSERT INTO master_data (category, code, label, display_order) VALUES ('WORK_ITEM_TYPE', 'BUG', 'Bug', 2);
INSERT INTO master_data (category, code, label, display_order) VALUES ('WORK_ITEM_TYPE', 'TEST_CASE', 'Test Case', 3);

-- Work Item Statuses
INSERT INTO master_data (category, code, label, display_order) VALUES ('WORK_ITEM_STATUS', 'OPEN', 'Open', 1);
INSERT INTO master_data (category, code, label, display_order) VALUES ('WORK_ITEM_STATUS', 'IN_PROGRESS', 'In Progress', 2);
INSERT INTO master_data (category, code, label, display_order) VALUES ('WORK_ITEM_STATUS', 'IN_REVIEW', 'In Review', 3);
INSERT INTO master_data (category, code, label, display_order) VALUES ('WORK_ITEM_STATUS', 'DONE', 'Done', 4);
INSERT INTO master_data (category, code, label, display_order) VALUES ('WORK_ITEM_STATUS', 'CLOSED', 'Closed', 5);

-- Work Item Priorities
INSERT INTO master_data (category, code, label, display_order) VALUES ('WORK_ITEM_PRIORITY', 'LOW', 'Low', 1);
INSERT INTO master_data (category, code, label, display_order) VALUES ('WORK_ITEM_PRIORITY', 'MEDIUM', 'Medium', 2);
INSERT INTO master_data (category, code, label, display_order) VALUES ('WORK_ITEM_PRIORITY', 'HIGH', 'High', 3);
INSERT INTO master_data (category, code, label, display_order) VALUES ('WORK_ITEM_PRIORITY', 'CRITICAL', 'Critical', 4);

-- Leave Types
INSERT INTO master_data (category, code, label, display_order) VALUES ('LEAVE_TYPE', 'CASUAL', 'Casual Leave', 1);
INSERT INTO master_data (category, code, label, display_order) VALUES ('LEAVE_TYPE', 'SICK', 'Sick Leave', 2);
INSERT INTO master_data (category, code, label, display_order) VALUES ('LEAVE_TYPE', 'EARNED', 'Earned Leave', 3);
INSERT INTO master_data (category, code, label, display_order) VALUES ('LEAVE_TYPE', 'UNPAID', 'Unpaid Leave', 4);

-- Leave Statuses
INSERT INTO master_data (category, code, label, display_order) VALUES ('LEAVE_STATUS', 'PENDING', 'Pending', 1);
INSERT INTO master_data (category, code, label, display_order) VALUES ('LEAVE_STATUS', 'APPROVED', 'Approved', 2);
INSERT INTO master_data (category, code, label, display_order) VALUES ('LEAVE_STATUS', 'REJECTED', 'Rejected', 3);
INSERT INTO master_data (category, code, label, display_order) VALUES ('LEAVE_STATUS', 'CANCELLED', 'Cancelled', 4);

-- Review Periods
INSERT INTO master_data (category, code, label, display_order) VALUES ('REVIEW_PERIOD', 'Q1', 'Quarter 1', 1);
INSERT INTO master_data (category, code, label, display_order) VALUES ('REVIEW_PERIOD', 'Q2', 'Quarter 2', 2);
INSERT INTO master_data (category, code, label, display_order) VALUES ('REVIEW_PERIOD', 'Q3', 'Quarter 3', 3);
INSERT INTO master_data (category, code, label, display_order) VALUES ('REVIEW_PERIOD', 'Q4', 'Quarter 4', 4);
INSERT INTO master_data (category, code, label, display_order) VALUES ('REVIEW_PERIOD', 'ANNUAL', 'Annual', 5);

-- Document Owner Types
INSERT INTO master_data (category, code, label, display_order) VALUES ('DOCUMENT_OWNER_TYPE', 'WORK_ITEM', 'Work Item', 1);
INSERT INTO master_data (category, code, label, display_order) VALUES ('DOCUMENT_OWNER_TYPE', 'PROJECT', 'Project', 2);
INSERT INTO master_data (category, code, label, display_order) VALUES ('DOCUMENT_OWNER_TYPE', 'LEAVE_REQUEST', 'Leave Request', 3);
INSERT INTO master_data (category, code, label, display_order) VALUES ('DOCUMENT_OWNER_TYPE', 'PERFORMANCE_REVIEW', 'Performance Review', 4);
INSERT INTO master_data (category, code, label, display_order) VALUES ('DOCUMENT_OWNER_TYPE', 'USER', 'User', 5);
