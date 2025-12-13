let selectedDays = [];
let currentPage = 'home';

function thaiDayToNumber(thaiDay) {
    const dayMap = {
        'อาทิตย์': 0,
        'จันทร์': 1,
        'อังคาร': 2,
        'พุธ': 3,
        'พฤหัสบดี': 4,
        'ศุกร์': 5,
        'เสาร์': 6
    };
    return dayMap[thaiDay];
}

function engDayToNumber(engDay) {
    const dayMap = {
        'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3,
        'Thu': 4, 'Fri': 5, 'Sat': 6
    };
    return dayMap[engDay];
}

function getDaysInRange(startDay, endDay) {
    const start = thaiDayToNumber(startDay);
    const end = thaiDayToNumber(endDay);
    const days = [];
    
    if (start === undefined || end === undefined) {
        return days;
    }
    
    if (start <= end) {
        for (let i = start; i <= end; i++) {
            days.push(i);
        }
    } else {
        for (let i = start; i <= 6; i++) {
            days.push(i);
        }
        for (let i = 0; i <= end; i++) {
            days.push(i);
        }
    }
    
    return days;
}

function parseOpeningHours(openingHours) {
    if (!openingHours || openingHours.trim() === '') {
        return [];
    }
    
    const lines = openingHours.split('\n').filter(line => line.trim());
    const schedules = [];
    
    lines.forEach(line => {
        const match = line.match(/(อาทิตย์|จันทร์|อังคาร|พุธ|พฤหัสบดี|ศุกร์|เสาร์)(?:-(อาทิตย์|จันทร์|อังคาร|พุธ|พฤหัสบดี|ศุกร์|เสาร์))?\s*(.+)/);
        
        if (match) {
            const startDay = match[1];
            const endDay = match[2] || startDay;
            const hoursText = match[3].trim();
            
            const days = getDaysInRange(startDay, endDay);
            
            schedules.push({
                days: days,
                hours: hoursText,
                originalLine: line
            });
        }
    });
    
    return schedules;
}

function checkOpeningHours(openingHours, filters) {
    if (!openingHours || openingHours.trim() === '') {
        return false;
    }
    
    const schedules = parseOpeningHours(openingHours);
    
    if (schedules.length === 0) {
        return false;
    }
    
    const allOpenDays = new Set();
    schedules.forEach(schedule => {
        schedule.days.forEach(day => allOpenDays.add(day));
    });
    
    if (filters.everyday) {
        if (allOpenDays.size !== 7) {
            return false;
        }
    }
    
    if (filters.hours24) {
        const has24Hours = schedules.some(s => {
            return s.hours.includes('24 ชั่วโมง') || s.hours.includes('24');
        });
        
        if (!has24Hours) {
            return false;
        }
    }
    
    if (filters.weekday) {
        const weekDays = [1, 2, 3, 4, 5];
        const opensAllWeekDays = weekDays.every(d => allOpenDays.has(d));
        
        if (!opensAllWeekDays) {
            return false;
        }
    }
    
    if (filters.opennow) {
        const now = new Date();
        const currentDayNum = now.getDay();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        
        let isOpenNow = false;
        
        for (const schedule of schedules) {
            if (schedule.days.includes(currentDayNum)) {
                const timeMatch = schedule.hours.match(/(\d{1,2}):?(\d{2})?\s*-\s*(\d{1,2}):?(\d{2})?/);
                
                if (timeMatch) {
                    const openHour = parseInt(timeMatch[1]);
                    const openMin = parseInt(timeMatch[2] || '0');
                    const closeHour = parseInt(timeMatch[3]);
                    const closeMin = parseInt(timeMatch[4] || '0');
                    
                    const openTime = openHour * 60 + openMin;
                    let closeTime = closeHour * 60 + closeMin;
                    
                    if (closeHour === 0 && closeMin === 0) {
                        closeTime = 24 * 60;
                    }
                    
                    if (currentMinutes >= openTime && currentMinutes <= closeTime) {
                        isOpenNow = true;
                        break;
                    }
                } else if (schedule.hours.includes('24') || schedule.hours.includes('ตลอด')) {
                    isOpenNow = true;
                    break;
                }
            }
        }
        
        if (!isOpenNow) {
            return false;
        }
    }
    
    if (filters.selectedDays && filters.selectedDays.length > 0) {
        const selectedDayNumbers = filters.selectedDays.map(engDayToNumber).filter(n => n !== undefined);
        
        const hasSelectedDay = selectedDayNumbers.some(dayNum => allOpenDays.has(dayNum));
        
        if (!hasSelectedDay) {
            return false;
        }
    }
    
    return true;
}

