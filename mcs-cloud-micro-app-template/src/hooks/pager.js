// 通用Hook，针对公共部分业务代码，禁止修改，禁止混入页面独有得业务逻辑、禁止对特殊数据格式化
import { ref, reactive } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';


export default function Pager( HTTP ) {
  const form = reactive({ page: 1, pageSize: 10}); //查询条件
  const tableData = ref([]);        // 分页列表
  const total = ref(0);             // 总条数
  const selectIds = ref([]);        // 选中id
  const selectRows = ref([]);       // 选中行
  const formDetail = ref({});       // 单行详情
  const detailVisible = ref(false); //新增修改弹窗显示隐藏
  const detailVisible2 = ref(false); //详情显示隐藏 
  const loading=ref(false)
  const tableSize=ref("default") //表格尺寸

  // 分页
  function findPage() {
    loading.value=true
    HTTP.findPage(form).then(res => {
      tableData.value = res.data.rows;
      total.value = Number(res.data.total?res.data.total:0);
    }).catch(err => {}).finally(()=>{loading.value=false})
  }

  // 页码改变回调
  function handleCurrentChange(val) {
    form.page = val;
    findPage();
  }

  // 每页条数改变回调
  function handleSizeChange(val) {
    form.pageSize = val;
    findPage();
  }

  // 单个查询条件重置
  function findSearch() {
    form.page = 1;
    findPage();
  }

  // 重置所有
  function reset() {
    for(let k in form){
      delete form[k];
    }
    form.page = 1;
    form.pageSize = 10;
    findPage();
  }

  // 导出全部
  function exportAll(name) {
    HTTP.exportAll().then(res => {
      const blob = new Blob([res]);
      let a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = name; //设置文件名
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      a.remove();
    })
  }

  // 导出
  function exports(name) {
    if(selectIds.value.length == 0){
      ElMessage.info("请先选择要导出的数据");
      return 
    }
    HTTP.exports(selectIds.value).then(res => {
      const blob = new Blob([res]);
      let a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = name; //设置文件名
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      a.remove();
    })
  }
  
  // 表格选中项
  function tableSelectionChange(rows){
    selectIds.value = rows.map(item => item.id);
    selectRows.value = JSON.parse(JSON.stringify(rows));
  }

  // 根据id查详情
  async function findById(id) {
    await HTTP.findById(id).then(res => {
      formDetail.value = res.data;
    }).catch(err => { })
  }

  // 查看
  async function detail(row, ajax){
    if(ajax){
      await findById(row.id)
    } else {
      formDetail.value = JSON.parse(JSON.stringify(row));
    }
    detailVisible2.value=true
  }
  
  // 编辑
  async function editor(row, ajax){
    if(ajax){
      await findById(row.id)
    } else {
      formDetail.value = JSON.parse(JSON.stringify(row));
    }
    detailVisible.value = true
  }

  // 新增或修改提交
  const formDetailRef = ref(null);
  function submit() {
    formDetailRef.value.validate(valid => {
      if(!valid) return
      if(formDetail.value.id){
        HTTP.update(formDetail.value).then(res => {
          ElMessage.success("修改成功");
          findPage();
          handleClose();
        }).catch(err => { })
      } else {
        HTTP.insert(formDetail.value).then(res => {
          ElMessage.success("新增成功");
          findPage();
          handleClose();
        }).catch(err => { })
      }
    })
  }

  // 关闭弹窗
  function handleClose() {
    detailVisible.value = false;
    detailVisible2.value = false
    setTimeout(() => {
      formDetail.value = {};
    }, 100)
  }

  // 删除单条
  function deleteById(id, message) {
    ElMessageBox.confirm(message??'确定删除选中项？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      HTTP.deleteById(id).then(res => {
        ElMessage.success("删除成功");
        findPage();
      }).catch(err => { })
    }).catch(err => { })
  }

  // 批量删除
  function deleteBatch(message) {
    if(selectIds.value.length == 0){
      ElMessage.warning("请先选择要删除的数据");
      return
    }
    ElMessageBox.confirm(message??'确定删除选中项？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      HTTP.deleteBatch(selectIds).then(res => {
        ElMessage.success("删除成功");
        findPage();
      }).catch(err => { })
   }).catch(() => {})
  }


  return {
    tableSize,                // 表格尺寸
    form,                     // 分页条件查询
    loading,                   // table加载
    tableData,                // 分页列表
    total,                    // 总条数
    findPage,                 // 分页查询方法
    findSearch,               // 单个查询条件重置查询方法
    reset,                    // 重置所有条件查询方法
    selectIds,                // 选中id
    selectRows,               // 选中行 
    tableSelectionChange,     // 表格选中回调
    exports,                  // 导出
    exportAll,                // 导出全部
    handleCurrentChange,      // 当前页改变
    handleSizeChange,         // 每页条数改变
    detailVisible,            // 弹窗显示隐藏
    detailVisible2,           // 详情显示隐藏   
    formDetail,               // 单条详情
    formDetailRef,            // 单条详情组件
    findById,                 // 单条详情查询方法
    submit,                   // 新增、修改提交方法
    handleClose,              // 关闭弹窗
    deleteById,               // 删除单条
    deleteBatch,              // 批量删除
    editor,                   // 编辑
    detail,                   // 查看
  }
}
