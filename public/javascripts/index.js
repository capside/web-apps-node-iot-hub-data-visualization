$(document).ready(function () {

  function getColorFromPalette(colorIndex, numberOfColors){
    return "hsl(" + (colorIndex * (60 + 300 / numberOfColors) % 360) + ",100%,50%)";
  }

  const sensors = {};

  var chart = new SmoothieChart({
    responsive: true,
    maxValue:40, minValue: 15,
    grid: {
      millisPerLine:5000
    },
    timestampFormatter : SmoothieChart.timeFormatter
  });
  chart.streamTo(document.getElementById("chart"), 2000);


  var ws = new WebSocket('ws://' + location.host);
  ws.onopen = function () {
    console.log('Successfully connect WebSocket');
  }
  ws.onmessage = function (message) {
    console.log('receive message: ' + message.data.toString('utf8'));

    try {
      const topic = message.data.substring(0, message.data.indexOf(' '));
      const body = message.data.substring(topic.length+1);
      var sensorData = JSON.parse(body);

      if(!sensorData.time || !sensorData.temperature) {
        return;
      }

      if (!sensors[topic]) {
        sensors[topic] = new TimeSeries();
        const color = getColorFromPalette(Object.keys(sensors).length,20);
        const style = {
          strokeStyle: color,
          fillStyle: 'rgba(0, 0, 0, 0.0)',
          lineWidth: 4
        };
        chart.addTimeSeries(sensors[topic], style);

        $('#legend').append(
          $('<li>')
            .append($('<span>').addClass('symbol').css({'background-color' : color}).text(' '))
            .append($('<span>').text(topic))
        )
      }
      sensors[topic].append(new Date(sensorData.time).getTime(), parseFloat(sensorData.temperature));
    } catch (err) {
      console.error(err);
    }
  }
});
