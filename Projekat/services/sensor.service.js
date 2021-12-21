"use strict";
const fs = require("fs");
const csv = require("csv-parser");
var data = {};

module.exports = {
	name: "sensor",

	/**
	 * Settings
	 */
	settings: {},

	/**
	 * Dependencies
	 */
	dependencies: [],

	/**
	 * Actions
	 */
	actions: {
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
			
				if(ctx.params.id != undefined)
					if(this.settings.metaData.devices[ctx.params.id-1] != undefined)
					return {"message":this.settings.metaData.devices[ctx.params.id-1]};
				else
					return {"message":"Sensor with this ID doesn't exist."};

			},
		},
        postSensorData: {
			rest: {
				method: "POST",
				path: "/metaData",
			},
			async handler(ctx) {
				const params = ctx.params;
				const device = this.settings.metaData;
				if (device.devices[0]==null) return "Device not found";
				if (device.devices[0].type == "sensor") {
					device.devices[0].interval = params.interval;
					if (params.interval) {
						clearInterval(this.settings.intervals[device.devices[0].id]);
						this.settings.intervals[device.devices[0].id] = this.startInterval(
							device.devices[0]
						);
					}
				}
				fs.writeFileSync(
					"sensor.config.json",JSON.stringify(device, undefined, "\t")
				);
                return device;
			},
		},
        putSensorData: {
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
				const params = ctx.params;
				const devices = this.settings.metaData.devices;
				if (devices[params.id-1]!=undefined)
			 		{
						devices[params.id-1].interval = params.interval;
						clearInterval(this.settings.intervals[devices[params.id-1].id]);
						this.settings.intervals[devices[params.id-1].id] = this.startInterval(devices[params.id-1]);
						return devices[params.id-1];
					}
					else
					{
						return {"message":"Sensor with this ID doesn't exist."};
					}
			},
		},
		showWarning: {
			rest: {
				method: "POST",
				path: "/executeWarning",
			},
			async handler(ctx) {
				
				let message = null;
				const params = ctx.params;
				switch (params.message.warning) {
					case "Cold water": this.logger.info(`Warning: Cold water on ${params.message.name}`); 
					message = "Warning: Cold water on "+params.message.name+"!\n Measurement Timestamp: " + params.message.time;
					break;
					case "Medium temperature of water": this.logger.info(`Warning:${params.message.warning} on ${params.message.name}`); 
					message = "Warning: Medium temperature of water on "+params.message.name +"!\n Measurement Timestamp: " + params.message.time;
					break;
					case "Low battery level": this.logger.info(`Detected ${params.message.warning} on ${params.message.name} sensor`); 
					message ="Detected low battery level on " + params.message.name +" sensor!" + "!\n Measurement Timestamp: " + params.message.time;
					break;
					case "Low wave period": this.logger.info(`Detected ${params.message.warning} on ${params.message.name}`); 
					message ="Detected low wave period on " + params.message.name + "!\n Measurement Timestamp: " + params.message.time;
					break;
					default:
				}
				this.broker.emit("warning",message);


			},
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
		startInterval(device) {
			return setInterval(() => {
				if (data.results) {
                    const random = Math.round(Math.random() * data.results.length);
                    const result = data.results[random];
					//console.log(result);				
                    this.broker.call("data.postData", {data:result});
                }
			}, device.interval);
		},
	},

	/**
	 * Service created lifecycle event handler
	 */
	created() {
		const config = fs.readFileSync("sensor.config.json");
		this.settings.metaData = JSON.parse(config);
		this.settings.intervals = []; 
		const results = [];
		fs.createReadStream("beach-water-quality-automated-sensors.csv")
			.pipe(csv())
			.on("data", (data) => results.push(data))
			.on("end", () => {
				data.results = results;
			});
	},

	/**
	 * Service started lifecycle event handler
	 */
	async started() {
		
		const device = this.settings.metaData.devices[0];
		this.settings.intervals[device.id] = this.startInterval(device);
	},

	/**
	 * Service stopped lifecycle event handler
	 */
	async stopped() {
		for (let interval of this.settings.intervals) { 
			if (interval) {
				clearInterval(interval);
			}
		}
	},
};