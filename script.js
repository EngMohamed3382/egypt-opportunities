document.addEventListener('DOMContentLoaded', () => {
    //!!! تأكد من أن هذا هو رابط الـ CSV الصحيح من Google Sheet!!!
    const SPREADSHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRLuh30Cn6quND3xxV2YLaCGroN-_kT3vssQzRmb-qQEulAce9kF2udC6yX_b1UVZYFA-8nKgIUAYqi/pub?output=csv';

    const listElement = document.getElementById('opportunities-list');
    const loadingElement = document.getElementById('loading');
    const searchInput = document.getElementById('searchInput');
    const typeFilter = document.getElementById('typeFilter');
    const cityFilter = document.getElementById('cityFilter');
    
    let allOpportunities = [];

    // دالة لجلب البيانات من Google Sheet
    async function fetchOpportunities() {
        try {
            const response = await fetch(SPREADSHEET_URL);
            const csvText = await response.text();
            
            const rows = csvText.split(/\r?\n/).slice(1);
            allOpportunities = rows.map(row => {
                const columns = row.split(',');
                // تم إضافة عمود الموافقة الجديد
                return {
                    title: columns[1]?.trim().replace(/"/g, '') || '',
                    organizer: columns[2]?.trim().replace(/"/g, '') || '',
                    description: columns[3]?.trim().replace(/"/g, '') || '',
                    deadline: columns[4]?.trim().replace(/"/g, '') || '',
                    type: columns[5]?.trim().replace(/"/g, '') || '',
                    city: columns[6]?.trim().replace(/"/g, '') || '',
                    link: columns[7]?.trim().replace(/"/g, '') || '',
                    status: columns[8]?.trim().replace(/"/g, '') || '',
                    approval_status: columns[9]?.trim().replace(/"/g, '') || ''
                };
            }).filter(opp => opp.approval_status === 'approved'); // <-- تم تعديل الفلتر هنا

            displayOpportunities(allOpportunities);
        } catch (error) {
            console.error('Error fetching data:', error);
            listElement.innerHTML = '<p>عفواً، حدث خطأ أثناء تحميل البيانات. تأكد من أن رابط الشيت صحيح.</p>';
        } finally {
            loadingElement.style.display = 'none';
        }
    }

    // دالة لعرض الفرص في الصفحة
    function displayOpportunities(opportunities) {
        listElement.innerHTML = '';
        if (opportunities.length === 0) {
            listElement.innerHTML = '<p>لا توجد نتائج حاليًا. حاول مرة أخرى لاحقًا.</p>';
            return;
        }

        opportunities.forEach(opp => {
            const card = document.createElement('div');
            card.className = 'opportunity-card';
            card.innerHTML = `
                <h2>${opp.title}</h2>
                <div class="meta">
                    <span><strong>الجهة:</strong> ${opp.organizer}</span>
                    <span><strong>النوع:</strong> ${opp.type}</span>
                    <span><strong>المدينة:</strong> ${opp.city}</span>
                    <span><strong>آخر معاد:</strong> ${opp.deadline}</span>
                </div>
                <p>${opp.description.substring(0, 150)}...</p>
                <a href="${opp.link}" target="_blank">التقديم والتفاصيل</a>
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



