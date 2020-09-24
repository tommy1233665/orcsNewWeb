const authorityMap = {
  home: {
    bar: "37e24183783e42279f1f57fb6fb0ebf8", // 查询各公司高中低风险（柱状图）
    map: "c30b6b577812475c98515097bc2870e6", // 查询各公司高风险航班数（地图）
    allTop10: "c6c3315c739645d7a4d494f195886d31", // 查询全公司高风险TOP10
    gzTop10: "cf4389c197004941a2b5d2a4ec4554f1", // 查询广州高风险TOP10
    pie: "df7dc9705ebc44bc87aa9080690e7dda", // 查询全公司高中低风险（饼图）
  },
  flightRiskShow: {
    list: "3645b32296154654ba7a2c3890049cda", // 查询航班风险
    listHistory: "dd9e0ecf8b514eaaa5bf3fe7e7163a5f", // 航班历史风险查询
    countFlightRiskValue: "9a00457e9eb8476e81eea8d6b9cdf098", // 计算航班风险值

    countLeaf: "51950432764842cfba4ff327048b7ccd", // 重新计算终端风险节点风险值

    warnList: "47519032435a4305b78218b40e350eb9", // 查询告警列表
    warnListHistory: "4140d6f88ff54297a1337f044886c92a", // 查询历史告警
    sureWarn: "cbc016dac52c4cfcad8f33137059da64", // 确认风险告警

    notice: "6f459a7ab14d42f685d3a506d799c84b", // 查看重要通告
    qar: "9877f93015854445be0ac8a905be6448", // 查看QAR监控事件
    qarRoute: "4b299a93ee9247348b4b7530ee474d4e", //查看QAR油量数据分析
    newCalculationResults: "b5b9836d0fa847f5abbade1a83837904", //新模型计算结果

    // 目前航班风险页面和历史航班风险页面用的是相同的，以后若需不同，直接改下面对应的值就行
    currentTree: "723819b1a5d14178a310b7131cdb4fef", // 航班风险树信息--航班风险页面
    historyTree: "2f8293ce81144d86b871300c22d600c3", // 航班历史风险树信息--航班风险页面
    historyDetail: "eca5e437b4334e19a24753c8745209e5", // 航班历史风险明细查询--航班风险页面(风险详情)
    historyList: "5ea680f4359e45a891bfc52b643199fd", // 航班历史风险总值明细--航班风险页面(历史风险list)

    currentTreeHistory: "723819b1a5d14178a310b7131cdb4fef", // 航班风险树信息--历史航班风险页面
    historyTreeHistory: "2f8293ce81144d86b871300c22d600c3", // 航班历史风险树信息--历史航班风险页面
    historyDetailHistory: "eca5e437b4334e19a24753c8745209e5", // 航班历史风险明细查询--历史航班风险页面(风险详情)
    historyListHistory: "5ea680f4359e45a891bfc52b643199fd", // 航班历史风险总值明细--历史航班风险页面(历史风险list)
  },
  riskTarget: {
    addTree: "38e245f5395a4b9a86f2cadd6f339cee", // 新增树节点
    editTree: "ca9aaa3817e94927a8bb82760fc7d732", // 修改树节点
    delTree: "aa6b1447c26046b1a68805d6e5ebb0f7", // 删除树节点
    listTree: "698f4510bc944861802bbf8fa978c283", // 查询树节点

    editNode: "a382db619a6b4e21a5823df2e05e5b5f", // 新增/修改组合风险节点默认值、概率、比重
    detailNode: "06d5b2cda12a4756a07baa6e616b6473", // 查看组合风险节点默认值、概率、比重
    editLeaf: "a7cdec8a5187488d9f46dc158af4ed09", // 新增/修改终端风险节点默认值、告警值、概率、比重
    detailLeaf: "fff053d5679648a886b61570d43fb01d", // 查看终端风险节点默认值、告警值、概率、比重

    editMatrix: "9f5a0ce07160428d8c42aa9c092e22a0", // 新增/修改组合风险节点交叉矩阵赋值
    detailMatrix: "b74bfa68539c4400873a5ae063effb02", // 查看组合风险节点交叉矩阵赋值

    addRule: "4548c751ffa64eafb4d71a413e23a288", // 新增终端风险节点规则
    editRule: "40c74ae009b94a5bb21b803a2259de3b", // 修改终端风险节点规则
    delTule: "034b3c7c5c3e4cf68bae1b0376317db0", // 删除终端风险节点规则
    listRule: "edbe29252e5340b8afebac1c7d584795", // 查看终端风险节点规则
  },
  relateRiskTarget: {
    addEdit: "a9ec4eac8c764f80af673249889e6e38", // 新增、修改
    del: "534f8db3242140eda45e818f621c458d", // 删除
    list: "d0df510184864941a097c706771b52c8", // 查询
  },
  dailyRiskTarget: {
    add: "39d3ee934cc549ad8dfbaf326b8e3404", // 新增
    edit: "51854e59d0b64e83b8e7ee88eab501b4", // 修改
    del: "cf896344304e454c9504b9245709ebc9", // 删除
    list: "2b90983b898345a2a403366e81e6ed30", // 查询
  },
  riskTreeShow: {
    show: "6eda5d611d474d3ca51ceb6e8d142860",
  },
  acfData: {
    add: "3a58231e53e346e1aa7f30678ed2ef91", // 新增
    edit: "3ac2b88eeab24cc1a9b08d63599486c2", // 修改
    del: "ab891dbc9ffd44c7813c4ea47840f919", // 删除
    list: "174b844283b4440aa6291300fc7ba623", // 查询
    detail: "f2d023b9372745a186ec6efc94287868", // 查询飞机详情信息
  },
  c0059HandBook: {
    add: "88063a8f578d45bea3464fe7aeffb173", // 新增
    edit: "d2c43836039a4f1681e225e4bce1feca", // 修改
    del: "cc5e12ea11c442ccb6e91daf9068ef41", // 删除
    list: "677dde2d0dea47d2b9d262273194502b", // 查询
  },
  rmArptRiskParam: {
    add: "21d29d8805a846be9e9829c62b57ff23", // 新增
    edit: "dce0c3d5020c46a5b09369f25a3633d4", // 修改
    del: "4856386a47554d7e8b6a80ba2a0cf5b0", // 删除
    list: "3446b88bbefb4721956e7cd343e7d7fa", // 查询
  },
  rmItemFunPoint: {
    edit: "8e5c7032045d42bca65f29bbce064b9d", // 修改
    list: "7c276be9cb0d438d962510efc9a29965", // 查询
  },
  rmRiskArpt: {
    add: "756799d22377414785fdb562e9bd4470", // 新增
    edit: "e8bdb62f2d114028859092521d17896f", // 修改
    del: "92069b48df89491e901be5a56b81876d", // 删除
    list: "c919163e8948496fafe1ff670b7e1547", // 查询
    detail: "f6b755a571f246f58b80161006a0e67c", // 查询飞机详情信息
  },
  rmSpecialAirLine: {
    add: "c4da74d1f7f943cc9eb9e2a1f23404a2", // 新增
    edit: "e34f960838064803b098b8f8d1b4600b", // 修改
    del: "c981ecba1536440e8477fb3bd318f155", // 删除
    list: "0c837107d1354d79b14442b52291445e", // 查询
  },
  rwyRule: {
    add: "5cd006b130b4444aa873e9aba6e464b6", // 新增
    edit: "9b99488365334ef5be02347f380e3327", // 修改
    del: "07a8ffde328646e0aee0a4496bf2cec9", // 删除
    list: "08936e16f82247038abc322619690396", // 查询
    export: "3812bbbdc20f4c089d1f1f4a9f770cbe", // 导出
  },
  v2500Data: {
    add: "398fdf0f74c647a491d5b37093deb5ce", // 新增
    edit: "f1d6a9611bcc4b75baea55b5458a42f4", // 修改
    del: "c192f859832b44988a6db825af842302", // 删除
    list: "c9e473972faf4cdd82c3feda7d27edcb", // 查询
  },
  //新增ETG和FWC的增删改查
  fWCData: {
    edit: "38c30c68983a42c89dcb559a33ade9ff", //修改
    list: "7da0eca8a0bf40dfbb9ffa52b47fe48a", //查询
    add: "8417a30d657b4fc5a16cc6dba27d499b", //新增
    del: "cf45b0ef1b2e44fbabbc80e2ea6bcfdc",
  },
  eGTData: {
    add: "793c3fa538114f24a55d45a08cbb088d",
    list: "a04d5fdebc404423a786c3599edb63e0",
    del: "ae59fe87f5644c94aec307fd3507355c",
    edit: "e385177c8b2e43c89ff705436ed686b3",
  },
  hAFHData: {
    edit: "861748dca89741909385b264e3cd62f3", //修改
    list: "0de46585f4fd40b7b528af3285005619", //查询
    add: "28d413dba8b24102b9e696663a01b414", //新增
    del: "69c497a2e1da4791bae890a3a3241d06",
  },
  ndTailData: {
    edit: "a7545155a53d43f2adb8744efc62af38", //修改
    list: "b49112d1a2ec43108d655cdf1226bdcc", //查询
    add: "6bc2c9e12d8e4049896908320a71c5a7", //新增
    del: "da4aa8cc84854bd8bd0cb15b71443152",
  },
  weather: {
    add: "ea030caaa9b44d95af059f04c97dadcf", // 新增
    edit: "49940003d8224ff58e348430f8e22247", // 修改
    del: "6994a89a4ce949c091461d5d356b9c7d", // 删除
    list: "f2a889bde90c41b696e090b7dc1cf99c", // 查询
  },
  windLimitStandard: {
    add: "531675721d83466f869053487d72cf75", // 新增
    edit: "cef82603458a4365b041fb166d0a4338", // 修改
    del: "140418a3777a48bdaad945b5e96bd744", // 删除
    list: "5f1181d7c2144b97bb5daad3de4b7c4d", // 查询
    export: "0f173e4337934aa09c833794cd6aab0f", // 查询飞机详情信息
  },
  airLineAcftType: {
    // 新机型老航线
    add: "01a7b52438264bddb598da905ccbf14f", // 新增
    edit: "72e13395ea2f42cd8b3d6e46545e7182", // 修改
    del: "0277cccab8be4802a0638db808d078e6", // 删除
    list: "503a9d872d4940839b1febfa00e0378b", // 查询
    upload: "40dfa0de9a5d497682d1cd702a06a940", // 导入
    export: "232a61cd27a04715b7e5740f27edf977", // 导出
  },
  newAirport: {
    // 新开航机场
    add: "0d8cdab46b6745038d0bf662da76440e", // 新增
    edit: "dcc0f9adafe0451f851cd747777283c3", // 修改
    del: "54bb7c94bc454fbf808ed1b7e93b3132", // 删除
    list: "12878f5e162c405fb301312927af1afd", // 查询
    export: "2141e3c84dd041259aefa748d1a96d07", // 导出
  },
  newAirLine: {
    // 新开航线
    add: "e36102b5495d42b1aea4eaefd0bc2b46", // 新增
    edit: "bc90e04a1c56435698bc4b2bbc1ba7ef", // 修改
    del: "3572a87535bb448893e83d89ed87d896", // 删除
    list: "6b71484c0b9c48149ce0baaa5119e58e", // 查询
    upload: "145ba9175d98425eb010ef963f0031d2", // 导入
    export: "dbb7c0a0ccd94c45be68e9e5a1c1836a", // 导出
  },
  newAcftType: {
    // 新引进机型
    add: "22147cd1cc1e4848916d3d1884ea02fe", // 新增
    edit: "0af1976c2ff244dd8df712ca426544e4", // 修改
    del: "d95cb6b127ee4c889990e81ee6e69202", // 删除
    list: "fd9744fe9523417b9f44a51ed8e86c00", // 查询
    export: "7efa902a87a3427db8cd965a482a0e05", // 导出
  },
  role: {
    add: "b838c11044be40dda964b4f6ee610498", // 新增
    edit: "cfb3d4c891ae411e8c309d66b84cfe63", // 修改
    del: "3de45345b22c4b5e9a6ccd14a7b0df97", // 删除
    list: "986d797926af421aaa57415c43814041", // 查询
    editHasAuthority: "7f2379fb631147f881d59cb01e63e45a", // 修改角色拥有权限
    detailHasAuthority: "3f9b02fe06254653b047f16ac3d20245", // 查看角色拥有权限
  },
  user: {
    add: "51e26cd92b3044a282acdc35d7360e8b", // 新增用户
    edit: "31b519f09bb44745b8c2dd08648594dc", // 修改用户
    del: "c5ffff76035448fea1b2e70a7a2586d4", // 删除用户
    list: "eefe75fcda02459eb2037add237f5b2d", // 查询用户
    editUserHasRole: "a2c462cab59b4109ba94bba345a2d74c", // 修改用户拥有角色
    detailUserHasRole: "2903994553034d8ba66a83cf49a2d9cd", // 查看用户拥有角色
  },
  permission: {
    // 权限管理
    add: "", // 新增
    edit: "", // 修改
    del: "", // 删除
    list: "", // 查询
  },
};

// 风险配置页面：用同一个侧风标准，目的地机场的侧风标准跟其他节点一样有新增修改删除，目的地备降机场的只查看不做其他操作
const riskTargetMap = {
  originalId: "61ee45a7490d460ab8d63e9ecffe5fde", // 目的地机场的侧风标准
  modifyId: "ff1a0425002a4817bb3075a1d9cc347c", // 目的地备降机场的侧风标准
};

export { authorityMap, riskTargetMap };
