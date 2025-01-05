document.addEventListener('DOMContentLoaded', function() {
    const checkInList = document.getElementById('checkin-list');
    const addItemForm = document.getElementById('add-item-form');
    const itemInput = document.getElementById('new-item-input');
    const toggleFormBtn = document.getElementById('toggle-form');
    
    // 从本地存储获取打卡项目和次数
    let savedItems = JSON.parse(localStorage.getItem('checkinItems')) || [];
    let savedCheckins = JSON.parse(localStorage.getItem('checkins')) || {};

    // 检查是否是首次使用
    if (!localStorage.getItem('hasShownTip')) {
        showFirstTimeTip();
    }

    // 显示首次使用提示
    function showFirstTimeTip() {
        const tip = document.createElement('div');
        tip.className = 'first-time-tip';
        tip.innerHTML = `
            <p>提示：点击项目名称可以显示清空次数和删除按钮</p>
            <button>知道了</button>
        `;
        document.body.appendChild(tip);

        tip.querySelector('button').addEventListener('click', () => {
            tip.remove();
            localStorage.setItem('hasShownTip', 'true');
        });
    }

    // 添加表单切换功能
    toggleFormBtn.addEventListener('click', function() {
        addItemForm.classList.toggle('hidden');
        if (!addItemForm.classList.contains('hidden')) {
            itemInput.focus();
        }
    });

    // 渲染打卡列表
    function renderCheckinList() {
        checkInList.innerHTML = savedItems.map(item => {
            const count = savedCheckins[item] || 0;
            return `
                <div class="checkin-item">
                    <div class="item-content">
                        <span class="item-name">${item}</span>
                        <span class="count">完成次数: ${count}</span>
                        <button class="checkin-btn" data-item="${item}">打卡 +1</button>
                        <div class="item-actions">
                            <button class="reset-btn" data-item="${item}">清空次数</button>
                            <button class="delete-btn" data-item="${item}">删除</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // 添加点击处理
        const items = document.querySelectorAll('.checkin-item');
        items.forEach(item => {
            const itemName = item.querySelector('.item-name');
            const itemActions = item.querySelector('.item-actions');
            const checkinBtn = item.querySelector('.checkin-btn');
            
            itemName.addEventListener('click', () => {
                // 隐藏所有其他项目的按钮并显示它们的打卡按钮
                document.querySelectorAll('.checkin-item').forEach(otherItem => {
                    const otherActions = otherItem.querySelector('.item-actions');
                    const otherCheckinBtn = otherItem.querySelector('.checkin-btn');
                    if (otherActions !== itemActions) {
                        otherActions.classList.remove('show');
                        otherCheckinBtn.classList.remove('hide');
                    }
                });
                // 切换当前项目的按钮显示状态
                itemActions.classList.toggle('show');
                checkinBtn.classList.toggle('hide');
            });
        });
    }

    // 添加新项目
    addItemForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const newItem = itemInput.value.trim();
        
        if (newItem && !savedItems.includes(newItem)) {
            savedItems.push(newItem);
            localStorage.setItem('checkinItems', JSON.stringify(savedItems));
            itemInput.value = '';
            renderCheckinList();
            showToast('添加成功！');
            addItemForm.classList.add('hidden'); // 添加成功后隐藏表单
        } else if (savedItems.includes(newItem)) {
            showToast('该项目已存在！');
        }
    });

    // 处理打卡和删除
    checkInList.addEventListener('click', function(e) {
        const item = e.target.dataset.item;
        
        if (e.target.classList.contains('checkin-btn')) {
            savedCheckins[item] = (savedCheckins[item] || 0) + 1;
            localStorage.setItem('checkins', JSON.stringify(savedCheckins));
            renderCheckinList();
            showToast(`${item} 打卡成功！`);
        }
        
        if (e.target.classList.contains('reset-btn')) {
            if (confirm(`确定要清空 "${item}" 的打卡次数吗？`)) {
                savedCheckins[item] = 0;
                localStorage.setItem('checkins', JSON.stringify(savedCheckins));
                renderCheckinList();
                showToast(`${item} 打卡次数已清空`);
            }
        }
        
        if (e.target.classList.contains('delete-btn')) {
            if (confirm(`确定要删除 "${item}" 吗？`)) {
                savedItems = savedItems.filter(i => i !== item);
                delete savedCheckins[item];
                localStorage.setItem('checkinItems', JSON.stringify(savedItems));
                localStorage.setItem('checkins', JSON.stringify(savedCheckins));
                renderCheckinList();
                showToast(`${item} 已删除`);
            }
        }
    });

    // 点击其他区域时隐藏所有操作按钮
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.item-name') && !e.target.closest('.item-actions')) {
            document.querySelectorAll('.checkin-item').forEach(item => {
                item.querySelector('.item-actions').classList.remove('show');
                item.querySelector('.checkin-btn').classList.remove('hide');
            });
        }
    });

    // 初始化渲染
    renderCheckinList();
});

// 显示提示信息
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 2000);
}