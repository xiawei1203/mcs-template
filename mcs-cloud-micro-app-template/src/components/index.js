import McsSearch from "./mcs-search/index.vue";
import McsTitle from "./mcs-title/index.vue";
import McsUploader from "./mcs-uploader/mcscloud/index.vue";
import McsEditor from "./mcs-editor/index.vue";
import McsUserPicker from "./mcs-user-picker/index.vue";
import McsOrgUserPanel from "./mcs-org-user-panel/index.vue";
import McsSpaceTreePicker from "./mcs-space-tree-picker/index.vue";

/**
 * 注册全局公共组件，必须在 app.mount() 之前调用
 * @param {import('vue').App} app
 */
export function installGlobalComponent(app){
    app.component("McsSearch",McsSearch)
    app.component("McsTitle",McsTitle)
    app.component("McsUploader",McsUploader)
    app.component("McsEditor",McsEditor)
    app.component("McsUserPicker",McsUserPicker)
    app.component("McsOrgUserPanel",McsOrgUserPanel)
    app.component("McsSpaceTreePicker",McsSpaceTreePicker)
}
