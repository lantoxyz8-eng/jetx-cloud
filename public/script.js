let chart;
let lastAlert = 0;

function start() {
    const url = document.getElementById('url').value;

    fetch('/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
    });

    initChart();
    setInterval(update, 3000);
}

function stop() {
    fetch('/stop', { method: 'POST' });
}

function initChart() {
    const ctx = document.getElementById('chart');

    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{ label: 'Multiplicateur', data: [] }]
        }
    });
}

function update() {
    fetch('/data')
    .then(res => res.json())
    .then(data => {

        chart.data.labels = data.multipliers.map((_, i) => i);
        chart.data.datasets[0].data = data.multipliers;
        chart.update();

        fetch('http://127.0.0.1:5000/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ multipliers: data.multipliers })
        })
        .then(res => res.json())
        .then(ai => {

            let txt = "";
            let alert = false;

            ai.predictions.forEach(p => {
                txt += p + " | ";
                if (p >= 3) alert = true;
            });

            document.getElementById('pred').innerText = txt;

            if (alert && Date.now() - lastAlert > 10000) {
                triggerAlert();
                lastAlert = Date.now();
            }
        });
    });
}

function triggerAlert() {
    document.getElementById('alertSound').play();

    let notif = document.createElement('div');
    notif.innerText = "🔥 X3 PROBABLE";
    notif.style.position = "fixed";
    notif.style.top = "20px";
    notif.style.right = "20px";
    notif.style.background = "red";
    notif.style.color = "white";
    notif.style.padding = "10px";

    document.body.appendChild(notif);

    setTimeout(() => notif.remove(), 3000);
}