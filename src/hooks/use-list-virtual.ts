import { ref, computed, onMounted, onUnmounted } from "vue";
import type { Ref } from "vue";

// * -------------------------------------------------------------------------- interface

interface VirtualListOptions {
	// 每个 item 的高度
	itemHeight: number;
	// 虚拟列表缓冲区
	buffer?: number;
}

// * -------------------------------------------------------------------------- hook

export function useVirtualList<T>(
	items: Ref<T[]>,
	options: VirtualListOptions,
) {
	const containerRef = ref<HTMLElement | null>(null);
	const scrollTop = ref(0);
	const containerHeight = ref(0);

	const itemHeight = options.itemHeight;
	const buffer = options.buffer || 5;

	// 计算可见范围
	const visibleRange = computed(() => {
		if (!containerRef.value) return { start: 0, end: 20 };

		const start = Math.floor(scrollTop.value / itemHeight) - buffer;
		const visibleCount =
			Math.ceil(containerHeight.value / itemHeight) + 2 * buffer;
		const end = start + visibleCount;

		return {
			start: Math.max(0, start),
			end: Math.min(items.value.length, end),
		};
	});

	// 获取可见的 items
	const visibleItems = computed(() => {
		const { start, end } = visibleRange.value;
		return items.value.slice(start, end).map((item, index) => ({
			item,
			index: start + index,
		}));
	});

	// 所有 items 的总高度
	const totalHeight = computed(() => {
		return items.value.length * itemHeight;
	});

	// item 位置的 transform
	const getItemTransform = (index: number) => {
		return `translateY(${index * itemHeight}px)`;
	};

	// 处理滚动
	const handleScroll = () => {
		if (!containerRef.value) return;
		scrollTop.value = containerRef.value.scrollTop;
	};

	// 处理 resize
	const handleResize = () => {
		if (!containerRef.value) return;
		containerHeight.value = containerRef.value.clientHeight;
	};

	onMounted(() => {
		if (!containerRef.value) return;

		containerHeight.value = containerRef.value.clientHeight;
		containerRef.value.addEventListener("scroll", handleScroll);
		window.addEventListener("resize", handleResize);
	});

	onUnmounted(() => {
		if (!containerRef.value) return;

		containerRef.value.removeEventListener("scroll", handleScroll);
		window.removeEventListener("resize", handleResize);
	});

	return {
		containerRef,
		visibleItems,
		totalHeight,
		getItemTransform,
	};
}
