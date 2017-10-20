## 验证流程说明

### input="type" maxlength minlength
- 非空判断？
    - 不需要：如果type为checkbox radio 或者其他自定义的，
    - 需要
- 通用判断？
    - 不需要：自定义的
    - 需要：
        - 有pattern， 进入pattern正则验证规则
        - 没有pattern，进入对应的type验证规则
    
- 成功返回false，错误返回一个{}, 并且把它放到一个错误数组中


- text
    - 如果有maxlength minlength, 在进行检验
- number
    - 根据type值判断，比如 type="number"，内置的验证规则，其实可以转为一个正则
    - 有没有min 和 max 属性， 有进行验证
- 


### input type='number' or pattern=""
- 非空判断

- 成功返回false，错误返回一个{}, 并且把它放到一个错误数组中




### input data-aorb


### input data-url


### input data-same