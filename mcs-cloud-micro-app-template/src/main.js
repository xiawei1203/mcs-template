import {microMount,microUnmount} from './qiankun';
import {createApp} from 'vue'
import App from './App.vue'
import router from "./router"
import store from "./store"
import ElementUI from 'element-plus'
import locale from 'element-plus/es/locale/lang/zh-cn'
import { installGlobalComponent } from "@/components";
import 'element-plus/dist/index.css'
import "@/styles/index.scss"

let instance = null;

function render(props = {}) {
  const { container } = props;

  instance = createApp(App)
  .use(store)
  .use(router)
  .use(ElementUI,{locale})
  instance.mount(container ? container.querySelector("#app") : "#app")

  installGlobalComponent(instance)
}


// 独立运行时
if (!window.__POWERED_BY_QIANKUN__) {
  render()
}

export async function bootstrap() {

}

export async function mount(props) {
  microMount(props)
  render(props);
  instance.config.globalProperties.$setGlobalState =props.setGlobalState
}

export async function unmount() {
  instance.unmount();
  instance._container.innerHTML = '';
  instance = null;
  microUnmount()
}