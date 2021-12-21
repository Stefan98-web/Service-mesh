"use strict";


const { response } = require('express');
const mqtt=require('mqtt');
const request = require('request');
const DbService = require("../mixins/db.mixin");
var client = null;
var service=null;

module.exports = {
	name: "analytics",
	mixins: [
		DbService("beach-water-quality-analytics")
	],
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
		 CEPWarning: {
            rest: {
                method: "POST",
                path: "/CEPWarning",
            },
            async handler(ctx,res) {
                var warningExist = ctx.params.message.event.warning;
				var warning = ctx.params.message.event;
				

				if(warningExist!="No warning")
				{
                	this.adapter.insert({ "Beach name": warning.name, "Water temperature": warning.temp, "Battery life": warning.bat, "Wave period": warning.waveperiod, "Time": warning.time, "warning": warning.warning });
					client.publish("Command", JSON.stringify(warning));
				}
            },
        },
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
        analyze(data) {
			
			request.post({
				headers: { 'content-type': 'application/json' },
				url: `http://siddhi:8006/analytics`,
				body: JSON.stringify({"name":data.name,"temp":parseInt(data.temp),"bat":parseInt(data.bat),"waveperiod":parseInt(data.waveperiod),"time":data.time})
			}, (err, Response, body) => {
				if (!err) {
					console.log("MESSAGE SENT to CEP Service");
				} else {
					console.log("ERROR in post to siddhi: "+ err);
				}
			})
		},
	},

	/**
	 * Service created lifecycle event handler
	 */
	created() { 
        client = mqtt.connect("mqtt://mqtt:1883",{clientId:"mqttjs01"});
        client.on("connect", function() { console.log("Analytics connected to MQTT") }); 
        client.on("error", function(error){
            console.log("Can't connect" + error)});     
	},

	/**
	 * Service started lifecycle event handler
	 */
	async started() {
		service=this;
        var topic = "Analytics"
		client.subscribe(topic, {qos:1});

         client.on('message',async function(topic, payload, packet){
			let message = JSON.parse(payload.toString());
			
			let info ={
				"bat": message.entity["Battery Life"],
				"time": message.entity["Measurement Timestamp Label"],
				"temp": message.entity["Water Temperature"],
				"name": message.entity["Beach Name"],
				"waveperiod": message.entity["Wave Period"]
			} 
			service.analyze(info);
         });

	},

	/**
	 * Service stopped lifecycle event handler
	 */
	async stopped() {
		client.end();
	},
};