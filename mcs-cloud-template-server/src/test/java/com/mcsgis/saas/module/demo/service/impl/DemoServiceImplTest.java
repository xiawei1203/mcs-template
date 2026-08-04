package com.mcsgis.saas.module.demo.service.impl;

import com.baomidou.mybatisplus.core.MybatisConfiguration;
import com.baomidou.mybatisplus.core.metadata.TableInfoHelper;
import com.mcsgis.saas.common.exception.McsException;
import com.mcsgis.saas.module.demo.constant.DemoStatus;
import com.mcsgis.saas.module.demo.dao.DemoMapper;
import com.mcsgis.saas.module.demo.domain.Demo;
import com.mcsgis.saas.module.demo.dto.DemoSaveRequest;
import com.mcsgis.saas.web.context.UserPoolContextHolder;
import org.apache.ibatis.builder.MapperBuilderAssistant;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * 示例单元测试，演示 Service 层测试写法：Mockito 打桩 Mapper，覆盖正常路径与异常路径。
 */
@ExtendWith(MockitoExtension.class)
class DemoServiceImplTest {

    @Mock
    private DemoMapper demoMapper;

    @AfterEach
    void tearDown() {
        UserPoolContextHolder.clear();
    }

    @Test
    void addShouldGenerateDemoCodeFromMaxSeqAndTrimFields() {
        DemoServiceImpl service = buildService();
        UserPoolContextHolder.setUserPoolId(88L);
        when(demoMapper.selectMaxDemoCodeSeq()).thenReturn(0);
        when(demoMapper.insert(any(Demo.class))).thenReturn(1);

        DemoSaveRequest request = new DemoSaveRequest();
        request.setDemoName(" 示例A ");
        request.setRemarks(" remark ");

        service.add(request);

        ArgumentCaptor<Demo> captor = ArgumentCaptor.forClass(Demo.class);
        verify(demoMapper).insert(captor.capture());
        Demo saved = captor.getValue();
        Assertions.assertEquals("DEMO000001", saved.getDemoCode());
        Assertions.assertEquals("示例A", saved.getDemoName());
        Assertions.assertEquals("remark", saved.getRemarks());
        Assertions.assertEquals(DemoStatus.ENABLED, saved.getStatus());
        Assertions.assertEquals(0, saved.getSortNo());
        Assertions.assertEquals(88L, saved.getUserPoolId());
    }

    @Test
    void addShouldThrowWhenUserPoolMissing() {
        DemoServiceImpl service = buildService();
        DemoSaveRequest request = new DemoSaveRequest();
        request.setDemoName("示例A");

        McsException ex = Assertions.assertThrows(McsException.class, () -> service.add(request));

        Assertions.assertEquals("用户池未就绪", ex.getMessage());
    }

    @Test
    void updateShouldKeepExistingDemoCode() {
        DemoServiceImpl service = buildService();
        Demo existing = new Demo();
        existing.setId(1L);
        existing.setDemoCode("DEMO000008");
        existing.setDemoName("旧名称");
        when(demoMapper.selectById(1L)).thenReturn(existing);
        when(demoMapper.updateById(any(Demo.class))).thenReturn(1);

        DemoSaveRequest request = new DemoSaveRequest();
        request.setDemoName("新名称");
        request.setStatus(DemoStatus.DISABLED);
        request.setSortNo(5);

        service.updateById(1L, request);

        ArgumentCaptor<Demo> captor = ArgumentCaptor.forClass(Demo.class);
        verify(demoMapper).updateById(captor.capture());
        Demo updated = captor.getValue();
        Assertions.assertEquals("DEMO000008", updated.getDemoCode());
        Assertions.assertEquals("新名称", updated.getDemoName());
        Assertions.assertEquals(DemoStatus.DISABLED, updated.getStatus());
        Assertions.assertEquals(5, updated.getSortNo());
    }

    @Test
    void updateShouldKeepExistingStatusWhenRequestStatusIsNull() {
        DemoServiceImpl service = buildService();
        Demo existing = new Demo();
        existing.setId(3L);
        existing.setDemoCode("DEMO000003");
        existing.setStatus(DemoStatus.DISABLED);
        existing.setSortNo(7);
        when(demoMapper.selectById(3L)).thenReturn(existing);
        when(demoMapper.updateById(any(Demo.class))).thenReturn(1);

        DemoSaveRequest request = new DemoSaveRequest();
        request.setDemoName("只改名称");

        service.updateById(3L, request);

        ArgumentCaptor<Demo> captor = ArgumentCaptor.forClass(Demo.class);
        verify(demoMapper).updateById(captor.capture());
        Demo updated = captor.getValue();
        Assertions.assertEquals(DemoStatus.DISABLED, updated.getStatus());
        Assertions.assertEquals(7, updated.getSortNo());
    }

    @Test
    void detailShouldThrowWhenNotFound() {
        DemoServiceImpl service = buildService();
        when(demoMapper.selectById(9L)).thenReturn(null);

        McsException ex = Assertions.assertThrows(McsException.class, () -> service.detail(9L));

        Assertions.assertEquals("示例数据不存在或已删除", ex.getMessage());
    }

    @Test
    void removeShouldRejectEnabledRow() {
        DemoServiceImpl service = buildService();
        Demo existing = new Demo();
        existing.setId(2L);
        existing.setStatus(DemoStatus.ENABLED);
        when(demoMapper.selectById(2L)).thenReturn(existing);

        McsException ex = Assertions.assertThrows(McsException.class, () -> service.removeByIdChecked(2L));

        Assertions.assertEquals("启用状态的数据不允许删除，请先禁用", ex.getMessage());
        verify(demoMapper, never()).deleteById(any(Long.class));
    }

    private DemoServiceImpl buildService() {
        initTableInfo();
        DemoServiceImpl service = new DemoServiceImpl();
        ReflectionTestUtils.setField(service, "baseMapper", demoMapper);
        return service;
    }

    private static void initTableInfo() {
        if (TableInfoHelper.getTableInfo(Demo.class) == null) {
            TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new MybatisConfiguration(), ""), Demo.class);
        }
    }
}
