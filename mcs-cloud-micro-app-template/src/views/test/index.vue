<template>
  <div class="page-container">
    <mcs-title title="菜单" :border="true">
      <template #right>
        <el-button type="mcs" @click="detailVisible = true">新增菜谱</el-button>
      </template>
    </mcs-title>
    <mcs-search v-model="form.name" :showAdvancedSearch="true" :showTableHeight="true" placeholder="请输入菜品名称" @tableHeightCommand="(command)=>{tableSize=command}" @change="findSearch" @reset="reset">
      <template #functionButton>
        <el-button plain @click="deleteBatch()">批量删除</el-button>
      </template>
      <template #advanceSearch>
        <el-form-item label="菜品类型">
          <el-select v-model="form.type" placeholder="请选择菜品类型">
            <el-option label="早餐" :value="1" />
            <el-option label="中餐" :value="2" />
            <el-option label="晚餐" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="菜品类型2" style="width: 300px;">
          <el-input></el-input>
        </el-form-item>
      </template>

    </mcs-search>

    <div class="table-box">
      <el-table :data="tableData" :size="tableSize" ref="multipleTableRef" @selection-change="tableSelectionChange">
        <el-table-column type="selection" :selectable="selectable" width="55" />
        <el-table-column type="index" label="序号" width="80" />
        <el-table-column prop="name" label="菜名" width="240" show-overflow-tooltip align="center" />
        <el-table-column prop="type" label="类型" width="200" align="center">
          <template #default="scope">
            <el-button v-if="Array.isArray(scope.row.type)&&scope.row.type.includes(1)" type="primary" plain size="small">早餐</el-button>
            <el-button v-if="Array.isArray(scope.row.type)&&scope.row.type.includes(2)" type="warning" plain size="small">中餐</el-button>
            <el-button v-if="Array.isArray(scope.row.type)&&scope.row.type.includes(3)" type="info" plain size="small">晚餐</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" show-overflow-tooltip align="center" />
        <el-table-column label="操作" width="200" show-overflow-tooltip fixed="right" align="center">
          <template #default="scope">
            <!-- <el-button link type="primary" size="small" @click="detail(scope.row.id)">详情</el-button> -->
            <el-button link type="primary" size="small" @click="editor(scope.row)">编辑</el-button>
            <el-button link type="danger" size="small" @click="deleteById(scope.row.id, '确定删除该菜品？')">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="pagination-box" v-if="total > 10">
      <el-pagination popper-class="pages-popper" v-model:current-page="form.page" v-model:page-size="form.pageSize" :total="total" layout="total, prev, pager, next, jumper, sizes" :page-sizes="[10, 20, 30, 40, 50, 100]"
        @current-change="handleCurrentChange" @size-change="handleSizeChange" />
    </div>
  </div>

  <el-dialog :title="formDetail.id?'修改菜品':'新增菜品'" v-model="detailVisible" width="60%" top="20vh" :destroy-on-close="true" :close-on-click-modal="false" :before-close="handleClose">
    <el-form :model="formDetail" :rules="rules" ref="formDetailRef" label-width="auto">
      <el-form-item label="名称：" prop="name">
        <el-input v-model="formDetail.name" placeholder="请输入菜品名称" maxlength="20" show-word-limit />
      </el-form-item>
      <el-form-item label="类型：" prop="type">
        <el-select v-model="formDetail.type" multiple placeholder="请选择菜品类型" clearable>
          <el-option label="早餐" :value="1" />
          <el-option label="中餐" :value="2" />
          <el-option label="晚餐" :value="3" />
        </el-select>
      </el-form-item>
      <el-form-item label="上传图片：" prop="name">
        <mcs-uploader v-model:file-list="files" valueType="string" list-type="picture" :multiple="false" :limit="1" style="width: 100%;" :maxFileSize="10*1024*1024" tip="最多1张图片且小于10M"></mcs-uploader>
      </el-form-item>
      <el-form-item label="上传文件：" prop="name">
        <mcs-uploader v-model:file-list="files" valueType="array" list-type="text" :attrs="{accept:'video/*,.doc,.pdf'}" :show-file-list="true" :limit="10" style="width: 100%;" tip="支持扩展名：.rar .zip .doc .docx .pdf .jpg"></mcs-uploader>
      </el-form-item>
      <el-form-item label="备注：">
        <mcs-editor v-model="formDetail.desc" uploadGroupId="admin" maxlength="200" show-word-limit></mcs-editor>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose()">取消</el-button>
        <el-button type="mcs" @click="submit">确认</el-button>
      </div>
    </template>
  </el-dialog>

  <el-drawer title="查看" v-model="detailVisible2" size="650" :destroy-on-close="true" :close-on-click-modal="false" :before-close="handleClose">
    <el-scrollbar>
      <el-form class="formDetail" :model="formDetail" label-width="100px">
        <h2 class="secondTitle">基础信息</h2>
        <el-form-item label="名称：：">{{ formDetail.name }}</el-form-item>
        <el-form-item label="类型：">{{ formDetail.type }}</el-form-item>
        <el-form-item label="图片：">
          <el-image :src="fileBaseUrl+formDetail.path" :preview-src-list="[ fileBaseUrl+formDetail.path ]" :initial-index="0" fit="cover" :preview-teleported="false" style="width: 100px; height: 100px"  />
        </el-form-item>
        <el-form-item label="备注：">{{ formDetail.desc }}</el-form-item>
      </el-form>
    </el-scrollbar>
  </el-drawer>
</template>
  
  <script setup>
import { reactive, ref, toRef, watch } from "vue";
import Pager from "@/hooks/pager.js";
import * as HTTP from "./api/menu.js";
const fileBaseUrl = process.env.VUE_APP_FILE_BASE_API;
const {
  tableSize,
  form,
  findPage,
  findSearch,
  reset,
  tableData,
  total,
  handleCurrentChange,
  handleSizeChange,
  tableSelectionChange,
  selectIds,                // 选中id
  selectRows,               // 选中行 
  deleteById,
  deleteBatch,
  detailVisible,
  formDetail,
  formDetailRef,
  submit,
  editor,
  handleClose,
  detailVisible2
} = Pager(HTTP);

const files = ref("f/e/fe06387d-afe5-4c3b-bfe0-817af5e44f93.jpg");

watch(
  () => files,
  (val) => {
    console.log(val);
  }
);

const rules = reactive({
  type: [{ required: true, message: "请选择菜单类型", trigger: "change" }],
  name: [{ required: true, message: "请输入菜单名称", trigger: "blur" }],
});

findPage();
</script>