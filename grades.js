function getGradeBoundaries(X, D, S) {
    const bounds = [
        { grade: "A+", min: X + 1.5 * D, max: S },
        { grade: "A",  min: X + D,       max: X + 1.5 * D },
        { grade: "B+", min: X + 0.5 * D, max: X + D },
        { grade: "B",  min: X,           max: X + 0.5 * D },
        { grade: "C+", min: X - 0.5 * D, max: X },
        { grade: "C",  min: X - D,       max: X - 0.5 * D },
        { grade: "D",  min: X - 1.5 * D, max: X - D },
        { grade: "F",  min: 0,           max: X - 1.5 * D }
    ];
    bounds.forEach(b => {
        b.min = Math.max(0, b.min);
        b.max = Math.min(S, b.max);
    });
    return bounds;
}

function drawBellCurve(canvas, average, deviation, total, gradeBoundaries) {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const plotWidth = canvas.width - 80;
    const plotHeight = canvas.height - 80;

    ctx.strokeStyle = "#888";
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(40, canvas.height - 50);
    ctx.lineTo(canvas.width - 40, canvas.height - 50);
    ctx.moveTo(40, canvas.height - 50);
    ctx.lineTo(40, 30);
    ctx.stroke();

    function bell(x) {
        const z = (x - average) / deviation;
        return (1 / (deviation * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * z * z);
    }

    let maxY = 0;
    for (let x = 0; x <= total; x += total / 200) {
        maxY = Math.max(maxY, bell(x));
    }

    ctx.beginPath();
    ctx.moveTo(40, canvas.height - 50);
    for (let px = 0; px <= plotWidth; px++) {
        const marks = (px / plotWidth) * total;
        const y = bell(marks);
        const py = (canvas.height - 50) - (y / maxY) * plotHeight;
        ctx.lineTo(40 + px, py);
    }
    ctx.strokeStyle = "#2E7D32";
    ctx.lineWidth = 3;
    ctx.stroke();

    const colors = {
        "A+": "#007d79", "A": "#00b7d4",
        "B+": "#0043ce", "B": "#3f6ad8",
        "C+": "#f4777f", "C": "#f28c38",
        "D": "#e55c00", "F": "#a62639"
    };

    gradeBoundaries.forEach((b) => {
        const x1 = 40 + (b.min / total) * plotWidth;
        const x2 = 40 + (b.max / total) * plotWidth;
        ctx.fillStyle = colors[b.grade] + "33";
        ctx.beginPath();
        ctx.moveTo(x1, canvas.height - 50);
        for (let x = x1; x <= x2; x += 1) {
            const marks = ((x - 40) / plotWidth) * total;
            const y = bell(marks);
            const py = (canvas.height - 50) - (y / maxY) * plotHeight;
            ctx.lineTo(x, py);
        }
        ctx.lineTo(x2, canvas.height - 50);
        ctx.closePath();
        ctx.fill();
    });

    gradeBoundaries.forEach((b) => {
        if (b.min > 0.001 && b.min < total - 0.001) {
            const x = 40 + (b.min / total) * plotWidth;
            ctx.strokeStyle = "#bbb";
            ctx.beginPath();
            ctx.moveTo(x, 50);
            ctx.lineTo(x, canvas.height - 50);
            ctx.stroke();
        }
        const xLabel = 40 + ((b.min + b.max) / 2 / total) * plotWidth;
        ctx.fillStyle = colors[b.grade];
        ctx.font = "bold 15px Arial";
        ctx.textAlign = "center";
        ctx.fillText(b.grade, xLabel, canvas.height - 30);
    });

    ctx.font = "12px Arial";
    ctx.fillStyle = "#333";
    ctx.textAlign = "center";
    ctx.fillText("0", 40, canvas.height - 35);
    ctx.fillText(total.toFixed(0), canvas.width - 40, canvas.height - 35);
    ctx.textAlign = "left";
    ctx.fillText("Marks", canvas.width - 60, 40);
    ctx.fillText("Density", 10, 40);
}

const personalGradeCheckbox = document.getElementById("personal-grade");
const toggleLabelText = document.getElementById("toggle-label-text");
const yourMarksGroup = document.getElementById("your-marks-group");
const gradesForm = document.getElementById("grades-form");
const resultElement = document.getElementById("result");
const easterEggImage = document.getElementById("easter-egg");
const bellCanvas = document.getElementById("bell-curve");
const gradeTable = document.getElementById("grade-table");

function resizeCanvas() {
    const containerWidth = Math.min(400, window.innerWidth - 40);
    bellCanvas.width = containerWidth;
    bellCanvas.height = containerWidth * 0.55;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function setPersonalMode(isPersonal) {
    if (isPersonal) {
        toggleLabelText.textContent = "Calculate my grade";
        yourMarksGroup.style.display = "";
        resultElement.style.display = "";
        easterEggImage.style.display = "none";
        bellCanvas.style.display = "none";
        gradeTable.style.display = "none";
        document.getElementById('your-marks').required = true;
    } else {
        toggleLabelText.textContent = "Show all grade boundaries";
        yourMarksGroup.style.display = "none";
        resultElement.style.display = "none";
        easterEggImage.style.display = "none";
        bellCanvas.style.display = "";
        gradeTable.style.display = "";
        document.getElementById('your-marks').required = false;
    }
}

personalGradeCheckbox.addEventListener("change", function() {
    setPersonalMode(this.checked);
});

setPersonalMode(personalGradeCheckbox.checked);

gradesForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const isPersonal = personalGradeCheckbox.checked;
    const S = parseFloat(document.getElementById('total-marks').value);
    const X = parseFloat(document.getElementById('class-average').value);
    const D = parseFloat(document.getElementById('median-deviation').value);

    resultElement.className = '';
    easterEggImage.style.display = "none";
    bellCanvas.style.display = "none";
    gradeTable.style.display = "none";

    if (!Number.isFinite(S) || !Number.isFinite(X) || !Number.isFinite(D) || S <= 0 || X < 0 || D <= 0 || X > S) {
        resultElement.className = 'result-error';
        resultElement.textContent = X > S 
            ? '❗ Class average cannot exceed total marks.'
            : '❗ Please enter valid positive numbers for all fields.';
        resultElement.style.display = "";
        return;
    }

    if (!isPersonal && D < 0.01) {
        resultElement.className = 'result-error';
        resultElement.textContent = '❗ Median deviation is too small for a meaningful curve.';
        resultElement.style.display = "";
        return;
    }

    if (isPersonal) {
        const Mks = parseFloat(document.getElementById('your-marks').value);
        if (!Number.isFinite(Mks) || Mks < 0 || Mks > S) {
            resultElement.className = 'result-error';
            resultElement.textContent = Mks > S 
                ? "❗ Your marks can't be more than the total marks."
                : '❗ Please enter valid positive marks.';
            resultElement.style.display = "";
            return;
        }
        let grade;
        if (Mks >= X + 1.5 * D) grade = "A+";
        else if (Mks >= X + D) grade = "A";
        else if (Mks >= X + 0.5 * D) grade = "B+";
        else if (Mks >= X) grade = "B";
        else if (Mks >= X - 0.5 * D) grade = "C+";
        else if (Mks >= X - D) grade = "C";
        else if (Mks >= X - 1.5 * D) grade = "D";
        else grade = "F";

        resultElement.textContent = `Your grade is: ${grade}`;
        resultElement.classList.add('result-show');
        resultElement.style.display = "";
        easterEggImage.style.display = grade === "F" ? "block" : "none";
    } else {
        const bounds = getGradeBoundaries(X, D, S);
        drawBellCurve(bellCanvas, X, D, S, bounds);
        bellCanvas.style.display = "";

        const colors = {
            "A+": "#007d79", "A": "#00b7d4",
            "B+": "#0043ce", "B": "#3f6ad8",
            "C+": "#f4777f", "C": "#f28c38",
            "D": "#e55c00", "F": "#a62639"
        };
        let table = `<table style="margin:20px auto;border-collapse:collapse;font-size:1.1em;">
          <tr style="background:#f0f0f0;">
            <th style="padding:6px 16px;">Grade</th>
            <th style="padding:6px 16px;">Marks range</th>
          </tr>`;
        bounds.forEach(b => {
            const minV = Math.round(b.min * 100) / 100;
            const maxV = Math.round(b.max * 100) / 100;
            const range = b.grade === "A+" ? `≥ ${minV}` :
                b.grade === "F" ? `< ${maxV}` :
                    `${minV} – ${maxV}`;
            table += `<tr>
            <td style="padding:6px 16px;font-weight:bold;color:${colors[b.grade]};">${b.grade}</td>
            <td style="padding:6px 16px;">${range}</td>
          </tr>`;
        });
        table += "</table>";
        gradeTable.innerHTML = table;
        gradeTable.style.display = "";
    }
});

