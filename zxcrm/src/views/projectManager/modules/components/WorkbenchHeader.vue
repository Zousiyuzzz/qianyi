<template>
    <div class="workbench-header">
        <img class="workbench-logo" src="~@/assets/logo.png" alt="logo">
        <div class="workbench-title">云象充</div>
    </div>
</template>

<script>
export default {
    name: 'WorkbenchHeader'
};
</script>

<style scoped>
.workbench-header {
    display: flex;
    justify-content: center;
    height: 100%;
    align-items: center;
    padding-bottom: 30px;
}

.workbench-logo {
    height: 50px;
    vertical-align: middle;
    margin-right: 6px;
}

.workbench-title {
    color: #000000;
    font-family: 'WDXL Lubrifont SC Local', 'ZCOOL KuaiLe', 'ZCOOL XiaoWei', 'ZCOOL ShangWei', 'ZCOOL JianYi', 'ZCOOL QingKe HuangYou', 'Source Han Sans SC', 'Noto Sans SC', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', sans-serif;
    font-size: 2em;
    white-space: nowrap;
    position: relative;
    cursor: pointer;
    letter-spacing: 2px;
    font-weight: 500;
    letter-spacing: 1px;
}
</style>
