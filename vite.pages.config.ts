import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('.',import.meta.url));
export default defineConfig({root:root+'github-web',base:'/campusmong/',publicDir:root+'public',plugins:[react()],resolve:{alias:[{find:'@/lib/client-request',replacement:root+'github-web/client-request.ts'},{find:'@',replacement:root}]},build:{outDir:root+'pages-dist',emptyOutDir:true}});