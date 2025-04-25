import { ref } from "vue";
import type { Ref } from "vue";
import { customAlphabet } from "nanoid";

const uuid = customAlphabet("0123456789", 8);

// * ------------------------------------------------------

export interface ListItem {
	id: string;
	title: string;
}

// * ------------------------------------------------------

const mockDataCache: Record<number, ListItem[]> = {};

function generateMockData(count: number) {
	if (mockDataCache[count]) {
		return mockDataCache[count];
	}

	const data: ListItem[] = [];
	for (let i = 1; i <= count; i++) {
		data.push({ id: uuid(), title: `item ${i}` });
	}
	mockDataCache[count] = data;
	return data;
}

// * ------------------------------------------------------

export function useListMock(initialSize = 50) {
	const dataSize = ref(initialSize);
	const listData: Ref<ListItem[]> = ref([]);

	listData.value = generateMockData(dataSize.value);

	const setDataSize = (size: number) => {
		dataSize.value = size;
		listData.value = generateMockData(size);
	};

	return {
		listData,

		dataSize,
		setDataSize,
	};
}
