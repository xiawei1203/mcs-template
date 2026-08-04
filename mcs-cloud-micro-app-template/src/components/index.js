

import McsSearch from "./mcs-search/index.vue";
import McsTitle from "./mcs-title/index.vue";
import McsUploader from "./mcs-uploader/mcscloud/index.vue";
import McsEditor from "./mcs-editor/index.vue";

/**
 * 
 * @param {*} app 
 */
export function installGlobalComponent(app){
    app.component("McsSearch",McsSearch)
    app.component("McsTitle",McsTitle)
    app.component("McsUploader",McsUploader)
    app.component("McsEditor",McsEditor)

}