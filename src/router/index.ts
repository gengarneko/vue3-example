import { createRouter, createWebHistory } from "vue-router";

const routes = [
	{
		path: "/",
		redirect: "/list",
	},
	{
		path: "/list",
		name: "List",
		component: () => import("../views/1-list.vue"),
	},
	{
		path: "/canvas",
		name: "Canvas",
		component: () => import("../views/2-canvas.vue"),
	},
	{
		path: "/three",
		name: "Three",
		component: () => import("../views/3-three.vue"),
	},
];

export const router = createRouter({
	history: createWebHistory(),
	routes,
});
