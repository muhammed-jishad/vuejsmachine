import { createRouter, createWebHistory } from 'vue-router';
import Register from '../components/RegisterPage.vue';
import Login from '../components/Loginpage.vue';
import Dashboard from '../components/DashBorad.vue';
import TaskPage from '../components/TaskPage.vue';


const routes = [
  { path: '/', redirect: '/login' },
  { path: '/register', component: Register },
  { path: '/login', component: Login },
  { path: '/dashboard', component: Dashboard },
  {
  path: '/projects/:id/tasks',
  name: 'TaskManager',
  component: TaskPage,
}

];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
