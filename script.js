document.addEventListener('DOMContentLoaded', () => {
    //!!! تأكد من أن هذا هو رابط الـ CSV الصحيح من Google Sheet!!!
    const SPREADSHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRLuh30Cn6quND3xxV2YLaCGroN-_kT3vssQzRmb-qQEulAce9kF2udC6yX_b1UVZYFA-8nKgIUAYqi/pub?output=csv';

    const listElement = document.getElementById('opportunities-list');
    const loadingElement = document.getElementById('loading');
    const searchInput = document.getElementById('searchInput');
    const typeFilter = document.getElementById('typeFilter');
    const cityFilter = document.getElementById('cityFilter');
    
    let allOpportunities =;

    // دالة لجلب البيانات من Google Sheet
    async function fetchOpportunities() {
        try {
            const response = await fetch(SPREADSHEET_URL);
            const csvText = await response.text();
            
            const rows = csvText.split(/\r?\n/).slice(1);
            allOpportunities = rows.map(row => {
                const columns = row.split(',');
                  return {
                        title: columns[1]?.trim().replace(/"/g, '') || '',       // 0 -> 1
                        organizer: columns[2]?.trim().replace(/"/g, '') || '',   // 1 -> 2
                        description: columns[3]?.trim().replace(/"/g, '') || '',// 2 -> 3
                        deadline: columns[4]?.trim().replace(/"/g, '') || '',   // 3 -> 4
                        type: columns[5]?.trim().replace(/"/g, '') || '',       // 4 -> 5
                        city: columns[6]?.trim().replace(/"/g, '') || '',       // 5 -> 6
                        link: columns[7]?.trim().replace(/"/g, '') || '',       // 6 -> 7
                        status: columns[8]?.trim().replace(/"/g, '') || ''      // 7 -> 8
            };

            }).filter(opp => opp.approval_status === 'approved');

            displayOpportunities(allOpportunities);
        } catch (error) {
            console.error('Error fetching data:', error);
            listElement.innerHTML = '<p>عفواً، حدث خطأ أثناء تحميل البيانات. تأكد من أن رابط الشيت صحيح.</p>';
        } finally {
            loadingElement.style.display = 'none';
        }
    }

    // دالة لعرض الفرص في الصفحة (تم تحديثها لإضافة الأيقونات)
    function displayOpportunities(opportunities) {
        listElement.innerHTML = '';
        if (opportunities.length === 0) {
            listElement.innerHTML = '<p>لا توجد فرص معتمدة حاليًا. تابعنا قريبًا!</p>';
            return;
        }

        opportunities.forEach(opp => {
            const card = document.createElement('div');
            card.className = 'opportunity-card';

            let correctedLink = opp.link;
            if (correctedLink &&!correctedLink.startsWith('http://') &&!correctedLink.startsWith('https://')) {
                correctedLink = 'https://' + correctedLink;
            }

            card.innerHTML = `
                <h2>${opp.title}</h2>
                <div class="meta">
                    <div class="meta-item"><i class="fas fa-building"></i> <span>${opp.organizer}</span></div>
                    <div class="meta-item"><i class="fas fa-tag"></i> <span>${opp.type}</span></div>
                    <div class="meta-item"><i class="fas fa-map-marker-alt"></i> <span>${opp.city}</span></div>
                    <div class="meta-item"><i class="fas fa-calendar-alt"></i> <span>آخر معاد: ${opp.deadline}</span></div>
                </div>
                <p>${opp.description.substring(0, 150)}...</p>
                <a href="${correctedLink}" target="_blank" class="cta-button">التقديم والتفاصيل</a>
            `;
            listElement.appendChild(card);
        });
    }

    // دالة لفلترة النتائج
    function filterAndDisplay() {
        let filtered = allOpportunities;

        const searchTerm = searchInput.value.toLowerCase();
        if (searchTerm) {
            filtered = filtered.filter(opp => 
                opp.title.toLowerCase().includes(searchTerm) ||
                opp.description.toLowerCase().includes(searchTerm)
            );
        }

        const typeValue = typeFilter.value;
        if (typeValue) {
            filtered = filtered.filter(opp => opp.type === typeValue);
        }

        const cityValue = cityFilter.value;
        if (cityValue) {
            filtered = filtered.filter(opp => opp.city === cityValue);
        }

        displayOpportunities(filtered);
    }

    // ربط الفلاتر بالأحداث
    searchInput.addEventListener('input', filterAndDisplay);
    typeFilter.addEventListener('change', filterAndDisplay);
    cityFilter.addEventListener('change', filterAndDisplay);

    // بداية تحميل البيانات
    fetchOpportunities();
});


