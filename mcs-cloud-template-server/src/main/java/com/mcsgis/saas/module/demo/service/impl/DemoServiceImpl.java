package com.mcsgis.saas.module.demo.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.mcsgis.saas.common.data.PageResult;
import com.mcsgis.saas.common.exception.McsException;
import com.mcsgis.saas.module.demo.constant.DemoStatus;
import com.mcsgis.saas.module.demo.dao.DemoMapper;
import com.mcsgis.saas.module.demo.domain.Demo;
import com.mcsgis.saas.module.demo.dto.DemoSaveRequest;
import com.mcsgis.saas.module.demo.service.DemoService;
import com.mcsgis.saas.module.demo.vo.DemoListVo;
import com.mcsgis.saas.web.context.UserPoolContextHolder;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 示例业务实现，演示分页、详情、新增、编辑、删除的标准写法。
 */
@Service
public class DemoServiceImpl extends ServiceImpl<DemoMapper, Demo> implements DemoService {

    private static final String DEMO_CODE_PREFIX = "DEMO";
    private static final int DEMO_CODE_SEQ_WIDTH = 6;

    @Override
    public PageResult<DemoListVo> pageList(int page, int pageSize, String keyword, Integer status) {
        LambdaQueryWrapper<Demo> query = Wrappers.<Demo>lambdaQuery();
        if (StringUtils.isNotBlank(keyword)) {
            String trimmed = keyword.trim();
            query.and(wrapper -> wrapper.like(Demo::getDemoName, trimmed)
                    .or()
                    .like(Demo::getDemoCode, trimmed));
        }
        query.eq(status != null, Demo::getStatus, status);
        query.orderByAsc(Demo::getSortNo).orderByDesc(Demo::getCreateTime);
        Page<Demo> result = this.page(new Page<>(page, pageSize), query);
        List<DemoListVo> rows = result.getRecords().stream()
                .map(this::toListVo)
                .collect(Collectors.toList());
        return new PageResult<>(result.getTotal(), rows);
    }

    @Override
    public Demo detail(Long id) {
        Demo row = this.getById(id);
        if (row == null) {
            throw new McsException("示例数据不存在或已删除");
        }
        return row;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void add(DemoSaveRequest request) {
        Long userPoolId = UserPoolContextHolder.getId();
        if (userPoolId == null) {
            throw new McsException("用户池未就绪");
        }
        Demo row = new Demo();
        row.setDemoCode(nextDemoCode());
        fillFromRequest(row, request);
        row.setUserPoolId(userPoolId);
        this.save(row);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateById(Long id, DemoSaveRequest request) {
        Demo row = this.getById(id);
        if (row == null) {
            throw new McsException("示例数据不存在或已删除");
        }
        fillFromRequest(row, request);
        this.updateById(row);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void removeByIdChecked(Long id) {
        Demo row = this.getById(id);
        if (row == null) {
            throw new McsException("示例数据不存在或已删除");
        }
        if (row.getStatus() != null && row.getStatus() == DemoStatus.ENABLED) {
            throw new McsException("启用状态的数据不允许删除，请先禁用");
        }
        this.removeById(id);
    }

    /**
     * 编码规则：DEMO + 6 位流水号，流水号取当前最大值加一。
     */
    private String nextDemoCode() {
        int nextSeq = baseMapper.selectMaxDemoCodeSeq() + 1;
        return DEMO_CODE_PREFIX + String.format("%0" + DEMO_CODE_SEQ_WIDTH + "d", nextSeq);
    }

    /**
     * 新增与编辑共用的字段映射。状态与排序值未传时保留原值，仅新增（原值为空）时套用默认值，
     * 避免编辑接口未传字段就把已有状态改掉。
     */
    private void fillFromRequest(Demo row, DemoSaveRequest request) {
        row.setDemoName(StringUtils.trimToNull(request.getDemoName()));
        row.setRemarks(StringUtils.trimToNull(request.getRemarks()));
        if (DemoStatus.isSupported(request.getStatus())) {
            row.setStatus(request.getStatus());
        } else if (row.getStatus() == null) {
            row.setStatus(DemoStatus.ENABLED);
        }
        if (request.getSortNo() != null) {
            row.setSortNo(request.getSortNo());
        } else if (row.getSortNo() == null) {
            row.setSortNo(0);
        }
    }

    private DemoListVo toListVo(Demo row) {
        DemoListVo vo = new DemoListVo();
        vo.setId(row.getId());
        vo.setDemoCode(row.getDemoCode());
        vo.setDemoName(row.getDemoName());
        vo.setStatus(row.getStatus());
        vo.setSortNo(row.getSortNo());
        vo.setCreateTime(row.getCreateTime());
        return vo;
    }
}
