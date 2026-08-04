package com.mcsgis.saas.module.demo.constant;

/**
 * 示例状态取值。状态、类型等取值集中放在 constant 包，避免魔法值散落在 Controller 和 Service 中。
 */
public final class DemoStatus {

    /**
     * 禁用
     */
    public static final int DISABLED = 0;

    /**
     * 启用
     */
    public static final int ENABLED = 1;

    private DemoStatus() {
    }

    public static boolean isSupported(Integer status) {
        return status != null && (status == DISABLED || status == ENABLED);
    }
}
