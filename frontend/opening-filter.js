// ========== Opening Days Filter Handler ==========

let selectedDays = [];
let currentPage = 'home';

function setCurrentPage(page) {
  currentPage = page;
}

window.setOpeningFilterPage = setCurrentPage;

// ========== Helper Functions ==========

// แปลงวันภาษาไทยเป็นตัวเลข (0=อาทิตย์, 1=จันทร์, ... 6=เสาร์)
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

// แปลงตัวเลขกลับเป็นวันภาษาไทย
function numberToThaiDay(num) {
    const days = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
    return days[num];
}

// แปลง Mon, Tue, ... เป็นตัวเลข
function engDayToNumber(engDay) {
    const dayMap = {
        'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3,
        'Thu': 4, 'Fri': 5, 'Sat': 6
    };
    return dayMap[engDay];
}

// ดึงวันทั้งหมดในช่วง เช่น อาทิตย์-ศุกร์ = [0,1,2,3,4,5]
function getDaysInRange(startDay, endDay) {
    const start = thaiDayToNumber(startDay);
    const end = thaiDayToNumber(endDay);
    const days = [];
    
    if (start === undefined || end === undefined) {
        return days;
    }
    
    // ถ้า start <= end เช่น จันทร์-ศุกร์ (1-5)
    if (start <= end) {
        for (let i = start; i <= end; i++) {
            days.push(i);
        }
    } else {
        // ถ้า start > end เช่น ศุกร์-อาทิตย์ (5-0) = ศุกร์,เสาร์,อาทิตย์
        for (let i = start; i <= 6; i++) {
            days.push(i);
        }
        for (let i = 0; i <= end; i++) {
            days.push(i);
        }
    }
    
    return days;
}

// แปลง opening_hours ให้เป็น array ของ {days: [0,1,2,...], hours: "07:00-18:00"}
function parseOpeningHours(openingHours) {
    if (!openingHours || openingHours.trim() === '') {
        return [];
    }
    
    const lines = openingHours.split('\n').filter(line => line.trim());
    const schedules = [];
    
    lines.forEach(line => {
        // รูปแบบ: "อาทิตย์-ศุกร์ 07:00-18:00" หรือ "เสาร์ 09:00-18:00"
        const match = line.match(/(อาทิตย์|จันทร์|อังคาร|พุธ|พฤหัสบดี|ศุกร์|เสาร์)(?:-(อาทิตย์|จันทร์|อังคาร|พุธ|พฤหัสบดี|ศุกร์|เสาร์))?\s*(.+)/);
        
        if (match) {
            const startDay = match[1];
            const endDay = match[2] || startDay; // ถ้าไม่มี - ให้ใช้วันเดียว
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

// ตรวจสอบว่าสถานที่เปิดตามเงื่อนไขที่เลือก
function checkOpeningHours(openingHours, filters) {
    if (!openingHours || openingHours.trim() === '') {
        return false;
    }
    
    const schedules = parseOpeningHours(openingHours);
    
    if (schedules.length === 0) {
        return false;
    }
    
    // รวมวันทั้งหมดที่เปิด
    const allOpenDays = new Set();
    schedules.forEach(schedule => {
        schedule.days.forEach(day => allOpenDays.add(day));
    });
    
    // =============== Every day ===============
    if (filters.everyday) {
        // ต้องเปิดครบทั้ง 7 วัน (0-6)
        if (allOpenDays.size !== 7) {
            return false;
        }
    }
    
    // =============== 24 hours ===============
    if (filters.hours24) {
        // ต้องมีคำว่า "24 ชั่วโมง" ในข้อความ
        const has24Hours = schedules.some(s => {
            return s.hours.includes('24 ชั่วโมง') 
                  
        });
        
        if (!has24Hours) {
            return false;
        }
    }
    
    // =============== Week day (วันธรรมดา = เสาร์-อาทิตย์) ===============
    if (filters.weekday) {
        // weekday = เปิดวันเสาร์(6) หรือ อาทิตย์(0)
        const hasWeekend = allOpenDays.has(6) || allOpenDays.has(0);
        
        if (!hasWeekend) {
            return false;
        }
    }
    
    // =============== Open Now ===============
    if (filters.opennow) {
        const now = new Date();
        const currentDayNum = now.getDay(); // 0=อาทิตย์, 1=จันทร์, ...
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        
        let isOpenNow = false;
        
        // หาว่าวันนี้เปิดไหม และเวลาตรงไหม
        for (const schedule of schedules) {
            if (schedule.days.includes(currentDayNum)) {
                // ตรวจสอบเวลา
                const timeMatch = schedule.hours.match(/(\d{1,2}):?(\d{2})?\s*-\s*(\d{1,2}):?(\d{2})?/);
                
                if (timeMatch) {
                    const openHour = parseInt(timeMatch[1]);
                    const openMin = parseInt(timeMatch[2] || '0');
                    const closeHour = parseInt(timeMatch[3]);
                    const closeMin = parseInt(timeMatch[4] || '0');
                    
                    const openTime = openHour * 60 + openMin;
                    let closeTime = closeHour * 60 + closeMin;
                    
                    // ถ้าปิดเป็น 00:00 หมายถึงเที่ยงคืน (24:00)
                    if (closeHour === 0 && closeMin === 0) {
                        closeTime = 24 * 60;
                    }
                    
                    if (currentMinutes >= openTime && currentMinutes <= closeTime) {
                        isOpenNow = true;
                        break;
                    }
                } else if (schedule.hours.includes('24') || schedule.hours.includes('ตลอด')) {
                    // เปิด 24 ชั่วโมง
                    isOpenNow = true;
                    break;
                }
            }
        }
        
        if (!isOpenNow) {
            return false;
        }
    }
    
    // =============== Selected Days ===============
    if (filters.selectedDays && filters.selectedDays.length > 0) {
        const selectedDayNumbers = filters.selectedDays.map(engDayToNumber).filter(n => n !== undefined);
        
        // ต้องเปิดอย่างน้อย 1 วันที่เลือก
        const hasSelectedDay = selectedDayNumbers.some(dayNum => allOpenDays.has(dayNum));
        
        if (!hasSelectedDay) {
            return false;
        }
    }
    
    return true;
}

// ========== UI Setup ==========

function setupOpeningDaysFilter(page = 'home') {
  currentPage = page;
  
  const filterBtn = document.getElementById('categoryBtn');
  const panel = document.getElementById('openingDaysPanel');
  
  if (!filterBtn || !panel) {
    console.warn('Opening filter: button or panel not found');
    return;
  }

  console.log(`Opening filter setup for ${page} page`);

  // เปิด/ปิด panel
  filterBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isHidden = panel.getAttribute('aria-hidden') === 'true';
    panel.setAttribute('aria-hidden', isHidden ? 'false' : 'true');
  });

  // ปิด panel เมื่อคลิกข้างนอก
  document.addEventListener('click', (e) => {
    if (!panel.contains(e.target) && !filterBtn.contains(e.target)) {
      panel.setAttribute('aria-hidden', 'true');
    }
  });

  // Day chips toggle
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
      
      console.log('Selected days:', selectedDays);
    });
  });

  // ปุ่ม Clear
  const clearBtn = panel.querySelector('.filter-clear');
  if (clearBtn) {
    clearBtn.addEventListener('click', async () => {
      // ยกเลิก checkbox ทั้งหมด
      panel.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.checked = false;
      });
      
      // ยกเลิก day chips
      panel.querySelectorAll('.day-chip').forEach(chip => {
        chip.classList.remove('active');
      });
      
      selectedDays = [];
      console.log('Opening filter cleared');
      
      // โหลดข้อมูลปกติกลับมา
      if (currentPage === 'home' && typeof fetchPlaces === 'function') {
        await fetchPlaces();
      } else if (currentPage === 'rank' && typeof fetchRankPlaces === 'function') {
        await fetchRankPlaces();
      }
      
      // ปิด panel
      panel.setAttribute('aria-hidden', 'true');
    });
  }

  // ปุ่ม Apply
  const applyBtn = panel.querySelector('.filter-apply');
  if (applyBtn) {
    applyBtn.addEventListener('click', async () => {
      await applyOpeningFilter();
      panel.setAttribute('aria-hidden', 'true');
    });
  }
}

