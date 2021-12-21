"use strict";

const mqtt=require('mqtt');
var client = null;
var service=null;

module.exports = {
	name: "command",
	settings: {
	},
	actions: {
		/**
		 * Add a new row.
		 *
		 * @actions
		 * @param {Object} data - Data entity
		 *
		 * @returns {Object} Created entity
         *
		 */
		 getSensorData: {
			rest: {
				method: "GET",
				path: "/metaData",
			},
			set: {
					params:{
						id: {type: "Number"}
					}
			},
			async handler(ctx) {
			return this.broker.call("sensor.getSensorData", { "id": ctx.params.id });
			}
		},
		setSensorInterval: {
			rest: {
				method: "PUT",
				path: "/metaData",
			},
			set: {
					params:{
						id: {type: "Number"},
						interval: {type: "Number"}
					}
			},
			async handler(ctx) {
			return this.broker.call("sensor.putSensorData", { "id": ctx.params.id, "interval":ctx.params.interval });
			}
		}
    },

	/**
	 * Events
	 */
	events: {
	},

	/**
	 * Methods
	 */
	methods: {
        takeAction(message){
			this.broker.call("sensor.showWarning", { message: message })		
        }
	},

	/**
	 * Service created lifecycle event handler
	 */
	created() { 
        client = mqtt.connect("mqtt://mqtt:1883",{clientId:"mqttjs03"});
        client.on("connect", function() { console.log("Command connected to MQTT") }); 
        client.on("error", function(error){
            console.log("Can't connect" + error)});     
	},

	/**
	 * Service started lifecycle event handler
	 */
	async started() {
       
        var topic = "Command"
		client.subscribe(topic, {qos:1});
		var service = this;

        client.on('message', function(topic, message, packet){
			let info = JSON.parse(message.toString());
			service.takeAction(info);
        });
	},

	/**
	 * Service stopped lifecycle event handler
	 */
	async stopped() {
		client.end();
	},
};