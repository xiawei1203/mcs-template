import request from '@/utils/request.js';

// 分页查询
export const findPage = params => {
    return new Promise((res,rej)=>{
        res(
            {
                "status": 200,
                "msg": "操作成功",
                "data": {
                  "page": "1",
                  "pageSize": "10",
                  "total": "19",
                  "rows": [
                      {
                        "id": "1824701245530161154",
                        "name": "武昌鱼",
                        "type": [
                          2,
                          3
                        ],
                        "remark": "鲜活武昌鱼",
                        "createUser": "1790239279533887490",
                        "createTime": "2024-08-17 14:54:13",
                        "updateUser": "1790239279533887490",
                        "updateTime": "2024-08-17 14:54:13"
                      },
                      {
                        "id": "1824657070898130946",
                        "name": "凉面",
                        "type": [
                          3
                        ],
                        "remark": "清凉爽口",
                        "createUser": "1790239279533887490",
                        "createTime": "2024-08-17 11:58:41",
                        "updateUser": "1790239279533887490",
                        "updateTime": "2024-08-17 11:58:41"
                      },
                      {
                        "id": "1824656938563645441",
                        "name": "香辣烤鱼",
                        "type": [
                          2,
                          3
                        ],
                        "remark": "锅，现杀现烤",
                        "createUser": "1790239279533887490",
                        "createTime": "2024-08-17 11:58:09",
                        "updateUser": "1790239279533887490",
                        "updateTime": "2024-08-17 11:58:09"
                      },
                      {
                        "id": "1824656812805828610",
                        "name": "清蒸鲈鱼",
                        "type": [
                          2,
                          3
                        ],
                        "remark": "先杀活鱼",
                        "createUser": "1790239279533887490",
                        "createTime": "2024-08-17 11:57:39",
                        "updateUser": "1790239279533887490",
                        "updateTime": "2024-08-17 11:57:39"
                      },
                      {
                        "id": "1824656707847565314",
                        "name": "水煮肉片",
                        "type": [
                          2,
                          3
                        ],
                        "remark": null,
                        "createUser": "1790239279533887490",
                        "createTime": "2024-08-17 11:57:14",
                        "updateUser": "1790239279533887490",
                        "updateTime": "2024-08-17 11:57:14"
                      },
                      {
                        "id": "1824656584753131522",
                        "name": "土豆炖牛腩",
                        "type": [
                          2
                        ],
                        "remark": null,
                        "createUser": "1790239279533887490",
                        "createTime": "2024-08-17 11:56:45",
                        "updateUser": "1790239279533887490",
                        "updateTime": "2024-08-17 11:56:45"
                      },
                      {
                        "id": "1824656494491709441",
                        "name": "干锅子鸡",
                        "type": [
                          2,
                          3
                        ],
                        "remark": "3-6月的嫩鸡",
                        "createUser": "1790239279533887490",
                        "createTime": "2024-08-17 11:56:23",
                        "updateUser": "1790239279533887490",
                        "updateTime": "2024-08-17 11:56:23"
                      },
                      {
                        "id": "1824656363491012609",
                        "name": "清炒时蔬",
                        "type": [
                          2,
                          3
                        ],
                        "remark": "竹叶菜、空心菜",
                        "createUser": "1790239279533887490",
                        "createTime": "2024-08-17 11:55:52",
                        "updateUser": "1790239279533887490",
                        "updateTime": "2024-08-17 11:55:52"
                      },
                      {
                        "id": "1824656200525524994",
                        "name": "羊腿手抓饭",
                        "type": [
                          2,
                          3
                        ],
                        "remark": "羊膻味较轻",
                        "createUser": "1790239279533887490",
                        "createTime": "2024-08-17 11:55:13",
                        "updateUser": "1790239279533887490",
                        "updateTime": "2024-08-17 11:55:13"
                      },
                      {
                        "id": "1824655886531538946",
                        "name": "新疆大盘鸡",
                        "type": [
                          3,
                          2
                        ],
                        "remark": "新疆特色焖鸡",
                        "createUser": "1790239279533887490",
                        "createTime": "2024-08-17 11:53:58",
                        "updateUser": "1790239279533887490",
                        "updateTime": "2024-08-17 11:53:58"
                      }
                  ]
                }
              }
        )
    })
}

// 查询所有
export const findAll = params => {
  return request({
    url: '/mcsOffice/v1/diningMenu/listAll',
    method: 'get',
    params,
  })
}

// id查询
export const findById = id => {
    return new Promise((res,rej)=>{
        res({
            "status": 200,
            "msg": "操作成功",
            "data": {
                "id": "1824655886531538946",
                "name": "新疆大盘鸡",
                "type": [  3, 2],
                "remark": "新疆特色焖鸡",
                "createUser": "1790239279533887490",
                "createTime": "2024-08-17 11:53:58",
                "updateUser": "1790239279533887490",
                "updateTime": "2024-08-17 11:53:58"
            }
          })
    })
}

// 新增
export const insert = (data) => {
  return request({
    url: '/mcsOffice/v1/diningMenu',
    method: 'post',
    data
  })
}


// 修改
export const update = data => {
  return request({
    url: '/mcsOffice/v1/diningMenu',
    method: 'put',
    data
  })
}

// id删除
export const deleteById = id => {
  return request({
    url: `/mcsOffice/v1/diningMenu`,
    method: 'delete',
    data: { ids: [id] }
  })
}

// ids批量删除
export const deleteBatch = ids => {
  return request({
    url: `/mcsOffice/v1/diningMenu`,
    method: 'delete',
    data: { ids: ids }
  })
}