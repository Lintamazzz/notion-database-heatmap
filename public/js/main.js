import { fetchHeatmapData, fetchLastEditedTime } from './fetch.js';
import { cal, paintHeatmap } from './paint.js';
import { updateWindowSize, updateLastEdited } from './resize.js';

// DOM 加载完成后调用
document.addEventListener('DOMContentLoaded', () => {
    fetchDataAndPaint();
});

export let mapData;  // 可全局共享，存储热力图数据
// 初始化页面
async function fetchDataAndPaint() {
    try {
        // 获取数据
        const [fetchedMapData, lastEditedTime] = await Promise.all([
            fetchHeatmapData(),
            fetchLastEditedTime()
        ]);
        mapData = fetchedMapData;

        // 添加点击事件
        document.getElementById("previous").addEventListener("click", () => cal.previous(1));
        document.getElementById("next").addEventListener("click", () => cal.next(1));
        // 添加最近修改时间
        document.getElementById("last").innerHTML = `Last edited: ${lastEditedTime}`;

        // 初始化位置
        updateLastEdited();  
        // 初始化窗口
        updateWindowSize();

        // 绘制热力图
        paintHeatmap(mapData);   
    } catch (err) {
        console.error("Error fetching data:", err);
    }
}
