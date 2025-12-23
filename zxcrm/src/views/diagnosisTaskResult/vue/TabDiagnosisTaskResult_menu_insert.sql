-- 注意：该页面对应的前台目录为views/diagnosisTaskResult文件夹下
-- 如果你想更改到其他目录，请修改sql中component字段对应的值


INSERT INTO sys_permission(id, parent_id, name, url, component, component_name, redirect, menu_type, perms, perms_type, sort_no, always_show, icon, is_route, is_leaf, keep_alive, hidden, hide_tab, description, status, del_flag, rule_flag, create_by, create_time, update_by, update_time, internal_or_external) 
VALUES ('202506051111470570', NULL, '前侧任务结果表', '/diagnosisTaskResult/tabDiagnosisTaskResultList', 'diagnosisTaskResult/TabDiagnosisTaskResultList', NULL, NULL, 0, NULL, '1', 0.00, 0, NULL, 1, 1, 0, 0, 0, NULL, '1', 0, 0, 'admin', '2025-06-05 11:11:57', NULL, NULL, 0);

-- 权限控制sql
-- 新增
INSERT INTO sys_permission(id, parent_id, name, url, component, is_route, component_name, redirect, menu_type, perms, perms_type, sort_no, always_show, icon, is_leaf, keep_alive, hidden, hide_tab, description, create_by, create_time, update_by, update_time, del_flag, rule_flag, status, internal_or_external)
VALUES ('202506051111470571', '202506051111470570', '添加前侧任务结果表', NULL, NULL, 0, NULL, NULL, 2, 'org.jeecg.modules.demo:tab_diagnosis_task_result:add', '1', NULL, 0, NULL, 1, 0, 0, 0, NULL, 'admin', '2025-06-05 11:11:57', NULL, NULL, 0, 0, '1', 0);
-- 编辑
INSERT INTO sys_permission(id, parent_id, name, url, component, is_route, component_name, redirect, menu_type, perms, perms_type, sort_no, always_show, icon, is_leaf, keep_alive, hidden, hide_tab, description, create_by, create_time, update_by, update_time, del_flag, rule_flag, status, internal_or_external)
VALUES ('202506051111470572', '202506051111470570', '编辑前侧任务结果表', NULL, NULL, 0, NULL, NULL, 2, 'org.jeecg.modules.demo:tab_diagnosis_task_result:edit', '1', NULL, 0, NULL, 1, 0, 0, 0, NULL, 'admin', '2025-06-05 11:11:57', NULL, NULL, 0, 0, '1', 0);
-- 删除
INSERT INTO sys_permission(id, parent_id, name, url, component, is_route, component_name, redirect, menu_type, perms, perms_type, sort_no, always_show, icon, is_leaf, keep_alive, hidden, hide_tab, description, create_by, create_time, update_by, update_time, del_flag, rule_flag, status, internal_or_external)
VALUES ('202506051111470573', '202506051111470570', '删除前侧任务结果表', NULL, NULL, 0, NULL, NULL, 2, 'org.jeecg.modules.demo:tab_diagnosis_task_result:delete', '1', NULL, 0, NULL, 1, 0, 0, 0, NULL, 'admin', '2025-06-05 11:11:57', NULL, NULL, 0, 0, '1', 0);
-- 批量删除
INSERT INTO sys_permission(id, parent_id, name, url, component, is_route, component_name, redirect, menu_type, perms, perms_type, sort_no, always_show, icon, is_leaf, keep_alive, hidden, hide_tab, description, create_by, create_time, update_by, update_time, del_flag, rule_flag, status, internal_or_external)
VALUES ('202506051111470574', '202506051111470570', '批量删除前侧任务结果表', NULL, NULL, 0, NULL, NULL, 2, 'org.jeecg.modules.demo:tab_diagnosis_task_result:deleteBatch', '1', NULL, 0, NULL, 1, 0, 0, 0, NULL, 'admin', '2025-06-05 11:11:57', NULL, NULL, 0, 0, '1', 0);
-- 导出excel
INSERT INTO sys_permission(id, parent_id, name, url, component, is_route, component_name, redirect, menu_type, perms, perms_type, sort_no, always_show, icon, is_leaf, keep_alive, hidden, hide_tab, description, create_by, create_time, update_by, update_time, del_flag, rule_flag, status, internal_or_external)
VALUES ('202506051111470575', '202506051111470570', '导出excel_前侧任务结果表', NULL, NULL, 0, NULL, NULL, 2, 'org.jeecg.modules.demo:tab_diagnosis_task_result:exportXls', '1', NULL, 0, NULL, 1, 0, 0, 0, NULL, 'admin', '2025-06-05 11:11:57', NULL, NULL, 0, 0, '1', 0);
-- 导入excel
INSERT INTO sys_permission(id, parent_id, name, url, component, is_route, component_name, redirect, menu_type, perms, perms_type, sort_no, always_show, icon, is_leaf, keep_alive, hidden, hide_tab, description, create_by, create_time, update_by, update_time, del_flag, rule_flag, status, internal_or_external)
VALUES ('202506051111470576', '202506051111470570', '导入excel_前侧任务结果表', NULL, NULL, 0, NULL, NULL, 2, 'org.jeecg.modules.demo:tab_diagnosis_task_result:importExcel', '1', NULL, 0, NULL, 1, 0, 0, 0, NULL, 'admin', '2025-06-05 11:11:57', NULL, NULL, 0, 0, '1', 0);