<template>
  <div class="page-container">
    <mcs-title title="图标管理" :border="true">
      <template #right>
        <el-button type="mcs" @click="detailVisible = true">新增图标管理</el-button>
      </template>
    </mcs-title>
    <mcs-search v-model="form.id" :showAdvancedSearch="true" :showTableHeight="true" placeholder="请输入id"  @tableHeightCommand="(command)=>{tableSize=command}" @change="findPage" @reset="reset">
      <template #functionButton>
        <el-button plain >批量删除</el-button>
      </template>
      <template #advanceSearch>
          <el-form-item label="图标名称" prop="name">
            <el-input v-model="form.name" placeholder="请输入图标名称" clearable/>
          </el-form-item>
      </template>
    </mcs-search>
    <div class="table-box">
    <el-table v-loading="loading" :data="tableData" :size="tableSize">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="id" align="center" prop="id" />
      <el-table-column show-overflow-tooltip label="图标名称" align="center" prop="name" />
      <el-table-column show-overflow-tooltip label="svg信息" align="center" prop="svg" />
      <el-table-column show-overflow-tooltip label="symbol信息" align="center" prop="symbol" />
      <el-table-column label="操作" align="center" show-overflow-tooltip fixed="right">
        <template slot-scope="scope">
          <el-button link type="primary" size="small" @click="editor(scope.row)">编辑</el-button>
          <el-button link type="danger" size="small" @click="deleteById(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    </div>
    <div class="pagination-box" v-if="total > 10">
      <el-pagination popper-class="pages-popper" v-model:current-page="form.page" v-model:page-size="form.pageSize"
                     :total="total" layout="total, prev, pager, next, jumper, sizes" :page-sizes="[10, 20, 30, 40, 50, 100]"
                     @current-change="handleCurrentChange" @size-change="handleSizeChange" />
    </div>
  </div>
    <!-- 添加或修改图标管理对话框 -->
    <el-dialog :title="formDetail.id?'修改图标管理':'新增图标管理'" v-model="detailVisible" width="500" top="20vh" :destroy-on-close="true" :close-on-click-modal="false" :before-close="handleClose">
      <el-form ref="formDetailRef" :model="formDetail" :rules="rules" label-width="auto">
           <el-form-item label="图标名称" prop="name">
             <el-input v-model="formDetail.name" placeholder="请输入图标名称" />
           </el-form-item>
           <el-form-item label="创建时间" prop="createTime">
             <el-date-picker clearable v-model="formDetail.createTime" type="date" value-format="yyyy-MM-dd" placeholder="请选择创建时间"></el-date-picker>
           </el-form-item>
           <el-form-item label="svg信息" prop="svg">
             <el-input v-model="formDetail.svg" type="textarea" placeholder="请输入内容" />
           </el-form-item>
           <el-form-item label="symbol信息" prop="symbol">
             <el-input v-model="formDetail.symbol" type="textarea" placeholder="请输入内容" />
           </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button  @click="handleClose()">取消</el-button>
          <el-button type="mcs" @click="submit">确认</el-button>
        </div>
      </template>
    </el-dialog>
</template>

<script setup>
import { reactive } from 'vue';
import Pager from '@/hooks/pager.js';
import * as HTTP from './api/sysIcons.js';

const {
  tableSize,
  form,
  findPage,
  reset,
  tableData,
  total,
  handleCurrentChange,
  handleSizeChange,
  detailVisible,
  formDetail,
  formDetailRef,
  submit,
  editor,
  handleClose,
  deleteById
} = Pager(HTTP);

const rules = reactive({
            name: [
                { required: true, message: "图标名称不能为空", trigger: "blur" }
            ],
            createTime: [
                { required: true, message: "创建时间不能为空", trigger: "blur" }
            ],
            svg: [
                { required: true, message: "svg信息不能为空", trigger: "blur" }
            ],
            symbol: [
                { required: true, message: "symbol信息不能为空", trigger: "blur" }
            ]
})

findPage();


</script>
