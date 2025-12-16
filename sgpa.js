const MIN_CREDITS = 1;
const MAX_CREDITS = 10;

const sgpaForm = document.getElementById('sgpa-form');
const subjectsContainer = document.getElementById('subjects-container');
const addSubjectBtn = document.getElementById('add-subject');

const gradeOptions = [
    { label: 'A+', value: 10 },
    { label: 'A', value: 9 },
    { label: 'B+', value: 8 },
    { label: 'B', value: 7 },
    { label: 'C+', value: 6 },
    { label: 'C', value: 5 },
    { label: 'D', value: 4 },
    { label: 'F', value: 0 }
];

function formatSubjectLabel(n) {
    return `Subject ${n}`;
}

function buildGradeSelect(name) {
    const select = document.createElement('select');
    select.name = name;
    select.required = true;

    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.disabled = true;
    placeholder.selected = true;
    placeholder.hidden = true;
    placeholder.textContent = 'Grade';
    select.appendChild(placeholder);

    gradeOptions.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt.value;
        option.textContent = opt.label;
        select.appendChild(option);
    });
    return select;
}

function createSubjectRow(index) {
    const row = document.createElement('div');
    row.className = 'subject-row';

    const subjectInput = document.createElement('input');
    subjectInput.type = 'text';
    subjectInput.name = `subject${index}`;
    subjectInput.placeholder = formatSubjectLabel(index);
    subjectInput.required = true;

    const creditInput = document.createElement('input');
    creditInput.type = 'number';
    creditInput.name = `credits${index}`;
    creditInput.placeholder = 'Credits';
    creditInput.min = String(MIN_CREDITS);
    creditInput.max = String(MAX_CREDITS);
    creditInput.required = true;

    const gradeSelect = buildGradeSelect(`grade${index}`);

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'remove-row danger-btn';
    removeBtn.setAttribute('aria-label', `Remove ${formatSubjectLabel(index)}`);
    removeBtn.textContent = '🗑️';

    row.appendChild(subjectInput);
    row.appendChild(creditInput);
    row.appendChild(gradeSelect);
    row.appendChild(removeBtn);
    return row;
}

function addSubjectRow() {
    const subjectCount = subjectsContainer.getElementsByClassName('subject-row').length + 1;
    subjectsContainer.appendChild(createSubjectRow(subjectCount));
}

function resetToSingleRow() {
    subjectsContainer.innerHTML = '';
    addSubjectRow();
}

addSubjectBtn.addEventListener('click', addSubjectRow);

subjectsContainer.addEventListener('click', (event) => {
    if (!(event.target instanceof HTMLElement)) return;
    if (event.target.classList.contains('remove-row')) {
        const rows = subjectsContainer.getElementsByClassName('subject-row');
        if (rows.length > 1) {
            event.target.parentElement?.remove();
        }
    }
});

sgpaForm.addEventListener('reset', () => {
    setTimeout(resetToSingleRow, 0);
});

sgpaForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const subjectRows = subjectsContainer.getElementsByClassName('subject-row');
    let totalCredits = 0;
    let totalPoints = 0;

    for (const row of subjectRows) {
        const creditInput = row.querySelector('input[type="number"]');
        const gradeSelect = row.querySelector('select');

        const credits = parseFloat(creditInput.value);
        const grade = parseFloat(gradeSelect.value);

        if (!Number.isFinite(credits) || credits < MIN_CREDITS || credits > MAX_CREDITS) {
            creditInput.focus();
            alert(`Credits must be between ${MIN_CREDITS} and ${MAX_CREDITS}.`);
            return;
        }
        if (!Number.isFinite(grade)) {
            gradeSelect.focus();
            alert('Please select a grade.');
            return;
        }

        totalCredits += credits;
        totalPoints += grade * credits;
    }

    if (totalCredits === 0) {
        alert('Total credits cannot be zero.');
        return;
    }

    const sgpa = totalPoints / totalCredits;
    alert(`Your SGPA is ${sgpa.toFixed(2)}.`);
});

// Initialize with one row
resetToSingleRow();