// ========== Apply Filter ==========

async function applyOpeningFilter() {
  try {
    const panel = document.getElementById('openingDaysPanel');
    if (!panel) return;

    // เก็บค่า checkbox
    const everyday = panel.querySelector('input[name="everyday"]')?.checked || false;
    const opennow = panel.querySelector('input[name="opennow"]')?.checked || false;
    const weekday = panel.querySelector('input[name="weekday"]')?.checked || false;
    const hours24 = panel.querySelector('input[name="24hour"]')?.checked || false;

    console.log('=== Applying Opening Filter ===');
    console.log('Everyday:', everyday);
    console.log('Open Now:', opennow);
    console.log('Weekday:', weekday);
    console.log('24 Hours:', hours24);
    console.log('Selected Days:', selectedDays);
    console.log('Page:', currentPage);

    // ใช้ Combined Filter System
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

// ========== Clear Filter ==========

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
  
  console.log('Opening filter cleared');
  
  // ล้าง opening filter ใน combined system
  if (window.combinedFilter) {
    window.combinedFilter.setOpeningFilters(false, false, false, false, []);
    await window.combinedFilter.applyCombinedFilters();
  } else {
    // Fallback: โหลดข้อมูลปกติ
    if (currentPage === 'home' && typeof fetchPlaces === 'function') {
      await fetchPlaces();
    } else if (currentPage === 'rank' && typeof fetchRankPlaces === 'function') {
      await fetchRankPlaces();
    }
  }
}

// ========== Export Functions ==========

window.setupOpeningDaysFilter = setupOpeningDaysFilter;
window.applyOpeningFilter = applyOpeningFilter;
window.clearOpeningFilter = clearOpeningFilter;
window.checkOpeningHours = checkOpeningHours; // Export เพื่อให้ combined-filter ใช้ได้
