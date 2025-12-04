const filterHTML = `
<div class="filterOverlay">
    <div class="filter-panel">
        <div class="filterheader">Opening days</div>
        <section class="line">
            <label><input type="checkbox"> Every day</label>
            <label><input type="checkbox"> Open Now</label>
            <label><input type="checkbox"> Week day</label>
            <label><input type="checkbox"> 24 hours</label>
        </section>
        <div class="filterdays">Days</div>
        <div class="days">
            <button>Mon</button>
            <button>Tue</button>
            <button>Wed</button>
            <button>Thu</button>
            <button>Fri</button>
            <button>Sat</button>
            <button>Sun</button>
        </div>
        <div class="filteractions">
            <button class="clear-btn">Clear</button>
            <button class="apply-btn">Apply</button>
        </div>
    </div>
</div>
`;

const filterCSS = `
.filterOverlay { 
    display: none !important; 
    position: absolute; 
    top: calc(100% + 10px); 
    right: 0; 
    z-index: 99999; 
}
.filterOverlay.active { 
    display: block !important; 
}
.filter { 
    position: relative; 
    z-index: 100000; 
}
.filter-panel { 
    background: white; 
    border-radius: 15px; 
    padding: 20px; 
    width: 350px; 
    max-width: 90vw;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15); 
    border: 1px solid #e0e0e0; 
}
.filterheader { 
    font-size: 20px; 
    font-weight: bold; 
    color: #1a9b8e; 
    text-align: center; 
    padding-bottom: 15px; 
    border-bottom: 2px solid #e0e0e0; 
    margin-bottom: 20px; 
}
.line { 
    display: grid; 
    grid-template-columns: 1fr 1fr; 
    gap: 12px; 
    margin-bottom: 20px; 
}
.line label { 
    display: flex; 
    align-items: center; 
    gap: 8px; 
    font-size: 13px; 
    color: #333; 
    cursor: pointer; 
}
.line input[type="checkbox"] { 
    width: 16px; 
    height: 16px; 
    cursor: pointer; 
    flex-shrink: 0; 
}
.filterdays { 
    font-size: 18px; 
    font-weight: bold; 
    color: #1a9b8e; 
    margin-bottom: 12px; 
    padding-bottom: 12px; 
    border-bottom: 2px solid #e0e0e0; 
    text-align: left; 
}
.days { 
    display: grid; 
    grid-template-columns: repeat(3, 1fr); 
    gap: 8px; 
    margin-bottom: 20px; 
}
.days button { 
    padding: 8px; 
    border: 2px solid #1a9b8e; 
    border-radius: 8px; 
    background: white; 
    color: #1a9b8e; 
    font-weight: 600; 
    font-size: 14px; 
    cursor: pointer; 
    transition: all 0.3s; 
}
.days button:hover, .days button.active { 
    background: #1a9b8e; 
    color: white; 
}
.filteractions { 
    display: flex; 
    gap: 10px; 
    justify-content: flex-end; 
    flex-wrap: wrap; 
}
.filteractions button { 
    padding: 8px 20px; 
    border-radius: 20px; 
    font-size: 14px; 
    font-weight: 600; 
    cursor: pointer; 
    transition: all 0.3s; 
}
.clear-btn { 
    background: white; 
    border: 2px solid #1a9b8e; 
    color: #1a9b8e; 
}
.clear-btn:hover { 
    background: #f0f0f0; 
}
.apply-btn { 
    background: #1a9b8e; 
    border: 2px solid #1a9b8e; 
    color: white; 
}
.apply-btn:hover { 
    background: #0d6b61; 
    border-color: #0d6b61; 
}
`;

const style = document.createElement('style');
style.textContent = filterCSS;
document.head.appendChild(style);

document.querySelector('.filter').insertAdjacentHTML('beforeend', filterHTML);

let filterIcon = document.querySelector('.filter .material-icons');
let filterBox = document.querySelector('.filterOverlay');
let applyButton = document.querySelector('.apply-btn');
let clearButton = document.querySelector('.clear-btn');
let dayButtons = document.querySelectorAll('.days button');
let checkboxes = document.querySelectorAll('.line input[type="checkbox"]');

filterIcon.onclick = function (e) {
    e.stopPropagation();
    filterBox.classList.toggle('active');
};

// ปิด filter เมื่อคลิกนอก popup
document.addEventListener('click', function(e) {
    if (!filterBox.contains(e.target) && !filterIcon.contains(e.target)) {
        filterBox.classList.remove('active');
    }
});

applyButton.onclick = function () {
    let selected = { openingDays: [], days: [] };
    for (let i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].checked) {
            selected.openingDays.push(checkboxes[i].parentElement.textContent.trim());
        }
    }
    for (let i = 0; i < dayButtons.length; i++) {
        if (dayButtons[i].classList.contains('active')) {
            selected.days.push(dayButtons[i].textContent);
        }
    }
    console.log('คุณเลือก:', selected);
    alert('Opening Days: ' + selected.openingDays.join(', ') + '\nDays: ' + selected.days.join(', '));
    filterBox.classList.remove('active');
};

clearButton.onclick = function () {
    for (let i = 0; i < checkboxes.length; i++) {
        checkboxes[i].checked = false;
    }
    for (let i = 0; i < dayButtons.length; i++) {
        dayButtons[i].classList.remove('active');
    }
};

for (let i = 0; i < dayButtons.length; i++) {
    dayButtons[i].onclick = function () {
        this.classList.toggle('active');
    };
}
