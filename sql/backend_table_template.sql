-- DROP TABLE IF EXISTS `platform_feedback`; 

CREATE TABLE IF NOT EXISTS `platform_feedback` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键自增 ID',
    `contact_phone` VARCHAR(24) COMMENT '对接人联系电话',
    `content` TEXT NOT NULL COMMENT '建议内容',
    `status` INT DEFAULT 0 COMMENT '状态，标记是否处理，0表示未处理，1表示已处理',
    `handle_remark` TEXT COMMENT '处理备注',
    `handle_time` DATETIME COMMENT '处理时间',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间',
    `delete_time` DATETIME COMMENT '删除时间',
    PRIMARY KEY (`id`)
) COMMENT '平台建议';