function setupOpeningDaysFilter(page = 'home') {
    currentPage = page;
    
    const filterBtn = document.getElementById('openingFilterBtn');
    const panel = document.getElementById('openingDaysPanel');
    
    if (!filterBtn || !panel) {
        console.warn('Opening filter: button or panel not found');
        return;
    }

    if (filterBtn.dataset.openingFilterBound === '1') {
        return;
    }
    filterBtn.dataset.openingFilterBound = '1';

    const getPanelWidth = () => {
        const maxW = Math.max(240, window.innerWidth - 32);
        return window.innerWidth <= 768 ? Math.min(280, maxW) : 320;
    };

    const positionPanel = () => {
        const btnRect = filterBtn.getBoundingClientRect();
        const panelWidth = getPanelWidth();

        const inner = panel.querySelector('.filter-panel-inner');
        if (inner) {
            inner.style.width = `${panelWidth}px`;
        }

        panel.style.position = 'fixed';

        const panelHeight = panel.offsetHeight || inner?.offsetHeight || 360;

        const margin = 12;
        let top = btnRect.bottom + 8;
        let left = btnRect.right - panelWidth;

        left = Math.max(margin, Math.min(left, window.innerWidth - panelWidth - margin));

        if (top + panelHeight + margin > window.innerHeight) {
            top = btnRect.top - panelHeight - 8;
        }

        top = Math.max(margin, Math.min(top, window.innerHeight - panelHeight - margin));

        panel.style.top = `${top}px`;
        panel.style.left = `${left}px`;
        panel.style.zIndex = '9999';
    };

    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');

    filterBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = panel.classList.contains('open');
        
        if (isOpen) {
            panel.classList.remove('open');
            panel.setAttribute('aria-hidden', 'true');
        } else {
            panel.classList.add('open');
            panel.setAttribute('aria-hidden', 'false');

            positionPanel();
        }
    });

    let rafId = null;
    const scheduleReposition = () => {
        if (!panel.classList.contains('open')) return;
        if (rafId) return;
        rafId = requestAnimationFrame(() => {
            rafId = null;
            positionPanel();
        });
    };

    window.addEventListener('resize', scheduleReposition);
    window.addEventListener('scroll', scheduleReposition, true);

    document.addEventListener('click', (e) => {
        if (!panel.contains(e.target) && !filterBtn.contains(e.target)) {
            panel.classList.remove('open');
            panel.setAttribute('aria-hidden', 'true');
        }
    });

    const dayChips = panel.querySelectorAll('.day-chip');
    dayChips.forEach(chip => {
        chip.addEventListener('click', () => {
            chip.classList.toggle('active');
            
            const day = chip.textContent.trim();
            if (chip.classList.contains('active')) {
                if (!selectedDays.includes(day)) {
                    selectedDays.push(day);
                }
            } else {
                selectedDays = selectedDays.filter(d => d !== day);
            }
        });
    });

    const clearBtn = panel.querySelector('.filter-clear');
    if (clearBtn) {
        clearBtn.addEventListener('click', async () => {
            panel.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                cb.checked = false;
            });
            
            panel.querySelectorAll('.day-chip').forEach(chip => {
                chip.classList.remove('active');
            });
            
            selectedDays = [];
            
            if (currentPage === 'home' && typeof fetchPlaces === 'function') {
                await fetchPlaces();
            } else if (currentPage === 'rank' && typeof fetchRankPlaces === 'function') {
                await fetchRankPlaces();
            }
            
            panel.classList.remove('open');
            panel.setAttribute('aria-hidden', 'true');
        });
    }

    const applyBtn = panel.querySelector('.filter-apply');
    if (applyBtn) {
        applyBtn.addEventListener('click', async () => {
            await applyOpeningFilter();
            panel.classList.remove('open');
            panel.setAttribute('aria-hidden', 'true');
        });
    }
}

async function applyOpeningFilter() {
    try {
        const panel = document.getElementById('openingDaysPanel');
        if (!panel) return;

        const everyday = panel.querySelector('input[name="everyday"]')?.checked || false;
        const opennow = panel.querySelector('input[name="opennow"]')?.checked || false;
        const weekday = panel.querySelector('input[name="weekday"]')?.checked || false;
        const hours24 = panel.querySelector('input[name="24hour"]')?.checked || false;

        if (window.combinedFilter) {
            window.combinedFilter.setOpeningFilters(everyday, opennow, weekday, hours24, selectedDays);
            window.combinedFilter.setCurrentPage(currentPage);
            await window.combinedFilter.applyCombinedFilters();
        } else {
            console.error('Combined filter system not available');
        }

    } catch (error) {
        console.error('Error applying opening filter:', error);
        alert('เกิดข้อผิดพลาดในการกรองข้อมูล: ' + error.message);
    }
}

async function clearOpeningFilter() {
    selectedDays = [];
    
    const panel = document.getElementById('openingDaysPanel');
    if (!panel) return;
    
    panel.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.checked = false;
    });
    
    panel.querySelectorAll('.day-chip').forEach(chip => {
        chip.classList.remove('active');
    });
    

    if (window.combinedFilter) {
        window.combinedFilter.setOpeningFilters(false, false, false, false, []);
        await window.combinedFilter.applyCombinedFilters();
    } else {
        if (currentPage === 'home' && typeof fetchPlaces === 'function') {
            await fetchPlaces();
        } else if (currentPage === 'rank' && typeof fetchRankPlaces === 'function') {
            await fetchRankPlaces();
        }
    }
}

window.setupOpeningDaysFilter = setupOpeningDaysFilter;
window.applyOpeningFilter = applyOpeningFilter;
window.clearOpeningFilter = clearOpeningFilter;
window.checkOpeningHours = checkOpeningHours;

window.setOpeningFilterPage = (page) => {
    currentPage = page;
};