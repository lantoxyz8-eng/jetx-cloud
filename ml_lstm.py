from flask import Flask, request, jsonify
import numpy as np

app = Flask(__name__)

data = []

def predict(data):
    if len(data) < 10:
        return [2]*5

    arr = np.array(data[-20:])
    mean = np.mean(arr)
    std = np.std(arr)

    preds = []
    for _ in range(5):
        val = mean + np.random.normal(0, std/2)
        if val < 1: val = 1.1
        preds.append(round(val,2))

    return preds

@app.route('/predict', methods=['POST'])
def run():
    global data

    new = request.json.get("multipliers", [])
    data.extend(new)

    preds = predict(data)

    return jsonify({"predictions": preds})

app.run(port=5000)