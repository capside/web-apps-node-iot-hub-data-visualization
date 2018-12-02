# IoTHub temperature control

## Placeholders

<wifi-ssid>: your wifi network
<wifi-pass>: the password of your wifi network
<server-host>: the ip of your laptop in your wifi network
<new-espurna-password>: the password you assign to your Espurna device
<device-name>: the name of your device as registered in the iot hub
<iot-hub-hostname>: the host name of your iot hub
<sr-value>: the value of the SAS
<it-hub-connection-string>: the iot hub connection string

## Flash the firmware

* Download and install [Python3](https://www.python.org/ftp/python/3.7.1/python-3.7.1.exe)
* Deactivate the firewall

```bash
git clone https://github.com/mirko/SonOTA.git
cd SonOTA
pip3 install -r requirements.txt
curl -fsSL https://github.com/xoseperez/espurna/releases/download/1.13.2/espurna-1.13.2-itead-sonoff-th.bin -o static/image_arduino.bin
python sonota.py --wifi-ssid <wifi-ssid> --wifi-password <wifi-ssid> --serving-host <server-host>
```

* Next steps must be done one by one because of every firmware will start a ssid with the same name (FinalStage)
* Look for your itead wifi network and connect to it (the password is 12345678)
* Follow the instruction on screen (connect to the FinalStage wifi) and let the process finish everything
* Take note of your espurna wifi access point name
* **Reactivate the firewall**


## Configure espurna

* Connect to to your espurna access point
* Open http://192.168.4.1 (wifi password is `fibonacci`)
* Login into espurna with user `admin` and password `fibonacci`
* Replace the wifi password with `<new-espurna-password>`
* Forget the ssid and reconnect to it with the new password
* Open again http://192.168.4.1 (wifi password is `<new-espurna-password>`)
* Check *status*: on, off. temperature.
* On *general*: hostname
* On *sensors*: Report every 1 (to send data each six seconds)
* mqtt: on, mqtt broker, json payload
* admin: enable http api, http api key
* On *wifi*: Add a new ssid (<wifi-ssid>, <wifi-ssid>, 212.0.122.155, static ip: 10.100.136.XX (1-99))
* Reboot the device
* Connect to the local wifi
* Open 10.100.136.XX with user `admin` and password `<new-espurna-password>`
* Check everything is ok

## Provision the IoT Hub

* Create the hub
* Define a device named `<device-name>`

## Create SAS token

* Go to the portal and select the iot hub
* Click on shared access policies, select iothubowner and copy the Connection string primary key
* Install [Device Explorer](https://github.com/Azure/azure-iot-sdks/releases) and run it
* Paste the previous connection string in the "IoT Hub Connection String" textarea and press the `update` button
* Go to the Management section
* Copy the data from the device (you will need the SharedAccessSignature sr)
* Go to the Data section and press "Monitor"

## Test the mqqt connection 

```
mosquitto_pub -d -h <iot-hub-hostname>.azure-devices.net -i <device-name> -u "<iot-hub-hostname>.azure-devices.net/<device-name>" -P "SharedAccessSignature sr=<sr-value>" -m "mosquitto goes live now" -t "devices/<device-name>/messages/events/readpipe/" -p 8883 --cafile /etc/ssl/certs/ca-certificates.crt -V mqttv311
```


## Run the mqtt-iouhub bridge

* Download and run the bridge project

``` bash
git clone https://github.com/capside/iot-hub-bridge
cd iot-hub-bridge
npm install
node index.js "SharedAccessSignature sr=<sr-value>" mqtt://localhost
```

## Start visualization

* Clone the [visualization app](https://github.com/capside/web-apps-node-iot-hub-data-visualization) fork

```bash
git clone https://github.com/capside/web-apps-node-iot-hub-data-visualization
cd web-apps-node-iot-hub-data-visualization
```

* Set the env variables

```bash
set Azure.IoT.IoTHub.DeviceId=<device-name>
set Azure.IoT.IoTHub.ConnectionString=HostName=<it-hub-connection-string>
set Azure.IoT.IoTHub.ConsumerGroup=chart
set PORT=3000
```

* Start the server

```bash
npm start
```