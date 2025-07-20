import { fetchHeatmapData, fetchLastEditedTime } from './fetch.js';
import { cal, paintHeatmap } from './paint.js';
import { updateWindowInfo, updateLastEditedPosition } from './resize.js';

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', () => {
    // 加载并绘制热力图
    loadHeatmapData();
    // 加载最后编辑时间      
    loadLastEditedTime();

    // 初始化最后编辑时间的位置
    updateLastEditedPosition();
    // 初始化窗口信息
    updateWindowInfo();
});

export let mapData;  // 可全局共享，存储热力图数据

async function loadHeatmapData() {
    try {
        // 获取数据
        mapData = await fetchHeatmapData();
        // 绘制热力图
        paintHeatmap(mapData);

        // 添加点击事件
        document.getElementById("previous").addEventListener("click", () => cal.previous(1));
        document.getElementById("next").addEventListener("click", () => cal.next(1));
    } catch (err) {
        console.error("Error fetching heatmap data:", err);
    }
}

async function loadLastEditedTime() {
    try {
        // 获取数据
        const lastEditedTime = await fetchLastEditedTime();
        // 更新页面
        document.getElementById("last").innerHTML = `Last edited: ${lastEditedTime}`;
    } catch (err) {
        console.error("Error fetching last edited time:", err);
    }
}