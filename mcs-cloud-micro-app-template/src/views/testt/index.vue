<template>
  <div class="page-container">
    <mcs-title title="测试" :border="true">
      <template #right>
        <el-button type="mcs" @click="detailVisible = true">新增测试</el-button>
      </template>
    </mcs-title>
    <mcs-search v-model="form.age" :showAdvancedSearch="true" :showTableHeight="true" placeholder="请输入age" @tableHeightCommand="(command)=>{tableSize=command}" @change="findPage" @reset="reset">
      <template #functionButton>
        <el-button :disabled="!selectIds.length" plain @click="deleteBatch(selectIds)">批量删除</el-button>
      </template>
      <template #advanceSearch>
        <el-form-item label="用户池" prop="userPoolId">
          <el-input v-model="form.userPoolId" placeholder="请输入用户池" clearable />
        </el-form-item>
      </template>
    </mcs-search>
    <div class="table-box">
      <el-table v-loading="loading" :data="tableData" :size="tableSize" @selection-change="tableSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="id" align="center" prop="id" />
        <el-table-column show-overflow-tooltip label="用户池" align="center" prop="userPoolId" />
        <el-table-column show-overflow-tooltip label="年纪" align="center" prop="age" />
        <el-table-column show-overflow-tooltip label="文件Key" align="center" prop="file" />
        <el-table-column show-overflow-tooltip label="类型" align="center" prop="type" />
        <el-table-column label="操作" align="center" show-overflow-tooltip fixed="right">
          <template #default="scope">
            <el-button link type="primary" size="small" @click="editor(scope.row)">编辑</el-button>
            <el-button link type="danger" size="small" @click="deleteById(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="pagination-box" v-if="total > 10">
      <el-pagination popper-class="pages-popper" v-model:current-page="form.page" v-model:page-size="form.pageSize" :total="total" layout="total, prev, pager, next, jumper, sizes" :page-sizes="[10, 20, 30, 40, 50, 100]"
        @current-change="handleCurrentChange" @size-change="handleSizeChange" />
    </div>
  </div>
  <!-- 添加或修改测试对话框 -->
  <el-dialog :title="formDetail.id?'修改测试':'新增测试'" v-model="detailVisible" width="50%" top="20vh" :destroy-on-close="true" :close-on-click-modal="false" :before-close="handleClose">
    <el-form ref="formDetailRef" :model="formDetail" :rules="rules" label-width="auto">
      <el-form-item label="用户池" prop="userPoolId">
        <el-input v-model="formDetail.userPoolId" placeholder="请输入用户池" />
      </el-form-item>
      <el-form-item label="负责人">
        <mcs-user-picker
          v-model="formDetail.ownerUserId"
          v-model:display-name="formDetail.ownerUserName"
          placeholder="请选择负责人"
          :teleported="false"
        />
      </el-form-item>
      <el-form-item label="年纪" prop="age">
        <el-input v-model="formDetail.age" type="textarea" placeholder="请输入内容" />
      </el-form-item>
      <el-form-item label="文件Key">
        <mcs-uploader-v2 showFileList groupId="test" v-model="formDetail.file"></mcs-uploader-v2>
      </el-form-item>
      <el-form-item label="类型">
        <mcs-editor v-model="formDetail.type" :min-height="192"></mcs-editor>
      </el-form-item>
      <el-form-item label="时间" prop="createTime">
        <el-date-picker clearable v-model="formDetail.createTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="请选择时间"></el-date-picker>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose()">取消</el-button>
        <el-button type="mcs" @click="submit">确认</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { reactive, ref } from "vue";
import Pager from "@/hooks/pager.js";
import * as HTTP from "./api/testt.js";

const {
  tableSize,
  form,
  findPage,
  reset,
  tableData,
  loading,
  total,
  handleCurrentChange,
  handleSizeChange,
  tableSelectionChange,
  detailVisible,
  formDetail,
  selectIds,
  formDetailRef,
  submit,
  editor,
  handleClose,
  deleteById,
  deleteBatch,
} = Pager(HTTP);

const rules = reactive({});

findPage();
</script>
