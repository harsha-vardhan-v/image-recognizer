let form = document.querySelector('form');
let input = document.querySelector('#image');
let img = document.querySelector('#selected');
let row = document.querySelector('#row');
let pie = document.querySelector('#pie');
let predH2 = document.querySelector('h1#predictions');
let base64img;

input.addEventListener('change', () => {
    let reader = new FileReader();
    reader.onload = () => {
        let dataURL = reader.result;
        img.src = dataURL;

        base64img = dataURL.replace('data:image/png;base64,', '');
    };

    reader.readAsDataURL(input.files[0]);
    row.innerHTML = '';
    pie.innerHTML = '';
});

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    let msg = {
        image: base64img
    };

    console.log(msg);
    let res = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(msg)
    });

    const g = await res.json();
    input.value = '';

    //Plots
    let vis = g.prediction.map(pred => {
        return {
            category: pred.name,
            value: parseFloat(pred.prob)
        };
    });

    let cf = crossfilter(vis);
    let category = cf.dimension(p => p.category);

    dc.rowChart('#row')
        .dimension(category)
        .group(category.group().reduceSum(p => p.value));

    dc.pieChart('#pie')
        .dimension(category)
        .group(category.group().reduceSum(p => p.value));

    predH2.innerHTML = 'Predictions';
    window.location.href = 'http://localhost:5000/static/index.html#predictions';
    dc.renderAll();
});