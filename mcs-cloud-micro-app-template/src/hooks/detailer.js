// 通用Hook，针对公共部分业务代码，禁止修改，禁止混入页面独有得业务逻辑、禁止对特殊数据格式化
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { useRouter, useRoute } from 'vue-router';

export default function Pager( HTTP ) {
  const Router = useRouter();
  const Route = useRoute();
  const id = Route.query.id;
  
  // 判断受否禁用页面编辑功能
  let pageDisabled = ref(Route.query.update? false: true); // 修改
  if(!id){ // 是否为新增
    pageDisabled.value = false;
  }
  const form = ref({}); // 表单

  // 根据id查详情
  async function findById(id) {
    await HTTP.findById(id).then(res => {
      form.value = res.data;
    }).catch(err => { })
  }

  // 新增或修改提交
  const formRef = ref(null);
  function submit() {
    formRef.value.validate(valid => {
      if(!valid) return
      if(form.value.id){
        HTTP.update(form.value).then(res => {
          ElMessage.success("修改成功");
          setTimeout(() => {
            goBack();
          }, 1000)
        }).catch(err => { })
      } else {
        HTTP.insert(form.value).then(res => {
          ElMessage.success("新增成功");
          setTimeout(() => {
            goBack();
          }, 1000)
        }).catch(err => { })
      }
    })
  }

  // 返回上一页
  function goBack() {
    Router.go(-1);
  }

  return {
    id,
    pageDisabled, // 是否编辑
    form,     // 表单
    submit,   // 提交
    goBack,   // 返回上一页
    formRef,  // 表单组件
    findById,
  }
}