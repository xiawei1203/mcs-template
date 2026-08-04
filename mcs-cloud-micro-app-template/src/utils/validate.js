
// 手机号&座机号
export function checkTelphone(rule, value, callback) {
  if(!value) {
    return callback(new Error('请输入联系方式'))
  }
  if (!(/^((0\d{2,3})-)?(\d{7,8})(-(\d{3,4}))?$/.test(value)) && !(/^1[34578]\d{9}$/.test(value))) {
    return callback(new Error('请输入正确的联系方式'))
  }
  callback()
}