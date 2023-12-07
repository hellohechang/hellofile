import { createPinia } from 'pinia';

// 引入持久化存储插件
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

const pinia = createPinia();

pinia.use(piniaPluginPersistedstate);

export default pinia;
