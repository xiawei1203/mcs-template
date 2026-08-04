/** 通过id获取tree路径, 默认完整id路径，返回集合
 * @param { String | Number } id 要查询的id
 * @param { Array | Object } tree 树形结构数据
 * @param { String } label 树形结构数据中返回值的key， 默认id
 * @param { String } children 子节点key，默认children
*/
export function getFullPathById(id, tree, label='id', children='children'){
  let arr = []
  if( tree instanceof Object && !tree instanceof Array ) {  // object
    arr = [tree]
  } else if (tree instanceof Array) {  // array
    arr = tree
  } else {
    return []
  }
	let result = []
	const findPath = (data, targetId) => {
		for (let i = 0; i < data.length; i++) {
			let item = data[i];
			if (item[children]) {
				let exist = findPath(item[children], targetId)
				if (exist) {
					result.unshift(item[label])
					return true
				}
			}
			if (item.id === targetId) {
				result.unshift(item[label])
				return true
			}
		}
	}
	findPath(arr, id)
	return result
}



/** 时间格式化
 * @param { String | Number | Date } time 要格式化的时间 字符串|毫秒时间戳类型|Date
 * @param { String } format 格式
 */
export function timeFormatter(time, format='yyyy-MM-dd hh:mm:ss') {
  if(!time){
    return ''
  }
  let newTime = null;
  if( typeof time == "string" || typeof time == "number" ){ // 字符串\毫秒时间戳类型
    newTime = new Date(time)
  } else if (time instanceof Date) {
    newTime = time
  }
  //获取年份
	const YY=newTime.getFullYear();
	//获取月份
	const MM=(newTime.getMonth()+1<10? '0'+(newTime.getMonth()+1):newTime.getMonth()+1);
	//获取日期
	const DD=(newTime.getDate()<10? '0'+newTime.getDate():newTime.getDate());
  //获取小时
	const hh=(newTime.getHours()<10? '0'+newTime.getHours():newTime.getHours());
  //获取分钟
	const mm=(newTime.getMinutes()<10? '0'+newTime.getMinutes():newTime.getMinutes());
  //获取秒
	const ss=(newTime.getSeconds()<10? '0'+newTime.getSeconds():newTime.getSeconds());
  const newFormat = format.trim().replaceAll("Y","y").replaceAll("M", "m").replaceAll("D", "d").replaceAll("H","h").replaceAll("S","s");
  switch(newFormat) {
    case 'yyyy-mm-dd hh:mm:ss':
      return YY+'-'+MM+'-'+DD+' '+hh+':'+mm+':'+ss;
    case 'yyyy-mm-dd hh:mm':
      return YY+'-'+MM+'-'+DD+' '+hh+':'+mm;
    case 'yyyy-mm-dd hh':
      return YY+'-'+MM+'-'+DD+' '+hh;
    case 'yyyy-mm-dd':
      return YY+'-'+MM+'-'+DD;
    case 'yyyy-mm':
      return YY+'-'+MM;
    case 'yyyy':
      return YY;
    case 'yyyy/mm/dd hh:mm:ss':
      return YY+'/'+MM+'/'+DD+' '+hh+':'+mm+':'+ss;
    case 'yyyy/mm/dd hh:mm':
      return YY+'/'+MM+'/'+DD+' '+hh+':'+mm;
    case 'yyyy/mm/dd hh':
      return YY+'/'+MM+'/'+DD+' '+hh;
    case 'yyyy/mm/dd':
      return YY+'/'+MM+'/'+DD;
    case 'yyyy/mm':
      return YY+'/'+MM;
    case 'hh:mm:ss':
      return hh+':'+mm+':'+ss;
    case 'hh:mm':
      return hh+':'+mm;
  }
}


/** table表单formatter格式化 */ 
export function valueFormatter(arr, id, key){
  let k = key || 'itemText'
	return arr.filter(item =>item.id === id)[0] && arr.filter(item =>item.id === id)[0][k]
}


/** 深拷贝
 * @param { Object | Array } obj 拷贝目标
 * @param { String } filterKey 过滤的key
 */ 
export function deepClone(obj, filterKey = '') {
  if (obj === null || typeof obj !== 'object') {
    return obj; // 如果是基本类型或者null，直接返回
  }

  if (Array.isArray(obj)) {
    // 如果是数组，遍历数组并递归调用deepClone
    return obj.map(item => deepClone(item, filterKey));
  }

  // 如果是对象，遍历对象的属性并递归调用deepClone
  const cloned = {};
  for (let key in obj) {
    if (obj.hasOwnProperty(key) && key != filterKey) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
}