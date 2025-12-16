const MIN_SGPA = 1.0;
const MAX_SGPA = 10.0;
const MIN_CREDITS = 1;

const form = document.getElementById('cgpa-form');
const container = document.getElementById('semesters-container');
const addSemesterBtn = document.getElementById('add-semester');

function format(n) {
    const v = n % 100;
    if (v > 10 && v < 14) return `${n}th`;
    switch (n % 10) {
        case 1: return `${n}st`;
        case 2: return `${n}nd`;
        case 3: return `${n}rd`;
        default: return `${n}th`;
    }
}

function createSemesterRow(index) {
    const ordinal = format(index);
    const row = document.createElement('div');
    row.className = 'semester-row';
    row.innerHTML = `
        <input class="sgpa-input" type="number" name="sgpa${index}" placeholder="SGPA in ${ordinal} semester" min="${MIN_SGPA}" max="${MAX_SGPA}" step="0.01" required>
        <input class="credits-input" type="number" name="credits${index}" placeholder="Credits in ${ordinal} semester" min="${MIN_CREDITS}" step="1" required>
        <button type="button" class="remove-row danger-btn" aria-label="Remove semester ${index}">🗑️</button>
    `;
    return row;
}

function addSemesterRow() {
    const semesterCount = container.getElementsByClassName('semester-row').length + 1;
    container.appendChild(createSemesterRow(semesterCount));
}

function clearToSingleRow() {
    container.innerHTML = '';
    container.appendChild(createSemesterRow(1));
}

addSemesterBtn.addEventListener('click', addSemesterRow);

container.addEventListener('click', (event) => {
    if (!(event.target instanceof HTMLElement)) return;
    if (event.target.classList.contains('remove-row')) {
        const rows = container.getElementsByClassName('semester-row');
        if (rows.length > 1) {
            event.target.parentElement?.remove();
        }
    }
});

form.addEventListener('reset', () => {
    setTimeout(clearToSingleRow, 0);
});

form.addEventListener('submit', (event) => {
    event.preventDefault();

    const semesterRows = container.getElementsByClassName('semester-row');
    let totalGradePoints = 0;
    let totalCredits = 0;

    for (const row of semesterRows) {
        const sgpaInput = row.querySelector('.sgpa-input');
        const creditsInput = row.querySelector('.credits-input');

        const sgpa = parseFloat(sgpaInput.value);
        const credits = parseInt(creditsInput.value, 10);

        if (!Number.isFinite(sgpa)) {
            sgpaInput.focus();
            alert('Please enter a numeric SGPA value.');
            return;
        }
        if (sgpa < MIN_SGPA || sgpa > MAX_SGPA) {
            sgpaInput.focus();
            alert(`SGPA must be between ${MIN_SGPA.toFixed(1)} and ${MAX_SGPA.toFixed(1)}.`);
            return;
        }
        if (!Number.isFinite(credits)) {
            creditsInput.focus();
            alert('Please enter a numeric credit value.');
            return;
        }
        if (credits < MIN_CREDITS) {
            creditsInput.focus();
            alert(`Credits must be at least ${MIN_CREDITS}.`);
            return;
        }

        totalGradePoints += sgpa * credits;
        totalCredits += credits;
    }

    if (totalCredits === 0) {
        alert('Total credits cannot be zero. Please add valid credit values.');
        return;
    }

    const cgpa = totalGradePoints / totalCredits;
    alert(`Your CGPA is ${cgpa.toFixed(2)}.`);
});

// Initialize with one semester row on load
clearToSingleRow();

