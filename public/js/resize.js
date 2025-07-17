import { mapData } from "./main.js";
import { paintHeatmap } from "./paint.js";

let previousMonthsToShow = calculateMonthsToShow(); // 初始化

// 监听窗口大小变化事件
window.addEventListener('resize', () => {
    // 添加防抖，避免频繁重绘
    clearTimeout(window.resizeTimer);
    window.resizeTimer = setTimeout(() => {
        const currentMonthsToShow = calculateMonthsToShow();

        // 只有在月份数变化时才重新绘制热图
        if (currentMonthsToShow !== previousMonthsToShow) {
            previousMonthsToShow = currentMonthsToShow;
            // 只有在有数据时才绘制
            if (mapData) {
                paintHeatmap(mapData);
            }
        }

        // 调整 Last Edited Time 的位置，保持在热图右下方显示
        updateLastEdited();

        // 实时显示窗口大小、月份数量
        updateWindowSize();

    }, 250);
});

export function updateLastEdited() {
    const monthsToShow = calculateMonthsToShow();
    document.getElementById('last').style.marginLeft = `${monthsToShow * (50 - (12 - monthsToShow) * (monthsToShow >= 6 ? 3 : (monthsToShow == 5 ? 4.5 : 6)))}px`;
}

export function updateWindowSize() {
    // const windowSizeElement = document.getElementById('window-size');
    // windowSizeElement.textContent = `窗口大小: ${window.innerWidth} × ${window.innerHeight} | 显示月份: ${calculateMonthsToShow()}`;
}

// 计算基于当前窗口宽度应该显示的月份数
export function calculateMonthsToShow() {
    const windowWidth = window.innerWidth;
    // 每个月大约需要 75px 宽度
    // 减去左右边距和一些额外空间
    const availableWidth = windowWidth - 80;
    // 计算可以显示的月份数量，最少显示 3 个月，最多显示 12 个月
    return Math.max(3, Math.min(12, Math.floor(availableWidth / 75)));
}