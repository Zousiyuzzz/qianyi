# 数据洞察页面组件化重构说明

## 组件结构

```
dataCheck/
├── components/
│   ├── DashboardHeader.vue      # 顶部筛选栏
│   ├── TopFactors.vue           # TOP3影响因素
│   ├── TrendAnalysis.vue        # 整体趋势分析
│   └── DataCardList.vue         # 数据卡片列表
├── utils/
│   └── carPolicyCalculator.js   # 汽车政策计算工具
└── dataCheck.vue                # 主页面（待重构）
```

## 汽车政策计算逻辑

汽车政策的数据需要前端自己计算，后端只提供列表数据。

### 使用方式

```javascript
import { calculateAllMetrics } from './utils/carPolicyCalculator';

// 在loadData方法中
if (this.selectedType === '汽车政策') {
    // 获取列表数据
    const calcDetailList = await getAction('/douyinRebateCalcDetail/listNotPage', params);
    const materialDetailList = await getAction('/douyinRebateMaterialDetail/listNotPage', materialParams);
    const performanceDetailList = await getAction('/douyinRebatePerformanceDetail/listNotPage', perfParams);
    
    // 前端计算
    const metrics = calculateAllMetrics(
        calcDetailList.result || [],
        materialDetailList.result || [],
        performanceDetailList.result || [],
        '汽车政策'
    );
    
    // 使用计算结果
    this.perfConsumption = metrics.perfConsumption;
    this.biddingRiskControlRebate = metrics.biddingRiskControlRebate;
    // ... 其他指标
} else {
    // 综代政策：使用后端返回的汇总值（原有逻辑）
    // ...
}
```

## 重构步骤

1. **在主页面引入组件**
   ```vue
   <template>
     <div class="rebate-dashboard">
       <DashboardHeader
         :selected-period.sync="selectedPeriod"
         :selected-year.sync="selectedYear"
         :selected-type.sync="selectedType"
         :selected-company.sync="selectedCompany"
         @refresh="loadData"
       />
       <main class="dashboard-main">
         <TopFactors :factors="topFactors" :loading="cardLoading" />
         <TrendAnalysis
           :perf-consumption="perfConsumption"
           :total-rebate-amount="totalRebateAmount"
           :rebate-rate="rebateRate"
           :bidding-risk-control-rebate="biddingRiskControlRebate"
           :high-quality-consumption="highQualityConsumption"
           :first-release-consumption="firstReleaseConsumption"
           :live-consumption="liveConsumption"
           :prepaid-consumption="prepaidConsumption"
           :perf-change="perfChange"
           :total-rebate-change="totalRebateChange"
           :rebate-rate-change="rebateRateChange"
           :bidding-change="biddingChange"
           :high-quality-change="highQualityChange"
           :first-release-change="firstReleaseChange"
           :live-change="liveChange"
           :prepaid-change="prepaidChange"
           :loading="cardLoading"
         />
         <DataCardList
           :cards="dataCards"
           :expanded-cards="expandedCards"
           :loading="cardLoading"
           @card-click="toggleCardExpand"
         >
           <template #detail="{ card, cardId }">
             <!-- 卡片详情内容 -->
           </template>
         </DataCardList>
       </main>
     </div>
   </template>
   
   <script>
   import DashboardHeader from './components/DashboardHeader.vue';
   import TopFactors from './components/TopFactors.vue';
   import TrendAnalysis from './components/TrendAnalysis.vue';
   import DataCardList from './components/DataCardList.vue';
   import { calculateAllMetrics } from './utils/carPolicyCalculator';
   
   export default {
     components: {
       DashboardHeader,
       TopFactors,
       TrendAnalysis,
       DataCardList
     },
     // ...
   };
   </script>
   ```

2. **修改loadData方法，添加汽车政策计算逻辑**

3. **逐步迁移样式到各组件**

4. **测试验证**

## 注意事项

- 汽车政策需要调用三个接口获取列表数据，然后前端计算
- 综代政策保持原有逻辑，使用后端汇总值
- 组件间通过props和events通信
- 保持原有的数据格式和计算逻辑

