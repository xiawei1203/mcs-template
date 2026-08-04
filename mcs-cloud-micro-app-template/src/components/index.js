import McsSearch from "./mcs-search/index.vue";
import McsTitle from "./mcs-title/index.vue";
import McsUploader from "./mcs-uploader/mcscloud/index.vue";
import McsEditor from "./mcs-editor/index.vue";
import McsTableEmpty from "./mcs-table-empty/index.vue";
import McsDialog from "./mcs-dialog/index.vue";
import McsDrawer from "./mcs-drawer/index.vue";
import McsSectionCard from "./mcs-section-card/index.vue";
import McsStatusTag from "./mcs-status-tag/index.vue";
import McsStatsGrid from "./mcs-stats-grid/index.vue";
import McsKpiCard from "./mcs-kpi-card/index.vue";
import McsTagSelect from "./mcs-tag-select/index.vue";

/**
 * 注册全局公共组件，必须在 app.mount() 之前调用
 * @param {import('vue').App} app
 */
export function installGlobalComponent(app){
    app.component("McsSearch",McsSearch)
    app.component("McsTitle",McsTitle)
    app.component("McsUploader",McsUploader)
    app.component("McsEditor",McsEditor)
    app.component("McsTableEmpty",McsTableEmpty)
    app.component("McsDialog",McsDialog)
    app.component("McsDrawer",McsDrawer)
    app.component("McsSectionCard",McsSectionCard)
    app.component("McsStatusTag",McsStatusTag)
    app.component("McsStatsGrid",McsStatsGrid)
    app.component("McsKpiCard",McsKpiCard)
    app.component("McsTagSelect",McsTagSelect)
}
